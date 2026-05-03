# anthropicprinciple.ai — Task Register

Canonical task list. All tasks live here — open and completed. Never delete; mark done instead.
Last updated: 2026-04-06 (session 2)

---

## Active Tasks

### CODE / STYLE Tasks

| # | Task | Type | Status | Notes |
|---|------|------|--------|-------|
| C1 | Default clock to visitor local time | CODE | ✅ Done 2026-04-06 | See full spec below. |
| S1 | Fix WCAG contrast: `.side p` text | STYLE | ⚠️ TODO | `#727786` on `#292b31` ≈ 2.85:1 — fails AA (4.5:1 required). Update `--side-text-muted` token in `home.css`. |
| S2 | Fix `home.css` aside positioning magic numbers | STYLE | ⚠️ TODO | `right: calc(-50vw + 1.25rem)` and `top: -17rem` are fragile. Audit at multiple viewports before fixing. |
| S3 | Audit `.side p` font-family deviation | STYLE | ⚠️ TODO | Uses Gill Sans — deliberate deviation from Verdana/Arial system. Decide: keep as documented exception or bring into system. Document either way in `DECISIONS.md`. |

---

### C1 — Default clock to visitor local time (full spec)

**Goal:** All visitors see their own local time by default, including automatic DST/BST changes. The manual UTC offset option remains available for users who want to display a different timezone.

**Why `new Date()` not a fixed offset:**
JavaScript's `Date` object is always in the visitor's local timezone. `new Date().getHours()` and `new Date().getMinutes()` automatically reflect DST/BST changes without any extra logic. A stored UTC offset (e.g. `+1`) would silently show the wrong time when clocks change.

**New localStorage key:**
- `clk_use_local` — `"true"` or `"false"` (string). Default (key absent) = treat as `"true"`.

**Behaviour matrix:**

| `clk_use_local` | `clk_hours` | What clock.js displays |
|-----------------|-------------|------------------------|
| absent (new visitor) | any | Local time via `new Date()` |
| `"true"` | any | Local time via `new Date()` |
| `"false"` | e.g. `"1"` | UTC + offset (existing behaviour) |

**Files to change:**

| File | Change |
|------|--------|
| `js/clock.js` | In the time-reading logic: check `clk_use_local`. If `true` or absent, use `new Date().getHours()` / `.getMinutes()`. If `false`, use existing UTC+offset calculation. |
| `js/controls.js` | On load: restore `clk_use_local` (default `true`). Show/hide `#section-utc-offset` based on value. Write `clk_use_local` on toggle change. |
| `clock-controls.html` | Add a "Local time" toggle (radio or checkbox) above the UTC offset field. When "Local time" selected: UTC offset input visually disabled/hidden. When "Manual offset" selected: UTC offset input shown. |

**UX detail:**
- New visitor arrives → local time shown immediately, no configuration needed
- Controls page: "Local time" selected by default
- User can switch to "Manual UTC offset" → UTC offset input appears → they set it → `clk_use_local` = `false`
- Switching back to "Local time" → `clk_use_local` = `true`, UTC offset input hidden again
- The stored `clk_hours` value is preserved when toggling back to local (so it's still there if they switch back to manual)

**Regression checks after implementation:**
- `visibilitychange` pause still intact
- Countdown mode unaffected — `clk_use_local` only applies when `clk_mode === "clock"`
- UTC offset extreme values (−12, +14) still work when manual mode selected
- `clk_use_local` absent (first visit) correctly defaults to local time

---

### HTML Tasks

| # | Task | Type | Status | Notes |
|---|------|------|--------|-------|
| H1 | W3C validation pass | HTML | ⚠️ TODO | Run `npx html-validate index.html clock-controls.html` post-any-HTML-edit. Must be clean before any deploy. |

### Architecture Quality Gates

| # | Task | Type | Status | Notes |
|---|------|------|--------|-------|
| ARC1 | Contradiction Hunt | DOCS | ⚠️ Pre-major-change | Feed all L1/L2 architecture docs to Gemini Pro. Ask for top 5 internal contradictions or tensions between documents. See `six-hats.md §Contradiction Hunt` for prompt. |
| ARC2 | Recursive Architecture Test | DOCS | ⚠️ Pre-major-change | Feed only `ARCHITECTURE.md` + `SYSTEM.md` to Gemini. Ask it to describe the clock animation pipeline. Compare against actual code — divergences = doc debt or code drift. See `GEMINI-CONSULTANCY.md` Pattern 5. |
| ARC3 | Full codebase audit | DOCS | ⚠️ Periodic | Run `CODEBASE-AUDIT.md` Strategy A chunks. Each chunk audited against G1–G13 constraints. |

### USER / Testing Tasks

| # | Task | Type | Status | Notes |
|---|------|------|--------|-------|
| T1 | PageSpeed audit — mobile + desktop | USER | ⚠️ After any JS/CSS change | Target ≥ 95. Currently 100/100. |
| T2 | Full manual test checklist (Mat's Checklist) | USER | ⚠️ After significant changes | Clock animation, countdown, localStorage persist, keyboard, responsive, dark mode, landscape. See `CLAUDE.md §Test Programme`. |

---

## Completed Tasks

### Performance Optimisation (2026-03-15 – 2026-03-21)

| # | Task | Status | Notes |
|---|------|--------|-------|
| PERF1 | rAF loop with visibilitychange | ✅ Done 2026-03-15 | Both `clock.js` and `favicon-animator.js`. Replaced setInterval in favicon-animator. |
| PERF2 | Pre-allocated output buffers | ✅ Done 2026-03-15 | `_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp` in `clock.js` |
| PERF3 | Float64Array angle cache | ✅ Done 2026-03-15 | `_lastAngles` in `apply()` — skips DOM write if angle unchanged |
| PERF4 | GPU compositor: will-change + contain | ✅ Done 2026-03-15 | `will-change: transform` on `.hand`, `contain: layout style paint` on `.mc` |
| PERF5 | Pattern trig throttle | ✅ Done 2026-03-15 | ~30fps for pattern phase, 60fps for ease windows, 1fps for static display |
| PERF6 | Angle rounding to 2dp | ✅ Done 2026-03-15 | Reduces unique string allocations per frame |
| PERF7 | `favicon-animator.js` throttled to ~10fps | ✅ Done 2026-03-15 | 100ms min interval; canvas.toDataURL() suspended when hidden |
| PERF8 | Logger buffered in memory | ✅ Done 2026-03-15 | No synchronous sessionStorage I/O on every log call |

### CSS Architecture (2026-03-15 – 2026-03-21)

| # | Task | Status | Notes |
|---|------|--------|-------|
| CSS1 | Mobile-first refactor | ✅ Done 2026-03-21 | All stylesheets converted to min-width breakpoints only |
| CSS2 | CSS custom properties for all colours | ✅ Done 2026-03-21 | `home.css` palette extracted to `--side-*` tokens |
| CSS3 | `--ctrl-*` namespace isolation | ✅ Done 2026-03-21 | Controls page dark theme isolated from global token system |
| CSS4 | Alphabetical properties | ✅ Done 2026-03-21 | Applied across all stylesheets |
| CSS5 | `controls.css` extracted from inline | ✅ Done 2026-03-15 | `controls.js` extracted from inline script block at same time |

### HTML / Accessibility (2026-03-15 – 2026-03-21)

| # | Task | Status | Notes |
|---|------|--------|-------|
| A11Y1 | `focus-visible` rings on all interactive elements | ✅ Done 2026-03-21 | |
| A11Y2 | ARIA landmarks on clock-controls.html | ✅ Done 2026-03-21 | `<nav aria-label>`, `<section aria-labelledby>`, `role="status" aria-live="polite"` |
| A11Y3 | `prefers-reduced-motion` in all animation stylesheets | ✅ Done 2026-03-21 | |
| A11Y4 | Keyboard navigation verified | ✅ Done 2026-03-21 | Tab, Enter/Space, Escape |

### SEO / Meta (2026-03-15)

| # | Task | Status | Notes |
|---|------|--------|-------|
| SEO1 | Open Graph meta tags | ✅ Done 2026-03-15 | `og:type`, `og:url`, `og:title`, `og:description`, `og:image` |
| SEO2 | Canonical links | ✅ Done 2026-03-15 | Both pages |
| SEO3 | JSON-LD structured data | ✅ Done 2026-03-15 | `WebApplication` schema |
| SEO4 | Meta description expanded | ✅ Done 2026-03-15 | 130-character descriptive summary |

### Security / Robustness (2026-03-15)

| # | Task | Status | Notes |
|---|------|--------|-------|
| SEC1 | `noopener noreferrer` on all `target="_blank"` | ✅ Done 2026-03-15 | All external links |
| SEC2 | localStorage sanitisation in `controls.js` | ✅ Done 2026-03-20 | `clk_hours` clamped to -12–14; `clk_countdown_time` regex-validated |
| SEC3 | Debounce on text inputs in `controls.js` | ✅ Done 2026-03-20 | 250ms — prevents excessive localStorage writes |

### GitHub Workflows (2026-03-21)

| # | Task | Status | Notes |
|---|------|--------|-------|
| GH1 | Portfolio analyst workflow patched | ✅ Done 2026-03-21 | Two bugs fixed in `portfolio-analyst.yml`. OAuth → ANTHROPIC_API_KEY. Upstream bug filed: github/gh-aw#22110 |

### Documentation (2026-04-05)

| # | Task | Status | Notes |
|---|------|--------|-------|
| DOC1 | Architecture documentation system | ✅ Done 2026-04-05 | Full `docs/architecture/` rewrite matching that-guy project structure. All files project-specific. |
| DOC2 | Plan system setup | ✅ Done 2026-04-05 | `docs/plan/` restructured: plan-rules.md, tasklist.md, archive/ |

### Features & UI (2026-04-06)

| # | Task | Status | Notes |
|---|------|--------|-------|
| C1 | Default clock to visitor local time | ✅ Done 2026-04-06 | `clk_use_local` key; `new Date()` path in `clock.js`; Local/Manual radio in controls. DST/BST handled automatically. |
| UI1 | Controls icon link in links panel | ✅ Done 2026-04-06 | `controls.svg` added above Bluesky; filtered to white via `brightness(0) invert(1)`; uses `--opacity-dim` + `--transition-fast` tokens. |

### Architecture & Tooling (2026-04-06)

| # | Task | Status | Notes |
|---|------|--------|-------|
| ARCH1 | `six-hats.md` rewrite for anthropicprinciple | ✅ Done 2026-04-06 | All iOS/that-guy content replaced. Strategy A/B rewritten for clock. Slow Connection UX Strategy added. |
| ARCH2 | Gemini MCP server wired | ✅ Done 2026-04-06 | `.mcp.json` configured; API key in `~/Claudette/Cowork/projects/.env` via `~/.zshrc` source. |
| ARCH3 | First Gemini MCP audit | ✅ Done 2026-04-06 | Pattern 1 audit run post-feature. Caught two violations: CSS token drift + undocumented localStorage key. Both fixed. B-06 written. |

### Architecture & Tooling (2026-05-03)

| # | Task | Status | Notes |
|---|------|--------|-------|
| ARCH4 | Architecture redux — Phase A (MAINDOCS_INDEX + qref/) | ✅ Done 2026-05-03 | Per `plan-architecture-redux-2026-05-03.md`. Created `docs/architecture/CLAUDE_MAINDOCS_INDEX.md` (project-scoped live state-of-play) + `qref/README.md` + three worked-example qrefs (clock-animation-engine, github-pages-static, claude-code-hooks). Phases B–E pending. Commit `dd0d4f5`. |
| ARCH5 | Beginner-safe `settings.local.json` baseline | ✅ Done 2026-05-03 | Repo-root Claude Code permissions baseline for forks. Aggressive deny on foot-guns (curl\|sh, rm -rf, sudo, .env reads, all push/force-push/history-rewrite ops, cross-platform deploys). Ask gates on every write-side git op, npm install/uninstall, edits to config + protected clock files. Commit `c53201f`. |
| DOC3 | Plans + handoff committed | ✅ Done 2026-05-03 | `plan-architecture-redux-2026-05-03.md`, `plan-security-playbook-update-2026-05-03.md`, `security-sweep-playbook.md`, `handoff-2026-05-03-architecture-redux-plan.md`. Commit `8f2365f`. |
| DOC4 | `og:title` ASCII-art preservation note | ✅ Done 2026-05-03 | HTML comment at meta tag in `index.html` + bullet in MAINDOCS_INDEX § Known Constraints. Documents intentional kinetic-clock glyph art so future sessions don't "fix" it. |
