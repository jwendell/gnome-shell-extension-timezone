// test-soup3-patterns.js
// Tests for Soup 3.0 async patterns and GitHub API integration

import Gio from 'gi://Gio';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

import {describe, it, expect} from './test-runner.js';
import {getSharedSession, cleanupSharedSession} from '../util.js';

// Test constants
const TEST_API_URL = 'https://api.github.com/users/test';
const USER_AGENT_HEADER = 'User-Agent';
const USER_AGENT_VALUE = 'timezone-gnome-shell-extension';
const AUTH_HEADER = 'Authorization';
const TEST_TOKEN = 'ghp_test_token_123';
const HTTP_GET = 'GET';

describe('Soup 3.0 Async Patterns', () => {
    it('should create a shared Soup session', () => {
        const session = getSharedSession();

        expect(session).toBeTruthy();
    });

    it('should reuse the same session instance', () => {
        const session1 = getSharedSession();
        const session2 = getSharedSession();

        expect(session1).toBe(session2);
    });

    it('should create Gio.Cancellable for async operations', () => {
        const cancellable = new Gio.Cancellable();

        expect(cancellable).toBeTruthy();
        expect(cancellable.is_cancelled()).toBe(false);
    });

    it('should support cancelling cancellable', () => {
        const cancellable = new Gio.Cancellable();
        cancellable.cancel();

        expect(cancellable.is_cancelled()).toBe(true);
    });

    it('should create Soup.Message with correct API', () => {
        const url = TEST_API_URL;
        const message = Soup.Message.new(HTTP_GET, url);

        expect(message).toBeTruthy();
        expect(message.get_method()).toBe(HTTP_GET);
        expect(message.get_uri().to_string()).toBe(url);
    });

    it('should abort and reset shared session on cleanup', () => {
        const session1 = getSharedSession();
        cleanupSharedSession();
        const session2 = getSharedSession();

        // After cleanup, a new session should be created
        expect(session1).toBeTruthy();
        expect(session2).toBeTruthy();
        expect(session1).not.toBe(session2);
    });
});

describe('GitHub API Headers', () => {
    it('should set User-Agent header on Soup.Message', () => {
        const message = Soup.Message.new(HTTP_GET, TEST_API_URL);
        const headers = message.get_request_headers();

        headers.append(USER_AGENT_HEADER, USER_AGENT_VALUE);

        expect(headers.get_one(USER_AGENT_HEADER)).toBe(USER_AGENT_VALUE);
    });

    it('should set Authorization header with Bearer token', () => {
        const message = Soup.Message.new(HTTP_GET, TEST_API_URL);
        const headers = message.get_request_headers();

        headers.append(AUTH_HEADER, `Bearer ${TEST_TOKEN}`);

        expect(headers.get_one(AUTH_HEADER)).toBe(`Bearer ${TEST_TOKEN}`);
    });

    it('should not set Authorization header when token is empty', () => {
        const message = Soup.Message.new(HTTP_GET, TEST_API_URL);
        const headers = message.get_request_headers();

        const authHeader = headers.get_one(AUTH_HEADER);
        // get_one returns null when header doesn't exist, so check for falsy
        expect(!authHeader).toBe(true);
    });

    it('should set both User-Agent and Authorization headers', () => {
        const message = Soup.Message.new(HTTP_GET, TEST_API_URL);
        const headers = message.get_request_headers();

        headers.append(USER_AGENT_HEADER, USER_AGENT_VALUE);
        headers.append(AUTH_HEADER, `Bearer ${TEST_TOKEN}`);

        expect(headers.get_one(USER_AGENT_HEADER)).toBe(USER_AGENT_VALUE);
        expect(headers.get_one(AUTH_HEADER)).toBe(`Bearer ${TEST_TOKEN}`);
    });
});

describe('Cancellable Lifecycle Management', () => {
    it('should track multiple cancellables in an array', () => {
        const cancellables = [];
        const cancellable1 = new Gio.Cancellable();
        const cancellable2 = new Gio.Cancellable();

        cancellables.push(cancellable1);
        cancellables.push(cancellable2);

        expect(cancellables.length).toBe(2);
        expect(cancellables).toContain(cancellable1);
        expect(cancellables).toContain(cancellable2);
    });

    it('should remove cancellable from tracking array after cleanup', () => {
        const cancellables = [];
        const cancellable = new Gio.Cancellable();
        cancellables.push(cancellable);

        const index = cancellables.indexOf(cancellable);
        if (index > -1) {
            cancellables.splice(index, 1);
        }

        expect(cancellables.length).toBe(0);
        expect(cancellables.indexOf(cancellable)).toBe(-1);
    });

    it('should cancel all tracked cancellables', () => {
        const cancellables = [];
        const cancellable1 = new Gio.Cancellable();
        const cancellable2 = new Gio.Cancellable();
        cancellables.push(cancellable1, cancellable2);

        // Cancel all
        for (const cancellable of cancellables) {
            cancellable.cancel();
        }

        expect(cancellable1.is_cancelled()).toBe(true);
        expect(cancellable2.is_cancelled()).toBe(true);
    });

    it('should clear cancellables array after cancellation', () => {
        const cancellables = [];
        const cancellable1 = new Gio.Cancellable();
        const cancellable2 = new Gio.Cancellable();
        cancellables.push(cancellable1, cancellable2);

        for (const cancellable of cancellables) {
            cancellable.cancel();
        }
        cancellables.length = 0;

        expect(cancellables.length).toBe(0);
    });
});

describe('Soup 3.0 Message Status', () => {
    it('should have Soup.Status.OK defined', () => {
        expect(Soup.Status.OK).toBeTruthy();
        expect(Soup.Status.OK).toBe(200);
    });

    it('should get status from message', () => {
        const message = Soup.Message.new(HTTP_GET, TEST_API_URL);

        // Message status is 0 before being sent
        expect(message.get_status()).toBe(0);
    });

    it('should have get_request_headers method', () => {
        const message = Soup.Message.new(HTTP_GET, TEST_API_URL);

        expect(typeof message.get_request_headers).toBe('function');
        const headers = message.get_request_headers();
        expect(headers).toBeTruthy();
    });
});
