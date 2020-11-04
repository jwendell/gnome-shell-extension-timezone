const St = imports.gi.St;
const Params = imports.misc.params;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const AvatarCache = Me.imports.avatarCache;

const AVATAR_ICON_SIZE = 70;

var Avatar = new Lang.Class({
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
        this._nameLabel.text = this._person.getName();
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
        this._expandBox = new St.Bin({x_expand: true, y_expand: true});
        if (!this._person.avatar) {
            this._defaultAvatarIcon = new St.Icon({ icon_name: 'avatar-default-symbolic'});
            this._expandBox.child = this._defaultAvatarIcon;
        }
        this.actor.add_child(this._expandBox);
        this._detailBox = new St.BoxLayout({visible: !this._person.avatar, vertical: true, style_class: 'tzi-avatar-name-box'});
        this.actor.add_child(this._detailBox);

        this._nameLabel = new St.Label({text: this._person.getName(), style_class: 'tzi-avatar-name', x_expand: true, y_expand: true, x_align: Clutter.ActorAlign.CENTER});
        this._detailBox.add_child(this._nameLabel);

        this._cityLabel = new St.Label({text: this._person.city, x_expand: true, y_expand: true, x_align: Clutter.ActorAlign.CENTER});
        this._detailBox.add_child(this._cityLabel);
    },

    _onEnterEvent: function(event) {
        this._detailBox.show();
    },

    _onLeaveEvent: function(event) {
        this._detailBox.hide();
    }
});

