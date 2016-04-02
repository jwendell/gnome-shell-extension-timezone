const St = imports.gi.St;
const Params = imports.misc.params;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

const AVATAR_ICON_SIZE = 70;

const Avatar = new Lang.Class({
    Name: 'Avatar',

    _init: function(person, params) {
        this._httpSession = new Soup.Session({user_agent: 'curl/7.43.0'});

        this._person = person;
        this._person.name = this._person.name !== undefined ? this._person.name : "";
        this._person.city = this._person.city !== undefined ? this._person.city : "";

        this._hasAvatar = (this._person.avatar !== undefined && this._person.avatar.trim() !== '');
        this._hasGravatar = (this._person.gravatar !== undefined && this._person.gravatar.trim() !== '');
        this._hasGithub = (this._person.github !== undefined && this._person.github.trim() !== '');
        this._hasPicture = this._hasAvatar || this._hasGravatar || this._hasGithub;

        params = Params.parse(params, { reactive: true,
                                        iconSize: AVATAR_ICON_SIZE});
        this._iconSize = params.iconSize;

        let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        this.actor = new St.BoxLayout({ track_hover: params.reactive,
                                  reactive: params.reactive,
                                  width: this._iconSize * scaleFactor,
                                  height: this._iconSize * scaleFactor,
                                  can_focus: params.reactive,
                                  vertical: true,
                                  style_class: 'tzi-avatar-main-box' });

        this._createPersonWidget();
        if (this._hasPicture) {
            this.actor.connect('enter-event', Lang.bind(this, this._onEnterEvent));
            this.actor.connect('leave-event', Lang.bind(this, this._onLeaveEvent));
        }

        this._setBackgroundImage();
        if (this._hasGithub) {
            this._setGithubData();
        }
    },

    _setBackgroundImage: function() {
        if (!this._hasPicture)
            return;

        let url;

        if (this._hasAvatar) {
            url = this._person.avatar.trim();
        } else if (this._hasGravatar) {
            url = this._getGravatarURL();
        }

        this.actor.style = 'background-image: url("%s");'.format(url);
    },

    _getGravatarURL: function() {
        let email = this._person.gravatar.trim().toLowerCase();
        let hash = GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, email, -1);
        let url = 'http://cdn.libravatar.org/avatar/' + hash;

        return url;
    },

    _setGithubData: function() {
        let github_api = 'https://api.github.com/users/%s'.format(
            this._person.github)
        let message = new Soup.Message({method: 'GET', uri: new Soup.URI(github_api)});

        this._httpSession.queue_message(message, Lang.bind(this, function(session, message) {
            if (message.status_code != Soup.KnownStatusCode.OK) {
                log('Error: ' + message.status_code.toString());
                log('got: ' + message.response_body.data);
            }
            else {
                let p = JSON.parse(message.response_body.data);
                this.actor.style = 'background-image: url("%s");'.format(p.avatar_url);
                this._name.text = p.name;
                this._city.text = p.location;
            }
        }));
    },

    _createPersonWidget: function() {
        let child = this._hasPicture ? new St.Bin() : new St.Icon({ icon_name: 'avatar-default-symbolic'});
        this.actor.add(child, {expand: true});
        this._detailBox = new St.BoxLayout({visible: !this._hasPicture, vertical: true, style_class: 'tzi-avatar-name-box'});
        this.actor.add(this._detailBox, {x_fill: true});

        this._name = new St.Label({text: this._person.name, style_class: 'tzi-avatar-name'});
        this._detailBox.add(this._name, {expand: true, x_align: St.Align.MIDDLE, x_fill: false});

        this._city = new St.Label({text: this._person.city});
        this._detailBox.add(this._city, {expand: true, x_align: St.Align.MIDDLE, x_fill: false});
    },

    _onEnterEvent: function(event) {
        this._detailBox.show();
    },

    _onLeaveEvent: function(event) {
        this._detailBox.hide();
    }
});

