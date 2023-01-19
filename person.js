const Lang = imports.lang;
const Signals = imports.signals;
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

var Person = new Lang.Class({
    Name: 'Person',

    _init: function(params) {
        this.id = ++peopleCount;
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

	getName: function() {
		return this.name ? this.name : (this.github ? this.github : 'Person ' + this.id);
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
        let message = Soup.Message.new('GET', 'https://api.github.com/users/%s'.format(this.github));
        if (this._githubToken) {
            message.request_headers.append("Authorization", "token " + this._githubToken);
        }

        _httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null, Lang.bind(this, function(session, result) {
            if (message.get_status() != Soup.Status.OK) {
                log('Response code "%d" getting data from github for user %s.'.format(message.get_status(), this.github));
                return;
            }

            let p;
            let bytes = session.send_and_read_finish(result);
            let decoder = new TextDecoder("utf-8");
            let response = decoder.decode(bytes.get_data());

            try {
                p = JSON.parse(response);
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

let peopleCount = 0;
function resetPeopleCount() {
	peopleCount = 0;
};
