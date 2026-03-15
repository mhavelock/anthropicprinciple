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
