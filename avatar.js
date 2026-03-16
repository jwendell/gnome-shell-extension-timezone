import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import {AvatarCache} from './avatarCache.js';

const AVATAR_ICON_SIZE = 70;

export class Avatar {
    constructor(person, extension) {
        this._person = person;
        this._extension = extension;

        const scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;

        this.actor = new St.BoxLayout({
                track_hover: true,
                reactive: true,
                width: AVATAR_ICON_SIZE * scaleFactor,
                height: AVATAR_ICON_SIZE * scaleFactor,
                can_focus: true,
                vertical: true,
                style_class: 'tzi-avatar-main-box'
            });

        this._createPersonWidget();
        this._cache = new AvatarCache(person, extension);

        this._updateInfo();
        this._changedId = this._person.connect('changed', () => this._updateInfo());
    }

    destroy() {
        if (this._changedId) {
            this._person.disconnect(this._changedId);
            this._changedId = null;
        }
        if (this._enterEventId) {
            this.actor.disconnect(this._enterEventId);
            this._enterEventId = null;
        }
        if (this._leaveEventId) {
            this.actor.disconnect(this._leaveEventId);
            this._leaveEventId = null;
        }
        this._cache = null;
    }

    _updateInfo() {
        this._nameLabel.text = this._person.getName();
        this._cityLabel.text = this._person.city;

        this._cache.fetchAvatar(success => {
            if (success)
                this._setBackground();
        });
    }

    _setBackground() {
        const filename = this._cache.getFilename();
        if (GLib.file_test(filename, GLib.FileTest.EXISTS)) {
            const uri = filename.startsWith('file://') ? filename : `file://${filename}`;
            this.actor.style = `background-image: url("${uri}")`;

            // Disconnect old handlers before connecting new ones
            if (this._enterEventId)
                this.actor.disconnect(this._enterEventId);
            if (this._leaveEventId)
                this.actor.disconnect(this._leaveEventId);

            this._enterEventId = this.actor.connect('enter-event', () => this._onEnterEvent());
            this._leaveEventId = this.actor.connect('leave-event', () => this._onLeaveEvent());
            this._detailBox.visible = false;
            if (this._expandBox.child)
                this._expandBox.remove_child(this._expandBox.child);
        }
    }

    _createPersonWidget() {
        this._expandBox = new St.Bin({x_expand: true, y_expand: true});
        if (!this._person.avatar) {
            this._defaultAvatarIcon = new St.Icon({icon_name: 'avatar-default-symbolic'});
            this._expandBox.child = this._defaultAvatarIcon;
        }
        this.actor.add_child(this._expandBox);

        this._detailBox = new St.BoxLayout({
            visible: !this._person.avatar,
            vertical: true,
            style_class: 'tzi-avatar-name-box'
            });
        this.actor.add_child(this._detailBox);

        this._nameLabel = new St.Label({
            text: this._person.getName(),
            style_class: 'tzi-avatar-name',
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.CENTER
            });
        this._detailBox.add_child(this._nameLabel);

        this._cityLabel = new St.Label({
                text: this._person.city,
                x_expand: true,
                y_expand: true,
                x_align: Clutter.ActorAlign.CENTER
            });
        this._detailBox.add_child(this._cityLabel);
    }

    _onEnterEvent() {
        this._detailBox.show();
    }

    _onLeaveEvent() {
        this._detailBox.hide();
    }
}
