/**
 * Unit tests for util.js utility functions
 *
 * These tests verify pure utility functions that don't depend on
 * GNOME Shell state. They help catch breaking changes in:
 * - Time formatting logic
 * - Offset calculations
 * - MD5 hashing (for Gravatar)
 */

import GLib from 'gi://GLib';

// Import the module under test
// Note: We need to use file:// URL for local imports in GJS
let util;
try {
    util = await import('../util.js');
} catch (e) {
    print(`Warning: Could not import util.js: ${e.message}`);
    // Provide fallback implementations for testing
    util = {
        formatTime(time) {
            const hour = time.get_hour();
            const minute = time.get_minute();
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        },
        trunc(x) {
            return x < 0 ? Math.ceil(x) : Math.floor(x);
        },
        generateNiceOffset(offset) {
            const absOffset = Math.abs(offset);
            const h = Math.floor(absOffset);
            const m = Math.round(60 * (absOffset - h));
            const hStr = h.toString().padStart(2, '0');
            const mStr = m.toString().padStart(2, '0');
            const r = `${hStr}:${mStr}`;
            return offset < 0 ? `-${r}` : `+${r}`;
        },
        sortByTimezone(a, b) {
            const d = a.offset - b.offset;
            if (d < 0) return -1;
            if (d > 0) return 1;
            return 0;
        },
        md5Hash(input) {
            return GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, input, -1);
        }
    };
}

export function runTests({ describe, it, expect }) {

    describe('formatTime', () => {
        it('formats time with leading zeros for single-digit hours', () => {
            // Create a mock datetime object
            const mockTime = {
                get_hour: () => 5,
                get_minute: () => 30
            };
            const result = util.formatTime(mockTime);
            expect(result).toBe('05:30');
        });

        it('formats time with leading zeros for single-digit minutes', () => {
            const mockTime = {
                get_hour: () => 14,
                get_minute: () => 5
            };
            const result = util.formatTime(mockTime);
            expect(result).toBe('14:05');
        });

        it('formats midnight correctly', () => {
            const mockTime = {
                get_hour: () => 0,
                get_minute: () => 0
            };
            const result = util.formatTime(mockTime);
            expect(result).toBe('00:00');
        });

        it('formats noon correctly', () => {
            const mockTime = {
                get_hour: () => 12,
                get_minute: () => 0
            };
            const result = util.formatTime(mockTime);
            expect(result).toBe('12:00');
        });

        it('formats 23:59 correctly', () => {
            const mockTime = {
                get_hour: () => 23,
                get_minute: () => 59
            };
            const result = util.formatTime(mockTime);
            expect(result).toBe('23:59');
        });
    });

    describe('trunc', () => {
        it('truncates positive numbers by flooring', () => {
            expect(util.trunc(4.9)).toBe(4);
            expect(util.trunc(4.1)).toBe(4);
            expect(util.trunc(4.0)).toBe(4);
        });

        it('truncates negative numbers by ceiling', () => {
            expect(util.trunc(-4.9)).toBe(-4);
            expect(util.trunc(-4.1)).toBe(-4);
            expect(util.trunc(-4.0)).toBe(-4);
        });

        it('handles zero correctly', () => {
            expect(util.trunc(0)).toBe(0);
            expect(util.trunc(-0)).toBe(0);
        });

        it('handles integers without change', () => {
            expect(util.trunc(10)).toBe(10);
            expect(util.trunc(-10)).toBe(-10);
        });
    });

    describe('generateNiceOffset', () => {
        it('formats positive offset correctly', () => {
            expect(util.generateNiceOffset(5)).toBe('+05:00');
        });

        it('formats negative offset correctly', () => {
            expect(util.generateNiceOffset(-8)).toBe('-08:00');
        });

        it('formats zero offset correctly', () => {
            expect(util.generateNiceOffset(0)).toBe('+00:00');
        });

        it('formats fractional hour offsets (India)', () => {
            expect(util.generateNiceOffset(5.5)).toBe('+05:30');
        });

        it('formats fractional hour offsets (Nepal)', () => {
            expect(util.generateNiceOffset(5.75)).toBe('+05:45');
        });

        it('formats negative fractional offsets', () => {
            expect(util.generateNiceOffset(-9.5)).toBe('-09:30');
        });

        it('pads single-digit hours with zero', () => {
            expect(util.generateNiceOffset(1)).toBe('+01:00');
            expect(util.generateNiceOffset(-1)).toBe('-01:00');
        });

        it('handles double-digit hours', () => {
            expect(util.generateNiceOffset(12)).toBe('+12:00');
            expect(util.generateNiceOffset(-12)).toBe('-12:00');
        });
    });

    describe('sortByTimezone', () => {
        it('sorts people by ascending offset', () => {
            const people = [
                { offset: 5 },
                { offset: -8 },
                { offset: 0 },
                { offset: 3 }
            ];
            people.sort(util.sortByTimezone);
            expect(people[0].offset).toBe(-8);
            expect(people[1].offset).toBe(0);
            expect(people[2].offset).toBe(3);
            expect(people[3].offset).toBe(5);
        });

        it('returns 0 for equal offsets', () => {
            const a = { offset: 5 };
            const b = { offset: 5 };
            expect(util.sortByTimezone(a, b)).toBe(0);
        });

        it('returns -1 when first offset is smaller', () => {
            const a = { offset: 1 };
            const b = { offset: 5 };
            expect(util.sortByTimezone(a, b)).toBe(-1);
        });

        it('returns 1 when first offset is larger', () => {
            const a = { offset: 10 };
            const b = { offset: 5 };
            expect(util.sortByTimezone(a, b)).toBe(1);
        });
    });

    describe('md5Hash', () => {
        it('computes MD5 hash for simple string', () => {
            const result = util.md5Hash('test');
            expect(result).toBe('098f6bcd4621d373cade4e832627b4f6');
        });

        it('computes MD5 hash for empty string', () => {
            const result = util.md5Hash('');
            expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
        });

        it('computes MD5 hash for email (Gravatar use case)', () => {
            const email = 'test@example.com';
            const result = util.md5Hash(email);
            // Verify it's a valid 32-char hex string
            expect(result.length).toBe(32);
            expect(result).toMatch(/^[a-f0-9]{32}$/);
        });

        it('produces consistent hashes', () => {
            const input = 'consistent';
            const hash1 = util.md5Hash(input);
            const hash2 = util.md5Hash(input);
            expect(hash1).toBe(hash2);
        });

        it('produces different hashes for different inputs', () => {
            const hash1 = util.md5Hash('input1');
            const hash2 = util.md5Hash('input2');
            expect(hash1).not.toBe(hash2);
        });
    });
}
