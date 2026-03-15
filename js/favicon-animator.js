/**
 * Favicon Animator Module
 * ========================
 * Animates the favicon by drawing a square outline frame-by-frame on a
 * canvas. Uses requestAnimationFrame (pauses automatically when the tab is
 * hidden) throttled to ~10 fps — plenty of resolution for a 32 px icon and
 * far cheaper than the previous setInterval approach.
 *
 * Stages (0–100 % each cycle):
 * 0–25 %:   Top edge    (0,0) → (32,0)
 * 25–50 %:  Right edge  (32,0) → (32,32)
 * 50–75 %:  Bottom edge (32,32) → (0,32)
 * 75–100 %: Left edge   (0,32) → (0,0)
 */

const FaviconAnimator = (() => {
    'use strict';

    const CANVAS_SIZE        = 32;
    const ANIMATION_DURATION = 100;   // total progress units per cycle
    const FRAME_INTERVAL_MS  = 100;   // ~10 fps — imperceptible on a 32px icon

    const GRADIENT_START = '#c7f0fe';
    const GRADIENT_END   = '#56d3c9';

    let canvas   = null;
    let ctx      = null;
    let favicon  = null;
    let rafId    = null;

    let progress  = 0;
    let lastTick  = 0;  // timestamp of the last rendered frame

    // ── Draw one frame ─────────────────────────────────────────────────────────

    function drawFrame() {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.beginPath();

        if (progress <= 25) {
            const w = (CANVAS_SIZE / 25) * progress;
            ctx.moveTo(0, 0);
            ctx.lineTo(w, 0);
        } else if (progress <= 50) {
            ctx.moveTo(0, 0);
            ctx.lineTo(CANVAS_SIZE, 0);
            const h = (CANVAS_SIZE / 25) * (progress - 25);
            ctx.moveTo(CANVAS_SIZE, 0);
            ctx.lineTo(CANVAS_SIZE, h);
        } else if (progress <= 75) {
            ctx.moveTo(0, 0);
            ctx.lineTo(CANVAS_SIZE, 0);
            ctx.moveTo(CANVAS_SIZE, 0);
            ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE);
            const w = -((CANVAS_SIZE / 25) * (progress - 75));
            ctx.moveTo(CANVAS_SIZE, CANVAS_SIZE);
            ctx.lineTo(w, CANVAS_SIZE);
        } else {
            ctx.moveTo(0, 0);
            ctx.lineTo(CANVAS_SIZE, 0);
            ctx.moveTo(CANVAS_SIZE, 0);
            ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE);
            ctx.moveTo(CANVAS_SIZE, CANVAS_SIZE);
            ctx.lineTo(0, CANVAS_SIZE);
            const h = -((CANVAS_SIZE / 25) * (progress - ANIMATION_DURATION));
            ctx.moveTo(0, CANVAS_SIZE);
            ctx.lineTo(0, h);
        }

        ctx.stroke();
        favicon.href = canvas.toDataURL('image/png');

        progress = progress >= ANIMATION_DURATION ? 0 : progress + 1;
    }

    // ── rAF loop — throttled to FRAME_INTERVAL_MS ─────────────────────────────

    function loop(now) {
        rafId = requestAnimationFrame(loop);
        if (now - lastTick < FRAME_INTERVAL_MS) return;
        lastTick = now;
        drawFrame();
    }

    // ── Pause / resume on tab visibility ──────────────────────────────────────

    function pause() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function resume() {
        if (rafId === null) {
            lastTick = 0; // let first frame fire immediately
            rafId = requestAnimationFrame(loop);
        }
    }

    // ── Init ──────────────────────────────────────────────────────────────────

    function init() {
        favicon = document.querySelector('link[rel*="icon"]');
        if (!favicon) {
            console.error('FaviconAnimator: favicon link element not found');
            return false;
        }

        canvas        = document.createElement('canvas');
        canvas.width  = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        ctx           = canvas.getContext('2d');
        if (!ctx) return false;

        const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        gradient.addColorStop(0, GRADIENT_START);
        gradient.addColorStop(1, GRADIENT_END);
        ctx.strokeStyle = gradient;
        ctx.lineWidth   = 16;

        document.addEventListener('visibilitychange', () => {
            document.hidden ? pause() : resume();
        });

        resume();
        return true;
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => FaviconAnimator.init());
