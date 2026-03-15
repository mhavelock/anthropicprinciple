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

    // ── Restore saved values ────────────────────────────────────────────
    const rawMode    = ls.get('clk_mode');
    const savedMode  = (rawMode === 'clock' || rawMode === 'countdown') ? rawMode : 'clock';
    const savedHours = ls.get('clk_hours')           || '0';
    const savedTime  = ls.get('clk_countdown_time')  || '05:00';

    document.querySelector(`input[value="${savedMode}"]`).checked = true;
    document.getElementById('hours').value          = savedHours;
    document.getElementById('countdown-time').value = savedTime;

    // ── Section visibility ──────────────────────────────────────────────
    function updateSections() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        document.getElementById('section-clock').classList.toggle('is-hidden', mode !== 'clock');
        document.getElementById('section-countdown').classList.toggle('is-hidden', mode !== 'countdown');
        document.getElementById('lbl-clock').classList.toggle('is-active', mode === 'clock');
        document.getElementById('lbl-countdown').classList.toggle('is-active', mode === 'countdown');
    }
    updateSections();

    // ── Event listeners ─────────────────────────────────────────────────
    document.querySelectorAll('input[name="mode"]').forEach(r => {
        r.addEventListener('change', () => {
            ls.set('clk_mode', r.value);
            updateSections();
        });
    });

    document.getElementById('hours').addEventListener('input', e => {
        ls.set('clk_hours', e.target.value);
    });

    document.getElementById('countdown-time').addEventListener('input', e => {
        ls.set('clk_countdown_time', e.target.value);
    });

    // ── Start / Reset countdown ──────────────────────────────────────────
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
