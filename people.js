import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as Signals from 'resource:///org/gnome/shell/misc/signals.js';

import {Person, resetPeopleCount} from './person.js';
import {sortByTimezone} from './util.js';

export class People extends Signals.EventEmitter {
    constructor(extension) {
        super();

        this._extension = extension;
        this._settings = extension.getSettings();
        this._cancellable = null;
        this._path = this._getFilename();
        this._file = Gio.File.new_for_uri(this._path);
        this._githubToken = this._settings.get_string('github-token').trim();

        this._monitor = this._file.monitor(Gio.FileMonitorFlags.NONE, null);
        this._monitorChangedId = this._monitor.connect('changed', (monitor, file, otherFile, eventType) => {
            if (eventType !== Gio.FileMonitorEvent.CHANGED)
                return;
            this.emit('changed');
        });
    }

    destroy() {
        if (this._monitorChangedId) {
            this._monitor.disconnect(this._monitorChangedId);
            this._monitorChangedId = null;
        }
        if (this._cancellable) {
            this._cancellable.cancel();
            this._cancellable = null;
        }
    }

    _getFilename() {
        let f = this._settings.get_string('path-to-people-json').trim();
        if (f === '')
            f = `file://${GLib.build_filenamev([GLib.get_home_dir(), 'people.json'])}`;
        return f;
    }

    // Use shared sortByTimezone from util.js

    getPeople(cb) {
        if (this._cancellable !== null) {
            this._cancellable.cancel();
        }

        this._cancellable = new Gio.Cancellable();
        this._getPeopleOriginalCB = cb;
        this._file.load_contents_async(this._cancellable, (file, res) => this._getPeopleCB(file, res));
    }

    _getPeopleCB(file, res) {
        let contents;
        try {
            [, contents] = file.load_contents_finish(res);
        } catch (e) {
            if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                log('[timezone] Ignoring previous getPeople() call');
                return;
            }

            log(`Error parsing ${this._path}: ${e}`);
            this._getPeopleOriginalCB({error: 'Make sure to put a file "people.json" in your home directory'});
            return;
        }

        let rawPeople;
        try {
            const decoder = new TextDecoder('utf-8');
            rawPeople = JSON.parse(decoder.decode(contents));
        } catch (e) {
            log(`Error parsing ${this._path}: ${e}`);
            this._getPeopleOriginalCB({error: 'There was an error parsing people.json file'});
            return;
        }

        const people = [];
        resetPeopleCount();
        for (const person of rawPeople) {
            person._githubToken = this._githubToken;
            people.push(new Person(person));
        }
        people.sort(sortByTimezone);

        this._getPeopleOriginalCB(people);
    }
}
