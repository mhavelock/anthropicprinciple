# Codebase Audit — Reference

Practical guidance for running effective audits on this codebase. Covers exclusion lists, chunking strategy, and guidelines. The approach models for structured thinking during audits live in `six-hats.md`.

---

## 1. Selective Context — The Exclusion List

These paths should not be loaded into AI context for audits. They are either binary, auto-generated, or irrelevant to code quality.

### Hard exclusions (never load)

```
.git/                           # version history — use git log/diff instead
assets/photos/                  # photos — binary files
assets/graphics/                # illustrations, SVG artwork — visual assets
*.ico, *.png                    # binary image files
site.webmanifest                # JSON manifest — rarely relevant to code audit
CNAME                           # single-line domain file
```

### Soft exclusions (load only if specifically relevant)

```
docs/plan/archive/              # historical session summaries
docs/architecture/.ai/memory/sprint-history.md  # completed sprint log
js/logger.js                    # dev utility, not application logic
```

---

## 2. Audit Chunks — Strategy A

Break the codebase into chunks that fit within a single context load. Each chunk should be auditable in isolation.

| Chunk | Files | Focus |
|-------|-------|-------|
| **A1 — HTML** | `index.html`, `clock-controls.html` | Semantics, accessibility, SEO, meta tags, script loading |
| **A2 — Core CSS** | `colors.css`, `fonts.css`, `global.css`, `utilities.css` | Token system, base styles, breakpoints, utility classes |
| **A3 — Feature CSS** | `clock.css`, `home.css`, `components.css` | Clock grid, compositor hints, component patterns |
| **A4 — Page CSS** | `controls.css`, `banner.css`, `border-effect.css` | Namespace isolation, page-specific patterns |
| **A5 — JS** | `clock.js`, `favicon-animator.js`, `controls.js` | rAF patterns, buffers, localStorage handling |
| **A6 — Docs** | `docs/architecture/ARCHITECTURE.md`, `SYSTEM.md`, `CORE_PATTERNS.md` | Accuracy of docs vs actual code |

---

## 3. Audit Guidelines (G1–G13)

Check each chunk against the global constraints. For each constraint, verdict: ✅ Pass / ⚠️ Warning / ❌ Fail.

| # | Constraint | What to check |
|---|------------|---------------|
| G1 | No hardcoded colour/spacing values | Every colour and spacing value uses a CSS custom property |
| G2 | Mobile-first — min-width only | No `max-width` media queries for layout |
| G3 | rAF not setInterval for animation | No `setInterval` in `clock.js` or `favicon-animator.js` |
| G4 | rAF loops pause on visibilitychange | `visibilitychange` listener present on each loop |
| G5 | Transform and opacity only in animations | No layout-triggering property animations |
| G6 | No per-frame allocations | No `Array()`, `[]`, `{}` creation in the tick function body |
| G7 | Float64Array cache before DOM write | `_lastAngles` cache used in `apply()` |
| G8 | will-change: transform on .hand | Present in `clock.css` |
| G9 | contain: layout style paint on .mc | Present in `clock.css` |
| G10 | No !important | None in any stylesheet (exception: reduced-motion blocks only) |
| G11 | No inline styles | No `style` attribute in any HTML file |
| G12 | localStorage sanitised | Parse, clamp, validate before use in `controls.js` / `clock.js` |
| G13 | clock.js timing unchanged | 30-second cycle, digit tables, pattern logic unchanged from baseline |

---

## 4. Anti-Hallucination Rule

When auditing against this codebase, **always read the source file before making a claim about it**. Do not rely on memory of the file's contents from a previous session. The actual file is the source of truth — not the architecture documentation.

If a constraint says "X is done in Y" and the file doesn't contain X, the correct response is:
- "The docs say X but the file doesn't have it — this is a doc debt"
- NOT: "X is present" (hallucinated confirmation)
- NOT: "The docs are wrong and X was never implemented" (if unsure)

Read the file. Then audit.

---

## 5. Documentation Accuracy Audit

Run periodically to keep the architecture docs accurate as the code evolves.

Prompt pattern:
```
Read [file]. Then read docs/architecture/ARCHITECTURE.md §[relevant section].
Are there any discrepancies between the code and the documentation?
List divergences — do not invent ones that aren't there.
```

Files most likely to drift:
- `js/clock.js` vs `ARCHITECTURE.md §Clock Engine`
- `styles/clock.css` vs `CORE_PATTERNS.md` G8/G9
- `js/controls.js` vs `ARCHITECTURE.md §Data Flow — Controls → Clock`

---

## 6. Future Audit Plan

A planned execution schedule for running the Strategy A chunks, plus Gemini consulting prompts for issues specific to this project's JS, animation, and graphics architecture.

### Execution Schedule

| When to run | Chunk | Trigger |
|-------------|-------|---------|
| After any HTML change | A1 | `npx html-validate` passes; then chunk review |
| After any CSS change | A2 + relevant A3/A4 | Run affected chunk only |
| After any clock.js / favicon-animator.js change | A5 | Full JS chunk |
| After any significant feature work | A1–A5 | Full audit pass |
| After documentation sprint | A6 | Doc accuracy pass |
| Pre-release or pre-public-share | A1–A6 | Full audit |
| Quarterly (maintenance) | A1–A6 | Health check |

---

### Gemini Consulting Prompts — Project-Specific Issues

The following are ready-to-use Gemini Pro consulting prompts for the specific technical risks of this project. Use Pattern 1 (Architecture Audit) or Pattern 2 (Stuck in a Loop) from `GEMINI-CONSULTANCY.md` as the wrapper.

---

#### Audit A — rAF Architecture Review

**When to use:** After any change to `clock.js` or `favicon-animator.js`, or when performance anomalies appear.

```
CONSTRAINTS:
- G3: requestAnimationFrame only — no setInterval
- G4: visibilitychange pause/resume on every rAF loop
- G6: No per-frame array/object allocations
- G7: Float64Array cache (_lastAngles) checked before every style.transform write
- G8: will-change: transform on .hand
- G9: contain: layout style paint on .mc

CODE:
[Paste js/clock.js or the changed section]

QUESTION:
Audit this code against the 6 constraints above.
1. Is the rAF loop correctly throttled with a timestamp comparison?
2. Is there a visibilitychange listener that explicitly cancels and restarts the rAF handle?
3. Are there any object or array allocations inside the tick() function body?
4. Is the Float64Array cache used before every style.transform write?
5. Are will-change and contain present in the corresponding CSS?
Output: Confirmed solid / Potential drift / Regression to check
```

---

#### Audit B — Clock Digit Correctness

**When to use:** If digit rendering appears wrong, or after any change touching the hand-angle tables in `clock.js`.

```
CONTEXT:
The clock displays digits by positioning 84 analogue clock hands at specific angles.
Each digit uses a 3×6 grid of clock faces. The angle notation is:
H=horizontal, V=vertical, TL/TR/BL/BR=corner joins, I_D/I_U=interior both-down/both-up,
NE/SW/NW/SE=diagonals.

The digit tables are defined in docs/plan/discovery/digit-reference.md.
The implementation is in js/clock.js (the `digits` object or equivalent constant).

CODE:
[Paste the digits constant from clock.js]

REFERENCE:
[Paste the relevant digit tables from digit-reference.md]

QUESTION:
Compare the implementation against the reference tables.
Are there any cells where the implemented angle pair differs from the reference?
Report exact cell positions (row, column within the digit) where discrepancies exist.
Do not invent discrepancies — if they match, say so.
```

---

#### Audit C — Pattern Logic Coherence

**When to use:** Before any change to the 4 generative pattern functions, or when a pattern "looks wrong" and the cause isn't clear.

```
CONTEXT:
Four generative patterns cycle in clock.js:
0 — Concentric ripple (elliptical atan2, rotating phase)
1 — Diagonal wave (linear phase across grid)
2 — Radial V (circular atan2, oscillating spread)
3 — Vortex (radial distance + rotation, oscillating spread)

Each pattern returns [hourAngle, minuteAngle] per cell.
Patterns are blended during the crossfade window using lerpA (angle-aware lerp).

CODE:
[Paste the 4 pattern functions from clock.js]

QUESTION:
For each pattern:
1. Is the mathematical approach consistent with the description above?
2. Are there any edge cases at the grid boundary (cell 0,0 or cell 5,13) that could produce NaN or Infinity?
3. Is lerpA being used for the angle lerp (not a naive linear interpolation)?
4. Does any pattern directly modify the pre-allocated buffer arrays in place, or does it create new arrays?
Flag any pattern that allocates new arrays per frame — this violates G6.
```

---

#### Audit D — localStorage Security and Correctness

**When to use:** After any change to `controls.js` or the localStorage read logic in `clock.js`.

```
CONSTRAINTS:
- G12: All localStorage values must be parsed, type-checked, range-clamped, and validated before use
- localStorage keys: clk_mode (string enum), clk_hours (integer -12 to 14),
  clk_countdown_time (MM:SS format), clk_countdown_end (ISO timestamp or null)

CODE:
[Paste the localStorage read functions from controls.js and clock.js]

QUESTION:
For each localStorage key:
1. Is the raw value parsed before use (not used as a raw string)?
2. Is the type validated (parseInt, parseFloat, regex, or typeof check)?
3. Is the range clamped (for numeric values)?
4. Is there a safe default for null/missing/NaN values?
5. Can a manually crafted localStorage value cause unexpected JS behaviour (prototype pollution, eval-equivalent, date math overflow)?
Flag any key where the validation is incomplete or missing.
```

---

#### Audit E — CSS Architecture Integrity

**When to use:** After any CSS change, or as a quarterly health check.

```
CONSTRAINTS:
- G1: No hardcoded colour or spacing values — CSS custom properties only
- G2: Mobile-first min-width only — no max-width breakpoints
- G10: No !important (exception: prefers-reduced-motion blocks only)
- G11: No inline styles in HTML
- Namespace rules: global tokens in colors.css (--color-*, --space-*), clock tokens in clock.css (--clk-*), controls tokens in controls.css (--ctrl-*)
- Load order for non-clock pages: colors.css → fonts.css → global.css → components.css → [page].css → utilities.css
- Clock page: clock.css only (self-contained)

CODE:
[Paste the relevant CSS file(s)]

QUESTION:
1. Are there any hardcoded hex, rgb, or pixel values that should be custom properties?
2. Are there any max-width media queries?
3. Are there any !important declarations outside reduced-motion blocks?
4. Are any --clk-* tokens used outside clock.css? Are any --ctrl-* tokens used outside controls.css?
5. Does the load order imply any cascade conflicts?
Output: pass / warning / violation with specific line reference.
```

---

#### Audit F — Favicon Animator Canvas Performance

**When to use:** After any change to `favicon-animator.js`, or when CPU usage is unexpectedly high.

```
CONTEXT:
favicon-animator.js renders an animated canvas favicon at ~10fps.
Key constraints:
- Must use requestAnimationFrame (not setInterval)
- Must pause on visibilitychange (hidden tab = no canvas work)
- canvas.toDataURL() is expensive — must not be called when tab is hidden
- Must be throttled to ~10fps (not 60fps)

CODE:
[Paste js/favicon-animator.js]

QUESTION:
1. Is rAF used with a timestamp throttle to achieve ~10fps?
2. Is there a visibilitychange listener that stops the rAF loop and suspends toDataURL()?
3. Are there any per-frame allocations (new arrays, new objects, new ImageData) inside the tick function?
4. Is the canvas context cached (not retrieved on every frame)?
5. At tab restore, does the animation restart cleanly from the current state, or does it reset to frame 0?
```

---

### Project-Specific Consulting Notes

These are known areas where external review is particularly valuable for this project:

| Topic | Why worth consulting | Best Gemini pattern |
|-------|---------------------|-------------------|
| **Angle lerp correctness** | `lerpA` must handle angle wraparound (359° → 1° should lerp via 0°, not the long way) | Pattern 2 (Root Cause) |
| **Float64Array precision** | Rounding to 2dp for cache comparison — calibration point that affects visual smoothness vs compositor work | Pattern 3 (Decision Validation) |
| **Pattern phase timing** | 30s cycle split: 2s ease-out → 21s patterns → 2s ease-in → 5s static — any drift changes the art piece | Pattern 1 (Architecture Audit) |
| **Countdown time arithmetic** | End timestamp stored in localStorage, compared to `Date.now()` — timezone edge cases, DST, leap second risks | Pattern 2 (Root Cause) |
| **GPU compositor at scale** | `will-change: transform` on 168 elements is documented as occasionally problematic on low-memory devices | Pattern 3 (Decision Validation) |
| **CSS contain scope** | `contain: layout style paint` isolates style recalculation — verify this doesn't block needed cascade (e.g. font-size on body reaching cells) | Pattern 1 (Architecture Audit) |
