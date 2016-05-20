const St = imports.gi.St;
const Params = imports.misc.params;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const AvatarCache = Me.imports.avatarCache;

const AVATAR_ICON_SIZE = 70;

const Avatar = new Lang.Class({
    Name: 'Avatar',

    _init: function(person, params) {
        this._person = person;

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
        this._cache = new AvatarCache.AvatarCache(person);

        this._updateInfo();
        this._person.connect('changed', Lang.bind(this, this._updateInfo));
    },

    _updateInfo: function() {
        this._nameLabel.text = this._person.name ? this._person.name : this._person.github;
        this._cityLabel.text = this._person.city;

        this._cache.fetchAvatar(Lang.bind(this, this._setBackground));
    },

    _setBackground: function() {
        let filename = this._cache.getFilename();
        if (GLib.file_test(filename, GLib.FileTest.EXISTS)) {
            this.actor.style = 'background-image: url("%s");'.format(filename);
            this.actor.connect('enter-event', Lang.bind(this, this._onEnterEvent));
            this.actor.connect('leave-event', Lang.bind(this, this._onLeaveEvent));
            this._detailBox.visible = false;
            if (this._expandBox.child)
                this._expandBox.remove_actor(this._expandBox.child);
        }
    },

    _createPersonWidget: function() {
        this._expandBox = new St.Bin();
        if (!this._person.avatar) {
            this._defaultAvatarIcon = new St.Icon({ icon_name: 'avatar-default-symbolic'});
            this._expandBox.child = this._defaultAvatarIcon;
        }
        this.actor.add(this._expandBox, {expand: true});
        this._detailBox = new St.BoxLayout({visible: !this._person.avatar, vertical: true, style_class: 'tzi-avatar-name-box'});
        this.actor.add(this._detailBox, {x_fill: true});

        this._nameLabel = new St.Label({text: this._person.name ? this._person.name : this._person.github, style_class: 'tzi-avatar-name'});
        this._detailBox.add(this._nameLabel, {expand: true, x_align: St.Align.MIDDLE, x_fill: false});

        this._cityLabel = new St.Label({text: this._person.city});
        this._detailBox.add(this._cityLabel, {expand: true, x_align: St.Align.MIDDLE, x_fill: false});
    },

    _onEnterEvent: function(event) {
        this._detailBox.show();
    },

    _onLeaveEvent: function(event) {
        this._detailBox.hide();
    }
});

