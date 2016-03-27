const St = imports.gi.St;
const Params = imports.misc.params;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const GLib = imports.gi.GLib;

const AVATAR_ICON_SIZE = 70;

const Avatar = new Lang.Class({
    Name: 'Avatar',

    _init: function(person, params) {
        this._person = person;
        this._hasAvatar = this._person.avatar !== undefined && this._person.avatar !== '';
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
        if (this._hasAvatar) {
            this.actor.connect('enter-event', Lang.bind(this, this._onEnterEvent));
            this.actor.connect('leave-event', Lang.bind(this, this._onLeaveEvent));
        }

        GLib.idle_add(GLib.PRIORITY_DEFAULT, Lang.bind(this, function() {
            if (this._hasAvatar)
                this.actor.style = 'background-image: url("%s");'.format(this._person.avatar);
            return GLib.SOURCE_REMOVE;
        }));
    },

    _createPersonWidget: function() {
        let child = this._hasAvatar ? new St.Bin() : new St.Icon({ icon_name: 'avatar-default-symbolic'});
        this.actor.add(child, {expand: true});
        this._detailBox = new St.BoxLayout({visible: !this._hasAvatar, vertical: true, style_class: 'tzi-avatar-name-box'});
        this.actor.add(this._detailBox, {x_fill: true});

        let name = new St.Label({text: this._person.name, style_class: 'tzi-avatar-name'});
        this._detailBox.add(name, {expand: true, x_align: St.Align.MIDDLE, x_fill: false});

        let city = new St.Label({text: this._person.city});
        this._detailBox.add(city, {expand: true, x_align: St.Align.MIDDLE, x_fill: false});
    },

    _onEnterEvent: function(event) {
        this._detailBox.show();
    },

    _onLeaveEvent: function(event) {
        this._detailBox.hide();
    }
});

