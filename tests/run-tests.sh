#!/bin/bash
#
# Run the test suite for timezone@jwendell GNOME Shell Extension
#
# Usage:
#   ./run-tests.sh              # Run all tests
#   ./run-tests.sh test-util.js # Run specific test file
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_DIR="$(dirname "$SCRIPT_DIR")"

cd "$EXTENSION_DIR"

echo "Running tests from: $EXTENSION_DIR"
echo ""

if [ -n "$1" ]; then
    # Run specific test file
    TEST_FILE="tests/$1"
    if [ ! -f "$TEST_FILE" ]; then
        echo "Error: Test file not found: $TEST_FILE"
        exit 1
    fi
    echo "Running: $TEST_FILE"
    gjs -m "$TEST_FILE"
else
    # Run all tests via test runner
    gjs -m tests/test-runner.js
fi
