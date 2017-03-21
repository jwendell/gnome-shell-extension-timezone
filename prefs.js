const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const TimezoneExtensionPrefsWidget = new GObject.Class({
    Name: 'TimezoneExtension.Prefs.Widget',
    GTypeName: 'TimezoneExtensionPrefsWidget',
    Extends: Gtk.Grid,

    _init: function(params) {
        this.parent(params);
        this.orientation = Gtk.Orientation.VERTICAL;
        this.margin = 12;
        this._settings = Convenience.getSettings();

        this.add(new Gtk.Label({ label: '<b>Location for the <i>people.json</i> file</b>',
                                 use_markup: true, margin_bottom: 6,
                                 hexpand: true, halign: Gtk.Align.START }));

        let box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});
        box.add(this._createEntry());
        box.add(this._createFileChooser());
        this.add(box);

        this.add(new Gtk.Label({ label: '<small>Remote files, e.g., starting with <i>http://</i> are also valid. <a href="https://github.com/jwendell/gnome-shell-extension-timezone/blob/master/editing-people.md">Need help with JSON?</a></small>',
                                 use_markup: true, margin_bottom: 6,
                                 hexpand: true, halign: Gtk.Align.START}));

        this.add(this._createHighlightBox());
        this.add(this._createSaveButton());
    },

    _createEntry: function() {
        this._entry = new Gtk.Entry({hexpand: true,
                                     text: this._settings.get_string("path-to-people-json"),
                                     activates_default: true});
        return this._entry;
    },

    _createHighlightBox: function() {
        let box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                               margin_bottom: 20, margin_top: 20});

        let box1 = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});
        box.add(box1);
        let label = new Gtk.Label({label: '<b>Highlight working hours</b>',
                                 use_markup: true, hexpand: true,
                                 halign: Gtk.Align.START});
        box1.add(label);
        let sb = new Gtk.Switch();
        this._settings.bind('enable-working-hours', sb, 'active', Gio.SettingsBindFlags.DEFAULT);
        box1.add(sb);

        let box2 = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,
                                spacing: 5});
        box.add(box2);
        sb.bind_property('active', box2, 'sensitive', GObject.BindingFlags.SYNC_CREATE);

        box2.add(new Gtk.Label({label: 'From'}));
        let from = Gtk.SpinButton.new_with_range (0, 23, 1);
        box2.add(from);
        this._settings.bind('working-hours-start', from, 'value', Gio.SettingsBindFlags.DEFAULT);

        box2.add(new Gtk.Label({label: 'to'}));
        let to = Gtk.SpinButton.new_with_range (0, 23, 1);
        box2.add(to);
        this._settings.bind('working-hours-end', to, 'value', Gio.SettingsBindFlags.DEFAULT);

        return box;
    },

    _createFileChooser: function() {
        this._chooser = new Gtk.FileChooserButton({local_only: false});
        this._chooser.set_uri(this._settings.get_string("path-to-people-json"));
        this._chooser.connect('file-set', Lang.bind(this, function() {
            this._entry.text = this._chooser.get_uri();
        }));

        return this._chooser;
    },

    _createSaveButton: function() {
        let b = new Gtk.Button({label: "Save",
                                halign: Gtk.Align.END,
                                hexpand: false,
                                can_default: true});
        b.get_style_context().add_class('suggested-action');
        b.connect("clicked", Lang.bind(this, function() {
            this._settings.set_string("path-to-people-json", this._entry.text);
            Gio.Application.get_default().quit();
        }));
        return b;
    }
});

function init() {

}

function buildPrefsWidget() {
    let widget = new TimezoneExtensionPrefsWidget();
    widget.show_all();

    return widget;
}
