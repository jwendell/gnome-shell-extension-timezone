import GLib from 'gi://GLib';
import * as Signals from 'resource:///org/gnome/shell/misc/signals.js';

import {People} from './people.js';
import {Timezone} from './timezone.js';
import {sortByTimezone} from './util.js';

export class World extends Signals.EventEmitter {
    constructor(extension) {
        super();

        this._extension = extension;
        this._people = new People(extension);

        this._peopleChangedId = this._people.connect('changed', () => {
            this.emit('changed');
        });
    }

    destroy() {
        if (this._peopleChangedId) {
            this._people.disconnect(this._peopleChangedId);
            this._peopleChangedId = null;
        }
        this._people.destroy();
    }

    // Use shared sortByTimezone from util.js

    _getTimezonesCB(people) {
        if (people.error) {
            this._getTimezonesOriginalCB(people);
            return;
        }

        const timezones = {};
        for (const person of people) {
            if (timezones[person.offset] === undefined) {
                timezones[person.offset] = new Timezone(person);
            }
            timezones[person.offset].addPerson(person);
        }

        const tzArray = Object.values(timezones);
        tzArray.sort(sortByTimezone);

        this._timezones = tzArray;
        this._getTimezonesOriginalCB(this._timezones);
    }

    getTimezones(cb) {
        this._getTimezonesOriginalCB = cb;
        this._people.getPeople(people => this._getTimezonesCB(people));
    }
}
