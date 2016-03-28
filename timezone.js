const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const People = Me.imports.people;

function _updateTopCity(timezone) {
    let count = {};
    timezone.people.forEach(function(person) {
        if (count[person.city] === undefined)
            count[person.city] = 1;
        else
            count[person.city]++;
    });

    let result = '', m = 0;
    for (let city in count) {
        if (count[city] > m) {
            m = count[city];
            result = city;
        }
    }

    timezone.topCity = result;
}

Math.trunc = Math.trunc || function(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}

function _generateNiceOffset(offset) {
    let absOffset = Math.abs(offset);
    let h = Math.trunc(absOffset);
    let m = 60 * (absOffset - h);

    if (h < 10)
        h = '0' + h;
    if (m < 10)
        m = '0' + m;

    let r = h + ':' + m;

    if (offset < 0)
        r = '-' + r;
    else
        r = '+' + r;

    return r;
}

const Timezone = new Lang.Class({
    Name: 'Timezone',

    _init: function() {
        this._people = new People.People;
        this._people.connect('changed', Lang.bind(this, function() {
            this.emit('changed');
        }));
    },

    getTimezones: function() {
        let people = this._people.getPeople();
        if (people.error)
            return people;

        let localOffset = GLib.DateTime.new_now_local().get_utc_offset() / (3600*1000*1000);

        var timezones = people.reduce(function(zones, person) {
            let last = zones[ zones.length - 1 ];
            let offset = last ? last.offset : null;

            if (last && offset === person.offset) {
                last.people.push(person);
            } else {
                zones.push({
                    tz: person.tz,
                    tz1: person.tz1,
                    offset: person.offset,
                    niceOffset: _generateNiceOffset(person.offset),
                    people: [ person ],
                    sameAsSystem: person.offset == localOffset
                });
            }

            return zones;
        }, []);

        timezones.forEach(function(timezone){
            _updateTopCity(timezone);
        });

        return timezones;
    }
});
Signals.addSignalMethods(Timezone.prototype);
