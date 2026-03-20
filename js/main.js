/**
 * Main Application Entry Point
 * ==========================
 * Shared utilities for all pages.
 *
 * Note: favicon-animator.js self-initialises via FaviconAnimator.init() at the
 * bottom of that file — no call needed here.
 *
 * Why no DOMContentLoaded?
 * All scripts use defer, so the DOM is already parsed when this runs.
 */
(function () {
  'use strict';

  // ── Viewport unit fix — iOS Safari orientation change ─────────────────────
  // dvh/dvw CSS units do not always trigger style recalculation after an
  // orientation change on iOS Safari. Setting --vw/--vh from JS on every
  // resize forces a reliable reflow. rAF throttle prevents layout thrashing
  // during continuous resize events.
  let rafPending = false;

  function updateViewportUnits() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      const s = document.documentElement.style;
      s.setProperty('--vw', (window.innerWidth  / 100) + 'px');
      s.setProperty('--vh', (window.innerHeight / 100) + 'px');
    });
  }

  window.addEventListener('resize', updateViewportUnits);
  updateViewportUnits();
}());
