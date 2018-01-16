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

var World = new Lang.Class({
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

    _getTimezonesCB: function(people) {
        if (people.error) {
            this._getTimezonesOriginalCB(people);
            return;
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
        this._getTimezonesOriginalCB(this._timezones);
    },

    getTimezones: function(cb) {
        this._getTimezonesOriginalCB = cb;
        this._people.getPeople(Lang.bind(this, this._getTimezonesCB));
    }

});
Signals.addSignalMethods(World.prototype);
