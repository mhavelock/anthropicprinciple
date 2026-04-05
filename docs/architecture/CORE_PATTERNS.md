# Core Patterns — anthropicprinciple.ai

The compact "do not break" reference. Read this before any significant code change. These are the patterns most likely to regress and the hardest to diagnose when they do.

Not a full architecture reference — that's `ARCHITECTURE.md`. This is the source of truth that fits in a prompt prefix.

---

## SOURCE OF TRUTH

### Global Constraints

Stated as rules. Each one is absolute — no exceptions without a new ADR.

| # | Never | Always | Why in one line |
|---|-------|--------|----------------|
| **G1** | Hard-code colour or spacing values in CSS | Use CSS custom properties from `colors.css` | One change to a token fixes everywhere; hardcoded values diverge silently |
| **G2** | Use `max-width` breakpoints | Mobile-first `min-width` only | max-width creates overrides; min-width layers cleanly |
| **G3** | Use `setInterval` for animation | `requestAnimationFrame` with timestamp throttle | setInterval fires when tab is hidden; rAF is suppressed by the browser |
| **G4** | Let rAF loops run when tab is hidden | `visibilitychange` listener — pause on hidden, resume on visible | Background tab burns CPU and allocates canvas work for zero visible benefit |
| **G5** | Animate `width`, `height`, `top`, `left` | `transform` and `opacity` only | Only transform/opacity bypass layout and paint — everything else causes reflow |
| **G6** | Allocate arrays or objects inside the rAF hot path | Pre-allocate at module init; mutate in place | Per-frame allocation causes GC pauses that drop frames and create jank |
| **G7** | Write `style.transform` if the angle hasn't changed | Check `_lastAngles` cache first; skip the write if equal | Unnecessary style mutations cause compositor invalidation even when the visual result is the same |
| **G8** | Remove `will-change: transform` from `.hand` | Keep it — it promotes hands to GPU compositor layers | Without it, transform updates flow through the main thread layout pipeline |
| **G9** | Remove `contain: layout style paint` from `.mc` | Keep it — it scopes style recalculation to each cell | Without it, a transform on one hand can cascade a recalculation across the full document |
| **G10** | Use `!important` in CSS | Find a lower-specificity solution | `!important` is a specificity debt that compounds |
| **G11** | Use inline styles (`style` attribute) | CSS classes and custom properties only | Inline styles override the cascade, skip the design token system, and are invisible to tooling |
| **G12** | Use raw localStorage values directly in JS logic | Always sanitise: parse integer, clamp range, or regex-validate | Corrupted or stale localStorage can silently break UI state |
| **G13** | Modify timing values or digit logic in `clock.js` | Performance optimisation only | The 30-second cycle and digit shapes are the product — they must never drift |

---

### Performance Floor

Minimum standards that all new code must meet.

| Floor | Applies to | Standard |
|-------|-----------|----------|
| **rAF throttle** | Any new animation loop | Timestamp comparison inside rAF — never fire frame work on every rAF callback |
| **visibilitychange** | Any new rAF loop | Must pause when `document.hidden === true`, resume on visible |
| **Pre-allocation** | Any new buffer or array used in the hot path | Allocate once at module init; never inside the loop body |
| **Transform-only animation** | Any new animated element | `transform` and `opacity` only — no layout-triggering properties |
| **Custom properties** | Any new colour, spacing, or timing value in CSS | Defined in `colors.css` (or the relevant namespace file) first, then referenced |
| **localStorage sanitisation** | Any new localStorage read in JS | Validate type, parse, and clamp before use |
| **W3C validation** | Any HTML change | `npx html-validate` must pass with no errors or warnings |

---

### The "Why" — History Behind the Constraints

The constraints above are not arbitrary. Each one was earned.

---

**G3 — rAF not setInterval**
`setInterval` fires at wall-clock time regardless of tab visibility. When the tab is hidden, the browser still runs the callback on every tick — burning CPU, allocating memory, and running canvas operations for zero visible output. `requestAnimationFrame` is suppressed by the browser when the tab is inactive. Combined with a `visibilitychange` listener that explicitly cancels the rAF handle, this completely eliminates background CPU usage.

**G4 — visibilitychange pause**
`requestAnimationFrame` alone is not enough. The browser throttles rAF callbacks in hidden tabs but may not suppress them entirely in all environments (e.g. background tabs in some browsers can still fire at 1fps). The explicit `visibilitychange` cancel + restart pattern guarantees zero background execution at the application level.

**G5 — Transform and opacity only**
`width`, `height`, `margin`, `top`, `left` — any property that affects box size or position — triggers a full browser layout pass on every frame. Layout is expensive: the browser recalculates positions for every element in the affected subtree. `transform` and `opacity` are handled entirely by the compositor thread after layout — they never re-trigger layout. For 168 hand elements animating simultaneously, this difference is substantial.

**G6 — Pre-allocated buffers**
The original `clock.js` created temporary `[angle, spread]` arrays inline for each of 84 cells on every frame. During the ease windows (2 seconds each, 60fps), this was ~84 array allocations per frame × 60fps = ~5,040 temporary objects per second flowing through GC. Pre-allocating `_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp` as fixed-length arrays at module init and mutating them in place reduces garbage collection pressure to near zero.

**G7 — _lastAngles cache**
Even when a clock hand isn't moving (e.g. during the static display phase), the rAF loop still runs at 1fps. Without the cache, every frame would write `style.transform` for all 168 hands even if nothing changed. Each write marks that element as needing a compositor update. The `Float64Array` cache comparison (rounded to 2 decimal places) skips the write when the value hasn't changed, reducing compositor work during static phases.

**G8 / G9 — will-change + contain**
`will-change: transform` tells the browser before animation starts that this element will be transformed, so it can promote it to its own compositor layer at paint time. Without it, the browser makes this decision lazily — sometimes mid-animation — causing a repaint. `contain: layout style paint` on the parent `.mc` cell creates a containment boundary: the browser knows that nothing outside the cell is affected by changes inside it. Together they give the browser enough information to do all transform updates on the compositor thread with zero main-thread involvement.

**G12 — localStorage sanitisation**
`localStorage` values are strings and can be: stale from a previous code version, set to an unexpected value by user manipulation, or corrupted. `clk_hours` must be an integer between -12 and 14; `clk_countdown_time` must match `MM:SS` format. Before these values reach any logic, they're validated and clamped. Without sanitisation, a stale `NaN` from a previous format change can silently break the clock display.

---

## Detailed Pattern Reference

### Pattern 1 — rAF with timestamp throttle

```javascript
// CORRECT — timestamp comparison before frame work
const MIN_INTERVAL = 33; // ~30fps
let lastFrame = 0;

function tick(now) {
  rafHandle = requestAnimationFrame(tick);
  if (now - lastFrame < MIN_INTERVAL) return;
  lastFrame = now;
  // do frame work
}

// WRONG — executes work on every rAF callback (~60fps with no throttle)
function tick() {
  requestAnimationFrame(tick);
  doExpensiveWork();
}
```

**Files:** `js/clock.js`, `js/favicon-animator.js`
**Regression signal:** CPU usage spikes when patterns are running; frame rate too high for pattern-phase work

---

### Pattern 2 — visibilitychange pause + resume

```javascript
// CORRECT
let rafHandle;

function start() {
  rafHandle = requestAnimationFrame(tick);
}

function stop() {
  cancelAnimationFrame(rafHandle);
  rafHandle = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});

// WRONG — rAF may still fire in some browsers when tab is hidden
function tick() {
  requestAnimationFrame(tick);
  // no visibilitychange guard
}
```

**Files:** `js/clock.js`, `js/favicon-animator.js`
**Regression signal:** Background CPU burn visible in Activity Monitor when tab is inactive

---

### Pattern 3 — Pre-allocated buffers, mutated in place

```javascript
// CORRECT — allocate once at module init
const _buf = Array.from({ length: 84 }, () => [0, 0]);

function tick() {
  for (let i = 0; i < 84; i++) {
    _buf[i][0] = computeAngle(i);
    _buf[i][1] = computeSpread(i);
  }
  apply(_buf);
}

// WRONG — allocates 84+ arrays per frame
function tick() {
  const buf = cells.map(cell => [computeAngle(cell), computeSpread(cell)]);
  apply(buf);
}
```

**File:** `js/clock.js`
**Regression signal:** GC pauses visible as micro-jank; heap size climbs during animation

---

### Pattern 4 — Float64Array cache comparison before DOM write

```javascript
// CORRECT — skip write if angle unchanged
const _lastAngles = new Float64Array(168);

function apply(buf) {
  for (let i = 0; i < 84; i++) {
    const a1 = Math.round(buf[i][0] * 100) / 100;
    const a2 = Math.round(buf[i][1] * 100) / 100;
    if (a1 !== _lastAngles[i * 2]) {
      hands[i].h1.style.transform = `rotate(${a1}deg)`;
      _lastAngles[i * 2] = a1;
    }
    if (a2 !== _lastAngles[i * 2 + 1]) {
      hands[i].h2.style.transform = `rotate(${a2}deg)`;
      _lastAngles[i * 2 + 1] = a2;
    }
  }
}

// WRONG — writes style.transform on every frame regardless of change
function apply(buf) {
  for (let i = 0; i < 84; i++) {
    hands[i].h1.style.transform = `rotate(${buf[i][0]}deg)`;
    hands[i].h2.style.transform = `rotate(${buf[i][1]}deg)`;
  }
}
```

**File:** `js/clock.js`
**Regression signal:** Compositor invalidation on every frame even during static display

---

### Pattern 5 — localStorage sanitisation

```javascript
// CORRECT — parse and validate before use
function loadConfig() {
  const raw = localStorage.getItem('clk_hours');
  const hours = parseInt(raw, 10);
  return isNaN(hours) ? 0 : Math.max(-12, Math.min(14, hours));
}

// WRONG — raw string used directly
function loadConfig() {
  return localStorage.getItem('clk_hours'); // could be null, NaN, or stale format
}
```

**File:** `js/controls.js`, `js/clock.js`
**Regression signal:** Clock displays wrong time silently; countdown never starts; console errors on invalid date math

---

### Pattern 6 — CSS custom properties, never hardcoded values

```css
/* CORRECT */
.card {
  background-color: var(--color-bg-alt);
  color: var(--color-text);
  padding: var(--space-md);
}

/* WRONG — hardcoded values invisible to design token system */
.card {
  background-color: #ebeef0;
  color: #1d1f24;
  padding: 1rem;
}
```

**File:** All stylesheets
**Regression signal:** Dark mode fails to apply; colour inconsistencies appear on update; spacing inconsistencies across breakpoints

---

## Quick Regression Checklist

Run before committing any change to `js/` or `styles/`:

- [ ] No `setInterval` in any new animation code — `requestAnimationFrame` with throttle
- [ ] `visibilitychange` listener present on any new rAF loop
- [ ] No per-frame array/object allocation — pre-allocated at module init
- [ ] `_lastAngles` cache check before any new `style.transform` write
- [ ] New CSS values use `--custom-properties` — no hardcoded colours or spacing
- [ ] No `max-width` breakpoints — mobile-first `min-width` only
- [ ] No inline `style` attribute in HTML
- [ ] No `!important` in CSS
- [ ] `localStorage` reads sanitised before use
- [ ] `npx html-validate` passes on any HTML change
- [ ] `will-change: transform` still on `.hand` in `clock.css`
- [ ] `contain: layout style paint` still on `.mc` in `clock.css`
- [ ] `clock.js` timing constants and digit tables unchanged
