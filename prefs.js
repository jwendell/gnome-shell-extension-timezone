import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TimezonePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Configuration'),
        });
        page.add(group);

        // Path to people.json
        const pathRow = new Adw.ActionRow({
            title: _('Location for people.json file'),
            subtitle: _('Local file or remote URL (http://, https://)'),
        });
        group.add(pathRow);

        const pathEntry = new Gtk.Entry({
            hexpand: true,
            text: settings.get_string('path-to-people-json'),
            activates_default: true,
        });
        pathEntry.connect('changed', () => {
            settings.set_string('path-to-people-json', pathEntry.text);
        });
        pathRow.add_suffix(pathEntry);

        // File chooser button
        const fileButton = new Gtk.Button({
            icon_name: 'document-open',
            tooltip_text: _('Choose a file'),
        });
        fileButton.connect('clicked', () => {
            const chooser = new Gtk.FileChooserNative({
                modal: true,
                title: _('Choose a people.json file'),
                transient_for: window,
            });

            chooser.connect('response', (_, response) => {
                if (response !== Gtk.ResponseType.ACCEPT)
                    return;

                const fileURI = chooser.get_file().get_uri();
                pathEntry.set_text(fileURI);
            });

            chooser.show();
        });
        pathRow.add_suffix(fileButton);

        // Working hours group
        const workingGroup = new Adw.PreferencesGroup({
            title: _('Working Hours'),
        });
        page.add(workingGroup);

        const workingRow = new Adw.ActionRow({
            title: _('Highlight working hours'),
        });
        workingGroup.add(workingRow);

        const workingSwitch = new Gtk.Switch({
            active: settings.get_boolean('enable-working-hours'),
        });
        workingSwitch.connect('notify::active', () => {
            settings.set_boolean('enable-working-hours', workingSwitch.active);
        });
        workingRow.add_suffix(workingSwitch);

        // Hours range
        const hoursRow = new Adw.ActionRow({
            title: _('Working hours range'),
            subtitle: _('People outside these hours will be dimmed'),
        });
        workingGroup.add(hoursRow);

        const hoursBox = new Gtk.Box({
            spacing: 12,
        });
        hoursRow.add_suffix(hoursBox);

        hoursBox.append(new Gtk.Label({label: _('From')}));
        const fromSpin = Gtk.SpinButton.new_with_range(0, 23, 1);
        fromSpin.value = settings.get_int('working-hours-start');
        fromSpin.connect('value-changed', () => {
            settings.set_int('working-hours-start', fromSpin.value);
        });
        hoursBox.append(fromSpin);

        hoursBox.append(new Gtk.Label({label: _('to')}));
        const toSpin = Gtk.SpinButton.new_with_range(0, 23, 1);
        toSpin.value = settings.get_int('working-hours-end');
        toSpin.connect('value-changed', () => {
            settings.set_int('working-hours-end', toSpin.value);
        });
        hoursBox.append(toSpin);

        // Panel configuration
        const panelGroup = new Adw.PreferencesGroup({
            title: _('Panel'),
        });
        page.add(panelGroup);

        const positionRow = new Adw.ActionRow({
            title: _('Position in panel'),
        });
        panelGroup.add(positionRow);

        const positionCombo = new Gtk.DropDown({
            model: new Gtk.StringList(),
            selected: ['left', 'center', 'right'].indexOf(settings.get_string('panel-position')),
        });
        positionCombo.model.splice(0, 0, [_('Left'), _('Center'), _('Right')]);

        positionCombo.connect('notify::selected', () => {
            const positions = ['left', 'center', 'right'];
            settings.set_string('panel-position', positions[positionCombo.selected]);
        });
        positionRow.add_suffix(positionCombo);

        // Help text
        const helpGroup = new Adw.PreferencesGroup();
        page.add(helpGroup);

        const helpRow = new Adw.ActionRow({
            title: _('Need help with JSON format?'),
        });
        helpGroup.add(helpRow);

        const helpButton = new Gtk.Button({
            label: _('Open Guide'),
        });
        helpButton.connect('clicked', () => {
            Gtk.show_uri(window, 'https://github.com/jwendell/gnome-shell-extension-timezone/blob/master/editing-people.md');
        });
        helpRow.add_suffix(helpButton);
    }
}
