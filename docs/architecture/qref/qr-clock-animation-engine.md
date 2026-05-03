# qr-clock-animation-engine: Why `clock.js` and `clock.css` are perf-only

> **The clock animation engine has six invariants that together hold Lighthouse at 100/100. Breaking any one regresses CPU, GC, or paint cost in ways that are easy to miss in dev and visible on a low-end mobile in production. This qref documents the invariants and the failure case that produced them.**

---

## Symptom

You make a "small" change to `clock.js` or `clock.css` — adding a new visual flourish, refactoring `apply()`, replacing a `_buf*` array with a literal `[a, b]`, dropping `will-change`, adding a `transition` to `.hand` — and one or more of:

- Lighthouse drops from 100 to 80–90 on Mobile.
- Chrome DevTools Performance panel shows long Recalculate Style frames during the pattern phase.
- Memory profile shows a saw-tooth GC pattern at 60 fps (every blend window allocates and discards arrays).
- The animation visibly stutters on iPhone SE / older Androids during pattern → time crossfade.
- Background tabs continue burning battery — `visibilitychange` no longer pauses the loop.

There is no functional bug. The clock still tells the time. The damage is invisible on a fast desktop and severe on the devices the site is most often viewed on.

---

## Root cause

84 mini-clocks × 2 hands = **168 elements rotated every frame**. The naive implementation allocates and recalculates more per frame than a static page does in a session:

- A literal `[a, b]` returned per cell per frame = **168 array allocations / frame** during 60 fps blend windows = ~10 080 allocations / second, all garbage.
- `style.transform = 'rotate(${a}deg)'` with floating-point precision = a unique string per cell per frame = unique cache keys, no internalisation, GC pressure.
- `.hand` without `will-change: transform` = main-thread paint on every rotation.
- `.mc` without `contain` = the browser must consider that one rotation could affect document layout, so style invalidation cascades up.
- `clockAngles()` returning a new outer array per call = `.map()` allocations on top of inner-array allocations.

Compounding: the engine has four phases (reverse ease, pattern, forward ease, static) and naïve code recomputes everything at the highest frame rate the rAF loop fires. The pattern phase is trig-heavy (`Math.atan2`, `Math.sin`, `Math.sqrt` per cell per frame); at 60 fps it dominates the main thread.

The fix isn't one optimisation. It's six interlocking invariants that have to stay aligned.

---

## Worked example — the c35388a perf commit

Commit [`c35388a`](https://github.com/mhavelock/anthropicprinciple/commit/c35388a) ("perf: deep-reduce main-thread and GC overhead for clock animation") rewrote the engine after a profiling session showed:

> 252+ array allocations per frame during 2-second blend windows  
> Full-document style invalidation on every hand rotation  
> Sub-hundredth-degree precision creating unique style strings the eye cannot see

Before:

```js
// Naive — three allocations per cell per frame, plus .map outer wrapper
function patternAngles(t, pidx) {
  return Array.from({length: N}, (_, i) => {
    const [r, c] = [...];
    return clockAngles(/* ... */);  // returns fresh [a, b] each call
  });
}

function blendedPatternAngles(t, pos) {
  const from = patternAngles(t, pidx);
  const to   = patternAngles(t, pidx + 1);
  return from.map((pair, i) => {
    return [lerpA(pair[0], to[i][0], p), lerpA(pair[1], to[i][1], p)];
  });
}

function apply(angles) {
  for (let i = 0; i < N; i++) {
    hands[i].h1.style.transform = `rotate(${angles[i][0]}deg)`;  // unconditional
    hands[i].h2.style.transform = `rotate(${angles[i][1]}deg)`;
  }
}
```

```css
/* Naive — no compositor hint, no containment */
.hand { transform-origin: bottom center; background: var(--clk-hand); }
.mc   { aspect-ratio: 1; position: relative; }
```

Effect during the 2-second pattern → time blend:

- 60 fps × (84 outer + 84 from + 84 to + 84 lerped) = **20 160 array allocations / s**.
- 60 fps × 168 hands × 2 transform writes = **20 160 style writes / s**, every one cascading recalc through the document.
- All 168 hands rendered on the main thread.

After (the current code in `js/clock.js` and `styles/clock.css`):

```js
// Pre-allocated buffers — six total, each Array of N 2-element arrays
const _bufOut    = Array.from({length: N}, () => [0, 0]);
const _bufFrom   = Array.from({length: N}, () => [0, 0]);
const _bufTo     = Array.from({length: N}, () => [0, 0]);
const _bufInterp = Array.from({length: N}, () => [0, 0]);
const _bufTime   = Array.from({length: N}, () => [0, 0]);

// Inlined — writes into buf[i] in place; no clockAngles() temporary
function patternAngles(t, pidx, buf) {
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // ... compute base, spread ...
      buf[i][0] = spread ? base - spread / 2 : base;
      buf[i][1] = spread ? base + spread / 2 : base + 180;
      i++;
    }
  }
  return buf;
}

// Skip-DOM-write cache; round to 2dp
const _lastAngles = new Float64Array(N * 2).fill(NaN);
function apply(angles) {
  for (let i = 0; i < N; i++) {
    const a1 = Math.round(angles[i][0] * 100) / 100;
    const a2 = Math.round(angles[i][1] * 100) / 100;
    const j = i * 2;
    if (a1 !== _lastAngles[j]) {
      _lastAngles[j] = a1;
      hands[i].h1.style.transform = `rotate(${a1}deg)`;
    }
    if (a2 !== _lastAngles[j + 1]) {
      _lastAngles[j + 1] = a2;
      hands[i].h2.style.transform = `rotate(${a2}deg)`;
    }
  }
}
```

```css
/* Compositor hints */
.hand {
  /* ... */
  will-change: transform;   /* GPU layer per hand → main thread skipped */
}
.mc {
  /* ... */
  contain: layout style paint;  /* style writes scoped to this cell */
}
```

Result: zero per-frame allocations during steady-state, ~30 fps trig-heavy phase (not 60), DOM writes only on actual change, and rotations applied by the compositor thread.

---

## Remedy — the six invariants

### 1. Never return a fresh array from a per-frame function

Functions called from `tick()` (`patternAngles`, `timeAngles`, `blendedPatternAngles`) take a buffer parameter and write in place. They return the same buffer. **Do not** `return [a, b]`, `return arr.map(...)`, `return Array.from(...)` from these paths.

### 2. Keep `_lastAngles` as the source of truth for hand state

If you want to know what angle a hand currently has, read `_lastAngles[i*2]` / `_lastAngles[i*2 + 1]`. **Do not** read `style.transform` back from the DOM — the cache is authoritative.

### 3. Round to 2 dp in `apply()`

Sub-hundredth-degree precision is invisible. Removing the `Math.round(... * 100) / 100` produces a unique transform string every frame for every hand and trashes the V8 string cache. Keep it.

### 4. `will-change: transform` on `.hand` is non-negotiable

It promotes each hand to its own compositor layer. Remove it and the rotations cost a main-thread repaint each. **Adding hover transitions on `.hand` in normal state will fight the compositor optimisation** — if you must add a hover state, scope it to a wrapper class on a parent element (e.g. `.is-active .hand`) and keep `transform` the only animated property.

### 5. `contain: layout style paint` on `.mc` is non-negotiable

It scopes style invalidation to the cell. Removing it lets a `transform` write on one hand invalidate styles across the whole document.

### 6. Phase throttling: 30 fps for pattern, 60 fps for ease, 1 fps for static

The `tick()` loop in `clock.js` enforces this:

```js
const PATTERN_FRAME_MS = 33;            // ~30 fps for the trig-heavy phase
if (now - lastFrame < PATTERN_FRAME_MS) return;  // pattern phase only
```

And:

```js
} else {
  // Static time display — re-render once per second only
  const sec = Math.floor(wallNow / 1000);
  if (sec !== lastSec) { lastSec = sec; apply(timeAngles()); }
}
```

**Do not** remove either gate. The eye cannot tell 30 fps from 60 fps for a slowly rotating spread. A static "07:23" needs to be drawn once per minute, not 60 times per second.

### Bonus invariant — `visibilitychange` pause

Both `clock.js` and `js/favicon-animator.js` listen for `visibilitychange` and `cancelAnimationFrame` when hidden. Without this, a backgrounded tab continues running the rAF loop on most browsers (rate-limited but not paused), and the favicon animator continues calling `canvas.toDataURL()` on every tick. Always include the listener when adding or refactoring rAF loops in this project.

---

## Why "performance only, never structural"

`CLAUDE.md` marks `js/clock.js` and `styles/clock.css` as protected. The rule is: edit them only to make them faster or to fix a bug — never to change visual behaviour, the 30-second cycle, the digit-angle tables, the 4-pattern sequence, or the colon layout.

The reason is in this qref: the engine's correctness and its performance are coupled. A "tidying" refactor that re-introduces per-frame allocations isn't tidying — it's a perf regression dressed as a clean-code improvement. If a structural change *is* needed (new pattern, different cycle length, different grid), make it deliberately, with profiling before and after, and update this qref + the relevant ADRs in the same commit.

---

## See also

- `DECISIONS.md` — **ADR-003** (rAF + visibilitychange), **ADR-004** (pre-allocated buffers), **ADR-005** (Float64Array cache), **ADR-006** (will-change + contain).
- `BREAKTHROUGHS.md` — **B-01** (eliminating per-frame allocations), **B-02** (Float64Array cache diagnosis), **B-03** (compositor promotion).
- Commit `c35388a` — the rewrite that introduced these invariants.
- `CLAUDE.md` § Protected files — the canonical list of files where structural changes need explicit sign-off.
- `tasklist.md` § Performance Optimisation — PERF1–PERF8, the work that implemented these invariants.
