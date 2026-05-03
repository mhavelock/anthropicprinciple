# Feedback Loops — Wins, Limits, and Redirections

Documented feedback from real project history. These are the moments where a win was locked in, a limit was set deliberately, or a "no" led somewhere better. The purpose is to keep these gains active — so future sessions build on them rather than regressing them.

Format: **What happened → The rule extracted → How to apply it**.

---

## Category 1: Wins That Became Rules

### FL-01: rAF over setInterval → Never use setInterval for animation

**What happened:** `favicon-animator.js` originally used `setInterval` for the canvas animation loop. This fired at wall-clock time regardless of tab visibility — burning CPU and calling `canvas.toDataURL()` even when the favicon was invisible.

**Win locked in:** Replaced with `requestAnimationFrame` + timestamp throttle + `visibilitychange` pause. Background CPU usage dropped to zero.

**Rule extracted:** Never use `setInterval` for animation. `requestAnimationFrame` is designed for animation — it's synchronised with the display and suppressed when the tab is inactive. Always add `visibilitychange` as an additional application-level guarantee.

**How to apply:** Any new animation loop must use `requestAnimationFrame`. If it animates, it must also have a `visibilitychange` listener.

---

### FL-02: Pre-allocated buffers → No per-frame heap allocations in the hot path

**What happened:** The clock engine was creating temporary array objects inline for each of 84 cells on every frame. At 60fps, this was thousands of short-lived allocations per second — continuous GC pressure, occasional micro-jank during crossfades.

**Win locked in:** Five named buffer arrays pre-allocated at module init; mutated in place on every frame. GC pressure eliminated.

**Rule extracted:** The animation hot path must be allocation-free. Allocate once at module initialisation; never inside the loop body. Any new buffer used per-frame must follow this pattern.

**How to apply:** If writing a new per-frame computation that requires a temporary container, allocate it at module init and reuse it. The loop body should contain only mutations, comparisons, and DOM writes.

---

### FL-03: Float64Array cache → Skip DOM writes when value unchanged

**What happened:** During the static display phase, all hands are stationary but `apply()` was still writing `style.transform` for every hand on every tick. Each write marks the element as needing a compositor update — unnecessary work for zero visual change.

**Win locked in:** `Float64Array` cache (`_lastAngles`) — compare before write, skip if equal. Applies across all phases, not just static.

**Rule extracted:** Never write a DOM property if the value hasn't changed. Always cache the last written value and compare before writing. For numeric values, `Float64Array` is faster than regular array comparison.

**How to apply:** Any new JS that drives DOM properties in an animation loop should maintain a cache of the last written value and skip the write on equality.

---

### FL-04: CSS namespace isolation → Page-specific tokens don't pollute the global system

**What happened:** The controls page needed a fixed dark theme that wouldn't change with `prefers-color-scheme`. Using global `--color-*` tokens directly would tie the controls page to the global dark mode behaviour.

**Win locked in:** `--ctrl-*` namespace defined entirely within `controls.css`. The controls page is immune to changes in `colors.css`.

**Rule extracted:** When a page or component deliberately deviates from the global design system, give it a dedicated token namespace. The isolation cost is low; the benefit is complete independence from the global system.

**How to apply:** Any new page or major component with a distinct visual identity should define its own `--[prefix]-*` namespace in its own stylesheet.

---

### FL-05: Debounce input writes → Don't fire storage events on every keystroke

**What happened:** Text inputs were writing to `localStorage` on every `input` event. Each write fires a `storage` event on the clock page — the clock reprocesses settings up to 10 times per character typed.

**Win locked in:** 250ms debounce on text inputs. Discrete inputs (radio, select) write immediately.

**Rule extracted:** Inputs that produce a stream of events (text, range sliders) should debounce side effects. 250ms is imperceptible to users but eliminates burst writes. Discrete inputs don't need debounce.

**How to apply:** Any new text or range input that writes to `localStorage` (or triggers any async operation) should debounce the write. Checkbox, radio, and select inputs can write immediately.

---

## Category 2: Limits Set Deliberately

### FL-06: Git push requires explicit user confirmation — never autonomous

**What happened:** Not an incident — a standing rule.

**Limit:** Claude Code sessions never push to the remote repository autonomously. `git push` requires explicit user instruction and confirmation.

**Why:** A push to `main` deploys immediately to production via GitHub Pages. The cost of an accidental or premature push (a broken clock, a malformed HTML page, a commit with wrong content) is immediate user-visible failure. The cost of asking before pushing is one prompt.

**How to apply:** Before running any `git push` command, explicitly confirm with the user: "Ready to push to main (deploys immediately)?"

---

### FL-07: clock.js and clock.css are protected — no behaviour changes

**What happened:** Not an incident — the protection is preventive.

**Limit:** `js/clock.js` and `styles/clock.css` are protected files. The 30-second cycle, digit shapes, pattern logic, hand-angle tables, timing values, and keyframes are off-limits for anything other than performance optimisation.

**Why:** The clock animation is the product. These files define what the art piece does. A "small" change to timing values or digit tables changes the experience for everyone. Any functional change requires a deliberate decision and a new ADR, not an in-session fix.

**How to apply:** If a change to `clock.js` or `clock.css` is proposed, ask: "Is this a performance optimisation, or is it changing behaviour?" If it's changing behaviour, stop and discuss.

---

## Category 3: Hard Rules (No Exceptions Without ADR)

### FL-08: No inline styles anywhere

Inline styles bypass the design token system, create specificity issues, and are invisible to CSS tooling. No exceptions without an explicit ADR.

### FL-09: No max-width layout breakpoints

`max-width` creates overrides that compound. Mobile-first `min-width` layers cleanly. All existing stylesheets comply. New code must comply.

### FL-10: No !important

`!important` is specificity debt. Find the correct specificity-ordered solution. One exception allowed: `!important` in `prefers-reduced-motion` blocks to ensure accessibility overrides work — but only there.

---

### FL-11: Update all references when a fact changes → Grep for the OLD value across the project before declaring doc work complete

**What happened:** Originated on the sister `hardy-succulents` project (2026-05-03). An AI image-generation model was swapped end-to-end. A thorough handoff was written. The user explicitly prompted: "ensure the correct model we are using is correct in docs". A project-wide grep surfaced stale references in `README.md`, the task tracker, and a phase plan — all needing manual reconciliation. Without that prompt, those would have created conflicting memories for future sessions.

**Win locked in:** Treat fact-changes as cross-document operations. The handoff is one of N references, not the canonical home. Discovery / research docs are the exception — they get a top-of-doc correction note rather than a retcon, since the original reasoning is itself part of their value.

**Rule extracted:** Whenever a fact changes (token name, namespace prefix, file path, ADR number, animation timing, localStorage key, threshold), grep the entire project for the OLD value before declaring the doc work complete. Update every current-state reference; annotate every research/discovery reference as historical. Handoffs are not magic — they don't reach back into other files.

**How to apply:**

1. After any fact change: `grep -rln "old_value" --include="*.md" --include="*.css" --include="*.js" .` (this project's facts often live in CSS custom properties and JS constants too — extend the grep accordingly).
2. For each match, decide: current-state (update inline) or research/discovery (top-of-doc "Status update" callout pointing at the new canonical source).
3. Only then consider the doc work complete.

**Particularly relevant for anthropicprinciple:** This project has tight namespace conventions (`--clk-*`, `--ctrl-*`, `--color-*`) and protected files (`clock.js`, `clock.css`) referenced across `ARCHITECTURE.md §2/§8`, `CORE_PATTERNS.md`, and per-feature ADRs. localStorage keys (`clk_use_local`, etc.) are documented in multiple places by design. A renamed token, relaxed protected-file boundary, or new storage key fixed in only one place becomes a future-session contradiction.

**Cross-reference:** B-07 in `BREAKTHROUGHS.md`. Originating incident documented in `hardy-succulents/docs/architecture/BREAKTHROUGHS.md` BD-06.
