import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Soup from 'gi://Soup?version=3.0';

import {md5Hash, getSharedSession} from './util.js';

export class AvatarCache {
    constructor(person, extension) {
        this._person = person;
        this._extension = extension;
    }

    fetchAvatar(cb) {
        if (!this._person.avatar) {
            cb(false);
            return;
        }

        if (this._handleLocalAvatar()) {
            cb(true);
            return;
        }

        const session = getSharedSession();
        let uri;
        try {
            uri = GLib.Uri.parse(this._person.avatar, GLib.UriFlags.NONE);
        } catch (e) {
            log(`Avatar for ${this._person.getName()} (${this._person.avatar}) is not valid: ${e}`);
            cb(false);
            return;
        }

        const message = Soup.Message.new_from_uri('GET', uri);

        session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null,
            (sess, result) => {
                if (message.get_status() !== Soup.Status.OK) {
                    log(`Response code "${message.get_status()}" getting avatar for user ${this._person.getName()}`);
                    cb(false);
                    return;
                }

                try {
                    const bytes = sess.send_and_read_finish(result);
                    const filename = this.getFilename();
                    const data = bytes.get_data();
                    GLib.file_set_contents(filename, data);
                    cb(true);
                } catch (e) {
                    log(`Error saving avatar for ${this._person.getName()}: ${e}`);
                    cb(false);
                }
            }
        );
    }

    getFilename() {
        const id = this._person.getName().trim().toLowerCase();
        return GLib.build_filenamev([GLib.get_user_cache_dir(), this._extension.uuid, md5Hash(id)]);
    }

    _handleLocalAvatar() {
        let filename = this._person.avatar;

        // Sanity check
        if (filename.length === 0)
            return true;

        // Only handle files in filesystem
        if (filename[0] !== '/' && !filename.startsWith('file://'))
            return false;

        if (filename[0] === '/')
            filename = `file://${filename}`;

        const file = Gio.File.new_for_uri(filename);
        const dest = Gio.File.new_for_path(this.getFilename());

        try {
            file.copy(dest, Gio.FileCopyFlags.OVERWRITE, null, null);
        } catch (e) {
            log(`Error building an avatar cache for user ${this._person.getName()}: ${e}`);
        }

        return true;
    }
}
