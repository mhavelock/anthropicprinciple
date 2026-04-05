# DECISIONS.md — Architecture Decision Records

Key technical decisions made during development. Each entry captures the choice, the alternatives, and the actual reason — so future sessions don't relitigate them or regress them by accident.

---

## ADR-001: Zero dependencies — no npm, no bundler, no framework

**Decision:** The entire site is plain HTML, CSS, and JS. No package manager, no build step, no third-party libraries.

**Context:** This is a single-page art installation with a strict performance target (PageSpeed 100). Every dependency adds risk and complexity.

**Alternatives:**
- React/Vue/Svelte — overkill for a static site with two pages and no dynamic data
- Bundler (Vite/Webpack) — adds a build step with no benefit for plain HTML/CSS/JS
- CSS framework (Tailwind) — fights with the custom design token system needed for clock-specific tokens

**Why zero deps:** Nothing to break, nothing to update, nothing to audit for vulnerabilities. The clock animation is pure DOM manipulation — no framework overhead between JS and the DOM is faster. PageSpeed 100 is trivially achievable. Any future developer can open `index.html` in a browser and it just works.

---

## ADR-002: CSS custom properties as single source of truth

**Decision:** All colours, spacing, font sizes, and timing values are defined as `--custom-properties` in `styles/colors.css`. Never hardcoded at usage sites.

**Context:** The site has light and dark modes, a distinct controls-page theme, and clock-specific colours. All need to stay consistent.

**Why custom properties:** One change to a token propagates everywhere. Dark mode overrides are applied at the `:root` level (or via `[data-theme]`) and automatically cascade. The `--clk-*` and `--ctrl-*` namespaces allow page-specific tokens without collision. Hardcoded values silently diverge across files as the codebase grows.

---

## ADR-003: requestAnimationFrame with visibilitychange — not setInterval

**Decision:** Both `clock.js` and `favicon-animator.js` use `requestAnimationFrame` loops with explicit `visibilitychange` pause/resume handlers.

**Context:** The clock runs continuously while the tab is open. The favicon animation runs on all pages.

**Alternatives:**
- `setInterval` — fires at wall-clock time regardless of tab visibility
- rAF alone (no visibilitychange) — browser may still fire callbacks in hidden tabs in some environments

**Why rAF + visibilitychange:** `requestAnimationFrame` is synchronised with the display refresh rate and suppressed by the browser in most inactive-tab scenarios. The `visibilitychange` handler adds an explicit application-level guarantee: the loop is cancelled when `document.hidden` becomes `true` and restarted when it becomes `false`. Zero background CPU usage is guaranteed.

---

## ADR-004: Pre-allocated output buffers in clock.js

**Decision:** Five fixed-length buffer arrays (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) are allocated once at module initialisation and mutated in place on every frame.

**Context:** The animation loop runs at up to 60fps. Each frame computes angles for 84 clock cells (168 hands).

**Alternatives:**
- Allocate fresh arrays per frame using `Array.from()` or `.map()` — creates ~84+ temporary objects per frame for GC
- Use a single flat array — fewer objects but same allocation pattern without pre-allocation

**Why pre-allocated:** Eliminates per-frame heap allocation. GC pauses from continuous short-lived allocations are detectable as micro-jank in 60fps animations. At 60fps × 84 cells × 5 buffers, this would otherwise be ~25,200 short-lived array slots per second feeding the garbage collector.

---

## ADR-005: Float64Array angle cache in apply()

**Decision:** `_lastAngles` is a `Float64Array` of length 168 (one per hand). Before writing `style.transform`, the new angle (rounded to 2 decimal places) is compared against the cached value. The write is skipped if equal.

**Context:** During the 5-second static display phase, the clock hands don't move. The rAF loop still runs at 1fps during this phase.

**Alternatives:**
- Always write `style.transform` on every frame — simpler, but invalidates the compositor on every tick even during static periods
- Compare using regular Array — same logic but `Float64Array` has faster numeric comparison and fixed memory layout

**Why Float64Array cache:** Skipping DOM writes during static periods reduces compositor invalidation to near zero. The 2 decimal place rounding also reduces unique string allocations per frame (fewer distinct `rotate(Xdeg)` string values).

---

## ADR-006: GPU compositor via will-change: transform + contain

**Decision:** `will-change: transform` is applied to all `.hand` elements. `contain: layout style paint` is applied to all `.mc` cells.

**Context:** 168 hand elements are individually animated via JS-driven `style.transform` writes at up to 60fps.

**Alternatives:**
- No compositor hints — browser promotes to GPU layers opportunistically, sometimes mid-animation
- `will-change: transform` only — without `contain`, a single cell's update can still cascade style recalculation across the document

**Why both:** `will-change` lets the browser promote all 168 hands to compositor layers at paint time (before animation starts), eliminating mid-animation promotions. `contain` creates a containment boundary per cell — the browser knows no element outside the `.mc` can be affected by what happens inside it, so style recalculation is scoped to the cell. Together they route all transform updates through the compositor thread with zero main-thread layout involvement.

---

## ADR-007: clock.css self-contained with --clk-* token namespace

**Decision:** `clock.css` carries its own reset, body class scope (`body.clock`), grid, hand compositor hints, and countdown keyframes. It uses a `--clk-*` token namespace and never imports from `components.css`.

**Context:** The clock page needs to be completely isolated from UI component styles to prevent accidental overrides or cascade conflicts.

**Alternatives:**
- Share tokens with `colors.css` only — partial isolation, but `components.css` could still leak if loaded
- Inline all clock styles in `<style>` tags — harder to maintain

**Why self-contained:** The clock page is a full-screen art piece with no navigation, no modals, no standard UI. Loading `components.css` risks style leakage. The `--clk-*` namespace makes clock tokens visible and auditable without confusion with global tokens.

---

## ADR-008: localStorage for settings persistence

**Decision:** Clock settings are persisted in `localStorage` under four keys. The `storage` event enables cross-tab synchronisation without a page reload.

**Context:** Users may open `clock-controls.html` in a second tab and expect changes to be reflected on the clock page immediately.

**Alternatives:**
- URL parameters — not persistent across reloads, requires page reload to apply
- IndexedDB — overkill for four small values
- Session storage — doesn't persist across reloads, no cross-tab event

**Why localStorage:** Persistent, synchronous reads, cross-tab `storage` event works natively. The four values stored are small strings with no sensitivity. Sanitisation on read handles any stale or corrupted values.

---

## ADR-009: --ctrl-* token namespace for controls page dark theme

**Decision:** The controls panel (`clock-controls.html`) uses an isolated `--ctrl-*` CSS custom property namespace defined in `controls.css`. It never uses `--color-*` tokens from `colors.css`.

**Context:** The controls page has a fixed dark terminal aesthetic that does not respond to the OS `prefers-color-scheme` preference. Global `--color-*` tokens change with dark mode — using them would break the controls page's intentional fixed-dark presentation.

**Why isolated namespace:** Complete isolation from the global token system. If a global token changes (e.g. `--color-bg` gets a new light value), it cannot affect the controls page. The controls page appearance is controlled entirely within `controls.css`.

---

## ADR-010: Debounced localStorage writes for text inputs in controls.js

**Decision:** The UTC hours input and countdown time input write to `localStorage` with a 250ms debounce. Radio/select inputs write immediately.

**Context:** Text inputs fire `input` events on every keystroke. Direct localStorage writes on every keystroke would trigger `storage` events on the clock page up to 10 times per character typed.

**Why debounced:** Reduces unnecessary storage events during typing. 250ms is imperceptible to the user but eliminates the burst. Radio buttons and selects have discrete values — debounce not needed.

---

## ADR-011: Gill Sans as deliberate aside font exception

**Decision:** The `.side` element in `home.css` uses `'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif` as its font-family, deviating from the project's two-font system (Verdana headings / Arial body).

**Context:** The aside attribution is a small, distinct typographic element used as a brand accent. It is not part of the main content hierarchy.

**Why the exception:** The Gill Sans stack is an intentional design choice — it creates a visual distinction for the attribution text without introducing an external font request. It is documented as a deliberate deviation in `SYSTEM.md` and `STANDARDS.md` so future sessions do not remove it as a "convention violation".

**Known tension:** This deviates from the "Arial/Verdana system fonts only" guideline. Future decision: if a more complete type system is introduced, this should be revisited. For now, it stays.
