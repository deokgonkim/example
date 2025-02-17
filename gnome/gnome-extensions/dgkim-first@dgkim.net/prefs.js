import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class DgkimFirstPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Appearance'),
            description: _('Configure the appearance of the extension'),
        });
        page.add(group);

        const row = new Adw.SwitchRow({
            title: _('Increase Counter'),
            subtitle: _('Wether to increase counter or not'),
        });
        group.add(row);

        window._settings = this.getSettings();
        window._settings.bind('increase-counter', row, 'active', Gio.SettingsBindFlags.DEFAULT);
    }
}
