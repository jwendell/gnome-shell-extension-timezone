imports.gi.versions.Soup = "3.0";

const Lang = imports.lang;
const Signals = imports.signals;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var AvatarCache = new Lang.Class({
    Name: 'AvatarCache',

    _init: function(person) {
        this._person = person;
    },

    fetchAvatar: function(cb) {
        if (!this._person.avatar) {
            cb(false);
            return;
        }

        if (this._handleLocalAvatar()) {
            cb(true);
            return;
        }

        let _httpSession = new Soup.Session({user_agent: 'jwendell/gnome-shell-extension-timezone'});
        let message = Soup.Message.new('GET', this._person.avatar);
        if (message == null) {
            log('Avatar for %s (%s) is not valid.'.format(this._person.getName(), this._person.avatar));
            cb(false);
            return;
        }

        _httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null, Lang.bind(this, function(session, result) {
            if (message.get_status() != Soup.Status.OK) {
                log('Response code "%d" getting avatar for user %s'.format(message.get_status(), this._person.getName()));
                cb(false);
                return;
            }

            let bytes = session.send_and_read_finish(result);
            let filename = this.getFilename();

            GLib.file_set_contents(filename, bytes.get_data());
            cb(true);
        }));

    },

    getFilename: function() {
        let id = this._person.getName().trim().toLowerCase();
        let hash = GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, id, -1);
        let filename = GLib.build_filenamev([GLib.get_user_cache_dir(), Me.metadata.uuid, hash]);

        return filename;
    },

    _handleLocalAvatar: function() {
        let filename = this._person.avatar

        // Sanity check
        if (filename.length == 0) {
            return true;
        }

        // Only handle files in filesystem
        if (filename[0] != '/' && filename.substring(0, 7) != "file://") {
            return false
        }

        if (filename[0] == '/') {
            filename = "file://" + filename
        }

        let file = Gio.File.new_for_uri(filename);
        let dest = Gio.File.new_for_path(this.getFilename());
        try {
            file.copy(dest, Gio.FileCopyFlags.OVERWRITE, null, null);
        } catch (e) {
            log('Error building an avatar cache for user %s: %s'.format(this._person.getName(), e));
        }

        return true;
    }
});
