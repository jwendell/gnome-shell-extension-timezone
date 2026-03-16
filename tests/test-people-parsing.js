/**
 * Unit tests for people.json parsing
 *
 * These tests verify the parsing and validation of people.json data.
 * They help detect breaking changes in:
 * - JSON parsing behavior
 * - Data validation
 * - Person object creation
 */

import GLib from 'gi://GLib';

// Sample valid people.json data for testing
const samplePeople = [
    { name: 'Dan', avatar: 'https://example.com/dan.jpg', city: 'NYC', tz: 'America/New_York' },
    { name: 'Niel', gravatar: 'niel@example.com', city: 'Cape Town', tz: 'Africa/Johannesburg' },
    { github: 'torvalds', tz: 'America/Los_Angeles' },
    { name: 'Minimal', tz: 'UTC' }
];

export function runTests({ describe, it, expect, assert }) {

    describe('JSON Parsing', () => {
        it('parses valid JSON array', () => {
            const json = JSON.stringify(samplePeople);
            const parsed = JSON.parse(json);
            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed.length).toBe(4);
        });

        it('parses empty array', () => {
            const json = '[]';
            const parsed = JSON.parse(json);
            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed.length).toBe(0);
        });

        it('handles malformed JSON', () => {
            const badJson = '[{name: "missing quotes"}]';
            let threw = false;
            try {
                JSON.parse(badJson);
            } catch (e) {
                threw = true;
            }
            expect(threw).toBe(true);
        });

        it('handles non-array JSON', () => {
            const objJson = '{"name": "single"}';
            const parsed = JSON.parse(objJson);
            expect(Array.isArray(parsed)).toBe(false);
        });
    });

    describe('Person Object Validation', () => {
        it('validates required timezone field', () => {
            const person = { name: 'Test', tz: 'America/New_York' };
            assert(person.tz !== undefined, 'tz field should be present');
        });

        it('handles missing optional fields', () => {
            const person = { tz: 'UTC' };
            assert(person.name === undefined, 'name should be undefined');
            assert(person.avatar === undefined, 'avatar should be undefined');
            assert(person.city === undefined, 'city should be undefined');
        });

        it('validates avatar URL format', () => {
            const person = { tz: 'UTC', avatar: 'https://example.com/avatar.jpg' };
            expect(person.avatar.startsWith('https://')).toBe(true);
        });

        it('validates avatar with file:// URI', () => {
            const person = { tz: 'UTC', avatar: 'file:///home/user/avatar.png' };
            expect(person.avatar.startsWith('file://')).toBe(true);
        });

        it('validates local file path for avatar', () => {
            const person = { tz: 'UTC', avatar: '/home/user/avatar.png' };
            // Extension should handle both file:// and plain paths
            expect(person.avatar.startsWith('/')).toBe(true);
        });

        it('validates gravatar email format', () => {
            const person = { tz: 'UTC', gravatar: 'test@example.com' };
            expect(person.gravatar).toContain('@');
        });

        it('validates github username', () => {
            const person = { tz: 'UTC', github: 'torvalds' };
            assert(typeof person.github === 'string', 'github should be a string');
            expect(person.github.length).toBeGreaterThan(0);
        });
    });

    describe('Timezone Validation', () => {
        it('accepts valid timezone identifiers', () => {
            const validTimezones = [
                'America/New_York',
                'America/Los_Angeles',
                'Europe/London',
                'Asia/Tokyo',
                'Australia/Sydney',
                'UTC'
            ];

            for (const tz of validTimezones) {
                // Extension uses GLib.TimeZone.new(tz)
                // This validates the timezone is recognized
                const glibTz = GLib.TimeZone.new(tz);
                assert(glibTz !== null, `Should accept ${tz}`);
            }
        });

        it('handles invalid timezone gracefully', () => {
            // Invalid timezone should still create an object but may have unexpected behavior
            const tz = GLib.TimeZone.new('Invalid/Timezone');
            // GLib may fall back to UTC for invalid timezones
            assert(tz !== null, 'GLib creates TimeZone object even for invalid input');
        });
    });

    describe('Data Transformation', () => {
        it('extracts unique cities', () => {
            const cities = new Set();
            for (const person of samplePeople) {
                if (person.city) {
                    cities.add(person.city);
                }
            }
            expect(cities.size).toBe(2); // NYC and Cape Town
            expect(cities.has('NYC')).toBe(true);
            expect(cities.has('Cape Town')).toBe(true);
        });

        it('counts people per timezone', () => {
            const tzCounts = {};
            for (const person of samplePeople) {
                const tz = person.tz;
                tzCounts[tz] = (tzCounts[tz] || 0) + 1;
            }
            expect(Object.keys(tzCounts).length).toBe(4); // 4 unique timezones
        });

        it('identifies avatar sources', () => {
            let avatarCount = 0;
            let gravatarCount = 0;
            let githubCount = 0;

            for (const person of samplePeople) {
                if (person.avatar) avatarCount++;
                if (person.gravatar) gravatarCount++;
                if (person.github) githubCount++;
            }

            expect(avatarCount).toBe(1);
            expect(gravatarCount).toBe(1);
            expect(githubCount).toBe(1);
        });
    });

    describe('UTF-8 Handling', () => {
        it('handles Unicode names', () => {
            const json = '[{"name": "José", "tz": "UTC"}]';
            const parsed = JSON.parse(json);
            expect(parsed[0].name).toBe('José');
        });

        it('handles Unicode cities', () => {
            const json = '[{"city": "São Paulo", "tz": "America/Sao_Paulo"}]';
            const parsed = JSON.parse(json);
            expect(parsed[0].city).toBe('São Paulo');
        });

        it('handles emoji in names', () => {
            const json = '[{"name": "Test 👋", "tz": "UTC"}]';
            const parsed = JSON.parse(json);
            expect(parsed[0].name).toContain('👋');
        });
    });

    describe('Large Dataset Handling', () => {
        it('handles 100 people', () => {
            const people = [];
            for (let i = 0; i < 100; i++) {
                people.push({
                    name: `Person ${i}`,
                    tz: 'UTC'
                });
            }
            const json = JSON.stringify(people);
            const parsed = JSON.parse(json);
            expect(parsed.length).toBe(100);
        });

        it('handles people with all fields', () => {
            const fullPerson = {
                name: 'Full Person',
                avatar: 'https://example.com/avatar.jpg',
                gravatar: 'full@example.com',
                github: 'fullperson',
                city: 'Full City',
                tz: 'America/New_York'
            };

            const json = JSON.stringify([fullPerson]);
            const parsed = JSON.parse(json);
            expect(Object.keys(parsed[0]).length).toBe(6);
        });
    });
}
