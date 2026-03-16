import GLib from 'gi://GLib';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import GnomeDesktop from 'gi://GnomeDesktop';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {World} from './world.js';
import {Avatar} from './avatar.js';
import {formatTime} from './util.js';

export const TimezoneIndicator = GObject.registerClass(
class TimezoneIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.5, _('Timezone Indicator'));

        this._extension = extension;
        this._settings = extension.getSettings();
        this._timezones = [];

        this._icon = new St.Icon({style_class: 'system-status-icon'});
        this._icon.gicon = Gio.icon_new_for_string(`${extension.path}/icons/timezone@jwendell-symbolic.svg`);
        this.add_child(this._icon);

        Main.panel.menuManager.addMenu(this.menu);
        this._item = new PopupMenu.PopupBaseMenuItem({reactive: false});
        this.menu.addMenuItem(this._item);

        this._createWorld();

        this._clock = new GnomeDesktop.WallClock();
        this._clockChangedId = this._clock.connect('notify::clock', () => this._updateTimezones());

        this._settingsChangedId = this._settings.connect('changed::path-to-people-json',
            () => this._createWorld());

        this._setupScreen();
    }

    destroy() {
        if (this._clockChangedId) {
            this._clock.disconnect(this._clockChangedId);
            this._clockChangedId = null;
        }

        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        if (this._monitorChangedId) {
            Main.layoutManager.disconnect(this._monitorChangedId);
            this._monitorChangedId = null;
        }

        super.destroy();
    }

    _setupScreen() {
        this._screenHeight = global.screen_height;
        this._monitorChangedId = Main.layoutManager.connect('monitors-changed', () => {
            if (global.screen_height === this._screenHeight)
                return;
            log('Resolution changed, recreating timezone UI');
            this._screenHeight = global.screen_height;
            this._createUI();
        });
    }

    _createWorld() {
        if (this._world) {
            this._world.disconnect(this._worldChangedId);
            this._world = null;
        }

        this._world = new World(this._extension);
        this._worldChangedId = this._world.connect('changed', () => this._createUI());
        this._createUI();
    }

    _updateTimezones() {
        if (!this._timezones)
            return;

        const start = this._settings.get_int('working-hours-start');
        const end = this._settings.get_int('working-hours-end');
        const enableWorkingHours = this._settings.get_boolean('enable-working-hours');

        for (const timezone of this._timezones) {
            const time = GLib.DateTime.new_now(timezone.tz.tz1);
            timezone.label.text = formatTime(time);
            timezone.label.style_class = 'tzi-time-label';

            if (timezone.tz.sameAsSystem)
                timezone.label.style_class += ' tzi-time-label-system';

            if (enableWorkingHours) {
                timezone.label.style_class += ' tzi-time-label-active';
                const hour = time.get_hour();

                if (start < end) {
                    if (hour < start || hour >= end)
                        timezone.label.style_class += ' tzi-time-label-inactive';
                } else {
                    if (hour >= end && hour < start)
                        timezone.label.style_class += ' tzi-time-label-inactive';
                }
            }
        }
    }

    _createInfoLine() {
        const box = new St.BoxLayout({x_expand: true, y_expand: true, x_align: Clutter.ActorAlign.CENTER});
        this._mainBox.add_child(box);

        this._infoLabel = new St.Button({reactive: true, track_hover: true, style_class: 'datemenu-today-button'});
        this._infoLabel.connect('clicked', () => {
            this.menu.close();
            ExtensionUtils.openPrefs();
        });
        box.add_child(this._infoLabel);
    }

    _getTimezonesCB(timezones) {
        this._timezones = [];

        if (timezones.error) {
            this._infoLabel.label = timezones.error;
            return;
        }

        let peopleCount = 0;
        const availableHeight = global.screen_height - 250;
        const avatarWidth = 70;
        const maxAvatarsColumn = Math.floor(availableHeight / avatarWidth);

        for (const tz of timezones) {
            const tzBox = new St.BoxLayout({vertical: true});
            this._tzsBox.add_child(tzBox);

            const timeLabel = new St.Label({style_class: 'tzi-time-label', x_align: Clutter.ActorAlign.CENTER});
            this._timezones.push({tz, label: timeLabel});
            tzBox.add_child(timeLabel);

            tz.topCityLabel = new St.Label({text: tz.topCity.toUpperCase(), style_class: 'tzi-tz-topCity', x_align: Clutter.ActorAlign.CENTER});
            tzBox.add_child(tz.topCityLabel);

            tz.connect('changed', () => {
                tz.topCityLabel.text = tz.topCity;
            });

            tzBox.add_child(new St.Label({text: tz.niceOffset, style_class: 'tzi-tz-offset', x_align: Clutter.ActorAlign.CENTER}));

            const people = tz.getPeople();
            peopleCount += people.length;

            const columns = Math.ceil(people.length / maxAvatarsColumn);
            let i = 0;
            let rowBox;

            for (const person of people) {
                if (i++ % columns === 0) {
                    rowBox = new St.BoxLayout({style: 'spacing: 20px'});
                    tzBox.add_child(rowBox);
                }
                const iconBin = new St.Bin({x_align: Clutter.ActorAlign.START});
                const avatar = new Avatar(person);
                iconBin.child = avatar.actor;
                rowBox.add_child(iconBin);
            }
        }

        this._infoLabel.label = _('%d people distributed in %d time zones...').format(peopleCount, timezones.length);
        this._updateTimezones();
    }

    _createUI() {
        if (this._mainBox) {
            this._item.remove_child(this._mainBox);
        }

        this._mainBox = new St.BoxLayout({vertical: true});
        this._tzsBox = new St.BoxLayout({style_class: 'tz1-people-box'});
        this._mainBox.add_child(this._tzsBox);
        this._createInfoLine();
        this._item.add_child(this._mainBox);

        this._world.getTimezones(timezones => this._getTimezonesCB(timezones));
    }
});
