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
        let uri = new Soup.URI(this._person.avatar);
        if (uri == null) {
            log('Avatar for %s (%s) is not valid.'.format(this._person.getName(), this._person.avatar));
            cb(false);
            return;
        }

        let message = new Soup.Message({method: 'GET', uri: uri});

        _httpSession.queue_message(message, Lang.bind(this, function(session, message) {
            if (message.status_code != Soup.KnownStatusCode.OK) {
                log('Response code "%d" getting avatar for user %s. Got: %s'.format(message.status_code, this._person.getName(), message.response_body.data));
                cb(false);
                return;
            }
            let filename = this.getFilename();
            GLib.file_set_contents(filename, message.response_body.flatten().get_as_bytes().get_data());
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
        let file = Gio.File.parse_name(this._person.avatar);
        if (!file.is_native())
            return false;

        let dest = Gio.File.new_for_path(this.getFilename());
        try {
            file.copy(dest, Gio.FileCopyFlags.OVERWRITE, null, null);
        } catch (e) {
            log('Error building an avatar cache for user %s: %s'.format(this._person.getName(), e));
        }

        return true;
    }
});

