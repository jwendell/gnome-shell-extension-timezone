const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const People = Me.imports.people;

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

    _init: function(params) {
        this._people = [];
        this.topCity = '';
        this.tz = params.tz;
        this.tz1 = params.tz1;
        this.offset = params.offset;
        this.niceOffset= _generateNiceOffset(this.offset);

        let localOffset = GLib.DateTime.new_now_local().get_utc_offset() / (3600*1000*1000);
        this.sameAsSystem = this.offset == localOffset;
    },

    _updateTopCity: function() {
        let count = {};
        this._people.forEach(function(person) {
            if (count[person.city] === undefined)
                count[person.city] = 1;
            else
                count[person.city]++;
        });

        let result = '', m = 0;
        for (let city in count) {
            if ((count[city] > m) || (count[city] == m && city.length > 0 && city.length < result.length)) {
                m = count[city];
                result = city;
            }
        }

        this.topCity = result;
    },

    addPerson: function(person) {
        this._people.push(person);
        this._updateTopCity();

        person.connect('changed', Lang.bind(this, function() {
            this._updateTopCity();
            this.emit('changed');
        }));
    },

    getPeople: function() {
        return this._people;
    }

});
Signals.addSignalMethods(Timezone.prototype);
