const Lang = imports.lang;
const Signals = imports.signals;
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

const Person = new Lang.Class({
    Name: 'Person',

    _init: function(params) {
        this.name = params.name || "";
        this.city = params.city || "";
        this.tz = params.tz;
        this.avatar = params.avatar;
        this.github = params.github;
        this.gravatar = params.gravatar;
        this._githubToken = params._githubToken;

        this._insertDateTime();
        this._getRemoteInfo();
    },

    _insertDateTime: function() {
        this.tz1 = GLib.TimeZone.new(this.tz);
        this.now = GLib.DateTime.new_now(this.tz1);
        this.offset = this.now.get_utc_offset() / (3600*1000*1000);
    },

    _getRemoteInfo: function() {
        // We have all data, no need to retrieve external data
        if (this.name && this.city && this.avatar)
            return;

        if (this.github) {
            this._getGithubInfo();
            return;
        }

        if (this.gravatar) {
            this._getGravatarInfo();
            return;
        }
    },

    _getGithubInfo: function() {
        let _httpSession = new Soup.Session({user_agent: 'jwendell/gnome-shell-extension-timezone'});
        let url = 'https://api.github.com/users/%s'.format(this.github);
        let message = new Soup.Message({method: 'GET', uri: new Soup.URI(url)});
        if (this._githubToken) {
            message.request_headers.append("Authorization", "token " + this._githubToken);
        }

        _httpSession.queue_message(message, Lang.bind(this, function(session, message) {
            if (message.status_code != Soup.KnownStatusCode.OK) {
                log('Response code "%d" getting data from github for user %s. Got: %s'.format(message.status_code, this.github, message.response_body.data));
                return;
            }
            let p;
            try {
                p = JSON.parse(message.response_body.data);
            } catch (e) {
                log('Error parsing github response for user %s: %s'.format(this.github, e));
                return;
            }

            if (!this.avatar && p.avatar_url)
                this.avatar = p.avatar_url;

            if (!this.name && p.name)
                this.name = p.name;

            if (!this.city && p.location)
                this.city = p.location;

            this.emit('changed');
        }));
    },

    _getGravatarInfo: function() {
        if (this.avatar)
            return;

        let email = this.gravatar.trim().toLowerCase();
        let hash = GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, email, -1);
        this.avatar = 'http://cdn.libravatar.org/avatar/' + hash;
    },

});
Signals.addSignalMethods(Person.prototype);
