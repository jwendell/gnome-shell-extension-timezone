const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const People = Me.imports.people;
const Timezone = Me.imports.timezone;

function _valuesToArray(obj) {
  return Object.keys(obj).map(function (key) { return obj[key]; });
}

const World = new Lang.Class({
    Name: 'World',

    _init: function() {
        this._people = new People.People;

        this._people.connect('changed', Lang.bind(this, function() {
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

    getTimezones: function() {
        let people = this._people.getPeople();
        if (people.error) {
            return people;
        }

        let localOffset = GLib.DateTime.new_now_local().get_utc_offset() / (3600*1000*1000);

        let timezones = {};
        people.forEach(function(person) {
            if (timezones[person.offset] == undefined) {
                timezones[person.offset] = new Timezone.Timezone(person);
            }
            timezones[person.offset].addPerson(person);
        });
        timezones = _valuesToArray(timezones);
        timezones.sort(this._sortByTimezone);

        this._timezones = timezones;
        return this._timezones;
    }

});
Signals.addSignalMethods(World.prototype);
