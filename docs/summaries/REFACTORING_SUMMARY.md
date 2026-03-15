# Refactoring Summary — anthropicprinciple.ai

## Project at a Glance

anthropicprinciple.ai is a browser-based kinetic clock art piece. 84 analogue mini-clocks are arranged in a 6×14 grid; their hands are driven by a JavaScript rAF loop that cycles through generative animation patterns before periodically resolving to display the current time or a running countdown. The project has three HTML pages: `index.html` (the clock), `clock-controls.html` (the settings panel), and `play.html` (additional page). The technology stack is vanilla HTML, CSS, and JavaScript — no build tools, no frameworks, no external dependencies.

---

## CSS Layer Summary

| File | Scope | Loads on |
|---|---|---|
| clock.css | Clock tokens, grid, hand animation, keyframes | index.html |
| colors.css | Design tokens: light/dark mode, all custom properties | Non-clock pages |
| fonts.css | System font-family stacks | Non-clock pages |
| global.css | Base elements, forms, 12-column grid | Non-clock pages |
| components.css | Header, logo, tooltip, alert, modal | Non-clock pages |
| controls.css | Clock-controls panel (fixed dark theme) | clock-controls.html |
| banner.css | Banner section with fluid typography | As needed |
| border-effect.css | Animated conic-gradient border component | As needed |
| utilities.css | `u-*` helper classes | All non-clock pages |

---

## JS Summary

| File | Purpose | Loaded on |
|---|---|---|
| clock.js | Clock engine — rAF loop, pattern generation, angle application | index.html |
| favicon-animator.js | Animated canvas favicon at ~10fps | All pages |
| logger.js | Dev logger — in-memory buffer, flush on unload | Opt-in (not loaded by default) |
| main.js | Reserved entry point | Not currently loaded |

---

## Performance Profile

**Zero external fonts, zero third-party scripts on the clock page.** The entire clock experience is delivered with 1 CSS file and 2 JavaScript files.

**GPU compositing**: `will-change: transform` on all 168 `.hand` elements promotes each to its own compositor layer. Transform updates written by clock.js are applied by the GPU thread, not the main thread.

**Style isolation**: `contain: layout style paint` on each `.mc` cell scopes style recalculation to that cell. A transform write on any one hand cannot invalidate the style tree for the rest of the document.

**rAF management**: the loop pauses on `visibilitychange` when the tab is hidden (both clock.js and favicon-animator.js). No CPU or GPU work occurs in backgrounded tabs.

**Frame rate strategy**:
- Pattern trig phase (21s window): ~30fps throttle — `atan2`, `sqrt`, and `sin` per cell is the most expensive computation
- Ease-in / ease-out phases (2s each): 60fps — no pattern trig, only lerp operations on pre-computed snapshots
- Static time display (5s window): 1fps — re-renders only when the wall-clock second changes

**No per-frame heap allocations**: all angle output arrays (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) are pre-allocated at module initialisation and mutated in place. The `Float64Array` angle cache (`_lastAngles`) in `apply()` further eliminates DOM writes for values that have not changed.

**Images**: where used, `srcset` with 250w and 500w resolution variants delivers appropriately sized images to each device. `loading="lazy"` defers off-screen image decoding.

---

## Key Constraints to Preserve

The following constraints must not be violated when modifying any file in the project:

- `clock.css` and `clock.js` may only be modified for performance reasons. Visual behaviour, timing values (cycle duration, phase boundaries, ease durations), and pattern mathematics must not change.
- No inline styles anywhere. All visual state must be expressed through CSS class toggling (`.is-hidden`, `.is-active`, `.countdown-zero`).
- No `max-width` media queries. All responsive breakpoints are `min-width` only (mobile-first).
- No visited state in any CSS file.
- All `font-size` values must use `em` units. All distance and spacing values (padding, margin, gap, width) must use `rem` units.
- Every colour, spacing value, transition duration, and font family must be expressed as a CSS custom property. No bare hex values or raw pixel measurements in component or page stylesheets.
