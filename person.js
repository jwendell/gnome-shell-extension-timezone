import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';
import * as Signals from 'resource:///org/gnome/shell/misc/signals.js';

import {md5Hash, getSharedSession} from './util.js';

let peopleCount = 0;

export function resetPeopleCount() {
    peopleCount = 0;
}

export class Person extends Signals.EventEmitter {
    constructor(params) {
        super();

        this.id = ++peopleCount;
        this.name = params.name || '';
        this.city = params.city || '';
        this.tz = params.tz;
        this.avatar = params.avatar;
        this.github = params.github;
        this.gravatar = params.gravatar;
        this._githubToken = params._githubToken;

        this._insertDateTime();
        this._getRemoteInfo();
    }

    getName() {
        return this.name || (this.github ? this.github : `Person ${this.id}`);
    }

    _insertDateTime() {
        this.tz1 = GLib.TimeZone.new(this.tz);
        this.now = GLib.DateTime.new_now(this.tz1);
        this.offset = this.now.get_utc_offset() / (3600 * 1000 * 1000);
    }

    _getRemoteInfo() {
        // We have all data, no need to retrieve external data
        if (this.name && this.city && this.avatar)
            return;

        if (this.github) {
            this._getGithubInfo();
            return;
        }

        if (this.gravatar) {
            this._getGravatarInfo();
        }
    }

    _getGithubInfo() {
        const session = getSharedSession();
        const url = `https://api.github.com/users/${this.github}`;
        const message = Soup.Message.new('GET', url);

        if (this._githubToken)
            message.get_request_headers().append('Authorization', `token ${this._githubToken}`);

        session.send_and_read_async(message, GLib.PRIORITY_DEFAULT,
            null,
            (sess, result) => {
                if (message.get_status() !== Soup.Status.OK) {
                    log(`Response code "${message.get_status()}" getting data from github for user ${this.github}`);
                    return;
                }

                let p;
                try {
                    const bytes = sess.send_and_read_finish(result);
                    const decoder = new TextDecoder('utf-8');
                    const responseData = decoder.decode(bytes.get_data());
                    p = JSON.parse(responseData);
                } catch (e) {
                    log(`Error parsing github response for user ${this.github}: ${e}`);
                    return;
                }

                if (!this.avatar && p.avatar_url)
                    this.avatar = p.avatar_url;

                if (!this.name && p.name)
                    this.name = p.name;

                if (!this.city && p.location)
                    this.city = p.location;

                this.emit('changed');
            }
        );
    }

    _getGravatarInfo() {
        if (this.avatar)
            return;

        const email = this.gravatar.trim().toLowerCase();
        this.avatar = `http://cdn.libravatar.org/avatar/${md5Hash(email)}`;
    }
}
