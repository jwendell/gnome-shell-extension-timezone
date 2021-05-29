const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const prefs3 = Me.imports.prefs3;
const prefs4 = Me.imports.prefs4;

function init() {

}

function buildPrefsWidget() {
    if (Gtk.get_major_version() == 3) {
        return new prefs3.TimezoneExtensionPrefsWidget3();
    }

    return new prefs4.TimezoneExtensionPrefsWidget4();
}
