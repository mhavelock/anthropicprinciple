# File Manifest

## Core HTML

### `index.html`
Main page. Loads `colors.css` then `clock.css`. Renders a 6×14 kinetic grid clock via `clock.js`.
Viewport meta includes `viewport-fit=cover` and `interactive-widget=resizes-content` for iOS orientation support.

### `clock-controls.html`
Standalone control panel (self-contained inline styles, no external CSS dependency).
Settings are persisted to `localStorage` and picked up by `clock.js` on the clock page.

**Controls:**
- Mode toggle: Clock ↔ Countdown
- UTC offset (hours) for clock mode
- MM:SS duration + Start/Reset for countdown mode

---

## Styles

### `styles/colors.css` — Design System
The single source of truth for all design tokens. Loaded by `index.html`.

**Light/dark mode** via `prefers-color-scheme`, overridable with `[data-theme="light"|"dark"]` on `<html>`.

**Key variables:**

| Group | Variables |
|---|---|
| Surfaces | `--color-bg`, `--color-bg-alt`, `--color-bg-raised` |
| Text | `--color-text`, `--color-text-muted`, `--color-text-on-btn` |
| Borders | `--color-border`, `--color-border-subtle` |
| Primary button | `--color-btn-primary`, `-hover`, `-active`, `--color-text-on-btn-primary` |
| Secondary button | `--color-btn-secondary`, `-hover`, `-active`, `--color-text-on-btn-secondary` |
| Links | `--color-link`, `--color-link-hover` |
| Forms | `--color-input-bg`, `--color-input-border`, `--color-input-text`, etc. |
| Grid | `--grid-cols`, `--gutter`, `--gutter-sm`, `--container-max` |
| Typography | `--font-size-h1` → `--font-size-xs` (based on 1rem = 16px) |
| Spacing | `--space-xs` → `--space-3xl` |
| Transitions | `--transition-fast/normal/slow`, `--ease-*` |

Light mode colours: bg `#ffffff`, text `#141211`, border `#262c30`, primary btn `#052842`, secondary btn `#074020`.
Dark mode colours: bg `#141211`, text `#e6ecf0`, border `#f2f9ff`, primary btn `#415e70`, secondary btn `#417055`.

### `styles/clock.css`
Clock-specific tokens and layout. Loaded by `index.html` after `colors.css`.

**Tokens:**

| Variable | Value | Purpose |
|---|---|---|
| `--clk-bg` | `#050505` | Page background |
| `--clk-face` | `#0e0e0e` | Clock dial fill |
| `--clk-hand` | `#FF1B0E` | Hand colour |
| `--clk-zero-hand` | `#FF1B0E` | Hand colour at countdown zero |
| `--clk-zero-glow` | `rgba(255,27,14,0.65)` | Glow strength at zero |

**Grid:** `display: grid; grid-template-columns: repeat(14, 1fr)` — 6 rows × 14 cols = 84 mini-clocks.
Width uses `dvw`/`dvh` (dynamic viewport units) for correct sizing on iPhone orientation change.

**Countdown zero effect:** `danger-pulse` keyframes animate hands through a 4-layer box-shadow glow (up to 130px spread). A full-screen `body::after` vignette pulses in sync.

### `styles/global.css`
Reusable styles, safe to defer. Not currently linked by either page directly — available for future pages.

**Contains:**
- Typography (`p`, `h1–h3`) using `--font-size-*` vars
- Link styles via `--color-link` / `--color-link-hover`
- `.btn`, `.btn-primary`, `.btn-secondary` classes
- Form element styles (`input`, `textarea`, `select`) — focus rings, placeholders, disabled state
- **12-column grid**: `.container`, `.row`, `.col-1` – `.col-12` with responsive collapse at 768px and 480px

### `styles/critical.css`
Core reset and layout. Not currently linked by either page — available for future pages.

**Contains:**
- `* { box-sizing: border-box }` reset
- `body` using `--color-bg` / `--color-text` (respects dark mode)
- `main` as flex centering container
- `button` base: `cursor: pointer`, no border, inherits font
- Responsive images, hidden canvas

Font size: browser default `1rem = 16px` (62.5% hack removed).

### `styles/components.css`
Component interaction states. Not currently linked by either page — available for future pages.

**Contains:**
- `button`, `[role="button"]`: cursor pointer, hover/active opacity
- `header` and `.logo` styles

### `styles/utilities.css`
Helper classes (margin, padding, flex, `sr-only`).

### `styles/fonts.css`
Google Fonts imports: Roboto Bold, Open Sans Regular.

### `styles/banner.css`
Banner section with fluid typography and gradient background.

### `styles/border-effect.css`
Animated rotating conic-gradient border effect.

---

## JavaScript

### `js/clock.js`
The kinetic grid clock engine (~300 lines). Reads config from `localStorage`, drives all 84 mini-clocks at 60fps via `requestAnimationFrame`.

**Modes:**
- **Clock** — displays HH:MM with configurable UTC offset
- **Countdown** — displays MM:SS, adds `body.countdown-zero` class when time expires

**30-second cycle:**
- 0–2s: ease from time display → animated pattern
- 2–23s: 4 blended kinetic patterns (radial wave, linear, sinusoidal, spiral)
- 23–25s: ease back to time display
- 25–30s: static time (re-renders once per second)

**Config keys (localStorage):** `clk_mode`, `clk_hours`, `clk_countdown_time`, `clk_countdown_end`

### `js/main.js`
Entry point. Initialises `FaviconAnimator` on `DOMContentLoaded`.

### `js/favicon-animator.js`
Draws a progressive square outline on a 32×32 canvas and pushes frames to `favicon.href` on button hover.

---

## File Relationships

```
index.html
├── styles/colors.css    Design system tokens
└── styles/clock.css     Clock layout + animation
    └── js/clock.js      Clock engine (defer)

clock-controls.html      Self-contained (inline styles + script)
    └── localStorage     Shared with clock.js
```

---

## Assets

| File | Purpose |
|---|---|
| `favicon.ico` | Default favicon (replaced at runtime by favicon-animator.js) |
| `assets/eruditorum.webp` | Preview image |
| `CNAME` | GitHub Pages custom domain |
