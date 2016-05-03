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

        this.add(this._createSaveButton());
    },

    _createEntry: function() {
        this._entry = new Gtk.Entry({hexpand: true,
                                     text: this._settings.get_string("path-to-people-json"),
                                     activates_default: true});
        return this._entry;
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
