const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const TimezoneExtensionPrefsWidget4 = new GObject.Class({
    Name: 'TimezoneExtension.Prefs4.Widget',
    GTypeName: 'TimezoneExtensionPrefsWidget4',
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);
        this.orientation = Gtk.Orientation.VERTICAL;
        this.margin_start = 12;
        this.margin_end = 12;
        this.margin_top = 12;
        this.margin_bottom = 12;
        this._settings = Convenience.getSettings();

        this.append(new Gtk.Label({ label: '<b>Location for the <i>people.json</i> file</b>',
                                 use_markup: true, margin_bottom: 6,
                                 hexpand: true, halign: Gtk.Align.START }));

        this.append(this._createEntry());

        this.append(new Gtk.Label({ label: '<small>Remote files, e.g., starting with <i>http://</i> are also valid. <a href="https://github.com/jwendell/gnome-shell-extension-timezone/blob/master/editing-people.md">Need help with JSON?</a></small>',
                                 use_markup: true, margin_bottom: 6,
                                 hexpand: true, halign: Gtk.Align.START}));

        this.append(this._createHighlightBox());
        this.append(this._createPanelConfiguration());
    },

    _createEntry: function() {
        this._entry = new Gtk.Entry({
            hexpand: true,
            text: this._settings.get_string("path-to-people-json"),
            activates_default: true,
            secondary_icon_name: "document-open",
            secondary_icon_activatable: true,
            secondary_icon_tooltip_text: "Pick a file using a file chooser"
        });
        this._entry.connect("icon-release", Lang.bind(this, function() {
            this._chooser.transient_for = this.get_root()
            this._chooser.show();
        }));

        this._chooser = new Gtk.FileChooserNative({
            modal: true,
            title: "Choose a people.json file"
        });

        this._chooser.connect("response", Lang.bind(this, function(_, response) {
            if (response !== Gtk.ResponseType.ACCEPT) {
                return;
            }
            let fileURI = this._chooser.get_file().get_uri();
            this._entry.set_text(fileURI);
            this._settings.set_string("path-to-people-json", this._entry.text);
        }));

        return this._entry;
    },

    _createHighlightBox: function() {
        let box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                               margin_bottom: 20, margin_top: 20});

        let box1 = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});
        box.append(box1);
        let label = new Gtk.Label({label: '<b>Highlight working hours</b>',
                                 use_markup: true, hexpand: true,
                                 halign: Gtk.Align.START, margin_bottom: 5});
        box1.append(label);
        let sb = new Gtk.Switch();
        this._settings.bind('enable-working-hours', sb, 'active', Gio.SettingsBindFlags.DEFAULT);
        box1.append(sb);

        let box2 = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,
                                spacing: 5});
        box.append(box2);
        sb.bind_property('active', box2, 'sensitive', GObject.BindingFlags.SYNC_CREATE);

        box2.append(new Gtk.Label({label: 'From'}));
        let from = Gtk.SpinButton.new_with_range (0, 23, 1);
        box2.append(from);
        this._settings.bind('working-hours-start', from, 'value', Gio.SettingsBindFlags.DEFAULT);

        box2.append(new Gtk.Label({label: 'to'}));
        let to = Gtk.SpinButton.new_with_range (0, 23, 1);
        box2.append(to);
        this._settings.bind('working-hours-end', to, 'value', Gio.SettingsBindFlags.DEFAULT);

        return box;
    },

    _createPanelConfiguration: function() {
        let box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});

        let box1 = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});
        box.append(box1);
        let label = new Gtk.Label({label: '<b>Panel configuration</b>',
                      use_markup: true, hexpand: true,
                      halign: Gtk.Align.START, margin_bottom: 5});
        box1.append(label);

        let box2 = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});
        box.append(box2);

        box2.append(new Gtk.Label({label: 'Position in panel'}));

        let combo = new Gtk.ComboBoxText({ active_id: this._settings.get_string('panel-position') });
        combo.append('left', "Left");
        combo.append('center', "Center");
        combo.append('right', "Right");

        this._settings.bind('panel-position', combo, 'active-id', Gio.SettingsBindFlags.DEFAULT);
        box2.append(combo);

        return box;
    }
});
