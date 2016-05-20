const Main = imports.ui.main;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Indicator = Me.imports.indicator;

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    let cacheDir = GLib.build_filenamev([GLib.get_user_cache_dir(), Me.metadata.uuid]);
    GLib.mkdir_with_parents(cacheDir, parseInt("0755", 8));
}

let _indicator;

function enable() {
    _indicator = new Indicator.TimezoneIndicator;
    Main.panel.addToStatusArea('timezone-indicator', _indicator, 0, 'center');
}

function disable() {
    _indicator.destroy();
    _indicator = null;
}

