# anthropicprinciple.ai — CLAUDE.md

> **Instruction file for Claude Code.** Single source of truth for how Claude should approach this project. Follow these instructions exactly and in preference to any defaults.

---

## Summary

**anthropicprinciple.ai** is a kinetic clock art piece inspired by Humans Since 1982's "A million times" installation. 84 mini analogue clocks arranged in a 6 × 14 grid perform choreographed animations that periodically resolve into a digital time display (HH:MM). The clock defaults to the visitor's local time (including DST/BST). A companion page (`/clock-controls.html`) lets visitors switch to a manual UTC offset or run a countdown timer, with settings persisted in `localStorage`.

The project is an example of a high-quality, zero-dependency HTML/CSS/JS site built to W3C standards with a 100/100 Google PageSpeed target.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 — semantic, W3C valid |
| Presentation | CSS3 — custom properties, Grid, Flexbox; no framework |
| Behaviour | Vanilla JavaScript — ES2020+, IIFE modules |
| Fonts | System fonts — Verdana (headings), Arial (body) |
| Hosting | GitHub Pages (branch: `main`) |
| CI | GitHub Actions |
| Domain | anthropicprinciple.ai (CNAME) |
| Local dev | `npx live-server` or VS Code Live Server — `http://127.0.0.1:5500` |

**No build step. No npm. No bundler. Pure HTML/CSS/JS.**

---

## Repository & Deployment

| Item | Value |
|------|-------|
| Working Directory | `~/Claudette/Cowork/projects/anthropicprinciple` |
| GitHub | https://github.com/mhavelock/anthropicprinciple |
| Local Development | http://127.0.0.1:8080/ (using live-server) |
| Live site | https://anthropicprinciple.ai/ |
| Branches | `main` → production (GitHub Pages) · `dev` branch planned for future gitflow |
| Git workflow | See [Git Workflow](#git-workflow) below |

---

## File Structure

```
anthropicprinciple/
├── index.html              # Main clock page — full-screen art piece
├── clock-controls.html     # Settings panel — mode, timezone, countdown
├── play.html               # SoundCloud playlist grid
├── CLAUDE.md               # This file — Claude Code instructions
├── CNAME                   # GitHub Pages custom domain
├── README.md               # Public-facing project readme
├── robots.txt              # Crawler directives + sitemap pointer
├── sitemap.xml             # XML sitemap
├── favicon.ico             # Legacy favicon fallback
├── favicon.svg             # Modern SVG favicon (animated by JS)
├── favicon-96x96.png       # PNG favicon
├── apple-touch-icon.png    # iOS home screen icon
└── site.webmanifest        # PWA manifest
│
├── assets/
│   ├── icons/              # SVG icons (Bluesky, SoundCloud, Claude)
│   ├── bgs/                # Background images
│   ├── graphics/           # Illustrations, SVG artwork
│   └── photos/             # Photography
│
├── styles/
│   ├── clock.css           # ⚠️ CLOCK ONLY — reset + grid + hands + animations
│   ├── colors.css          # Design tokens — colours, spacing, typography, transitions
│   ├── fonts.css           # Font family declarations and heading/body assignments
│   ├── global.css          # Base element defaults, links, buttons, forms, 12-col grid
│   ├── components.css      # Reusable UI components — header, logo, etc.
│   ├── home.css            # Homepage — aside, social links, hover animations
│   ├── controls.css        # Self-contained dark theme for clock-controls.html
│   ├── play.css            # Self-contained styles for play.html
│   ├── utilities.css       # Helper classes — u-sr-only, u-flex-center, etc.
│   ├── banner.css          # Banner section component
│   └── border-effect.css   # Animated conic-gradient border component
│
├── js/
│   ├── clock.js            # ⚠️ Clock animation engine — do not modify structure
│   ├── favicon-animator.js # Animated canvas favicon — ~10fps rAF loop
│   ├── controls.js         # Settings form — localStorage read/write with debounce
│   ├── logger.js           # Dev logger — not loaded by default in production
│   └── main.js             # Shared utilities (placeholder)
│
└── docs/
    ├── architecture/           # All architecture docs — ADRs, patterns, feedback loops
    │   ├── CLAUDE_MAINDOCS_INDEX.md # Live state-of-play (project-scoped) — loaded every session
    │   ├── qref/               # Surgical quick-references — clock engine, GH Pages, Claude Code hooks
    │   ├── ARCHITECTURE.md     # System overview and core structural decisions
    │   ├── CORE_PATTERNS.md    # G1–G13 constraints + code patterns (prompt prefix)
    │   ├── DECISIONS.md        # ADR-001 to ADR-011
    │   ├── FEEDBACK-LOOPS.md   # FL-01 to FL-10: wins, limits, hard rules
    │   ├── BREAKTHROUGHS.md    # B-01 to B-05: key problem-solving records
    │   ├── CODEBASE-AUDIT.md   # Audit chunks, G1–G13 table, future audit plan
    │   ├── CHECKPOINTS.md      # Auto-checkpoint triggers and format
    │   ├── FE-VISUALISATION.md # Visual debugging approach for this site
    │   ├── GEMINI-CONSULTANCY.md # Gemini audit patterns and consulting protocol
    │   └── .ai/                # Sprint memory — roadmap, active sprint, history
    └── plan/
        ├── plan-rules.md       # Session operating rules
        ├── tasklist.md         # Open and completed tasks
        ├── discovery/          # Reference docs — digit-reference.md, system-architecture
        ├── archive/            # Closed handoffs, legacy summaries
        └── handoff_[date].md   # Active session handoff
```

### ⚠️ Protected files — do not modify clock behaviour

| File | Why protected |
|------|--------------|
| `styles/clock.css` | Clock grid layout, hand animation, keyframes. May be modified for **performance only** (e.g. compositor hints). Never change visual behaviour or timing values. |
| `js/clock.js` | The animation engine — hand-angle tables, patterns, timing loop. May be modified for **performance only**. Never change the 30-second cycle, digit shapes, or pattern logic. |
| `js/favicon-animator.js` | Working correctly. Do not modify unless a performance or bug fix is required. |

---

## Technical Development Approach

- **No dependencies.** No npm, no bundler, no framework. Everything is plain HTML/CSS/JS.
- **CSS-first.** Use CSS for UI state wherever possible (`:checked`, `:focus-visible`, `@media`, custom properties, `@keyframes`). Add JS only when CSS cannot achieve the goal.
- **Separation of concerns.** HTML = structure and content. CSS = all presentation. JS = behaviour only. No inline styles. No inline event handlers.
- **Progressive enhancement.** The clock grid renders statically without JS (hands at 0°). JS then animates them.
- **Modular JS.** Each JS file is a self-contained IIFE or module. No globals. No shared mutable state across files.
- **CSS custom properties.** All colours, spacing, and timing values are defined as `--custom-properties` in `colors.css`. Never hard-code values in component CSS.
- **Mobile-first CSS.** Base styles target the smallest screen. Use `min-width` media queries to layer on complexity for larger screens. Never use `max-width` for responsive breakpoints.
- **`requestAnimationFrame` loop.** `clock.js` and `favicon-animator.js` use `rAF` — no `setInterval`. Both pause via `visibilitychange` when the tab is hidden.
- **`localStorage` persistence.** Clock settings (mode, local/manual time source, UTC offset, countdown end time) survive page reloads.
- **Flex for layout, Grid for components.** Use Flexbox for page-level flow. CSS Grid for components where a two-dimensional structure is semantically correct (e.g. the clock grid, the 12-column page grid).
- **Chained classes.** Separate structural and presentational concerns using chained classes where it improves clarity.

---

## UX Goals

- **Immediate delight.** The animation plays instantly on load — no spinner, no splash screen.
- **Minimal chrome.** On the main page, the clock fills the full viewport. Nothing competes.
- **Discoverable controls.** `/clock-controls.html` is accessible via keyboard and linked clearly.
- **Settings persist automatically.** No save button needed — `localStorage` updates on every change.
- **Large touch targets.** All interactive controls ≥ 44 × 44 px. Labels, inputs, and buttons are large and readable.
- **Clean and minimal.** No decoration that doesn't serve the experience.
- **Orientation aware.** The clock grid adapts gracefully to landscape on small-screen devices.
- **Reduced motion respect.** The controls page respects `prefers-reduced-motion: reduce`.
- **Keyboard accessible.** Every interactive element reachable by Tab, operable by Enter/Space, dismissable by Escape.

---

## SEO Features

- Descriptive `<title>` on every page.
- `<meta name="description">` on every page.
- Open Graph `og:` tags — title, description, type, image, url.
- `<link rel="canonical">` on every page.
- Schema.org JSON-LD structured data (`WebSite`, `WebApplication`).
- Semantic HTML5 landmarks: `<main>`, `<header>`, `<nav>`, `<footer>` where appropriate.
- `lang="en"` on `<html>`.
- `<meta name="robots" content="index, follow">` on indexable pages.
- `site.webmanifest` for PWA and search discoverability.

---

## Performance Features

- Zero third-party scripts or stylesheets on `index.html`.
- Critical CSS (`clock.css`) loaded as a single `<link>` in `<head>`.
- System fonts only — zero font-loading requests on the main clock page.
- All `<img>` elements have `width`, `height`, `alt`; below-fold images use `loading="lazy"`.
- `srcset` with `250w` and `500w` resolution variants; `sizes` reflects layout breakpoints.
- Explicit image dimensions prevent Cumulative Layout Shift (CLS).
- `defer` attribute on all `<script>` tags.
- `requestAnimationFrame` for the clock render loop — no layout-triggering properties animated.
- CSS animations use `transform` and `opacity` only.
- `aspect-ratio` on the clock grid prevents CLS on load.
- `will-change: transform` on `.hand` — promotes all 168 hand elements to GPU compositor layers; JS-driven `rotate()` updates are applied by the compositor thread, not the main thread.
- `contain: layout style paint` on `.mc` — scopes style recalculation to each clock cell; a transform write on one hand cannot cascade across the document.
- Pre-allocated angle buffers in `clock.js` (`_bufOut`, `_bufFrom`, `_bufTo`, `_bufTime`, `_bufInterp`) — eliminates per-frame heap allocations.
- `Float64Array` angle cache in `apply()` — skips DOM write if the value hasn't changed.
- Pattern phase throttled to ~30fps; ease-in/out windows at 60fps; static display at 1fps.
- `visibilitychange` listener pauses `rAF` loops in both `clock.js` and `favicon-animator.js` when the tab is hidden.
- `favicon-animator.js` throttled to ~10fps (was continuous `setInterval`); `canvas.toDataURL()` suspended when tab is not visible.
- `logger.js` buffers log entries in memory — no synchronous `sessionStorage` I/O on every call.
- **Target: Google PageSpeed ≥ 95 on both mobile and desktop.**

---

## Content Summary

| Page | Content |
|------|---------|
| `index.html` | Full-screen kinetic clock. 84 mini analogue clocks animate through 4 choreographed patterns, then resolve to display the current time (HH:MM). Cycles every 30 seconds. |
| `clock-controls.html` | Settings panel. Clock mode defaults to local time; manual UTC offset (±12–14h) available. Countdown mode (MM:SS). Settings persist in `localStorage` and take effect on `index.html` immediately. |

---

## Layout & Style Guide

### Grid
- **12-column grid** for page-level layouts (`.container`, `.row`, `.col-*`).
- **Gutter:** `1rem` (16px at browser default).
- **Max content width:** `1440px`.
- **Minimum element width:** `288px` (prevents over-compression on small devices).
- **Clock page:** single full-viewport Flexbox container — no page grid.

### Typography

| Role | Font stack | Weight |
|------|-----------|--------|
| Headings h1–h6 | `Verdana, Geneva, sans-serif` | bold |
| Body, paragraphs | `Arial, Helvetica, sans-serif` | normal |
| Monospace / code | `'Courier New', Courier, monospace` | normal |
| Aside attribution | `'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif` | normal |

The aside attribution uses Gill Sans as a deliberate brand accent — it is a distinct design element separate from the main type system. All are system fonts; no external font requests are made.

- Base: `1rem = 16px` (browser default — do not override `font-size` on `html` or `body`).
- All font sizes in `em`. All spacing distances in `rem`.
- Responsive line height: `1.5` base; `1.7` at ≥ 768px.

### Colour Palette

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--color-bg` | `#f5f6f7` | `#0e0f12` |
| `--color-bg-alt` | `#ebeef0` | `#1a1c20` |
| `--color-text` | `#1d1f24` | `#a1b1ca` |
| `--color-text-muted` | `#555e64` | `#7a8896` |
| `--color-btn-primary` | `#a1b1ca` | `#1d1f24` |
| `--color-text-on-btn-primary` | `#1d1f24` | `#a1b1ca` |
| `--color-btn-secondary` | `#3e3b1b` | `#ebe6b7` |
| `--color-text-on-btn-secondary` | `#a1b1ca` | `#1d1f24` |
| `--color-link` | `#1d1f24` | `#a1b1ca` |
| `--color-focus` | `#1d1f24` | `#a1b1ca` |

All tokens defined in `styles/colors.css`. All dark-mode overrides via `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`.

### Spacing Scale

| Token | Value | px equivalent |
|-------|-------|--------------|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `1rem` | 16px |
| `--space-lg` | `1.5rem` | 24px |
| `--space-xl` | `2rem` | 32px |
| `--space-2xl` | `3rem` | 48px |
| `--space-3xl` | `4rem` | 64px |

### Breakpoints (mobile-first, min-width only)

| Name | Value | Context |
|------|-------|---------|
| `sm` | `480px` | Large phones |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Laptops |
| `xl` | `1280px` | Desktops |
| `2xl` | `1440px` | Wide screens |

---

## CSS Conventions

- **File per concern.** One responsibility per stylesheet. Never mix concerns.
- **Load order for non-clock pages:** `global.css` → `colors.css` → `fonts.css` → `components.css` → `utilities.css` → `[page].css`.
- **Clock page only:** `clock.css` (self-contained — contains its own reset, tokens, grid, and animation styles).
- **Component naming pattern:**
  - `.component` — root: `.card`
  - `.component-element` — child: `.card-title`, `.card-body`
  - `.mod-variant` — modifier: `.mod-featured`
  - `.is-state` — JS-applied state: `.is-open`, `.is-active`
  - `.js-hook` — JS selector only, never styled: `.js-toggle`
  - `.u-utility` — utility: `.u-sr-only`, `.u-flex-center`
- **No inline styles.** Never use the `style` attribute.
- **No `!important`.** Find a lower-specificity solution.
- **Alphabetical properties** within each rule block.
- **`:focus-visible` not `:focus`** — keyboard focus indicators only.
- **Hover, focus, active states — no visited state.**
- **Mobile-first always.** `@media (min-width: …)` only. Never `max-width`.
- **`box-sizing: border-box`** in every stylesheet reset.
- **CSS custom properties** for every colour, spacing value, and transition duration.

---

## Standards Compliance

- HTML5, W3C valid.
- WCAG 2.1 AA.
- `lang="en"` on `<html>`.
- `<meta charset="UTF-8">` first in `<head>`.
- `<!doctype html>` lowercase.
- Semantic landmarks: `<main>`, `<header>`, `<nav>`, `<footer>`.
- Every `<input>` and `<textarea>` paired with a `<label for="…">`.
- Every `<img>` has `alt`, `width`, `height`.
- Keyboard: Tab → interactive elements, Enter/Space → activate, Escape → dismiss overlays.
- Visible `:focus-visible` ring on all interactive elements.
- WCAG AA colour contrast: 4.5:1 for text, 3:1 for UI components.
- `prefers-color-scheme` for automatic dark mode.
- `prefers-reduced-motion` for animation opt-out.
- Schema.org JSON-LD structured data on each page.
- One `<h1>` per page; heading hierarchy sequential.
- `defer` on all `<script>` tags.

---

## Skills

| Skill | When to invoke |
|-------|---------------|
| `frontend-standards` | Any time HTML, CSS, or JS is written, reviewed, or refactored |
| `git-commit-messaging` | Every commit — produces Conventional Commits format messages |

---

## Test Programme

After each significant change, run this review prompt:

> "Taking into account the best practices docs in the project `docs/` folder, please run a code review on what we have. Look for better code organisation, clean code improvements, performance improvements, browser memory usage issues, and a security check. Update the md docs and memory file then add and commit to git. Suggest any additional best practice improvements and anything important I may have forgotten. Check changes didn't break completed task functionality."

### Mat's Checklist
- [ ] Clock animation runs — patterns cycle correctly, time resolves at correct interval
- [ ] Countdown mode: set timer, verify display counts down, zero state pulses red
- [ ] `localStorage` persists settings across page reload and between pages
- [ ] Controls page: all inputs save to `localStorage` on change without requiring Save
- [ ] Keyboard: Tab through all controls on controls page, Enter/Space activates Start button
- [ ] Responsive: test at 320px, 480px, 768px, 1024px, 1440px viewport widths
- [ ] Landscape: clock grid fits in viewport on small-screen landscape (e.g. iPhone landscape)
- [ ] Dark mode: verified at OS system preference level
- [ ] PageSpeed: Lighthouse on main page — score ≥ 95 on both mobile and desktop

### Claude's Checklist
- [ ] HTML validates — W3C validator (no errors, no warnings)
- [ ] All `<img>` have `alt`, `width`, `height`
- [ ] All `<input>` have an associated `<label for="…">`
- [ ] No `!important` in CSS
- [ ] No inline styles in HTML
- [ ] No `max-width` media queries (must be mobile-first `min-width`)
- [ ] `box-sizing: border-box` present in every stylesheet reset
- [ ] CSS custom properties used for all colours and spacing values
- [ ] `defer` on all `<script>` tags
- [ ] No console errors or warnings in browser devtools
- [ ] `prefers-color-scheme: dark` verified visually
- [ ] `prefers-reduced-motion: reduce` verified (animations pause/reduce)
- [ ] Schema.org JSON-LD present on each page
- [ ] Open Graph meta tags present on each page

---

## Common Commands

```bash
# Local dev server
npx live-server

# Validate HTML (requires html-validate)
npx html-validate index.html clock-controls.html

# Show staged + unstaged diff before committing
git diff

# Show what would be committed
git diff --cached

# Stage specific files and commit
git add styles/colors.css styles/global.css
git commit -m "style(css): mobile-first refactor and brand colour update"
```

---

## Git Workflow

- **Current workflow:** All work committed directly to `main`. `main` auto-deploys to GitHub Pages on push.
- **Future gitflow:** `dev` → `main` PR workflow to be adopted when ready. Not yet active.
- **Commit messages:** Conventional Commits — `type(scope): description`
  - Types: `feat` `fix` `style` `refactor` `docs` `perf` `test` `chore`
  - Examples: `feat(clock): add pattern 5` · `fix(controls): persist UTC offset` · `style(css): mobile-first refactor`
- **Always `git diff` before committing** — review every change.
- **Stop and show `git diff` after each task** — confirm with user before proceeding.
- **`git push` requires explicit user confirmation** — push deploys immediately to production.
- Use the `git-commit-messaging` skill for all commit messages.

---

## Logging System

`js/logger.js` provides a structured development logger, kept entirely separate from application code.

```js
// Log a named event with optional data payload
Logger.log('section', 'message', { optional: 'data' });

// Time measurements
Logger.time('hero-image');       // start a named timer
Logger.timeEnd('hero-image');    // stop timer, log elapsed ms

// Inspect stored logs
Logger.dump();                   // print all session logs to console
Logger.clear();                  // clear sessionStorage log store
```

- Entries buffered in memory — no synchronous storage I/O on `log()` calls.
- On `beforeunload`, buffer is flushed to `sessionStorage` and a summary snapshot written to `localStorage`.
- Logger is passive: it never throws, never blocks execution.
- `Logger.flush()` — write buffer to sessionStorage immediately (e.g. before an expected crash).
- Remove `<script src="js/logger.js">` from HTML before production deployment if not needed.
