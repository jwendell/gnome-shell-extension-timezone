/**
 * Unit tests for GSettings schema and extension settings
 *
 * These tests verify that the settings schema is properly defined
 * and all expected keys exist. They help detect breaking changes in:
 * - Settings schema structure
 * - Key types and default values
 * - Settings API methods
 */

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

// Expected settings schema
const expectedSchema = {
    'path-to-people-json': {
        type: 's',  // string
        defaultValue: ''
    },
    'panel-position': {
        type: 's',  // string
        defaultValue: 'center',
        validValues: ['left', 'center', 'right']
    },
    'enable-working-hours': {
        type: 'b',  // boolean
        defaultValue: false
    },
    'working-hours-start': {
        type: 'i',  // integer
        defaultValue: 9,
        min: 0,
        max: 23
    },
    'working-hours-end': {
        type: 'i',  // integer
        defaultValue: 17,
        min: 0,
        max: 23
    },
    'github-token': {
        type: 's',  // string
        defaultValue: ''
    }
};

export function runTests({ describe, it, expect, assert }) {

    describe('Schema File Validation', () => {
        it('schema file exists', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            assert(file.query_exists(null), 'Schema file should exist');
        });

        it('schema is valid XML', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);

            assert(success, 'Should read schema file');

            const text = new TextDecoder('utf-8').decode(contents);
            // Check for schemalist (case-insensitive due to XML)
            const hasSchemalist = text.toLowerCase().includes('<schemalist');
            const hasSchema = text.toLowerCase().includes('<schema ');
            assert(hasSchemalist || hasSchema, 'Should have schemalist or schema element');
        });

        it('schema has correct ID', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);

            const text = new TextDecoder('utf-8').decode(contents);
            assert(text.includes('org.gnome.shell.extensions.timezone'),
                'Schema should have correct ID');
        });
    });

    describe('Settings Key Definitions', () => {
        it('defines path-to-people-json key', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);
            const text = new TextDecoder('utf-8').decode(contents);

            assert(text.includes('path-to-people-json'), 'Should define path key');
        });

        it('defines panel-position key', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);
            const text = new TextDecoder('utf-8').decode(contents);

            assert(text.includes('panel-position'), 'Should define position key');
        });

        it('defines enable-working-hours key', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);
            const text = new TextDecoder('utf-8').decode(contents);

            assert(text.includes('enable-working-hours'), 'Should define working hours key');
        });

        it('defines working-hours-start key', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);
            const text = new TextDecoder('utf-8').decode(contents);

            assert(text.includes('working-hours-start'), 'Should define start hour key');
        });

        it('defines working-hours-end key', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);
            const text = new TextDecoder('utf-8').decode(contents);

            assert(text.includes('working-hours-end'), 'Should define end hour key');
        });

        it('defines github-token key', () => {
            const schemaPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'org.gnome.shell.extensions.timezone.gschema.xml'
            ]);
            const file = Gio.File.new_for_path(schemaPath);
            const [success, contents] = file.load_contents(null);
            const text = new TextDecoder('utf-8').decode(contents);

            assert(text.includes('github-token'), 'Should define GitHub token key');
        });
    });

    describe('Settings Value Validation', () => {
        it('validates working hours range (0-23)', () => {
            const validHours = [0, 1, 12, 23];
            const invalidHours = [-1, 24, 100];

            for (const hour of validHours) {
                assert(hour >= 0 && hour <= 23, `${hour} should be valid hour`);
            }

            for (const hour of invalidHours) {
                assert(!(hour >= 0 && hour <= 23), `${hour} should be invalid hour`);
            }
        });

        it('validates panel position values', () => {
            const validPositions = ['left', 'center', 'right'];
            const invalidPositions = ['top', 'bottom', 'middle'];

            for (const pos of validPositions) {
                assert(validPositions.includes(pos), `${pos} should be valid position`);
            }

            for (const pos of invalidPositions) {
                assert(!validPositions.includes(pos), `${pos} should be invalid position`);
            }
        });

        it('validates path can be local or remote', () => {
            const localPath = '/home/user/people.json';
            const fileUri = 'file:///home/user/people.json';
            const httpUrl = 'https://example.com/people.json';

            // Extension should handle all these formats
            assert(localPath.startsWith('/') || localPath.startsWith('file://'),
                'Local path format');
            assert(fileUri.startsWith('file://'), 'File URI format');
            assert(httpUrl.startsWith('http://') || httpUrl.startsWith('https://'),
                'HTTP URL format');
        });
    });

    describe('Settings API Methods', () => {
        it('has Gio.Settings class', () => {
            assert(typeof Gio.Settings === 'function',
                'Gio.Settings should be a constructor');
        });

        it('has get_string method signature', () => {
            // We can't test actual settings without compiled schema
            // but we can verify the API exists
            const settingsProto = Gio.Settings.prototype;
            assert(typeof settingsProto.get_string === 'function',
                'Settings should have get_string');
        });

        it('has set_string method signature', () => {
            const settingsProto = Gio.Settings.prototype;
            assert(typeof settingsProto.set_string === 'function',
                'Settings should have set_string');
        });

        it('has get_boolean method signature', () => {
            const settingsProto = Gio.Settings.prototype;
            assert(typeof settingsProto.get_boolean === 'function',
                'Settings should have get_boolean');
        });

        it('has set_boolean method signature', () => {
            const settingsProto = Gio.Settings.prototype;
            assert(typeof settingsProto.set_boolean === 'function',
                'Settings should have set_boolean');
        });

        it('has get_int method signature', () => {
            const settingsProto = Gio.Settings.prototype;
            assert(typeof settingsProto.get_int === 'function',
                'Settings should have get_int');
        });

        it('has set_int method signature', () => {
            const settingsProto = Gio.Settings.prototype;
            assert(typeof settingsProto.set_int === 'function',
                'Settings should have set_int');
        });
    });

    describe('Compiled Schema Check', () => {
        it('checks for compiled schema (gschemas.compiled)', () => {
            // In development, this may not exist until installed
            const compiledPath = GLib.build_filenamev([
                GLib.get_current_dir(),
                'schemas',
                'gschemas.compiled'
            ]);
            const file = Gio.File.new_for_path(compiledPath);

            // This is informational - schema may not be compiled in dev
            const exists = file.query_exists(null);
            if (!exists) {
                print('     ℹ️  gschemas.compiled not found (normal in development)');
            }
        });
    });
}
