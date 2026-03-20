/**
 * controls.js — Clock Controls Panel
 * =====================================
 * Handles all form interaction on clock-controls.html:
 * - Restores saved values from localStorage on load
 * - Toggles section visibility when mode radio changes
 * - Writes settings to localStorage on every input event
 * - Computes countdown end timestamp on Start / Reset click
 *
 * localStorage keys (read by clock.js on the main page):
 *   clk_mode           — "clock" or "countdown"
 *   clk_hours          — UTC offset integer string (e.g. "1" for UTC+1)
 *   clk_countdown_time — Duration "MM:SS" string (e.g. "05:00")
 *   clk_countdown_end  — Unix timestamp ms (absolute countdown end time)
 */

(function () {
    'use strict';

    const ls = { get: k => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v) };

    // ── Debounce helper — prevents excessive localStorage writes on rapid input ──
    function debounce(fn, ms) {
        let timer = null;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn.bind(this, ...arguments), ms);
        };
    }

    // ── Restore saved values (with sanitization) ────────────────────────────────
    const rawMode    = ls.get('clk_mode');
    const savedMode  = (rawMode === 'clock' || rawMode === 'countdown') ? rawMode : 'clock';

    const rawHours   = parseInt(ls.get('clk_hours') ?? '0', 10);
    const savedHours = isNaN(rawHours) ? 0 : Math.max(-12, Math.min(14, rawHours));

    const rawTime    = ls.get('clk_countdown_time') || '';
    const savedTime  = /^\d{1,2}:\d{2}$/.test(rawTime) ? rawTime : '05:00';

    document.querySelector(`input[value="${savedMode}"]`).checked = true;
    document.getElementById('hours').value          = savedHours;
    document.getElementById('countdown-time').value = savedTime;

    // ── Section visibility ──────────────────────────────────────────────────────
    function updateSections() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        document.getElementById('section-clock').classList.toggle('is-hidden', mode !== 'clock');
        document.getElementById('section-countdown').classList.toggle('is-hidden', mode !== 'countdown');
        document.getElementById('lbl-clock').classList.toggle('is-active', mode === 'clock');
        document.getElementById('lbl-countdown').classList.toggle('is-active', mode === 'countdown');
    }
    updateSections();

    // ── Event listeners ─────────────────────────────────────────────────────────
    document.querySelectorAll('input[name="mode"]').forEach(r => {
        r.addEventListener('change', () => {
            ls.set('clk_mode', r.value);
            updateSections();
        });
    });

    // Debounced — user may arrow-key through many values rapidly
    document.getElementById('hours').addEventListener('input', debounce(function (e) {
        const v = parseInt(e.target.value, 10);
        if (!isNaN(v)) ls.set('clk_hours', Math.max(-12, Math.min(14, v)));
    }, 250));

    // Debounced — user types character by character
    document.getElementById('countdown-time').addEventListener('input', debounce(function (e) {
        ls.set('clk_countdown_time', e.target.value);
    }, 250));

    // ── Start / Reset countdown ─────────────────────────────────────────────────
    document.getElementById('start-btn').addEventListener('click', () => {
        const raw   = document.getElementById('countdown-time').value.trim() || '05:00';
        const parts = raw.split(':');
        const mm    = Math.min(99, parseInt(parts[0], 10) || 0);
        const ss    = Math.min(59, parseInt(parts[1], 10) || 0);
        const totalMs = (mm * 60 + ss) * 1000;

        ls.set('clk_countdown_time', `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`);
        ls.set('clk_countdown_end', Date.now() + totalMs);
        ls.set('clk_mode', 'countdown');

        document.querySelector('input[value="countdown"]').checked = true;
        updateSections();

        const endTime = new Date(Date.now() + totalMs);
        document.getElementById('status').textContent =
            `Started — ends at ${endTime.toLocaleTimeString()}`;
    });
}());
