import GLib from 'gi://GLib';
import * as Signals from 'resource:///org/gnome/shell/misc/signals.js';

import {generateNiceOffset} from './util.js';

export class Timezone extends Signals.EventEmitter {
    constructor(params) {
        super();

        this._people = [];
        this.topCity = '';
        this.tz = params.tz;
        this.tz1 = params.tz1;
        this.offset = params.offset;
        this.niceOffset = generateNiceOffset(this.offset);

        const localOffset = GLib.DateTime.new_now_local().get_utc_offset() / (3600 * 1000 * 1000);
        this.sameAsSystem = this.offset === localOffset;
    }

    _updateTopCity() {
        const count = {};
        for (const person of this._people) {
            if (count[person.city] === undefined)
                count[person.city] = 1;
            else
                count[person.city]++;
        }

        let result = '';
        let m = 0;
        for (const city in count) {
            if ((count[city] > m) || (count[city] === m && city.length > 0 && city.length < result.length)) {
                m = count[city];
                result = city;
            }
        }

        this.topCity = result;
    }

    addPerson(person) {
        this._people.push(person);
        this._updateTopCity();

        person.connect('changed', () => {
            this._updateTopCity();
            this.emit('changed');
        });
    }

    getPeople() {
        return this._people;
    }
}
