# Architecture

## Overview

eruditorum is a kinetic grid clock. The main page (`index.html`) renders only a clock; the control panel (`clock-controls.html`) writes settings to `localStorage` which the clock reads.

```
Browser
├── index.html
│   ├── styles/colors.css   ← design tokens (light/dark mode)
│   ├── styles/clock.css    ← clock layout & animation
│   └── js/clock.js         ← clock engine (defer)
│
└── clock-controls.html     ← standalone, inline styles
        ↕ localStorage
    js/clock.js reads on load + storage event
```

---

## CSS Architecture

### Two-file stack for the clock page

`index.html` intentionally loads only two stylesheets:

1. **`colors.css`** — all design tokens (custom properties only, no rendered styles)
2. **`clock.css`** — all clock UI (references tokens from colors.css)

This keeps the clock page minimal and fast. All other CSS files (`global.css`, `critical.css`, etc.) exist for use by future pages.

### Design token system (`colors.css`)

Tokens adapt automatically to the OS colour scheme via `prefers-color-scheme`. Manual overrides are possible with `[data-theme="light"]` or `[data-theme="dark"]` on `<html>`.

```
Light defaults defined in :root
    ↓ overridden by
@media (prefers-color-scheme: dark)
    ↓ overridden by
[data-theme="light|dark"] attribute
```

Font sizes use browser-default `1rem = 16px`. No 62.5% body hack.

### 12-column grid (`global.css`)

Available to any page that links `global.css`:

```html
<div class="container">
  <div class="row">
    <div class="col-8">main content</div>
    <div class="col-4">sidebar</div>
  </div>
</div>
```

Collapses: col-1 to col-4 → span 6 at ≤768px; all → span 12 at ≤480px.

The clock homepage bypasses this grid — its layout is driven entirely by `clock.css`.

---

## Clock Engine (`js/clock.js`)

### Grid structure

84 mini-clocks arranged in a 6-row × 14-column grid:

```
[HH: 3 cols][HH: 3 cols][:: 2 cols][MM: 3 cols][MM: 3 cols]
```

Each cell contains two `.hand` elements that rotate from a shared pivot point at the cell centre. Hand positions encode digit shapes (0–9) and a colon separator.

### 30-second display cycle

```
0s ──────────── 2s ──────────────────────── 23s ─── 25s ─── 30s
  [ease out]         [kinetic patterns]       [ease in] [static]
```

- **0–2s**: time display → pattern (reverse ease)
- **2–23s**: four blended kinetic patterns crossfade every ~5.75s
- **23–25s**: pattern → time display (forward ease)
- **25–30s**: static time, re-renders once per second

### Four kinetic patterns

| # | Style |
|---|---|
| 0 | Radial wave from centre with rotation |
| 1 | Linear progression with column/row offsets |
| 2 | Radial with sinusoidal spread |
| 3 | Spiral with distance-based modulation |

Patterns crossfade during a 1.2s blend window (`BLEND_MS`).

### Countdown zero

When countdown reaches 0, `body.countdown-zero` is set. This triggers:
- `danger-pulse` keyframe animation on all `.hand` elements (4-layer glow, 130px max spread)
- `body::after` full-screen vignette that pulses in sync (defined in `clock.css`)

### iOS orientation fix

Grid width uses `dvw`/`dvh` (dynamic viewport units) instead of `vw`/`vh`:

```css
width: min(90dvw, calc(90dvh * (14/6)), 900px);
```

`dvh` updates on every orientation change including browser chrome resize, which standard `vh` does not reliably do on iOS Safari. The viewport meta also includes `interactive-widget=resizes-content`.

---

## Control Panel (`clock-controls.html`)

Self-contained: all styles are inline, no external CSS. Uses the dark colour palette directly.

Settings written to `localStorage`:

| Key | Values |
|---|---|
| `clk_mode` | `"clock"` \| `"countdown"` |
| `clk_hours` | integer string, UTC offset |
| `clk_countdown_time` | `"MM:SS"` string |
| `clk_countdown_end` | Unix timestamp (ms) |

`clock.js` reads these on load and re-reads on the `storage` event (cross-tab sync).

---

## Performance

- Clock page: 2 CSS files + 1 JS file, no framework, no build step
- Hands use `will-change: transform` + `transform` only (GPU compositing, no layout reflow)
- `requestAnimationFrame` loop; static display throttled to once per second
- `dvh`/`dvw` avoid JS resize handlers for responsive sizing
