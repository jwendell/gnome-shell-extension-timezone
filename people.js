const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Person = Me.imports.person;

const People = new Lang.Class({
    Name: 'People',

    _init: function() {
        this._path = GLib.build_filenamev([GLib.get_home_dir(), 'people.json']);
        this._file = Gio.file_new_for_path(this._path);

        this._monitor = this._file.monitor(Gio.FileMonitorFlags.NONE, null);
        this._monitor.connect('changed',
                    Lang.bind(this, function(a, b, c, d) {
                        if (d != 1) return;
                        this.emit('changed');
                    }));
    },

    _sortByTimezone: function(a, b) {
        let d = a.offset - b.offset;

        if (d < 0)
            return -1;
        else if (d > 0)
            return 1;
        return 0;
    },

    _parsePeopleFile: function() {
        let contents, success, tag, people;
        try {
            [success, contents, tag] = this._file.load_contents(null);
        } catch (e) {
            log('Error parsing %s: %s'.format(this._path, e));
            return {error: 'Make sure to put a file "people.json" in your home directory'};
        }

        try {
            people = JSON.parse(contents);
        } catch (e) {
            log('Error parsing %s: %s'.format(this._path, e));
            return {error: 'There was an error parsing people.json file'};
        }

        return people;
    },

    getPeople: function() {
        let rawPeople = this._parsePeopleFile();
        if (rawPeople.error)
            return rawPeople;

        let people = [];
        rawPeople.forEach(function(person) {
            people.push(new Person.Person(person));
        });
        people.sort(this._sortByTimezone);

        return people;
    }

});
Signals.addSignalMethods(People.prototype);
