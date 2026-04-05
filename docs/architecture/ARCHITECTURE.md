# ARCHITECTURE.md — anthropicprinciple.ai

**Site:** anthropicprinciple.ai
**Type:** Static art installation website — zero dependencies
**Version context:** Phase 3 complete, live on GitHub Pages (as of 2026-03-21)
**Purpose:** The golden thread — structural decisions, data flows, and what must never regress. Keep core under ~1,000 words. Detail lives in `ARCHITECTURE_EXTENSION.md`.

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
Clock settings survive page reloads and cross-tab via `localStorage`. Four keys: `clk_mode`, `clk_hours`, `clk_countdown_time`, `clk_countdown_end`. `clock.js` reads on load and re-reads on the `storage` event (other-tab changes apply immediately).

---

## File Structure

```
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
    ├── ARCHITECTURE.md         # Brief overview (legacy shortcut)
    ├── FILE_MANIFEST.md        # Every file described
    └── architecture/           # Full developer reference (this system)
```

### ⚠️ Protected files

| File | Rule |
|------|------|
| `styles/clock.css` | Never change timing values, keyframes, or grid layout. May add compositor hints only. |
| `js/clock.js` | Never change the 30-second cycle, digit shapes, pattern logic, or hand-angle tables. May add performance optimisations. |
| `js/favicon-animator.js` | Working correctly. Do not modify unless a specific bug fix is required. |

---

## CSS Load Order

### Clock page (index.html)
`colors.css` → `global.css` → `clock.css` → `utilities.css` → `home.css`

### Non-clock pages
`colors.css` → `fonts.css` → `global.css` → `components.css` → `[page].css` → `utilities.css`

---

## Clock Engine — 30-Second Cycle

The cycle is keyed to `Date.now() % 30000`. Phase windows:

| Window | Duration | Throttle | Phase |
|--------|----------|----------|-------|
| 0–2000 ms | 2 s | 60fps | Ease-out: time display → live pattern |
| 2000–23000 ms | 21 s | ~30fps | Blended patterns (trig-heavy, throttled) |
| 23000–25000 ms | 2 s | 60fps | Ease-in: pattern → time display |
| 25000–30000 ms | 5 s | 1fps | Static time display |

Four patterns: Radial wave · Linear sweep · Sinusoidal radial · Distance-modulated spiral. Adjacent patterns crossfade over 1200ms using `blendedPatternAngles()` with `lerpA()` (shortest-arc lerp).

---

## Data Flow — Controls → Clock

```
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
| `clk_hours` | Integer UTC offset string (e.g. `"1"` for UTC+1) |
| `clk_countdown_time` | Duration string `"MM:SS"` |
| `clk_countdown_end` | Unix timestamp ms (absolute countdown end time) |

---

## Countdown Zero State

When countdown mode reaches zero, `timeAngles()` adds `countdown-zero` to `body.classList`. Two CSS rules activate:
- `body.countdown-zero .hand` — `danger-pulse` keyframes: alternates hand colour with a 4-layer box-shadow glow
- `body.countdown-zero::after` — full-screen radial gradient vignette, pulses in sync

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

*Operational reference (coding standards, performance details, audit types): `ARCHITECTURE_EXTENSION.md`*
*Developer rules in full: `SYSTEM.md`*
*Pre-commit patterns: `CORE_PATTERNS.md`*
