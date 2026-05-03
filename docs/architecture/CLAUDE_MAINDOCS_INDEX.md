# anthropicprinciple.ai — Project Main Settings

> **Live state-of-play. Loaded at every session start.**
>
> The 17 architecture docs in `docs/architecture/` are *rules + history* — slow to change, reference-grade. **This file is *current state*** — it changes session-to-session as the project evolves. Different concerns. Don't merge them.
>
> If something in this file contradicts an architecture doc, that is a drift signal — fix the doc, not this file.

---

## Project

- **Name:** anthropicprinciple.ai
- **Type:** Kinetic clock art piece — single-page static site, 84 mini analogue clocks in a 6 × 14 grid that animate through patterns and resolve to HH:MM
- **Repo:** <https://github.com/mhavelock/anthropicprinciple> · branch `main` → GitHub Pages (auto-deploy on push)
- **Domain:** <https://anthropicprinciple.ai/> (CNAME → `mhavelock.github.io`)
- **Stack:** HTML5 / CSS3 / vanilla JS (ES2020+, IIFE) / GitHub Pages — zero dependencies, no build step
- **Local dev:** `npx live-server` → <http://127.0.0.1:8080/>

---

## Quick Reference

> Detailed quick-reference files live in `qref/`. Use them when a topic needs surgical depth (rule of thumb: ≥ 200 words and ≥ 1 worked failure case). Summaries below are intentionally terse — link out for the full version.

| File | Topic |
|---|---|
| `qref/qr-clock-animation-engine.md` | The 30-second rAF cycle; `Float64Array` angle cache; pre-allocated `_buf*` arrays; `will-change` + `contain` GPU hints; why `clock.js` and `clock.css` are protected (perf-only edits, never structural) |
| `qref/qr-github-pages-static.md` | GitHub Pages serving rules; CNAME apex domain; no SSR / no env vars at runtime; `svw`/`svh` over `dvw`/`dvh` for iOS orientation stability; no 404.html means GitHub default page on miss |
| `qref/qr-claude-code-hooks.md` | Env-var-driven hook paths (`$COWORK_LOG_DIR`, `$COWORK_BACKUP_DIR`); diagnostic hooks always exit 0; never use `set -e` in hooks; `git rev-parse` fallback for repo root |

---

## Key Architecture Decisions

> The constraints that shaped the codebase. Headlines only — full ADRs in `DECISIONS.md`.

- **Zero dependencies.** No npm, no bundler, no framework. (ADR-001)
- **CSS custom properties as single source of truth** for all colours, spacing, transitions. (ADR-002)
- **`requestAnimationFrame` only** — never `setInterval`. Both `clock.js` and `favicon-animator.js` pause on `visibilitychange`. (ADR-003)
- **Pre-allocated output buffers** in `clock.js` — eliminates per-frame heap allocations. (ADR-004)
- **`Float64Array` angle cache** in `apply()` — skips DOM write when value unchanged. (ADR-005)
- **GPU compositor hints** — `will-change: transform` on `.hand`, `contain: layout style paint` on `.mc`. (ADR-006)
- **`clock.css` is self-contained** with `--clk-*` token namespace; clock page does not load the global token system. (ADR-007)
- **`localStorage` for settings persistence** — no save button, debounced writes for text inputs. (ADR-008, ADR-010)
- **`--ctrl-*` namespace** isolates the controls page dark theme from the global tokens. (ADR-009)
- **Mobile-first, `min-width` only** — never `max-width`. Progressive enhancement: clock grid renders statically without JS.
- **30-second cycle:** 2s ease-out → 21s patterns (4 patterns, crossfaded) → 2s ease-in → 5s static HH:MM display.

---

## Known Constraints

> The "do-not-trip" list. Append every session — this is the costliest section to lose.

- **`styles/clock.css` and `js/clock.js` are PROTECTED.** Performance-only edits. Never change visual behaviour, the 30-second cycle, the digit angle tables, or the pattern logic. See `qref/qr-clock-animation-engine.md` and `CLAUDE.md` § Protected files.
- **168 `.hand` elements are GPU-promoted** via `will-change: transform`. Do not add hover rotations, layout-affecting properties, or `box-shadow` transitions on `.hand` in normal state — would defeat the compositor optimisation. The `body.countdown-zero` pulse is a deliberate exception, scoped by class.
- **`apply()` short-circuits via `_lastAngles` Float64Array.** Don't read `style.transform` back from the DOM expecting a fresh value — the cache is the source of truth.
- **Pattern phase is throttled to ~30 fps**, ease windows run at 60 fps, static display at 1 fps. Removing any throttle without measuring will burn CPU on a stable display.
- **iOS Safari orientation:** `clock.css` uses `svw`/`svh` (small viewport units), not `dvw`/`dvh` and not JS-set `--vw`/`--vh`. iOS fires `resize` late or not at all after orientation change. See `qref/qr-github-pages-static.md`.
- **No SSR, no env vars.** GitHub Pages serves files as-is. There is no runtime config — every setting lives in `localStorage` (client-side) or is hardcoded in markup/CSS/JS.
- **No 404.html.** A miss returns GitHub's default 404 page on the apex domain. If routes are added, ship a `404.html` at repo root.
- **`logger.js` is dev-only.** Remove `<script src="js/logger.js">` from HTML before production deploy if not actively diagnosing.
- **Conventional Commits enforced.** Use the `git-commit-messaging` skill — never freehand a commit subject.
- **`git push` requires explicit user confirmation.** `main` auto-deploys; pushing is a production release.

---

## Changes Since Training Data

> **Check this before planning vendor / API work.** Empty for greenfield static sites; populate as the project integrates fast-moving SaaS APIs.

- *(none — no vendor surface; static site, no third-party scripts on `index.html`.)*

---

## File Structure (key paths)

> Quick-jump list. Full tree lives in `CLAUDE.md`.

- `index.html` — full-screen kinetic clock; only page where the art piece runs
- `clock-controls.html` — settings panel (mode, local/manual time source, UTC offset, countdown)
- `play.html` — SoundCloud playlist grid
- `js/clock.js` — **PROTECTED** animation engine
- `styles/clock.css` — **PROTECTED** clock-only stylesheet, self-contained
- `styles/colors.css` — design tokens, single source of truth (non-clock pages)
- `js/favicon-animator.js` — 10 fps rAF favicon, paused on `visibilitychange`
- `js/controls.js` — settings form; debounced `localStorage` writes; sanitisation
- `docs/plan/tasklist.md` — open and completed tasks (canonical task register)
- `docs/architecture/qref/` — surgical quick-references (this index's Quick Reference table)
- `CNAME` — apex domain `anthropicprinciple.ai`

---

## Design Tokens

> Full token set lives in `styles/colors.css`. Listed here for fast reference; never hardcode.

- **Light/dark mode:** `--color-bg`, `--color-bg-alt`, `--color-text`, `--color-text-muted`, `--color-btn-primary`, `--color-text-on-btn-primary`, `--color-btn-secondary`, `--color-text-on-btn-secondary`, `--color-link`, `--color-focus`
- **Clock-only namespace** (`styles/clock.css`): `--clk-bg`, `--clk-face`, `--clk-border`, `--clk-hand`, `--clk-zero-hand`, `--clk-zero-glow`
- **Controls-only namespace** (`styles/controls.css`): `--ctrl-*`
- **Spacing:** `--space-xs` `0.25rem` → `--space-3xl` `4rem`
- **Breakpoints (min-width only):** `sm 480px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1440px`
- **Typography:** Verdana headings, Arial body, Courier New mono, Gill Sans aside (deliberate exception — ADR-011)

---

## Environment Variables

> Static site. No `.env` files in this project. No runtime secrets.

| Variable | Local | Prod | Source |
|---|---|---|---|
| *(none)* | — | — | — |

**Tooling-adjacent secrets** (not used by the deployed site):

- `GEMINI_API_KEY` — Gemini MCP for in-session architecture audits. Stored in `~/Claudette/Cowork/projects/.env`, sourced via `~/.zshrc`. Never committed.

---

## Common Commands

```bash
npx live-server                                       # local dev → http://127.0.0.1:8080/
npx html-validate index.html clock-controls.html      # W3C validation pass
git diff                                              # review unstaged changes
git diff --cached                                     # review staged changes
git log --oneline -- js/clock.js styles/clock.css     # clock-engine history
```

---

## Coding Conventions

> Short bullets. Full guidance in `STANDARDS.md`, `ARCHITECTURE_EXTENSION.md`, and project-root `CLAUDE.md`.

- **Conventional Commits:** `type(scope): description` — types `feat` `fix` `style` `refactor` `docs` `perf` `test` `chore`. Use the `git-commit-messaging` skill.
- **Component class pattern:** `.component`, `.component-element`, `.mod-variant`, `.is-state`, `.js-hook`, `.u-utility`.
- **Alphabetical CSS properties** within each rule block.
- **`:focus-visible` not `:focus`** — keyboard focus only.
- **`defer` on every `<script>` tag.**
- **Mobile-first only** — `@media (min-width: …)`. Never `max-width` for breakpoints.
- **No `!important`. No inline styles. No inline event handlers.**
- **Skill on every front-end change:** `frontend-standards`.

---

## Phase Status

> Lightweight kanban. Detail lives in `docs/plan/tasklist.md`.

| Phase | Status |
|---|---|
| 0 — Scaffold + clock engine | Complete |
| 1 — Performance optimisation (rAF, Float64Array, GPU compositor, throttling) | Complete (2026-03-15 → 2026-03-21) |
| 2 — Architecture documentation (17 docs, ADRs, FL, breakthroughs) | Complete (2026-04-05 → 2026-04-06) |
| 3 — Local-time default + Gemini MCP audit | Complete (2026-04-06) |
| 4 — Architecture redux: MAINDOCS_INDEX + qref/ | In progress (Phase A landing 2026-05-03) |
| 5 — G14/G15 + security-sweep ADRs (Phase B of redux) | Pending |
| 6 — Run security playbook on this project (Phase E of redux) | Pending |

---

## Settings — Current State of Play (2026-05-03)

### Production runtime

- Site live at <https://anthropicprinciple.ai/>. GitHub Pages, builds green.
- Render mode: static. No server runtime, no SSR, no env vars at runtime.
- Performance baseline: Lighthouse 100/100 mobile + desktop (last measured 2026-04-06; re-measure after every JS/CSS change — see `tasklist.md` T1).

### Open work (sequential / blocking)

1. **Phase B of architecture redux** (next session) — add G14/G15 to `CORE_PATTERNS.md`, ADR-012/013/014 to `DECISIONS.md`, FL-11 to `FEEDBACK-LOOPS.md`, Trigger 10 to `CHECKPOINTS.md`, and run the `G1–G13` → `G1–G15` grep sweep across all `.md` files.
2. **Phase D markdown sweep** — annotate fenced code blocks across `docs/`; modelled on the white-hat-label sweep.
3. **Phase E security playbook** — run Phase 0 triage; defer the breakthrough entry until findings are real (next available is **B-07**, not B-06 — B-06 already exists as "First In-Session Gemini MCP Audit").

### Pre-launch checklist (orthogonal)

- N/A — already live. The "after every change" checklist lives in `CLAUDE.md` § Mat's Checklist + Claude's Checklist.

### Open standing tasks

- **S1** — fix WCAG contrast on `.side p` (currently ~2.85:1, fails AA).
- **S2** — replace `home.css` aside positioning magic numbers.
- **S3** — decide Gill Sans status (deliberate exception or bring into system).
- **H1** — `npx html-validate` pass before any deploy.
- **ARC1/ARC2/ARC3** — Gemini contradiction hunt + recursive architecture test + full chunked audit (pre-major-change).
- See `docs/plan/tasklist.md` for detail.

### Entry prompt for next session

```text
Read docs/architecture/CLAUDE_MAINDOCS_INDEX.md (this file) first, then
docs/plan/plan-architecture-redux-2026-05-03.md.

Continue at Phase B of the redux. Stop and show diffs after each file
edit before moving on. Phase B touches CORE_PATTERNS.md, DECISIONS.md,
FEEDBACK-LOOPS.md, CHECKPOINTS.md, REFLECTIVE-SYNC.md, and a grep sweep
for G1–G13 → G1–G15 across all .md files in the repo.

Note: in the plan, "B-06" should read "B-07" — B-06 already exists as
"First In-Session Gemini MCP Audit". Next available ADR is ADR-012.
Defer the security-sweep breakthrough entry until Phase E runs.
```

---

## Cross-references

- Architecture rules + history: `docs/architecture/` (17 files; reading order in `CLAUDE_ARCHITECTURE.md`).
- Active plans: `docs/plan/plan-architecture-redux-2026-05-03.md`, `docs/plan/plan-security-playbook-update-2026-05-03.md`.
- Task register: `docs/plan/tasklist.md`.
- Project CLAUDE.md: `/CLAUDE.md` (load order, file structure, test programme, git workflow).
