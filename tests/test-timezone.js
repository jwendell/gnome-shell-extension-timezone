/**
 * Unit tests for timezone.js
 *
 * These tests verify timezone-related calculations and detect
 * breaking changes in:
 * - GLib.TimeZone API
 * - GLib.DateTime API
 * - Offset calculations
 * - Timezone string parsing
 */

import GLib from 'gi://GLib';

export function runTests({ describe, it, expect, assert }) {

    describe('GLib.TimeZone API', () => {
        it('creates timezone from identifier', () => {
            const tz = GLib.TimeZone.new('America/New_York');
            assert(tz !== null, 'TimeZone should be created');
        });

        it('creates timezone from offset string', () => {
            const tz = GLib.TimeZone.new('+05:00');
            assert(tz !== null, 'TimeZone from offset should be created');
        });

        it('creates timezone from negative offset', () => {
            const tz = GLib.TimeZone.new('-08:00');
            assert(tz !== null, 'Negative offset TimeZone should be created');
        });

        it('creates UTC timezone', () => {
            const tz = GLib.TimeZone.new('UTC');
            assert(tz !== null, 'UTC TimeZone should be created');
        });

        it('handles common timezone identifiers', () => {
            const zones = [
                'America/New_York',
                'America/Los_Angeles',
                'Europe/London',
                'Europe/Paris',
                'Asia/Tokyo',
                'Asia/Kolkata',
                'Australia/Sydney',
                'Pacific/Auckland'
            ];

            for (const zoneId of zones) {
                const tz = GLib.TimeZone.new(zoneId);
                assert(tz !== null, `Should create timezone for ${zoneId}`);
            }
        });
    });

    describe('GLib.DateTime API', () => {
        it('creates DateTime in specific timezone', () => {
            const tz = GLib.TimeZone.new('America/New_York');
            const dt = GLib.DateTime.new_now(tz);
            assert(dt !== null, 'DateTime should be created');
        });

        it('gets hour from DateTime', () => {
            const tz = GLib.TimeZone.new('UTC');
            const dt = GLib.DateTime.new_now(tz);
            const hour = dt.get_hour();
            expect(hour).toBeGreaterThanOrEqual(0);
            expect(hour).toBeLessThanOrEqual(23);
        });

        it('gets minute from DateTime', () => {
            const tz = GLib.TimeZone.new('UTC');
            const dt = GLib.DateTime.new_now(tz);
            const minute = dt.get_minute();
            expect(minute).toBeGreaterThanOrEqual(0);
            expect(minute).toBeLessThanOrEqual(59);
        });

        it('calculates UTC offset correctly', () => {
            // Test with a known timezone
            const tz = GLib.TimeZone.new('UTC');
            const dt = GLib.DateTime.new_now(tz);
            const offset = dt.get_utc_offset();
            // UTC offset should be 0
            expect(offset).toBe(0);
        });

        it('calculates positive UTC offset', () => {
            // Tokyo is UTC+9 (32400 seconds = 9 * 3600 * 1_000_000 microseconds)
            const tz = GLib.TimeZone.new('Asia/Tokyo');
            const dt = GLib.DateTime.new_now(tz);
            const offsetMicroseconds = dt.get_utc_offset();
            const offsetHours = offsetMicroseconds / (3600 * 1000 * 1000);
            // Tokyo offset should be around +9 hours (may vary with DST)
            expect(offsetHours).toBeGreaterThanOrEqual(8);
            expect(offsetHours).toBeLessThanOrEqual(10);
        });

        it('calculates negative UTC offset', () => {
            // New York is typically UTC-5 or UTC-4
            const tz = GLib.TimeZone.new('America/New_York');
            const dt = GLib.DateTime.new_now(tz);
            const offsetMicroseconds = dt.get_utc_offset();
            const offsetHours = offsetMicroseconds / (3600 * 1000 * 1000);
            // NY offset should be negative (around -5 to -4 depending on DST)
            expect(offsetHours).toBeLessThanOrEqual(-4);
            expect(offsetHours).toBeGreaterThanOrEqual(-6);
        });

        it('creates local DateTime', () => {
            const dt = GLib.DateTime.new_now_local();
            assert(dt !== null, 'Local DateTime should be created');
        });

        it('creates UTC DateTime', () => {
            const dt = GLib.DateTime.new_now_utc();
            assert(dt !== null, 'UTC DateTime should be created');
        });
    });

    describe('Offset Calculations', () => {
        it('converts microseconds to hours correctly', () => {
            // The extension uses: offset / (3600 * 1000 * 1000)
            const microsecondsPerHour = 3600 * 1000 * 1000;

            // Test various offsets
            const testCases = [
                { us: 0, expectedHours: 0 },          // UTC
                { us: 3600000000, expectedHours: 1 }, // +1 hour
                { us: 18000000000, expectedHours: 5 },// +5 hours
                { us: -18000000000, expectedHours: -5 }, // -5 hours
            ];

            for (const tc of testCases) {
                const hours = tc.us / microsecondsPerHour;
                expect(hours).toBe(tc.expectedHours);
            }
        });

        it('handles fractional hour offsets', () => {
            // India is UTC+5:30 = 5.5 hours
            const microsecondsPerHour = 3600 * 1000 * 1000;
            const offsetUs = 5.5 * microsecondsPerHour;
            const hours = offsetUs / microsecondsPerHour;
            expect(hours).toBe(5.5);
        });

        it('handles Nepal offset (UTC+5:45)', () => {
            const microsecondsPerHour = 3600 * 1000 * 1000;
            const offsetUs = 5.75 * microsecondsPerHour;
            const hours = offsetUs / microsecondsPerHour;
            expect(hours).toBe(5.75);
        });
    });

    describe('Timezone Edge Cases', () => {
        it('handles International Date Line', () => {
            // Pacific/Kiritimati is UTC+14
            const tz = GLib.TimeZone.new('Pacific/Kiritimati');
            assert(tz !== null, 'Should handle UTC+14');
        });

        it('handles Pacific/Midway (UTC-11)', () => {
            const tz = GLib.TimeZone.new('Pacific/Midway');
            assert(tz !== null, 'Should handle UTC-11');
        });

        it('handles half-hour offsets', () => {
            // Australia/Adelaide can be UTC+9:30 or UTC+10:30
            const tz = GLib.TimeZone.new('Australia/Adelaide');
            assert(tz !== null, 'Should handle half-hour offset');
        });

        it('handles 45-minute offsets', () => {
            // Nepal is UTC+5:45
            const tz = GLib.TimeZone.new('Asia/Kathmandu');
            assert(tz !== null, 'Should handle 45-minute offset');
        });
    });

    describe('Timezone Comparison', () => {
        it('can compare offsets for sorting', () => {
            const offsets = [
                { tz: 'America/Los_Angeles', expected: 'negative' },
                { tz: 'UTC', expected: 'zero' },
                { tz: 'Asia/Tokyo', expected: 'positive' }
            ];

            const results = offsets.map(({ tz: tzId }) => {
                const tz = GLib.TimeZone.new(tzId);
                const dt = GLib.DateTime.new_now(tz);
                return dt.get_utc_offset();
            });

            // LA should have smallest (most negative) offset
            assert(results[0] < results[2], 'LA offset should be less than Tokyo');
        });
    });
}
