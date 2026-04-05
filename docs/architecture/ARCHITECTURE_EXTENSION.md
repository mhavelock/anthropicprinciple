# ARCHITECTURE_EXTENSION.md — anthropicprinciple.ai

Operational and reference detail. This is the secondary document — the primary structural decisions and data flows live in `ARCHITECTURE.md`.

Load this when: doing a code audit, reviewing conventions, checking design tokens, diagnosing a known pitfall, or starting a new development environment.

---

## Technical Coding Standards

### CSS Conventions

**File per concern.** `colors.css` for tokens, `global.css` for base resets, `components.css` for reusable components, page-specific files for page-specific overrides, `utilities.css` last. Never mix concerns.

**Component naming pattern:**
```css
.card               /* component root */
.card-title         /* component child */
.mod-featured       /* modifier */
.is-open            /* JS-applied state */
.js-toggle          /* JS selector only — never styled */
.u-sr-only          /* utility */
```

**Custom properties:**
All colours, spacing, transitions defined in `colors.css`. Clock namespace `--clk-*` in `clock.css`. Controls namespace `--ctrl-*` in `controls.css`. Referencing a token that doesn't exist in its expected file is a bug.

**Responsive:** Base styles target the smallest screen. `@media (min-width: ...)` adds complexity for larger screens. Never `max-width` for layout breakpoints. `max-height` is permitted for orientation queries.

**Focus styles:** `:focus-visible` only — never bare `:focus`. This ensures visible keyboard focus rings without showing them on click.

**Typography:** `rem` for spacing and layout distances. `em` for font sizes. `html`/`body` font-size never overridden — browser default (16px) preserved for accessibility.

---

### JS Conventions

**Module pattern (IIFE):** Every JS file is a self-contained IIFE that exposes a named object. No globals. No shared mutable state between files.

```javascript
// Standard module pattern
const ModuleName = (function () {
  // private state
  let _state = 0;

  // public API
  return {
    init() { /* ... */ },
    getValue() { return _state; }
  };
})();
```

**rAF throttle pattern:** All animation loops compare elapsed time before doing frame work.

```javascript
let lastFrame = 0;
const MIN_INTERVAL = 33; // ~30fps

function tick(now) {
  rafHandle = requestAnimationFrame(tick);
  if (now - lastFrame < MIN_INTERVAL) return;
  lastFrame = now;
  doFrameWork();
}
```

**visibilitychange pattern:** Every rAF loop must implement this.

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(rafHandle); rafHandle = null; }
  else { rafHandle = requestAnimationFrame(tick); }
});
```

---

## Known Pitfalls

### Clock.js — angle rounding
Angles are rounded to 2 decimal places before comparison and DOM write. Reducing rounding precision increases the number of unique `rotate(Xdeg)` string values — more strings means more allocations. Increasing precision means more DOM writes (values never match). 2dp is the calibrated balance.

### Clock.js — pattern crossfade timing
`blendedPatternAngles()` uses `lerpA()` (shortest-arc lerp) for angle interpolation. Standard linear interpolation fails at the 0°/360° boundary — hands would sweep 350° in the wrong direction. `lerpA` always takes the shorter arc. Never replace this with `lerp`.

### controls.js — countdown end time
The countdown end time (`clk_countdown_end`) is stored as an absolute Unix timestamp (ms), not a duration. `clock.js` computes the remaining time as `clk_countdown_end - Date.now()`. If the system clock changes, the countdown may jump. This is expected behaviour.

### home.css — aside positioning
`right: calc(-50vw + 1.25rem)` and `top: -17rem` are fragile magic numbers derived from the specific aside width and its offset from the content column. They work at current content proportions. If the grid or aside width changes, these values will need recalibration. See task S2 in `docs/plan/tasklist.md`.

### favicon-animator.js — `canvas.toDataURL()`
`canvas.toDataURL('image/png')` is called on every frame to write to `favicon.href`. This is a full raster encode on every tick. The 10fps throttle and `visibilitychange` pause keep this manageable, but it's an inherently expensive operation for an animation. If favicon animation causes performance issues in future, consider pre-rendering frames as data URIs.

---

## Design Token Reference

### Breakpoints (mobile-first, min-width only)

| Name | Value |
|------|-------|
| `sm` | 480px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1440px |

### Spacing Scale

| Token | Value | px |
|-------|-------|----|
| `--space-xs` | 0.25rem | 4px |
| `--space-sm` | 0.5rem | 8px |
| `--space-md` | 1rem | 16px |
| `--space-lg` | 1.5rem | 24px |
| `--space-xl` | 2rem | 32px |
| `--space-2xl` | 3rem | 48px |
| `--space-3xl` | 4rem | 64px |

### Colour Palette

| Token | Light mode | Dark mode |
|-------|-----------|-----------|
| `--color-bg` | `#f5f6f7` | `#0e0f12` |
| `--color-bg-alt` | `#ebeef0` | `#1a1c20` |
| `--color-text` | `#1d1f24` | `#a1b1ca` |
| `--color-text-muted` | `#555e64` | `#7a8896` |
| `--color-link` | `#1d1f24` | `#a1b1ca` |
| `--color-focus` | `#1d1f24` | `#a1b1ca` |

### Typography

| Role | Stack | Weight |
|------|-------|--------|
| Headings h1–h6 | `Verdana, Geneva, sans-serif` | bold |
| Body, paragraphs | `Arial, Helvetica, sans-serif` | normal |
| Monospace / code | `'Courier New', Courier, monospace` | normal |
| Aside attribution | `'Gill Sans', Calibri, 'Trebuchet MS', sans-serif` | normal (deliberate exception) |

---

## Logger Module (js/logger.js)

Development-only. Not needed in production — remove the `<script>` tag before deployment if log data collection is not desired.

```javascript
Logger.log('section', 'message', { optional: 'data' }); // buffered in memory
Logger.time('label');   // start named timer
Logger.timeEnd('label'); // stop timer, log elapsed ms
Logger.flush();          // write buffer to sessionStorage immediately
Logger.dump();           // print all entries to browser console
Logger.clear();          // empty buffer
```

Entries accumulate in `_buf` array in memory. No synchronous `sessionStorage` I/O on individual `log()` calls. On `beforeunload`, buffer is flushed to `sessionStorage['ap_dev_log']` and a summary is written to `localStorage['ap_dev_log_summary']`.

---

## Testing Reference

Manual testing is tracked in `CLAUDE.md §Test Programme`. No automated test suite. Testing is in-browser.

**Mat's Checklist (run after significant changes):**
- Clock animation runs — patterns cycle correctly, time resolves at correct interval
- Countdown mode: set timer, verify counts down, zero state pulses red
- `localStorage` persists across page reload and between pages
- Controls: all inputs save on change without requiring Save button
- Keyboard: Tab through all controls on controls page, Enter/Space activates Start
- Responsive: test at 320px, 480px, 768px, 1024px, 1440px
- Landscape: clock grid fits small-screen landscape (e.g. iPhone landscape)
- Dark mode: verified at OS system preference level

**Claude's Checklist (run before any commit):**
- HTML validates — `npx html-validate index.html clock-controls.html`
- All `<img>` have `alt`, `width`, `height`
- All `<input>` have `<label for="...">`
- No `!important` in CSS
- No inline styles
- No `max-width` layout breakpoints
- `box-sizing: border-box` in every reset
- `defer` on all `<script>` tags
- No console errors in browser devtools
- `prefers-color-scheme: dark` verified
- `prefers-reduced-motion: reduce` verified

---

## Common Commands

```bash
# Local dev server
npx live-server

# HTML validation
npx html-validate index.html clock-controls.html

# Show staged + unstaged diff before committing
git diff

# Show what would be committed
git diff --cached

# Stage specific files and commit
git add styles/colors.css styles/global.css
git commit -m "style(css): mobile-first refactor"
```
