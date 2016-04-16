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

        this._icon = new St.Icon({ icon_name: 'gnome-clocks-symbolic', fallback_icon_name: 'org.gnome.clocks-symbolic', style_class: 'system-status-icon' });
        this.actor.add_actor(this._icon);

        Main.panel.menuManager.addMenu(this.menu);
        this._item = new PopupMenu.PopupBaseMenuItem({reactive: false});
        this.menu.addMenuItem(this._item);

        //this._createUI();
        this._createWorld();

        this._clock = new GnomeDesktop.WallClock();
        this._clock.connect('notify::clock', Lang.bind(this, this._updateTimezones));

        this._settings = Convenience.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._createWorld));
    },

    _createWorld: function() {
        this._world = new World.World;
        this._world.connect('changed', Lang.bind(this, this._createUI));
        this._createUI();
    },

    _updateTimezones: function() {
        this._timezones.forEach(function (timezone) {
            let time = GLib.DateTime.new_now(timezone.tz);
            timezone.label.text = time.format('%H:%M');
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

    _createUI: function() {
        if (this._mainBox)
            this._item.actor.remove_actor(this._mainBox);
        this._mainBox = new St.BoxLayout({vertical: true});
        let tzsBox = new St.BoxLayout({style_class: 'tz1-people-box'});
        this._mainBox.add(tzsBox);
        this._createInfoLine();

        this._timezones = [];

        let timezones = this._world.getTimezones();
        if (timezones.error) {
            this._infoLabel.label = timezones.error;
        } else {
            let peopleCount = 0;

            timezones.forEach(Lang.bind(this, function(tz) {
                let tzBox = new St.BoxLayout({vertical: true, width: 70});
                tzsBox.add(tzBox);
                let timeLabel = new St.Label({style_class: 'tzi-time-label'});
                if (tz.sameAsSystem)
                    timeLabel.style_class += ' tzi-time-label-system';
                this._timezones.push({tz: tz.tz1, label: timeLabel});

                tzBox.add(timeLabel, {x_align: St.Align.START, x_fill: false});

                tz.topCityLabel = new St.Label({text: tz.topCity.toUpperCase(), style_class: 'tzi-tz-topCity'});
                tzBox.add(tz.topCityLabel);
                tz.connect('changed', Lang.bind(this, function() {
                    tz.topCityLabel.text = tz.topCity;
                }));

                tzBox.add(new St.Label({text: tz.niceOffset, style_class: 'tzi-tz-offset'}));

                tz.getPeople().forEach(function(person) {
                  peopleCount++;
                  let iconBin = new St.Bin();
                  let avatar = new Avatar.Avatar(person);
                  iconBin.child = avatar.actor;
                  tzBox.add(iconBin, {x_align: St.Align.START, x_fill: false});
                });
            }));

            this._infoLabel.label = '%d people distributed in %d time zones...'.format(peopleCount, timezones.length);
            this._updateTimezones();
        }

        this._item.actor.add_actor(this._mainBox);
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

