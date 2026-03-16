/**
 * Unit tests for GNOME API compatibility
 *
 * These tests verify that the GNOME Shell APIs the extension depends on
 * are still available and behave as expected. They help detect breaking
 * changes when upgrading GNOME Shell versions.
 *
 * Tested APIs:
 * - GLib (file I/O, checksums, date/time)
 * - Gio (file monitoring, async operations)
 * - Soup 3.0 (HTTP requests)
 * - GObject (class registration)
 * - GTK 4 (preferences widgets)
 */

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Soup from 'gi://Soup?version=3.0';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';

export function runTests({ describe, it, expect, assert }) {

    describe('GLib API Compatibility', () => {
        it('has GLib.DateTime.new_now', () => {
            assert(typeof GLib.DateTime.new_now === 'function',
                'GLib.DateTime.new_now should be a function');
        });

        it('has GLib.DateTime.new_now_local', () => {
            assert(typeof GLib.DateTime.new_now_local === 'function',
                'GLib.DateTime.new_now_local should be a function');
        });

        it('has GLib.TimeZone.new', () => {
            assert(typeof GLib.TimeZone.new === 'function',
                'GLib.TimeZone.new should be a function');
        });

        it('has GLib.compute_checksum_for_string', () => {
            assert(typeof GLib.compute_checksum_for_string === 'function',
                'GLib.compute_checksum_for_string should be a function');
        });

        it('has GLib.ChecksumType.MD5', () => {
            assert(GLib.ChecksumType.MD5 !== undefined,
                'GLib.ChecksumType.MD5 should exist');
        });

        it('has GLib.build_filenamev', () => {
            assert(typeof GLib.build_filenamev === 'function',
                'GLib.build_filenamev should be a function');
        });

        it('has GLib.get_home_dir', () => {
            assert(typeof GLib.get_home_dir === 'function',
                'GLib.get_home_dir should be a function');
        });

        it('has GLib.file_test', () => {
            assert(typeof GLib.file_test === 'function',
                'GLib.file_test should be a function');
        });

        it('has GLib.FileTest.EXISTS', () => {
            assert(GLib.FileTest.EXISTS !== undefined,
                'GLib.FileTest.EXISTS should exist');
        });

        it('has GLib.PRIORITY_DEFAULT', () => {
            assert(GLib.PRIORITY_DEFAULT !== undefined,
                'GLib.PRIORITY_DEFAULT should exist');
        });
    });

    describe('Gio API Compatibility', () => {
        it('has Gio.File.new_for_uri', () => {
            assert(typeof Gio.File.new_for_uri === 'function',
                'Gio.File.new_for_uri should be a function');
        });

        it('has Gio.File.new_for_path', () => {
            assert(typeof Gio.File.new_for_path === 'function',
                'Gio.File.new_for_path should be a function');
        });

        it('has Gio.FileMonitorFlags.NONE', () => {
            assert(Gio.FileMonitorFlags.NONE !== undefined,
                'Gio.FileMonitorFlags.NONE should exist');
        });

        it('has Gio.FileMonitorEvent.CHANGED', () => {
            assert(Gio.FileMonitorEvent.CHANGED !== undefined,
                'Gio.FileMonitorEvent.CHANGED should exist');
        });

        it('has Gio.IOErrorEnum', () => {
            assert(Gio.IOErrorEnum !== undefined,
                'Gio.IOErrorEnum should exist');
        });

        it('has Gio.Cancellable', () => {
            assert(typeof Gio.Cancellable === 'function',
                'Gio.Cancellable should be a constructor');
        });

        it('can create Gio.Cancellable', () => {
            const cancellable = new Gio.Cancellable();
            assert(cancellable !== null, 'Should create Cancellable');
        });
    });

    describe('Soup 3.0 API Compatibility', () => {
        it('has Soup.Session', () => {
            assert(typeof Soup.Session === 'function',
                'Soup.Session should be a constructor');
        });

        it('can create Soup.Session', () => {
            const session = new Soup.Session();
            assert(session !== null, 'Should create Soup.Session');
        });

        it('has Soup.Message', () => {
            assert(typeof Soup.Message === 'function',
                'Soup.Message should be a constructor');
        });

        it('can create Soup.Message with new', () => {
            const message = Soup.Message.new('GET', 'https://example.com');
            assert(message !== null, 'Should create Soup.Message');
        });

        it('has Soup.Status.OK', () => {
            assert(Soup.Status.OK !== undefined,
                'Soup.Status.OK should exist');
        });

        it('Soup.Status.OK equals 200', () => {
            expect(Soup.Status.OK).toBe(200);
        });

        it('has send_and_read_async method', () => {
            const session = new Soup.Session();
            assert(typeof session.send_and_read_async === 'function',
                'Session should have send_and_read_async');
        });

        it('has send_and_read_finish method', () => {
            const session = new Soup.Session();
            assert(typeof session.send_and_read_finish === 'function',
                'Session should have send_and_read_finish');
        });

        it('Message has get_status method', () => {
            const message = Soup.Message.new('GET', 'https://example.com');
            assert(typeof message.get_status === 'function',
                'Message should have get_status');
        });

        it('Message has get_request_headers method', () => {
            const message = Soup.Message.new('GET', 'https://example.com');
            assert(typeof message.get_request_headers === 'function',
                'Message should have get_request_headers');
        });
    });

    describe('GObject API Compatibility', () => {
        it('has GObject.registerClass', () => {
            assert(typeof GObject.registerClass === 'function',
                'GObject.registerClass should be a function');
        });

        it('can register a simple class', () => {
            const TestClass = GObject.registerClass(
                class TestClass extends GObject.Object {
                    _init() {
                        super._init();
                    }
                }
            );
            assert(typeof TestClass === 'function', 'Should register class');
        });

        it('can instantiate registered class', () => {
            // Use unique GTypeName to avoid conflicts
            const uniqueName = `TestInst_${Date.now()}`;
            const TestClass = GObject.registerClass(
                { GTypeName: uniqueName },
                class TestClass extends GObject.Object {
                    _init() {
                        super._init();
                    }
                }
            );
            const instance = new TestClass();
            assert(instance !== null, 'Should instantiate');
        });
    });

    describe('GTK 4 API Compatibility', () => {
        it('has Gtk.Entry', () => {
            assert(typeof Gtk.Entry === 'function',
                'Gtk.Entry should be a constructor');
        });

        it('has Gtk.Box', () => {
            assert(typeof Gtk.Box === 'function',
                'Gtk.Box should be a constructor');
        });

        it('has Gtk.Button', () => {
            assert(typeof Gtk.Button === 'function',
                'Gtk.Button should be a constructor');
        });

        it('has Gtk.Label', () => {
            assert(typeof Gtk.Label === 'function',
                'Gtk.Label should be a constructor');
        });

        it('has Gtk.Switch', () => {
            assert(typeof Gtk.Switch === 'function',
                'Gtk.Switch should be a constructor');
        });

        it('has Gtk.DropDown', () => {
            assert(typeof Gtk.DropDown === 'function',
                'Gtk.DropDown should be a constructor');
        });

        it('has Gtk.StringList', () => {
            assert(typeof Gtk.StringList === 'function',
                'Gtk.StringList should be a constructor');
        });

        it('has Gtk.SpinButton', () => {
            assert(typeof Gtk.SpinButton === 'function',
                'Gtk.SpinButton should be a constructor');
        });

        it('has Gtk.SpinButton.new_with_range', () => {
            assert(typeof Gtk.SpinButton.new_with_range === 'function',
                'Gtk.SpinButton.new_with_range should exist');
        });

        it('has Gtk.FileChooserNative', () => {
            assert(typeof Gtk.FileChooserNative === 'function',
                'Gtk.FileChooserNative should be a constructor');
        });

        it('has Gtk.ResponseType.ACCEPT', () => {
            assert(Gtk.ResponseType.ACCEPT !== undefined,
                'Gtk.ResponseType.ACCEPT should exist');
        });

        it('has Gtk.show_uri', () => {
            assert(typeof Gtk.show_uri === 'function',
                'Gtk.show_uri should be a function');
        });
    });

    describe('ESM Import Compatibility', () => {
        it('imports GLib from gi://GLib', () => {
            assert(GLib !== undefined, 'GLib should be importable');
        });

        it('imports Gio from gi://Gio', () => {
            assert(Gio !== undefined, 'Gio should be importable');
        });

        it('imports Soup from gi://Soup with version 3.0', () => {
            assert(Soup !== undefined, 'Soup 3.0 should be importable');
        });

        it('imports GObject from gi://GObject', () => {
            assert(GObject !== undefined, 'GObject should be importable');
        });

        it('imports Gtk from gi://Gtk with version 4.0', () => {
            assert(Gtk !== undefined, 'Gtk 4.0 should be importable');
        });
    });
}
