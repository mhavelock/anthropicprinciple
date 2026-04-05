# SYSTEM.md — anthropicprinciple.ai

**Purpose:** Developer rules of engagement. What to do, what never to do, naming conventions, and constraints that keep the codebase consistent. Read this alongside `ARCHITECTURE.md` before making changes.

---

## Rules of Engagement

### Before Making Any Change
1. Read `ARCHITECTURE.md §"What We Never Do"` — confirm the change doesn't violate a hard constraint.
2. If touching `clock.js` or `clock.css`, read the §"Protected files" section — these files have near-zero tolerance for behavioural change.
3. If modifying any CSS, confirm the change uses CSS custom properties — never hardcoded colour or spacing values.
4. If touching `controls.js`, confirm localStorage reads are sanitised and text inputs are debounced.

### After Making a Change
1. If the change alters a structural decision in `ARCHITECTURE.md`, update that file.
2. Write a handoff to `docs/plan/handoff_YYYY-MM-DD.md` at session end.
3. Mark completed tasks in `docs/plan/tasklist.md`.

---

## Naming Conventions

### CSS

| Pattern | Convention | Example |
|---------|-----------|---------|
| Component root | `.component` | `.card` |
| Component child | `.component-element` | `.card-title`, `.card-body` |
| Modifier | `.mod-variant` | `.mod-featured` |
| JS-applied state | `.is-state` | `.is-open`, `.is-active`, `.is-hidden` |
| JS selector only (never styled) | `.js-hook` | `.js-toggle` |
| Utility | `.u-utility` | `.u-sr-only`, `.u-flex-center` |
| Custom property — global | `--color-*`, `--space-*`, `--font-*` | `--color-text`, `--space-md` |
| Custom property — clock | `--clk-*` | `--clk-bg`, `--clk-hand` |
| Custom property — controls | `--ctrl-*` | `--ctrl-bg`, `--ctrl-accent` |

### JS

| Element | Convention | Example |
|---------|-----------|---------|
| Module variables | camelCase | `lastAngle`, `chunkSize` |
| Constants | SCREAMING_SNAKE_CASE | `CHUNK_DURATION_MS`, `MIN_INTERVAL_MS` |
| Private module vars | `_prefixed` camelCase | `_bufOut`, `_lastAngles` |
| Functions | camelCase | `applyAngles()`, `loadConfig()` |

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Stylesheets | kebab-case | `colors.css`, `border-effect.css` |
| JS files | camelCase | `clock.js`, `favicon-animator.js` |
| HTML pages | kebab-case | `clock-controls.html` |

---

## File Organisation — Where Does X Live?

| What | Where |
|------|-------|
| All design tokens | `styles/colors.css` |
| Font declarations | `styles/fonts.css` |
| Clock-specific tokens (`--clk-*`) | `styles/clock.css` |
| Controls page tokens (`--ctrl-*`) | `styles/controls.css` |
| Shared base resets, 12-col grid | `styles/global.css` |
| Reusable UI components | `styles/components.css` |
| Page-specific home styles | `styles/home.css` |
| Page-specific controls styles | `styles/controls.css` |
| Utility helpers (`u-*`) | `styles/utilities.css` |
| Clock animation engine | `js/clock.js` |
| Favicon animation | `js/favicon-animator.js` |
| Controls panel logic | `js/controls.js` |
| Viewport / resize handling | `js/main.js` |
| Dev logging | `js/logger.js` |

---

## CSS Rules

- **One responsibility per stylesheet.** Never mix concerns across files.
- **Load order matters.** `colors.css` always first. `utilities.css` always last.
- **Alphabetical properties** within each rule block.
- **`box-sizing: border-box`** in every stylesheet reset.
- **`:focus-visible` not `:focus`** — keyboard focus rings only.
- **Hover, focus, active states only.** No `:visited` state anywhere.
- **Mobile-first always.** `@media (min-width: ...)` only. Never `max-width` for layout breakpoints.
- **No `!important`.** Find a lower-specificity solution.
- **No inline styles.** Never use the `style` attribute.
- **CSS custom properties for every colour, spacing value, and transition duration.** Never hardcode.
- **`rem` for spacing** (layout distances consistent regardless of local font-size). **`em` for font sizes** (scales with element context).
- **Never override `html` or `body` font-size.** Browser default (16px) is preserved for accessibility.

---

## JS Rules

- **IIFE or module pattern throughout.** No globals.
- **`const` and `let` only.** No `var`.
- **`requestAnimationFrame` for all animation loops.** Never `setInterval` for animations.
- **Timestamp-based throttle inside rAF.** Compare `now - lastFrame >= MIN_INTERVAL` before executing frame work.
- **`visibilitychange` listener on every rAF loop.** Pause when hidden, resume on restore.
- **Pre-allocate at module init.** No array or object creation inside the rAF hot path.
- **Sanitise localStorage before use.** Parse as integer, clamp to valid range, or validate with regex.
- **No `eval`, no `innerHTML` with dynamic content.**
- **`defer` on all `<script>` tags.** Never blocking.

---

## HTML Rules

- **W3C valid.** Run `npx html-validate` before any commit touching HTML.
- `<!doctype html>` lowercase, first line.
- `<meta charset="UTF-8">` first in `<head>`.
- `lang="en"` on `<html>`.
- `defer` on all `<script>` tags.
- Semantic landmarks on every page: `<main>`, `<header>`, `<nav>`, `<footer>`.
- One `<h1>` per page; heading hierarchy sequential — never skip levels.
- Every `<input>` paired with `<label for="...">`.
- Every `<img>` has `alt`, `width`, `height`.
- `rel="noopener noreferrer"` on all `target="_blank"` links.

---

## Commit Conventions

Follow Conventional Commits (`type(scope): description`):

| Type | When |
|------|------|
| `feat` | New feature or page |
| `fix` | Bug fix |
| `style` | CSS-only changes |
| `refactor` | Code restructure, no behaviour change |
| `perf` | Performance improvement |
| `chore` | Tooling, CI, config |
| `docs` | Documentation only |
| `a11y` | Accessibility fix or improvement |
| `seo` | SEO-only changes |

Scope examples: `clock`, `controls`, `css`, `favicon`, `html`, `seo`, `perf`, `a11y`
