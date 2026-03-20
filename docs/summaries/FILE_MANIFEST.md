# File Manifest — anthropicprinciple.ai

## Core HTML

**index.html** — Full-screen kinetic clock. Loads `styles/clock.css` as the sole stylesheet. Scripts `js/favicon-animator.js` and `js/clock.js` are both loaded with `defer`. Contains the pre-rendered 84 `.mc` cells (6 rows × 14 columns), Open Graph meta, canonical link, theme-color meta, and a JSON-LD `WebApplication` schema block.

**clock-controls.html** — Settings panel for configuring clock mode and countdown. Loads `styles/controls.css`. Scripts `js/main.js` and `js/controls.js` loaded with `defer`. `controls.js` handles form state restoration from localStorage (with validation and range clamping), section visibility toggling via `.is-hidden` / `.is-active` classes, debounced localStorage writes, and countdown end-time calculation on button click. The status element uses `role="status"` and `aria-live="polite"`. `robots` meta is set to `noindex`.

**play.html** — Additional page.

---

## Styles

**clock.css** — Self-contained stylesheet loaded exclusively by index.html. Includes its own `*` reset, all `--clk-*` design tokens (background, face, border, hand colour, zero glow), the 6×14 `display: grid` layout with fluid `min()` width, `.mc` cell with `contain: layout style paint`, `.hand` elements with `will-change: transform` and `transform-origin: bottom center`, and the `danger-pulse` / `body-pulse` keyframes for countdown-zero state. Also contains landscape orientation media query for small-screen layout.

**colors.css** — Design token source of truth for all non-clock pages. `:root` declares light mode defaults: surface colours (`--color-bg`, `--color-bg-alt`, `--color-bg-raised`), text colours, border colours, primary and secondary button colours, link colours, form input colours, focus ring colour, and accent colours. Font sizes use `em` (`--font-size-h1` through `--font-size-xs`). Spacing uses `rem` (`--space-xs` through `--space-3xl`). Also declares `--font-family-*`, `--border-*`, `--transition-*`, and `--ease-*` tokens. Dark mode overrides applied via `@media (prefers-color-scheme: dark)`. Manual overrides available via `[data-theme="light"]` and `[data-theme="dark"]` on `<html>`.

**fonts.css** — Font-family declarations only. Verdana (headings), Arial (body), Courier New (mono). All system fonts — no external font requests are made.

**global.css** — Box-model reset, base element defaults (`html`, `body`, `h1`–`h3`, `p`, `img`, `video`, `canvas`), link styles (`color: inherit`; hover and focus-visible states; no visited state), base `button` reset, `.btn` / `.btn-primary` / `.btn-secondary` component classes with 44px minimum touch targets, full form element styles for text inputs, textarea, select, and custom-styled checkbox and radio inputs using `appearance: none`. 12-column grid system (`.container`, `.row`, `.col-1` through `.col-12`) — mobile-first with `min-width` breakpoints at 480px and 768px. Orientation landscape media query for small devices. `prefers-reduced-motion` block that collapses all animation and transition durations.

**components.css** — Header (flex, border-bottom, focus-visible ring), `.logo` with responsive height breakpoints, `main` layout defaults for non-clock pages. Tooltip: `.tooltip` with `data-tip` attribute — CSS-only, visible on hover and `:focus-visible`. Alert: `.alert` with `.mod-info`, `.mod-success`, `.mod-warning`, `.mod-danger` modifiers using left-border colour coding. Modal: `.modal-backdrop`, `.modal`, `.modal-close`, `.modal-title`, `.modal-body` — ARIA usage (`role="dialog"`, `aria-modal`, `aria-labelledby`) and keyboard requirements (Tab focus trap, Escape close, backdrop click close) documented in comments. `.is-hidden` toggles display.

**controls.css** — Page-specific stylesheet for clock-controls.html. Fixed dark terminal theme using `--ctrl-*` custom property namespace — not system-preference responsive. Defines: `.panel`, `.panel-nav`, `.panel-nav-link`, `.panel-nav-id`, `.panel-title`, `.section-title`, `.ctrl-section`, `.ctrl-radio-label` (with `.is-active` state), `.ctrl-field`, `.ctrl-field-label`, text and number input overrides, `.ctrl-btn` (hover and active states), `.ctrl-note`, `.ctrl-status`. State class `.is-hidden` hides inactive sections. `prefers-reduced-motion` block disables transitions.

**utilities.css** — Single-purpose helper classes with `u-` prefix. Display utilities: `.u-flex`, `.u-flex-center`, `.u-flex-col`, `.u-block`, `.u-inline`, `.u-inline-flex`, `.u-hidden`. Spacing utilities: `.u-m-0`, `.u-p-0`, `.u-mt-auto`, `.u-ml-auto`, `.u-mr-auto`. Text utilities: `.u-text-center`, `.u-text-left`, `.u-text-right`, `.u-text-muted`, `.u-text-sm`, `.u-text-xs`. State classes: `.is-hidden`, `.is-visible`. Screen-reader utility: `.u-sr-only` (visually hidden via `clip` and 1px dimensions) with `:focus-visible` reveal for skip-to-content links.

**banner.css** — `.banner` container and `.banner-title` with `clamp()` fluid typography in `em`. Mobile-first breakpoints. `prefers-contrast` and `prefers-reduced-motion` blocks.

**border-effect.css** — `.border-effect` component with animated conic-gradient border. `prefers-reduced-motion` disables the rotation animation.

---

## JavaScript

**clock.js** — Kinetic grid engine. Reads configuration from localStorage via `loadConfig()` on initialisation and on `storage` events. Computes hand angles for clock mode (HH:MM with UTC offset) and countdown mode (MM:SS with zero state). Pre-allocated angle buffers (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) eliminate per-frame heap allocations. `Float64Array` angle cache in `apply()` skips DOM writes for unchanged values. Pattern trig phase throttled to ~30fps; ease phases run at 60fps; static display at 1fps. rAF loop pauses via `visibilitychange`.

**favicon-animator.js** — IIFE module (`FaviconAnimator`). Initialises on `DOMContentLoaded`. Creates an off-screen 32×32 canvas with a linear gradient stroke. rAF loop throttled to ~10fps draws a progressive square outline edge-by-edge each cycle, then writes the result to `favicon.href` via `canvas.toDataURL()`. Pauses when tab is hidden; resumes on visibility restore.

**logger.js** — Development logger. Buffered in memory (`_buf` array) — no storage I/O on `log()` calls. Flushes to `sessionStorage` (`ap_dev_log`) on `beforeunload`; writes a persistent summary to `localStorage` (`ap_dev_log_summary`). Self-tests localStorage and sessionStorage availability on init. Public API: `log(section, message, data)`, `time(name)`, `timeEnd(name)`, `flush()`, `dump()`, `clear()`.

**main.js** — Shared application utilities, loaded on all pages with `defer`. Sets `--vw` and `--vh` CSS custom properties from `window.innerWidth`/`Height` on load and on `resize` (rAF-throttled), fixing iOS Safari's failure to re-evaluate `dvh`/`dvw` units after orientation change.

---

## Assets

**assets/icons/** — SVG icons: `bluesky-icon.svg`, `claude-ai-icon.svg`, `soundcloud.svg`.

**assets/audio/, assets/bgs/, assets/components/, assets/graphics/, assets/photos/** — Directory structure scaffolded for future use; no files currently placed.

**Images** — Where used, `<img>` elements include `alt`, `width`, and `height` attributes. `srcset` provides 250w and 500w resolution variants; `sizes` attribute reflects layout breakpoints. `loading="lazy"` on below-fold images; `loading="eager"` on the first visible image.

---

## File Relationships

```
index.html
├── styles/clock.css          Clock tokens, grid, hand styles, keyframes
├── js/main.js                Viewport unit fix --vw/--vh (defer)
├── js/favicon-animator.js    Animated canvas favicon (defer)
└── js/clock.js               Clock engine — reads localStorage (defer)

clock-controls.html
├── styles/controls.css       Fixed dark panel styles
├── js/main.js                Viewport unit fix --vw/--vh (defer)
└── js/controls.js            Form state, debounced localStorage writes (defer)
    └── localStorage          Read by clock.js on load + storage event

Additional pages (non-clock)
├── styles/colors.css         Design tokens
├── styles/fonts.css          Font stacks
├── styles/global.css         Base elements + 12-col grid
├── styles/components.css     UI components
├── styles/[page].css         Page-specific overrides
└── styles/utilities.css      Helper classes
```
