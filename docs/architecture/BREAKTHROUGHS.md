# Project Breakthroughs — Reflective Record

Process, approach, and decision breakthroughs from anthropicprinciple.ai development. These are not feature releases — they are moments where a better way to think about a problem was found, a correct decision was made under pressure, or a root cause was identified instead of a symptom.

Organised as: what the situation was → what we were tempted to do → what we actually did → what we learned.

---

## B-01: Eliminating Per-Frame Allocations

**Date:** 2026-03-15
**Session type:** Performance review

**Situation:** The clock animation was running but the frame loop was creating temporary arrays on every tick. For 84 cells at 60fps, this was ~84 array allocations per frame during ease windows — feeding GC continuously. The visible result was occasional micro-jank during pattern crossfades.

**Temptation:** Accept it as "good enough" — the jank wasn't severe. Or use `Float64Array` for the output buffers as a patch.

**What we actually did:** Pre-allocated five named buffer arrays (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) once at module initialisation as fixed-length arrays of 2-element sub-arrays. All frame work mutates these in place — zero allocations in the hot path.

**Lesson:** The correct fix was at the data model level (move allocation to init), not at the algorithm level (smarter allocation). The hot path must be allocation-free. Once the principle was applied, the fix was straightforward.

**ADR reference:** ADR-004

---

## B-02: Float64Array Cache — Skipping Unchanged DOM Writes

**Date:** 2026-03-15
**Session type:** Performance review

**Situation:** During the 5-second static display phase, all 168 hand elements are not moving. Yet `apply()` was still writing `style.transform` for every hand on every rAF tick (throttled to 1fps). Each write marks the element as needing a compositor update, even if the value is identical.

**Temptation:** Add an `if (phase === 'static') return` guard — simpler, but creates a special case that can regress when phases change.

**What we actually did:** Added a `Float64Array` of length 168 (`_lastAngles`) as a persistent cache. Before every DOM write, the rounded new angle is compared against the cached value. The write is skipped if equal. The cache applies across all phases, not just static.

**Lesson:** The general solution (cache + compare) is better than the special case (skip-if-static). It handles the static phase but also reduces writes during pattern phases when many hands aren't moving between frames. Angles rounded to 2dp is the calibration point — finer precision would increase write frequency; coarser would add visual inaccuracy.

**ADR reference:** ADR-005

---

## B-03: GPU Compositor via will-change + contain

**Date:** 2026-03-15
**Session type:** Performance review

**Situation:** 168 hand elements being animated via JS-driven `style.transform` writes. Without compositor hints, the browser was handling transform updates through the main thread layout pipeline — each transform write could trigger style recalculation cascading across the document.

**Temptation:** Rely on the browser to promote elements to compositor layers opportunistically — "it'll figure it out."

**What we actually did:** Added `will-change: transform` to `.hand` (promotes all 168 hands to compositor layers at paint time, before animation starts) and `contain: layout style paint` to `.mc` (creates a containment boundary per cell so transform writes never cascade outside the cell).

**Lesson:** Tell the browser what you know. `will-change` communicates that these elements will be transformed; the browser acts before animation starts rather than scrambling during it. `contain` communicates the scope of changes; style recalculation becomes O(1) per cell rather than O(document). Both hints require understanding the specific browser architecture they exploit — they're not general-purpose optimisations.

**ADR reference:** ADR-006

---

## B-04: CSS Namespace Isolation for the Controls Page

**Date:** 2026-03-15
**Session type:** CSS architecture review

**Situation:** The controls page needs a fixed dark terminal aesthetic that doesn't respond to `prefers-color-scheme`. The global `--color-*` token system changes with dark mode — using it would mean the controls page light/dark behaviour changes with the OS preference, which is wrong by design.

**Temptation:** Override `--color-*` tokens inside a `controls.html`-scoped block — messy and fragile.

**What we actually did:** Introduced a `--ctrl-*` custom property namespace defined entirely within `controls.css`. The controls page never references `--color-*` tokens. Any change to the global colour system cannot affect the controls page.

**Lesson:** Isolated namespaces are a clean CSS architecture pattern when a page intentionally deviates from the design system. The cost is maintaining two token sets; the benefit is complete immunity from global changes. The `--clk-*` namespace in `clock.css` applies the same principle to the clock-specific tokens.

**ADR reference:** ADR-009

---

## B-06: First In-Session Gemini MCP Audit

**Date:** 2026-04-06
**Session type:** Architecture audit

**Situation:** After implementing two features (local time default, controls icon link), a Gemini architectural audit was run via the project's `.mcp.json` MCP server — no manual copy-paste. First live use of Gemini MCP on this project.

**What Gemini caught:** Two constraint violations that had been merged without notice:
1. `home.css` hard-coded `opacity: 0.8` and `transition: opacity 200ms` — violating the CSS custom properties constraint (ARCHITECTURE.md §2).
2. The new `clk_use_local` localStorage key was not documented in `ARCHITECTURE.md §8`.

**What we actually did:** Ran Pattern 1 (Architecture Audit) from `GEMINI-CONSULTANCY.md`. Adjudicated findings — one false positive dismissed (internal API consistency), two genuine findings fixed: added `--opacity-dim` token to `colors.css`, updated references in `home.css`, documented `clk_use_local` in `ARCHITECTURE.md`.

**Lesson:** The Gemini MCP audit works. The constraint it most reliably catches is CSS token drift — hardcoded values that look correct but break the single source of truth. Run Pattern 1 after every feature session.

---

## B-05: Debouncing localStorage Writes

**Date:** 2026-03-20
**Session type:** Code review

**Situation:** Text inputs in `controls.js` (UTC offset, countdown time) were writing to `localStorage` on every `input` event — every keystroke. Each write fires a `storage` event on `clock.js` in other tabs, causing the clock to reprocess settings up to 10 times per character typed.

**Temptation:** Accept it — the visual effect is subtle (the clock updates as the user types, which could even be seen as a feature).

**What we actually did:** Added a 250ms debounce to text input writes. Radio buttons and selects still write immediately (they have discrete values — debounce would feel laggy).

**Lesson:** The frequency of side effects (storage events triggering clock reprocessing) matters even when the visible output looks fine. Debouncing at the input level is cleaner than debouncing at the clock's storage event handler. Keep the fix at the source of the excess.

**ADR reference:** ADR-010
