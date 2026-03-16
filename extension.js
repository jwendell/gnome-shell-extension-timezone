import GLib from 'gi://GLib';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Indicator from './indicator.js';

export default class TimezoneExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._indicator = null;
        this._settings = null;
        this._settingsChangedId = null;
    }

    enable() {
        // Setup icon theme
        const iconTheme = new St.IconTheme();
        iconTheme.append_search_path(this.path + '/icons');

        // Create cache directory
        const cacheDir = GLib.build_filenamev([GLib.get_user_cache_dir(), this.uuid]);
        GLib.mkdir_with_parents(cacheDir, 0o755);

        // Get settings
        this._settings = this.getSettings();

        // Create and add indicator
        this._indicator = new Indicator.TimezoneIndicator(this);
        this._settingsChangedId = this._settings.connect('changed::panel-position',
            () => this._updatePanelPosition());
        this._updatePanelPosition();
    }

    disable() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._settings = null;
    }

    _updatePanelPosition() {
        const panelPosition = this._settings.get_string('panel-position');

        const container = this._indicator.container;
        const parent = container.get_parent();
        if (parent)
            parent.remove_child(container);

        let box;
        if (panelPosition === 'left')
            box = Main.panel._leftBox;
        else if (panelPosition === 'center')
            box = Main.panel._centerBox;
        else
            box = Main.panel._rightBox;

        // Avoid positioning the icon on the leftmost side of the panel
        const index = panelPosition === 'left' ? box.get_n_children() : 0;
        box.insert_child_at_index(container, index);
    }
}
