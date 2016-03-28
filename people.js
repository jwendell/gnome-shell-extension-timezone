const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const People = new Lang.Class({
    Name: 'People',

    _init: function() {
        this._path = GLib.build_filenamev([GLib.get_home_dir(), 'people.json']);
        this._file = Gio.file_new_for_path(this._path);
    },

    _sortByTimezone: function(a, b) {
        let d = a.offset - b.offset;

        if (d < 0)
            return -1;
        else if (d > 0)
            return 1;
        return 0;
    },

    _insertDateTime: function(person) {
        person.tz1 = GLib.TimeZone.new(person.tz);
        person.now = GLib.DateTime.new_now(person.tz1);
        person.offset = person.now.get_utc_offset() / (3600*1000*1000);
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
        let people = this._parsePeopleFile();
        if (!people.error) {
            people.forEach(this._insertDateTime);
            people.sort(this._sortByTimezone);
        }

        return people;
    }

});
