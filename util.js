import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

/**
 * Format a GLib.DateTime as a time string
 * @param {GLib.DateTime} time - The datetime to format
 * @returns {string} Formatted time string (HH:MM)
 */
export function formatTime(time) {
    const hour = time.get_hour();
    const minute = time.get_minute();
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Truncate a number (for older GJS compatibility)
 * @param {number} x - The number to truncate
 * @returns {number} Truncated number
 */
export function trunc(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}

/**
 * Generate a nice offset string from hours (e.g., +05:30, -08:00)
 * @param {number} offset - The offset in hours
 * @returns {string} Formatted offset string
 */
export function generateNiceOffset(offset) {
    const absOffset = Math.abs(offset);
    let h = trunc(absOffset);
    let m = Math.round(60 * (absOffset - h));

    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');

    const r = `${hStr}:${mStr}`;
    return offset < 0 ? `-${r}` : `+${r}`;
}

/**
 * Sort comparison function for timezone offsets
 * @param {Object} a - First person with offset property
 * @param {Object} b - Second person with offset property
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 */
export function sortByTimezone(a, b) {
    const d = a.offset - b.offset;
    if (d < 0) return -1;
    if (d > 0) return 1;
    return 0;
}

/**
 * Generate MD5 hash for a string
 * @param {string} input - The string to hash
 * @returns {string} MD5 hash of the input
 */
export function md5Hash(input) {
    return GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, input, -1);
}

/**
 * Shared Soup session for HTTP requests
 * Reuse session for connection pooling and SSL caching
 */
let _sharedSession = null;

export function getSharedSession() {
    if (!_sharedSession)
        _sharedSession = new Soup.Session();
    return _sharedSession;
}
