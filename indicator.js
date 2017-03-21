const GLib = imports.gi.GLib;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const GnomeDesktop = imports.gi.GnomeDesktop;
const Shell = imports.gi.Shell;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const World = Me.imports.world;
const Avatar = Me.imports.avatar;
const Convenience = Me.imports.convenience;

const TimezoneIndicator = new Lang.Class({
    Name: 'TimezoneIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.5, _("Timezone Indicator"));

        this._icon = new St.Icon({ icon_name: 'timezone@jwendell-symbolic', style_class: 'system-status-icon' });
        this.actor.add_actor(this._icon);

        Main.panel.menuManager.addMenu(this.menu);
        this._item = new PopupMenu.PopupBaseMenuItem({reactive: false});
        this.menu.addMenuItem(this._item);

        this._createWorld();

        this._clock = new GnomeDesktop.WallClock();
        this._clockChangedSignalId = this._clock.connect('notify::clock', Lang.bind(this, this._updateTimezones));

        this._settings = Convenience.getSettings();
        this._settingsChangedSignalId = this._settings.connect('changed::path-to-people-json', Lang.bind(this, this._createWorld));

        this._setupScreen();
    },

	destroy: function() {
		this._clock.disconnect(this._clockChangedSignalId);
		this._settings.disconnect(this._settingsChangedSignalId);

		this.parent();
	},

    _setupScreen: function() {
        this._screenHeight = global.screen_height;
        global.screen.connect('monitors-changed', Lang.bind(this, function() {
            if (global.screen_height == this._screenHeight)
                return;
            log('Resolution changed, recreating timezone UI');
            this._screenHeight = global.screen_height;
            this._createWorld();
        }));
    },

    _createWorld: function() {
        this._world = new World.World;
        this._world.connect('changed', Lang.bind(this, this._createUI));
        this._createUI();
    },

    _updateTimezones: function() {
        this._timezones.forEach(function (timezone) {
            let time = GLib.DateTime.new_now(timezone.tz.tz1);
            let settings = Convenience.getSettings();
            const start = settings.get_int("working-hours-start");
            const end = settings.get_int("working-hours-end");

            timezone.label.text = Util.formatTime(time, { timeOnly: true });
            timezone.label.style_class = 'tzi-time-label';

            if (timezone.tz.sameAsSystem)
                timezone.label.style_class += ' tzi-time-label-system';

            if (settings.get_boolean("enable-working-hours")) {
                timezone.label.style_class += ' tzi-time-label-active';

                if (start < end) {
                    if (time.get_hour(time) < start || time.get_hour(time) >= end)
                        timezone.label.style_class += ' tzi-time-label-inactive';
                } else {
                    if (time.get_hour(time) >= end && time.get_hour(time) < start)
                        timezone.label.style_class += ' tzi-time-label-inactive';
                }
            }
        });
    },

    _createInfoLine: function() {
        let box = new St.BoxLayout();
        this._mainBox.add(box, {expand: true, x_fill: false, x_align: St.Align.MIDDLE});

        this._infoLabel = new St.Button({reactive: true, track_hover: true, style_class: 'datemenu-today-button'});
        this._infoLabel.connect('clicked', Lang.bind(this, function () {
            this.menu.close();
            openConfigWidget();
        }));
        box.add(this._infoLabel);
    },

    _getTimezonesCB: function(timezones) {
        if (timezones.error) {
            this._infoLabel.label = timezones.error;
            return;
        }

        let peopleCount = 0;
        this._timezones = [];

        let availableHeight = global.screen_height - 250;
        let avatarWidth = 70;
        let maxAvatarsColumn = Math.floor(availableHeight / avatarWidth);

        timezones.forEach(Lang.bind(this, function(tz) {
            let tzBox = new St.BoxLayout({vertical: true});
            this._tzsBox.add(tzBox);
            let timeLabel = new St.Label({style_class: 'tzi-time-label'});
            this._timezones.push({tz: tz, label: timeLabel});

            tzBox.add(timeLabel, {x_align: St.Align.MIDDLE, x_fill: false});

            tz.topCityLabel = new St.Label({text: tz.topCity.toUpperCase(), style_class: 'tzi-tz-topCity'});
            tzBox.add(tz.topCityLabel, {x_align: St.Align.MIDDLE, x_fill: false});
            tz.connect('changed', Lang.bind(this, function() {
                tz.topCityLabel.text = tz.topCity;
            }));

            tzBox.add(new St.Label({text: tz.niceOffset, style_class: 'tzi-tz-offset'}),
                      {x_align: St.Align.MIDDLE, x_fill: false});

            let people = tz.getPeople();
            peopleCount += people.length;

            let columns = Math.ceil(people.length / maxAvatarsColumn);
            let i = 0;
            let rowBox;

            people.forEach(function(person) {
                if (i++ % columns == 0) {
                    rowBox = new St.BoxLayout({style: 'spacing: 20px'});
                    tzBox.add(rowBox);
                }
                let iconBin = new St.Bin();
                let avatar = new Avatar.Avatar(person);
                iconBin.child = avatar.actor;
                rowBox.add(iconBin, {x_align: St.Align.START, x_fill: false});
            });
        }));

        this._infoLabel.label = '%d people distributed in %d time zones...'.format(peopleCount, timezones.length);
        this._updateTimezones();
    },

    _createUI: function() {
        if (this._mainBox)
            this._item.actor.remove_actor(this._mainBox);

        this._mainBox = new St.BoxLayout({vertical: true});
        this._tzsBox = new St.BoxLayout({style_class: 'tz1-people-box'});
        this._mainBox.add(this._tzsBox);
        this._createInfoLine();
        this._item.actor.add_actor(this._mainBox);

        this._world.getTimezones(Lang.bind(this, this._getTimezonesCB));
    }
});

function openConfigWidget() {
    let _appSys = Shell.AppSystem.get_default();
    let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');

    if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING) {
        _gsmPrefs.activate();
    } else {
        let info = _gsmPrefs.get_app_info();
        let timestamp = global.display.get_current_time_roundtrip();
        let metadata = Me.metadata;
        info.launch_uris([metadata.uuid], global.create_app_launch_context(timestamp, -1));
    }
}

