/**
 * logger.js — Development Logger
 * ==================================
 * Structured activity logger for build-time diagnostics.
 * Entirely separate from application code — safe to include or exclude
 * without affecting any clock or UI functionality.
 *
 * Storage:
 *   - Active session logs → sessionStorage (cleared on tab close)
 *   - Summary snapshot    → localStorage (persists, written on beforeunload)
 *
 * Usage:
 *   Logger.log('section', 'message', { optional: 'data' });
 *   Logger.time('hero-image');
 *   Logger.timeEnd('hero-image');
 *   Logger.dump();
 *   Logger.clear();
 */

const Logger = (() => {
    'use strict';

    const SESSION_KEY = 'ap_dev_log';
    const PERSIST_KEY = 'ap_dev_log_summary';

    const timers = {};

    // ── Helpers ───────────────────────────────────────────────────────────────

    function timestamp() {
        return new Date().toISOString();
    }

    function readSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function writeSession(entries) {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(entries));
        } catch (e) {
            console.warn('[Logger] sessionStorage write failed:', e.message);
        }
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Log a named event with an optional data payload.
     * @param {string} section - Logical category (e.g. 'init', 'clock', 'storage')
     * @param {string} message - Human-readable description
     * @param {*} [data]       - Optional structured data
     */
    function log(section, message, data) {
        const entry = { ts: timestamp(), section, message };
        if (data !== undefined) entry.data = data;

        const entries = readSession();
        entries.push(entry);
        writeSession(entries);

        console.info(`[Logger:${section}] ${message}`, data !== undefined ? data : '');
    }

    /**
     * Start a named performance timer.
     * @param {string} name - Timer identifier
     */
    function time(name) {
        timers[name] = performance.now();
        log('timer', `start: ${name}`);
    }

    /**
     * Stop a named timer and log elapsed milliseconds.
     * @param {string} name - Timer identifier
     * @returns {number|null} Elapsed ms, or null if timer was not started
     */
    function timeEnd(name) {
        if (!(name in timers)) {
            console.warn(`[Logger] timeEnd called for unknown timer: "${name}"`);
            return null;
        }

        const elapsed = +(performance.now() - timers[name]).toFixed(2);
        delete timers[name];
        log('timer', `end: ${name}`, { elapsed_ms: elapsed });
        return elapsed;
    }

    /**
     * Print all session log entries to the browser console.
     */
    function dump() {
        const entries = readSession();
        console.group('[Logger] Session log dump');
        entries.forEach(e => console.log(`[${e.ts}] [${e.section}] ${e.message}`, e.data || ''));
        console.groupEnd();
        return entries;
    }

    /**
     * Clear the session log store.
     */
    function clear() {
        try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
        log('logger', 'session log cleared');
    }

    // ── Persist summary on page unload ────────────────────────────────────────
    window.addEventListener('beforeunload', () => {
        try {
            const entries = readSession();
            const summary = {
                saved_at: timestamp(),
                url: location.href,
                count: entries.length,
                entries,
            };
            localStorage.setItem(PERSIST_KEY, JSON.stringify(summary));
        } catch { /* noop — storage may be full or restricted */ }
    });

    // ── Test log on init ──────────────────────────────────────────────────────
    (function selfTest() {
        log('logger', 'Logger initialised', { storage: { session: 'sessionStorage', persist: 'localStorage' } });

        // localStorage availability
        try {
            localStorage.setItem('_ap_test', '1');
            localStorage.removeItem('_ap_test');
            log('storage', 'localStorage: available');
        } catch {
            log('storage', 'localStorage: unavailable or blocked');
        }

        // sessionStorage availability
        try {
            sessionStorage.setItem('_ap_test', '1');
            sessionStorage.removeItem('_ap_test');
            log('storage', 'sessionStorage: available');
        } catch {
            log('storage', 'sessionStorage: unavailable or blocked');
        }

        // Script load time (time from navigation start to this script executing)
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
            log('perf', 'page navigation timing', {
                domContentLoaded_ms: +navEntry.domContentLoadedEventEnd.toFixed(2),
                load_ms: +navEntry.loadEventEnd.toFixed(2),
            });
        }

        // Time to first byte
        const [nav] = performance.getEntriesByType('navigation');
        if (nav) {
            log('perf', 'TTFB', { ttfb_ms: +(nav.responseStart - nav.requestStart).toFixed(2) });
        }
    }());

    return { log, time, timeEnd, dump, clear };

})();
