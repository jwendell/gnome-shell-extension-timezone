const Main = imports.ui.main;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Indicator = Me.imports.indicator;

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    let cacheDir = GLib.build_filenamev([GLib.get_user_cache_dir(), Me.metadata.uuid]);
    GLib.mkdir_with_parents(cacheDir, parseInt("0755", 8));
}

let _indicator;
let _settings;
let _settingsChangedSignalId;

function _updatePanelPosition() {
    let panelPosition = _settings.get_string('panel-position');

    let container = _indicator.container;
    let parent = container.get_parent();
    if (parent)
        parent.remove_actor(container);

    let box;
    if (panelPosition == 'left')
        box = Main.panel._leftBox;
    else if (panelPosition == 'center')
        box = Main.panel._centerBox;
    else
        box = Main.panel._rightBox;

    // Avoid positioning the icon on the leftmost side of the panel.
    let index = panelPosition == 'left' ? box.get_n_children() : 0;
    box.insert_child_at_index(_indicator.container, index);
}

function enable() {
    _indicator = new Indicator.TimezoneIndicator;
    _settings = Convenience.getSettings();
    _settingsChangedSignalId = _settings.connect('changed::panel-position', _updatePanelPosition);
    _updatePanelPosition();
}

function disable() {
    _settings.disconnect(_settingsChangedSignalId);
    _settings = null;

    _indicator.destroy();
    _indicator = null;
}

