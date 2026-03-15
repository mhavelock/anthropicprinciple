# Architecture — anthropicprinciple.ai

## Overview

anthropicprinciple.ai is a kinetic clock art piece. The page presents 84 analogue mini-clocks arranged in a 6-row by 14-column grid; clock.js drives all hand positions through a continuous 30-second animation cycle that blends between four generative patterns before resolving to display the current time (or a countdown). clock-controls.html provides a settings panel that writes configuration to localStorage, which clock.js reads on load and re-reads on the storage event. A favicon animator runs on all pages, drawing a progressive square outline on a 32×32 canvas at approximately 10fps.

---

## Page / Script Dependency Diagram

```
index.html
├── styles/colors.css         (design tokens)
├── styles/global.css         (base styles, flex centring)
├── styles/clock.css          (clock tokens, grid, hand animations)
├── styles/utilities.css      (u-* helper classes)
├── styles/home.css           (aside, social links, hover animations)
├── js/favicon-animator.js    (defer)
└── js/clock.js               (defer)

clock-controls.html
├── styles/controls.css       (stylesheet)
├── js/favicon-animator.js    (defer)
└── js/controls.js            (defer) — form state, localStorage writes

play.html
├── styles/play.css           (stylesheet)
└── (no scripts)
```

---

## CSS Architecture

### Clock page

index.html loads five stylesheets in order:

1. `colors.css` — design tokens (loaded here so `--clk-bg` and global tokens are both available)
2. `global.css` — body flex centring and base resets shared with other pages
3. `clock.css` — self-contained clock tokens (`--clk-*`), the 6×14 grid (`.grid-14x6`), `.mc` cell containment, `.hand` compositor hints, and countdown-zero keyframes; body clock-specific overrides are scoped to `body.clock`
4. `utilities.css` — `u-*` helper classes
5. `home.css` — aside attribution, social link layout, Bluesky flutter animation, Claude/SoundCloud hover effects

### Non-clock pages

All other pages load stylesheets in the following order:

1. `colors.css` — design tokens (must be first)
2. `fonts.css` — font-family declarations
3. `global.css` — reset, base elements, buttons, forms, 12-column grid
4. `components.css` — header, logo, tooltip, alert, modal
5. `[page].css` — page-specific overrides (e.g. `controls.css`, `play.css`)
6. `utilities.css` — `u-*` helper classes (must be last to allow overrides)

---

## Design Token System

`colors.css` is the single source of truth for all CSS custom properties. Light mode defaults are declared on `:root`. Dark mode overrides are applied via `@media (prefers-color-scheme: dark)`, which can be further overridden by `[data-theme="light"]` or `[data-theme="dark"]` attributes on `<html>` for manual theme control.

Font sizes use `em` units (all `--font-size-*` properties) so they scale relative to the element's inherited font size. Spacing uses `rem` units (all `--space-*` properties) so distances remain consistent regardless of local font-size inheritance. The browser default font size (16px) is never overridden on `html` or `body`.

---

## 12-Column Grid

Defined in `global.css`. The pattern is `.container > .row > .col-*`. Mobile-first: all `.col-*` elements default to `grid-column: span 12` (full width, stacked). At 480px+, `.col-1` through `.col-4` span 6, and `.col-5` through `.col-8` span 8. At 768px+, every `.col-1` through `.col-12` spans its nominal number of columns. Container minimum width is 288px; maximum is 1440px. The clock page bypasses this grid entirely — it uses its own CSS grid declared in `clock.css`.

---

## Clock Engine (js/clock.js)

### Grid structure

84 cells are pre-rendered in HTML as `.mc` elements, each containing two `.hand` elements. clock.js references these via `document.querySelectorAll('#grid .hand')` and organises them into a flat `hands[]` array of `{h1, h2}` pairs indexed row-major. Hands pivot from a shared centre point (`transform-origin: bottom center`) and extend upward by half the cell diameter.

### 30-second cycle

The cycle is keyed to `Date.now()` modulo 30000ms and runs continuously. Phase boundaries (ms):

| Window | Duration | Phase |
|---|---|---|
| 0 – 2000 | 2 s | Ease-out: time display to live pattern (60fps) |
| 2000 – 23000 | 21 s | Blended patterns (throttled to ~30fps) |
| 23000 – 25000 | 2 s | Ease-in: pattern to time display (60fps) |
| 25000 – 30000 | 5 s | Static time display (throttled to 1fps) |

### Four kinetic patterns

`patternAngles()` computes base angle and spread for each of the 84 cells using the pattern index:

| Index | Name | Computation |
|---|---|---|
| 0 | Radial wave | `atan2(dr, dc)` with time-phase rotation and fixed spread |
| 1 | Linear sweep | Linear function of column, row, and time; zero spread |
| 2 | Sinusoidal radial | `atan2(dr, dc)` with sinusoidal spread |
| 3 | Distance-modulated spiral | `atan2` with `sqrt` distance field modulating phase and spread |

Adjacent patterns crossfade over 1200ms using `blendedPatternAngles()`. The crossfade interpolates all 84 hand pairs using `lerpA()` (shortest-arc lerp) and an ease function.

### Performance

Five pre-allocated output buffers (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) are created at module initialisation as fixed-length arrays of 2-element sub-arrays. These are mutated in place on every frame — no per-frame heap allocations occur during the blend or ease windows.

`apply()` holds a `Float64Array` of length 168 (`_lastAngles`) as a cache of the last value written to each hand. Before writing `style.transform`, it compares the rounded new angle against the cached value and skips the DOM write if they are equal, avoiding unnecessary style invalidations. Angles are rounded to 2 decimal places to reduce unique string allocations.

Pattern-phase trig calculations (`atan2`, `sqrt`, `sin` per cell) are throttled to approximately 30fps (33ms minimum frame interval) because they are the most expensive per-frame work. The ease-in and ease-out windows run at full 60fps because they are short (2s each) and do not recompute pattern trig. The static display re-renders at most once per second.

The rAF loop is started with `requestAnimationFrame(tick)`. A `visibilitychange` listener cancels the rAF when the tab is hidden and resumes it when the tab becomes visible again.

---

## Countdown Zero State

When countdown mode reaches zero, `timeAngles()` sets `body.classList` to include `countdown-zero`. This class activates two CSS rules in `clock.css`:

- `body.countdown-zero .hand` — applies `danger-pulse` keyframes: a 1.2s ease-in-out loop that alternates hand colour between `--clk-zero-hand` and `#ff5c50` with a 4-layer box-shadow glow.
- `body.countdown-zero::after` — inserts a full-screen fixed pseudo-element with a radial gradient vignette that pulses in sync via `body-pulse` keyframes.

---

## Favicon Animator (js/favicon-animator.js)

An IIFE module (`FaviconAnimator`) initialises on `DOMContentLoaded`. It creates an off-screen 32×32 canvas, sets up a linear gradient stroke style, and starts a rAF loop throttled to approximately 10fps (100ms minimum interval). Each frame draws a progressively longer square outline: top edge (0–25% of cycle), right edge (25–50%), bottom edge (50–75%), left edge (75–100%), then repeats. The completed frame is written to `favicon.href` via `canvas.toDataURL('image/png')`. A `visibilitychange` listener pauses the rAF when the tab is hidden and resumes it on visibility restore.

---

## Control Panel (clock-controls.html)

The page loads `styles/controls.css`, which defines a fixed dark terminal theme using `--ctrl-*` custom properties. This theme is intentionally not system-preference responsive — the panel always renders dark. `js/controls.js` (deferred) handles all control panel behaviour: restoring saved values from localStorage on load, toggling section visibility via `.is-hidden` / `.is-active` classes when the mode radio changes, writing to localStorage on every input event, and computing a countdown end timestamp (`Date.now() + totalMs`) when the Start / Reset button is clicked.

localStorage keys read by clock.js:

| Key | Value |
|---|---|
| `clk_mode` | `"clock"` or `"countdown"` |
| `clk_hours` | Integer UTC offset string (e.g. `"1"` for UTC+1) |
| `clk_countdown_time` | Duration string in `"MM:SS"` format (e.g. `"05:00"`) |
| `clk_countdown_end` | Unix timestamp in ms (absolute end time of countdown) |

clock.js reads these on load via `loadConfig()` and re-reads them whenever another tab fires a `storage` event.

---

## Logger (js/logger.js)

A development-only module. Entries are accumulated in a private `_buf` array in memory. No storage I/O occurs on individual `log()` calls. On `beforeunload`, `flush()` writes the full buffer to `sessionStorage` under the key `ap_dev_log`, and a summary object (count, URL, timestamp, entries) is written to `localStorage` under `ap_dev_log_summary`. The module self-tests localStorage and sessionStorage availability on initialisation and logs the results as buffered entries.

Public API:

| Method | Description |
|---|---|
| `log(section, message, data)` | Buffer a named entry with optional data payload |
| `time(name)` | Start a named `performance.now()` timer |
| `timeEnd(name)` | Stop timer; log elapsed ms |
| `flush()` | Write buffer to sessionStorage immediately |
| `dump()` | Print all entries to the browser console |
| `clear()` | Empty buffer and remove sessionStorage entry |
