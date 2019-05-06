const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Person = Me.imports.person;
const Convenience = Me.imports.convenience;

var People = new Lang.Class({
    Name: 'People',

    _init: function() {
        this._cancellable = null;
        this._settings = Convenience.getSettings();
        this._path = this._getFilename();
        this._file = Gio.file_new_for_uri(this._path);
        this._githubToken = this._settings.get_string("github-token").trim();

        this._monitor = this._file.monitor(Gio.FileMonitorFlags.NONE, null);
        this._monitorChangedSignalId = this._monitor.connect('changed',
                    Lang.bind(this, function(a, b, c, d) {
                        if (d != 1) return;
                        this.emit('changed');
                    }));
    },

    destroy: function() {
        this._monitor.disconnect(this._monitorChangedSignalId);
        this.parent();
	},

    _getFilename: function() {
        let f = this._settings.get_string("path-to-people-json").trim();
        if (f == "")
            f = "file://" + GLib.build_filenamev([GLib.get_home_dir(), 'people.json']);

        return f;
    },

    _sortByTimezone: function(a, b) {
        let d = a.offset - b.offset;

        if (d < 0)
            return -1;
        else if (d > 0)
            return 1;
        return 0;
    },

    getPeople: function(cb) {
        if (this._cancellable != null) {
            this._cancellable.cancel();
        }

        this._cancellable = new Gio.Cancellable();
        this._getPeopleOriginalCB = cb;
        this._file.load_contents_async(this._cancellable, Lang.bind(this, this._getPeopleCB));
    },

    _getPeopleCB: function(a, res) {
        let contents, success, tag, rawPeople;
        try {
            [success, contents, tag] = this._file.load_contents_finish(res);
        } catch (e) {
            if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                log('[timezone] Ignoring previous getPeople() call');
                return;
            }

            log('Error parsing %s: %s'.format(this._path, e));
            this._getPeopleOriginalCB({error: 'Make sure to put a file "people.json" in your home directory'});
            return;
        }

        try {
            rawPeople = JSON.parse(contents);
        } catch (e) {
            log('Error parsing %s: %s'.format(this._path, e));
            this._getPeopleOriginalCB({error: 'There was an error parsing people.json file'});
            return;
        }

        let people = [];
        Person.resetPeopleCount();
        rawPeople.forEach(Lang.bind(this, function(person) {
            person._githubToken = this._githubToken;
            people.push(new Person.Person(person));
        }));
        people.sort(this._sortByTimezone);

        this._getPeopleOriginalCB(people);
    }

});
Signals.addSignalMethods(People.prototype);
