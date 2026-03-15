/**
 * logger.js — Development Logger
 * ==================================
 * Structured activity logger for build-time diagnostics.
 * Entirely separate from application code — safe to include or exclude
 * without affecting any clock or UI functionality.
 *
 * Entries are buffered in memory and flushed to sessionStorage only on
 * beforeunload (or manually via Logger.flush()), avoiding synchronous
 * storage I/O on every log call.
 *
 * Storage:
 *   - Active session logs → sessionStorage (cleared on tab close)
 *   - Summary snapshot    → localStorage (persists, written on beforeunload)
 *
 * Usage:
 *   Logger.log('section', 'message', { optional: 'data' });
 *   Logger.time('hero-image');
 *   Logger.timeEnd('hero-image');
 *   Logger.flush();   // write buffer to sessionStorage now
 *   Logger.dump();    // print all entries to console
 *   Logger.clear();   // wipe buffer + sessionStorage
 */

const Logger = (() => {
    'use strict';

    const SESSION_KEY = 'ap_dev_log';
    const PERSIST_KEY = 'ap_dev_log_summary';

    // In-memory buffer — flushed to sessionStorage only on unload
    const _buf = [];
    const _timers = {};

    // ── Helpers ───────────────────────────────────────────────────────────────

    function timestamp() {
        return new Date().toISOString();
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Log a named event with an optional data payload.
     * @param {string} section - Logical category (e.g. 'init', 'clock', 'storage')
     * @param {string} message - Human-readable description
     * @param {*}      [data]  - Optional structured data
     */
    function log(section, message, data) {
        const entry = { ts: timestamp(), section, message };
        if (data !== undefined) entry.data = data;
        _buf.push(entry);
        // No synchronous storage write here — see flush()
    }

    /**
     * Start a named performance timer.
     * @param {string} name - Timer identifier
     */
    function time(name) {
        _timers[name] = performance.now();
        log('timer', `start: ${name}`);
    }

    /**
     * Stop a named timer and log elapsed milliseconds.
     * @param {string} name - Timer identifier
     * @returns {number|null} Elapsed ms, or null if timer was not started
     */
    function timeEnd(name) {
        if (!(name in _timers)) {
            console.warn(`[Logger] timeEnd called for unknown timer: "${name}"`);
            return null;
        }
        const elapsed = +(performance.now() - _timers[name]).toFixed(2);
        delete _timers[name];
        log('timer', `end: ${name}`, { elapsed_ms: elapsed });
        return elapsed;
    }

    /**
     * Flush in-memory buffer to sessionStorage.
     * Called automatically on beforeunload; call manually if needed.
     */
    function flush() {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(_buf));
        } catch (e) {
            console.warn('[Logger] sessionStorage flush failed:', e.message);
        }
    }

    /**
     * Print all buffered log entries to the browser console.
     * @returns {Array} The full entry array
     */
    function dump() {
        console.group('[Logger] Session log dump');
        _buf.forEach(e => console.log(`[${e.ts}] [${e.section}] ${e.message}`, e.data || ''));
        console.groupEnd();
        return _buf;
    }

    /**
     * Clear the in-memory buffer and sessionStorage.
     */
    function clear() {
        _buf.length = 0;
        try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
    }

    // ── Flush on unload ────────────────────────────────────────────────────────

    window.addEventListener('beforeunload', () => {
        flush();
        try {
            const summary = {
                saved_at: timestamp(),
                url:      location.href,
                count:    _buf.length,
                entries:  _buf,
            };
            localStorage.setItem(PERSIST_KEY, JSON.stringify(summary));
        } catch { /* noop — storage may be full or restricted */ }
    });

    // ── Self-test on init (buffered, zero storage I/O) ────────────────────────

    (function selfTest() {
        log('logger', 'Logger initialised', { mode: 'buffered' });

        try {
            localStorage.setItem('_ap_test', '1');
            localStorage.removeItem('_ap_test');
            log('storage', 'localStorage: available');
        } catch {
            log('storage', 'localStorage: unavailable or blocked');
        }

        try {
            sessionStorage.setItem('_ap_test', '1');
            sessionStorage.removeItem('_ap_test');
            log('storage', 'sessionStorage: available');
        } catch {
            log('storage', 'sessionStorage: unavailable or blocked');
        }

        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
            log('perf', 'navigation timing', {
                domContentLoaded_ms: +navEntry.domContentLoadedEventEnd.toFixed(2),
                load_ms:             +navEntry.loadEventEnd.toFixed(2),
                ttfb_ms:             +(navEntry.responseStart - navEntry.requestStart).toFixed(2),
            });
        }
    }());

    return { log, time, timeEnd, flush, dump, clear };

})();
