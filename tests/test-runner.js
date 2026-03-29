#!/usr/bin/env gjs

/**
 * Test Runner for timezone@jwendell GNOME Shell Extension
 *
 * This test suite runs unit tests that can detect API breakages when
 * GNOME Shell updates. Tests focus on:
 * - Pure utility functions (no GNOME dependencies)
 * - Data parsing and transformation
 * - Timezone calculations
 * - Mocked GNOME API interactions
 *
 * Usage:
 *   cd /path/to/extension
 *   gjs -m tests/test-runner.js
 *
 * Or run individual test files:
 *   gjs -m tests/test-util.js
 */

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

// Test framework state
let _testsRun = 0;
let _testsPassed = 0;
let _testsFailed = 0;
let _currentSuite = '';
const _failedTests = [];

/**
 * Simple test framework
 */
export function describe(name, fn) {
    _currentSuite = name;
    print(`\n📋 ${name}`);
    try {
        fn();
    } catch (e) {
        print(`  ❌ Suite setup failed: ${e.message}`);
    }
    _currentSuite = '';
}

export function it(description, fn) {
    _testsRun++;
    try {
        fn();
        _testsPassed++;
        print(`  ✓ ${description}`);
    } catch (e) {
        _testsFailed++;
        const fullName = `${_currentSuite}: ${description}`;
        _failedTests.push({ name: fullName, error: e.message });
        print(`  ❌ ${description}`);
        print(`     Error: ${e.message}`);
    }
}

export function expect(actual) {
    const matchers = {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
        },
        toEqual(expected) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr !== expectedStr) {
                throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
            }
        },
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
            }
        },
        toBeGreaterThan(expected) {
            if (!(actual > expected)) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toBeLessThan(expected) {
            if (!(actual < expected)) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        },
        toBeGreaterThanOrEqual(expected) {
            if (!(actual >= expected)) {
                throw new Error(`Expected ${actual} to be >= ${expected}`);
            }
        },
        toBeLessThanOrEqual(expected) {
            if (!(actual <= expected)) {
                throw new Error(`Expected ${actual} to be <= ${expected}`);
            }
        },
        toContain(expected) {
            if (!actual.includes(expected)) {
                throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
            }
        },
        toThrow() {
            let threw = false;
            try {
                actual();
            } catch (e) {
                threw = true;
            }
            if (!threw) {
                throw new Error('Expected function to throw but it did not');
            }
        },
        toBeInstanceOf(expectedClass) {
            if (!(actual instanceof expectedClass)) {
                throw new Error(`Expected instance of ${expectedClass.name} but got ${actual.constructor.name}`);
            }
        },
        toHaveLength(expected) {
            if (actual.length !== expected) {
                throw new Error(`Expected length ${expected} but got ${actual.length}`);
            }
        },
        toMatch(pattern) {
            if (!pattern.test(actual)) {
                throw new Error(`Expected ${JSON.stringify(actual)} to match ${pattern}`);
            }
        }
    };

    // Add .not modifier
    matchers.not = {
        toBe(expected) {
            if (actual === expected) {
                throw new Error(`Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`);
            }
        },
        toEqual(expected) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr === expectedStr) {
                throw new Error(`Expected NOT to equal ${expectedStr}`);
            }
        },
        toBeTruthy() {
            if (actual) {
                throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
            }
        },
        toBeFalsy() {
            if (!actual) {
                throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
            }
        },
        toContain(expected) {
            if (actual.includes(expected)) {
                throw new Error(`Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(expected)}`);
            }
        },
        toMatch(pattern) {
            if (pattern.test(actual)) {
                throw new Error(`Expected ${JSON.stringify(actual)} NOT to match ${pattern}`);
            }
        }
    };

    return matchers;
}

/**
 * Assert helpers
 */
export function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

/**
 * Run all test files
 */
async function runAllTests() {
    print('═══════════════════════════════════════════════════════════');
    print('  GNOME Shell Extension Test Suite');
    print('  timezone@jwendell');
    print('═══════════════════════════════════════════════════════════');

    const testDir = GLib.get_current_dir();
    const testsPath = GLib.build_filenamev([testDir, 'tests']);

    // Import and run test modules
    const testFiles = [
        'test-util.js',
        'test-timezone.js',
        'test-people-parsing.js',
        'test-gnome-apis.js',
        'test-settings.js',
        'test-soup3-patterns.js'
    ];

    for (const file of testFiles) {
        const filePath = GLib.build_filenamev([testsPath, file]);
        const testFile = Gio.File.new_for_path(filePath);

        if (!testFile.query_exists(null)) {
            print(`\n⚠️  Test file not found: ${file}`);
            continue;
        }

        print(`\n▶ Running ${file}...`);
        try {
            // Import the test module
            const module = await import(`file://${filePath}`);
            if (module.runTests) {
                module.runTests({ describe, it, expect, assert });
            }
        } catch (e) {
            print(`  ❌ Failed to load ${file}: ${e.message}`);
            _testsFailed++;
        }
    }

    // Print summary
    print('\n═══════════════════════════════════════════════════════════');
    print('  TEST SUMMARY');
    print('═══════════════════════════════════════════════════════════');
    print(`  Total:  ${_testsRun}`);
    print(`  ✅ Passed: ${_testsPassed}`);
    print(`  ❌ Failed: ${_testsFailed}`);

    if (_failedTests.length > 0) {
        print('\n  Failed Tests:');
        for (const test of _failedTests) {
            print(`    • ${test.name}`);
            print(`      ${test.error}`);
        }
    }
    print('═══════════════════════════════════════════════════════════');

    // Exit with appropriate code
    const exitCode = _testsFailed > 0 ? 1 : 0;
    print(`\nExiting with code ${exitCode}`);
    imports.system.exit(exitCode);
}

// Run tests
runAllTests();
