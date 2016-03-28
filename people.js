const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

function _sortByTimezone(a, b) {
    let d = a.offset - b.offset;

    if (d < 0)
        return -1;
    else if (d > 0)
        return 1;
    return 0;
}

function _insertDateTime(person) {
    person.tz1 = GLib.TimeZone.new(person.tz);
    person.now = GLib.DateTime.new_now(person.tz1);
    person.offset = person.now.get_utc_offset() / (3600*1000*1000);
}

function _parsePeopleFile() {
    let path = GLib.build_filenamev([GLib.get_home_dir(), 'people.json']);
    let f = Gio.file_new_for_path(path);

    let contents, success, tag, people;
    try {
    	[success, contents, tag] = f.load_contents(null);
    } catch (e) {
        log('Error parsing %s: %s'.format(path, e));
        return {error: 'Make sure to put a file "people.json" in your home directory'};
    }

    try {
        people = JSON.parse(contents);
    } catch (e) {
        log('Error parsing %s: %s'.format(path, e));
        return {error: 'There was an error parsing people.json file'};
    }

    return people;
}

function getPeople() {
    let people = _parsePeopleFile();
    if (!people.error) {
        people.forEach(_insertDateTime);
        people.sort(_sortByTimezone);
    }

    return people;
}

