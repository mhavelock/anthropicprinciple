# Improvements Log — anthropicprinciple.ai

Technical improvements made to the project. Each section describes what changed and the reasoning.

---

## Standards and CSS Architecture

**CLAUDE.md** rewritten as a comprehensive project reference covering brand guidelines, CSS architecture, JS module descriptions, performance constraints, and naming conventions.

**CSS brand tokens updated** throughout `colors.css`: Arial and Verdana are declared as system font stacks (`--font-family-body`, `--font-family-heading`) with no external font requests. The brand palette (`#1d1f24` / `#a1b1ca`) is expressed as CSS custom properties used consistently across all button, text, border, and input token groups.

**Typography units standardised**: all `--font-size-*` values use `em` so they scale with inherited context. All `--space-*` values use `rem` for layout distances that remain consistent regardless of local font-size changes. The `html` element font-size is never overridden — the browser default of 16px is preserved for user accessibility.

**Mobile-first refactor** applied across all stylesheets. Base styles target the smallest screen. All responsive breakpoints use `min-width` only — no `max-width` breakpoints exist anywhere in the codebase.

**Link colour** inherits from text colour (`color: inherit`) in both light and dark mode, so links read as body text unless explicitly styled. Hover and focus-visible states are defined; no visited state is set anywhere.

**Component naming convention** applied throughout: `.component-element` structure for component parts, `.mod-*` for variant modifiers, `.is-*` for toggled state classes, `.u-*` prefix for utility classes.

**Hover, focus-visible, and active states** defined on all interactive elements. No visited state. Focus rings use `outline: 2px solid var(--color-focus)` with `outline-offset: 2px`.

**controls.css extracted** from inline styles into an external stylesheet. A dedicated `--ctrl-*` token namespace isolates the panel's fixed dark theme from the global design token system. No `--color-*` tokens are used on the controls page.

**Tooltip, alert, and modal components** added to `components.css`. ARIA usage patterns documented in CSS comments: tooltip visible on `:focus-visible` for keyboard users; alert uses `role="alert"`; modal requires `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trapping, Escape-key close, and backdrop-click close.

**Orientation landscape media query** added in `global.css` and `clock.css` to handle small devices rotated to landscape, reducing vertical padding to recover viewport height.

---

## HTML

**index.html** updated with: semantic `<main aria-label="Kinetic clock">` wrapper, Open Graph meta tags (`og:type`, `og:url`, `og:title`, `og:description`), canonical `<link>`, `theme-color` meta, and a JSON-LD `WebApplication` schema block. All favicons and web manifest references are present.

**clock-controls.html** updated with: all inline styles removed and replaced with `controls.css` classes; proper `<label for>` associations on all inputs; `aria-labelledby` on each `<section>`; `role="status" aria-live="polite"` on the status output element; `.is-hidden` / `.is-active` class conventions for section and label state toggling.

---

## Images

All `<img>` elements carry `alt`, `width`, and `height` attributes. Where images are used, `srcset` provides 250w and 500w resolution variants; the `sizes` attribute reflects layout breakpoints. `loading="lazy"` is set on below-fold images and `loading="eager"` on the first visible image to avoid blocking the initial render.

---

## JavaScript — Performance

**favicon-animator.js**: replaced `setInterval` with a `requestAnimationFrame` loop throttled to approximately 10fps using a timestamp comparison (100ms minimum interval). A `visibilitychange` listener pauses the loop when the tab is hidden, reducing `canvas.toDataURL()` calls from approximately 16 per second (at 60fps) to approximately 10 per second, suspended entirely when the tab is backgrounded.

**clock.js — rAF optimisations**:

- Pattern phase trig calculations (`atan2`, `sqrt`, `sin` per cell) are throttled to approximately 30fps (33ms minimum frame interval). The ease-in and ease-out windows (2s each) run at full 60fps since they do not recompute pattern trig.
- `visibilitychange` listener cancels `requestAnimationFrame` when the tab is backgrounded and restarts it on restore.
- `clockAngles()` inlined into `patternAngles()` as a direct buffer write — eliminates 84 temporary `[a, b]` array allocations per call.
- Pre-allocated reusable buffers (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) — no per-frame heap allocations occur during the blend or ease windows.
- `Float64Array` angle cache (`_lastAngles`) in `apply()` — DOM write is skipped if angle is unchanged from the previous frame.
- Angles rounded to 2 decimal places — reduces unique template literal string allocations per frame.
- `timeAngles()` column indexing simplified — eliminates a `Math.floor` call per cell per frame.

**clock.css — compositor optimisations**:

- `will-change: transform` on `.hand` — promotes all 168 hand elements to GPU compositor layers so JS-driven `rotate()` updates are applied by the GPU thread rather than the main thread.
- `contain: layout style paint` on `.mc` — scopes style recalculation to each individual cell. A transform write on one hand cannot trigger a style or layout recalculation across the full document tree.

**logger.js**: entries buffered in memory (`_buf`); `sessionStorage` flush deferred to `beforeunload`. Removes the previous pattern of synchronous read, JSON parse, append, and write on every `log()` call.

---

## Accessibility

Keyboard navigation verified across all interactive elements: Tab order, Enter and Space activation on buttons, Escape to close modals.

`focus-visible` rings on all interactive elements (links, buttons, inputs, radio labels, modal close button, nav links).

ARIA landmarks and labelling on clock-controls.html: `<nav aria-label>`, `<section aria-labelledby>`, `role="status" aria-live="polite"` on the status element.

`prefers-reduced-motion` blocks in `global.css`, `components.css`, and `controls.css` collapse all animation and transition durations to 0.01ms for users who have requested reduced motion.

`.u-sr-only` utility in `utilities.css` provides a visually hidden class that reveals on `:focus-visible`, used on skip-to-content links.

---

## Assets and Structure

`assets/` subdirectories scaffolded: `audio/`, `bgs/`, `components/`, `graphics/`, `icons/`, `photos/`. SVG icons placed in `assets/icons/`.

`context/summaries/` directory created per project specification for task lists and handoff summaries.

`docs/` populated with architecture reference, file manifest, improvements log, and refactoring summary. `docs/digit-reference.md` documents the hand-angle pair notation used in the digit tables in clock.js.

---

## Code Review — 2026-03-20 (Iteration 1)

Full review against CLAUDE.md conventions, ARCHITECTURE.md, and best-practices docs. Gemini MCP consulted for independent second opinion.

**Deleted**
- `styles/critical.css` — legacy placeholder, never loaded by any HTML page. Dead code confirmed.

**JS — Clean Code**
- `main.js`: `var` → `const/let` (CLAUDE.md convention). rAF throttle added to `resize` listener (`rafPending` flag) — prevents layout thrashing during continuous scroll/resize on mobile. Removed stale `DOMContentLoaded` wrapper (redundant with `defer`). Removed duplicate `FaviconAnimator.init()` call (favicon-animator.js already self-inits at load time).
- `main.js` added to `clock-controls.html` — viewport orientation fix now applies consistently on both pages.

**JS — Security / Robustness**
- `controls.js`: localStorage values are now sanitized before use. `clk_hours` is parsed as integer and clamped to valid range (-12–14); `clk_countdown_time` is validated against `/^\d{1,2}:\d{2}$/` regex before applying to the input. Prevents stale or corrupted localStorage from breaking the UI.
- `controls.js`: debounce helper added (250ms) for `hours` and `countdown-time` inputs — prevents excessive localStorage writes on rapid keystrokes or arrow-key stepping.

**CSS — Convention Compliance**
- `home.css`: hardcoded hex palette (`#292b31`, `#727786`, `#5c6b94`, `#4d5f8c`) extracted to `--side-*` CSS custom properties at the top of the file. Satisfies the "all colours via CSS custom properties" rule.
- `home.css`: double-semicolon typo (`padding: 0.25rem 0.66rem;;`) fixed.
- `banner.css`: hardcoded `#ffffff` on `.banner-title` extracted to `--banner-title-color` CSS custom property.
- `clock.css`: explanatory comment added for `--vw`/`--vh` orientation-change fix.

**Items reviewed and left unchanged**
- `will-change: transform` on `.hand` — deliberate GPU compositor optimisation per CLAUDE.md performance notes. Not removed.
- `max-height: 500px` orientation query in `clock.css` — CLAUDE.md prohibits `max-width`, not `max-height`. Valid use.
- `--ctrl-*` tokens in `controls.css` — intentionally isolated from global token system (controls page is self-contained dark theme).
- `play.css` box-sizing reset — needed; play.html does not load global.css.
- `home.css` aside font-family (Gill Sans) — distinct design element, intentional deviation.

**Remaining issues (not fixed — see iteration 2 list)**
- WCAG contrast: `.side p` text `#727786` on background `#292b31` = ~2.85:1, fails AA (4.5:1 required).
- `home.css` aside positioning: `right: calc(-50vw + 1.25rem)` and `top: -17rem` are magic-number values fragile to viewport changes.
- `home.css` `.side p` font-family (Gill Sans) deviates from project's two-font system (Verdana/Arial).

---

## Code Review — 2026-03-15

Full code review conducted against best-practices docs. Overall verdict: A/A+ across all categories. Specific fixes applied:

**Security**
- Added `noreferrer` to all `rel="noopener"` attributes on `target="_blank"` links in `index.html` — prevents Referer header leakage to external domains (Humans Since 1982, Bluesky, SoundCloud, Claude).

**HTML / SEO**
- Meta description on `index.html` expanded from 19 characters ("Anthropic Principles") to a descriptive 130-character summary for search engine snippets.
- `og:image` meta tag added to `index.html` pointing to `web-app-manifest-512x512.png`.
- `og:description` updated to match the new meta description.
- `<meta name="theme-color">` added to `clock-controls.html` (`#0a0d14` matches the dark panel theme).
- `<link rel="canonical">` added to `clock-controls.html`.

**Separation of Concerns**
- Inline `<script>` block removed from `clock-controls.html` and extracted to `js/controls.js` (deferred). Eliminates the only violation of the "no inline scripts" standard across the codebase. Behaviour is identical; the script now loads non-blocking with `defer`.

**Documentation**
- `docs/ARCHITECTURE.md` updated: page/script dependency diagram reflects the five stylesheets now loaded by `index.html` and the new `js/controls.js`; clock-page CSS architecture section corrected; controls-page description updated.
- `docs/summaries/REFACTORING_SUMMARY.md` JS summary table updated to include `controls.js`.

**Items verified as correct (no action needed)**
- Both `clock-controls.html` and `play.html` already carry `lang="en"` — agent false-positive.
- `critical.css` is referenced only in docs/README (not in any HTML page) — no 404 risk; kept as documentation placeholder.
- Hard-coded colours in `home.css` aside section are intentional — the aside has a fixed dark presentation independent of the design token system.
- Inline IIFE script in `clock-controls.html` was the sole exception to separation-of-concerns; now resolved.
