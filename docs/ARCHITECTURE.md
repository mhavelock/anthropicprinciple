# ARCHITECTURE.md — anthropicprinciple.ai

**Site:** anthropicprinciple.ai
**Type:** Static art installation website — zero dependencies
**Version context:** Phase 3 complete, live on GitHub Pages (as of 2026-03-21)
**Purpose:** The golden thread — structural decisions, data flows, and what must never regress.

---

## What It Is

A kinetic clock art piece. 84 mini analogue clocks arranged in a 6 × 14 grid perform four choreographed generative patterns, crossfading continuously, before resolving to display the current time (HH:MM). The 30-second cycle runs without pause. A companion page (`/clock-controls.html`) lets visitors set a UTC offset or run a countdown timer; settings persist in `localStorage` and take effect immediately on `index.html` via the `storage` event.

Inspired by Humans Since 1982's "A Million Times" installation.

---

## Platform & Deployment

- **Static site.** No backend. No build step. No npm. Pure HTML/CSS/JS.
- **Hosting:** GitHub Pages — branch `main` auto-deploys
- **Domain:** anthropicprinciple.ai (CNAME to GitHub Pages)
- **Repository:** https://github.com/mhavelock/anthropicprinciple
- **Local dev:** `npx live-server` — http://127.0.0.1:5500

---

## Core Structural Decisions

These are the expensive-to-change choices. Each one has a reason that must survive the decision.

### 1. Zero dependencies
No npm, no bundler, no framework. All files are shipped as-is. Rationale: simplicity, auditability, PageSpeed 100, zero build failure surface, zero supply-chain risk.

### 2. CSS custom properties as single source of truth
All colours, spacing, and timing values are defined as `--custom-properties` in `colors.css`. Never hard-coded in component CSS. Clock-specific tokens live in `clock.css` under the `--clk-*` namespace. Controls page tokens live in `controls.css` under the `--ctrl-*` namespace.

### 3. clock.css is self-contained
`clock.css` is the only stylesheet on the clock page that carries the clock-specific reset, grid, hand compositor hints, and countdown keyframes. It never borrows from `components.css` or any page-specific sheet. This isolation means clock rendering is predictable and immune to changes elsewhere.

### 4. rAF loops with visibilitychange pause
Both `clock.js` and `favicon-animator.js` use `requestAnimationFrame` — never `setInterval`. Both pause via `visibilitychange` when the tab is hidden. This prevents background CPU burn and canvas allocations when the page is not visible.

### 5. Pre-allocated output buffers — no per-frame heap allocations
`clock.js` allocates five buffer arrays (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) once at module initialisation as fixed-length arrays of 2-element sub-arrays. These are mutated in place on every frame — no objects or arrays created in the hot path.

### 6. Float64Array angle cache — skip unchanged DOM writes
`apply()` maintains `_lastAngles` (a `Float64Array` of length 168) as a per-frame cache. A `style.transform` write is only issued if the rounded new angle differs from the cached value — avoiding unnecessary style invalidations when a hand hasn't moved.

### 7. GPU compositor via will-change + contain
`will-change: transform` on `.hand` promotes all 168 hand elements to individual GPU compositor layers. `contain: layout style paint` on `.mc` scopes style recalculation to each clock cell. Together, a transform write on one hand cannot cascade to the full document.

### 8. localStorage-only settings persistence
Clock settings survive page reloads and cross-tab via `localStorage`. Five keys: `clk_mode`, `clk_use_local`, `clk_hours`, `clk_countdown_time`, `clk_countdown_end`. `clock.js` reads on load and re-reads on the `storage` event (other-tab changes apply immediately).

---

## File Structure

```text
anthropicprinciple/
├── index.html              # Clock page — full-screen art piece
├── clock-controls.html     # Settings panel — mode, timezone, countdown
│
├── styles/
│   ├── clock.css           # ⚠️ PROTECTED — clock grid, hands, animations
│   ├── colors.css          # Design tokens — single source of truth
│   ├── fonts.css           # Font declarations
│   ├── global.css          # Base resets, 12-col grid, shared styles
│   ├── components.css      # UI components — header, modal, alert, tooltip
│   ├── home.css            # Page-specific — aside, social links, hover effects
│   ├── controls.css        # Page-specific — controls panel (--ctrl-* namespace)
│   ├── utilities.css       # u-* helper classes (always load last)
│   ├── banner.css          # Banner component
│   └── border-effect.css   # Animated conic-gradient border component
│
├── js/
│   ├── clock.js            # ⚠️ PROTECTED — animation engine, hand-angle tables
│   ├── favicon-animator.js # ⚠️ PROTECTED — animated canvas favicon
│   ├── controls.js         # Controls panel — localStorage reads/writes
│   ├── logger.js           # Dev logger — buffered in memory, separate from app
│   └── main.js             # Entry point — viewport/resize handling
│
└── docs/
    ├── ARCHITECTURE.md         # This file — system overview and structural decisions
    ├── SYSTEM.md               # Developer rules, naming conventions, never-do constraints
    ├── FILE_MANIFEST.md        # Every file described
    └── architecture/           # Extended reference docs (audit, patterns, feedback loops)
```

### ⚠️ Protected files

| File | Rule |
|------|------|
| `styles/clock.css` | Never change timing values, keyframes, or grid layout. May add compositor hints only. |
| `js/clock.js` | Never change the 30-second cycle, digit shapes, pattern logic, or hand-angle tables. May add performance optimisations. |
| `js/favicon-animator.js` | Working correctly. Do not modify unless a specific bug fix is required. |

---

## Page / Script Dependency Diagram

```text
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

## Clock Engine (js/clock.js)

### Grid structure

84 cells are pre-rendered in HTML as `.mc` elements, each containing two `.hand` elements. clock.js references these via `document.querySelectorAll('#grid .hand')` and organises them into a flat `hands[]` array of `{h1, h2}` pairs indexed row-major. Hands pivot from a shared centre point (`transform-origin: bottom center`) and extend upward by half the cell diameter.

### 30-Second Cycle

The cycle is keyed to `Date.now() % 30000`. Phase windows:

| Window | Duration | Throttle | Phase |
|--------|----------|----------|-------|
| 0–2000 ms | 2 s | 60fps | Ease-out: time display → live pattern |
| 2000–23000 ms | 21 s | ~30fps | Blended patterns (trig-heavy, throttled) |
| 23000–25000 ms | 2 s | 60fps | Ease-in: pattern → time display |
| 25000–30000 ms | 5 s | 1fps | Static time display |

### Four kinetic patterns

`patternAngles()` computes base angle and spread for each of the 84 cells using the pattern index:

| Index | Name | Computation |
|---|---|---|
| 0 | Radial wave | `atan2(dr, dc)` with time-phase rotation and fixed spread |
| 1 | Linear sweep | Linear function of column, row, and time; zero spread |
| 2 | Sinusoidal radial | `atan2(dr, dc)` with sinusoidal spread |
| 3 | Distance-modulated spiral | `atan2` with `sqrt` distance field modulating phase and spread |

Adjacent patterns crossfade over 1200ms using `blendedPatternAngles()` with `lerpA()` (shortest-arc lerp).

### Performance

Five pre-allocated output buffers (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) are created at module initialisation as fixed-length arrays of 2-element sub-arrays. These are mutated in place on every frame — no per-frame heap allocations occur during the blend or ease windows.

`apply()` holds a `Float64Array` of length 168 (`_lastAngles`) as a cache of the last value written to each hand. Before writing `style.transform`, it compares the rounded new angle against the cached value and skips the DOM write if they are equal. Angles are rounded to 2 decimal places to reduce unique string allocations.

Pattern-phase trig calculations (`atan2`, `sqrt`, `sin` per cell) are throttled to approximately 30fps (33ms minimum frame interval). The ease-in/ease-out windows run at full 60fps. The static display re-renders at most once per second.

The rAF loop is started with `requestAnimationFrame(tick)`. A `visibilitychange` listener cancels the rAF when the tab is hidden and resumes it when the tab becomes visible again.

---

## Data Flow — Controls → Clock

```text
[User changes a control]
    ↓
controls.js → localStorage write (debounced 250ms for text inputs)
    ↓
clock.js reads on page load via loadConfig()
    ↓
clock.js re-reads on storage event (cross-tab, immediate)
    ↓
timeAngles() uses clk_mode, clk_hours, clk_countdown_end
    to determine hand positions for the current HH:MM or countdown
```

localStorage keys:

| Key | Value |
|-----|-------|
| `clk_mode` | `"clock"` or `"countdown"` |
| `clk_use_local` | `"true"` or `"false"` — absent = `true` (default: local time) |
| `clk_hours` | Integer UTC offset string (e.g. `"1"` for UTC+1) — only used when `clk_use_local` is `"false"` |
| `clk_countdown_time` | Duration string `"MM:SS"` |
| `clk_countdown_end` | Unix timestamp ms (absolute countdown end time) |

---

## Countdown Zero State

When countdown mode reaches zero, `timeAngles()` adds `countdown-zero` to `body.classList`. Two CSS rules activate:

- `body.countdown-zero .hand` — `danger-pulse` keyframes: alternates hand colour between `--clk-zero-hand` and `#ff5c50` with a 4-layer box-shadow glow (1.2s ease-in-out loop)
- `body.countdown-zero::after` — full-screen fixed pseudo-element with a radial gradient vignette that pulses in sync via `body-pulse` keyframes

---

## Favicon Animator (js/favicon-animator.js)

An IIFE module (`FaviconAnimator`) initialises on `DOMContentLoaded`. It creates an off-screen 32×32 canvas, sets up a linear gradient stroke style, and starts a rAF loop throttled to approximately 10fps (100ms minimum interval). Each frame draws a progressively longer square outline: top edge (0–25% of cycle), right edge (25–50%), bottom edge (50–75%), left edge (75–100%), then repeats. The completed frame is written to `favicon.href` via `canvas.toDataURL('image/png')`. A `visibilitychange` listener pauses the rAF when the tab is hidden and resumes it on visibility restore.

---

## Control Panel (clock-controls.html)

The page loads `styles/controls.css`, which defines a fixed dark terminal theme using `--ctrl-*` custom properties. This theme is intentionally not system-preference responsive — the panel always renders dark. `js/controls.js` (deferred) handles all control panel behaviour: restoring saved values from localStorage on load, toggling section visibility via `.is-hidden` / `.is-active` classes when the mode radio changes, writing to localStorage on every input event, and computing a countdown end timestamp (`Date.now() + totalMs`) when the Start / Reset button is clicked.

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

---

## Conventions Quick Reference

| What | Where |
|------|-------|
| All design tokens | `styles/colors.css` |
| Clock-specific tokens (`--clk-*`) | `styles/clock.css` |
| Controls page tokens (`--ctrl-*`) | `styles/controls.css` |
| Font declarations | `styles/fonts.css` |
| Shared base styles | `styles/global.css` |
| Reusable UI components | `styles/components.css` |
| Clock animation engine | `js/clock.js` |
| Favicon animation | `js/favicon-animator.js` |
| Controls panel logic | `js/controls.js` |
| Viewport / resize handling | `js/main.js` |
| Dev logging | `js/logger.js` |

---

## What We Never Do

| Never | Always |
|-------|--------|
| `setInterval` for animation | `requestAnimationFrame` with timestamp throttle |
| Let rAF run when tab is hidden | `visibilitychange` listener pauses both loops |
| Animate `width`, `height`, `top`, `left` | `transform` and `opacity` only |
| Hard-code colour or spacing values | CSS custom properties from `colors.css` |
| Use `max-width` breakpoints | Mobile-first `min-width` only |
| Inline styles in HTML | No `style` attribute, ever |
| `!important` in CSS | Specificity-correct rule ordering |
| Per-frame heap allocations in the rAF loop | Pre-allocated buffers at module init |
| Write DOM if hand angle unchanged | `_lastAngles` Float64Array cache comparison first |
| Modify `clock.js` timing or digit logic | Performance optimisation only |
| Modify `clock.css` visual values | Compositor hints only |
| Raw localStorage values in JS logic | Always sanitise/validate before use |

---

*Developer rules in full: `docs/SYSTEM.md`*
*Coding standards, token reference, pitfalls: `docs/architecture/ARCHITECTURE_EXTENSION.md`*
*Pre-commit patterns: `docs/architecture/CORE_PATTERNS.md`*
