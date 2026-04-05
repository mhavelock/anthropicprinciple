# STANDARDS.md — anthropicprinciple.ai

A record of the quality standards established and maintained across this project. Covers performance, HTML, CSS, JS, accessibility, and SEO. Intended as both a quality benchmark for future sessions and an honest account of what is still open.

---

## Performance Standards

### Targets

| Metric | Target | Current status |
|--------|--------|----------------|
| Google PageSpeed — Mobile | ≥ 95 | ✅ 100 |
| Google PageSpeed — Desktop | ≥ 95 | ✅ 100 |
| Zero third-party scripts on `index.html` | Required | ✅ |
| `defer` on all `<script>` tags | Required | ✅ |
| All images with `alt`, `width`, `height` | Required | ✅ |
| rAF loops pause when tab is hidden | Required | ✅ |
| No per-frame heap allocations in clock engine | Required | ✅ |

### Animation Performance

| Standard | Status |
|----------|--------|
| `requestAnimationFrame` — not `setInterval` | ✅ Both loops |
| `visibilitychange` pause on both rAF loops | ✅ Both loops |
| `will-change: transform` on `.hand` | ✅ |
| `contain: layout style paint` on `.mc` | ✅ |
| Pre-allocated output buffers (`_buf*`) | ✅ |
| `Float64Array` angle cache (`_lastAngles`) | ✅ |
| Pattern trig throttled to ~30fps | ✅ |
| Ease windows at 60fps | ✅ |
| Static display at 1fps | ✅ |
| Angle strings rounded to 2dp | ✅ |

---

## HTML Standards

| Standard | Status |
|----------|--------|
| W3C valid — no errors, no warnings | ✅ (validate after any HTML change) |
| `<!doctype html>` lowercase | ✅ |
| `<meta charset="UTF-8">` first in `<head>` | ✅ |
| `lang="en"` on `<html>` | ✅ |
| One `<h1>` per page, sequential heading hierarchy | ✅ |
| Semantic landmarks: `<main>`, `<header>`, `<nav>`, `<footer>` | ✅ |
| Every `<input>` paired with `<label for="...">` | ✅ |
| Every `<img>` has `alt`, `width`, `height` | ✅ |
| `rel="noopener noreferrer"` on all `target="_blank"` | ✅ |
| `defer` on all `<script>` tags | ✅ |
| No inline `<script>` blocks | ✅ |
| No inline `style` attributes | ✅ |

---

## CSS Standards

| Standard | Status |
|----------|--------|
| All colours defined as CSS custom properties | ✅ |
| All spacing defined as CSS custom properties | ✅ |
| Mobile-first (`min-width` breakpoints only) | ✅ |
| No `max-width` breakpoints for layout | ✅ |
| `box-sizing: border-box` in every reset | ✅ |
| Alphabetical properties within rule blocks | ✅ |
| No `!important` | ✅ |
| No inline styles | ✅ |
| One responsibility per stylesheet | ✅ |
| Load order: `colors.css` first, `utilities.css` last | ✅ |
| `--clk-*` namespace isolated in `clock.css` | ✅ |
| `--ctrl-*` namespace isolated in `controls.css` | ✅ |
| `rem` for spacing, `em` for font sizes | ✅ |
| `html`/`body` font-size never overridden | ✅ |

---

## JS Standards

| Standard | Status |
|----------|--------|
| IIFE / module pattern — no globals | ✅ |
| `const`/`let` only — no `var` | ✅ |
| `requestAnimationFrame` for all animations | ✅ |
| `visibilitychange` on all rAF loops | ✅ |
| Timestamp throttle inside rAF | ✅ |
| Pre-allocated buffers at module init | ✅ |
| `Float64Array` cache for angle comparison | ✅ |
| localStorage sanitised before use | ✅ |
| Debounced writes for text inputs | ✅ |
| No `eval`, no `innerHTML` with dynamic content | ✅ |

---

## Accessibility Standards (WCAG 2.1 AA)

| Standard | Status |
|----------|--------|
| Keyboard navigation: Tab order | ✅ |
| Keyboard: Enter/Space on buttons | ✅ |
| Keyboard: Escape to close overlays | ✅ |
| `:focus-visible` rings on all interactive elements | ✅ |
| `prefers-reduced-motion` respected | ✅ (all animation stylesheets) |
| `prefers-color-scheme` dark mode | ✅ |
| `aria-label` on unlabelled navigation | ✅ |
| `role="status" aria-live="polite"` on status output | ✅ |
| `aria-labelledby` on `<section>` elements | ✅ |
| Colour contrast ≥ 4.5:1 for text | ⚠️ Open: `.side p` text fails AA (see task S1) |
| `.u-sr-only` utility available | ✅ |

---

## SEO Standards

| Standard | Status |
|----------|--------|
| `<title>` on every page | ✅ |
| `<meta name="description">` on every page | ✅ 130+ char |
| Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`) | ✅ |
| `<link rel="canonical">` on every page | ✅ |
| JSON-LD structured data (`WebApplication`) | ✅ |
| `<meta name="robots" content="index, follow">` | ✅ |
| `site.webmanifest` | ✅ |
| `theme-color` meta | ✅ |

---

## Needs Review

Issues identified but not yet resolved:

| # | Issue | File | Severity |
|---|-------|------|----------|
| S1 | `.side p` text fails WCAG AA contrast (2.85:1 vs 4.5:1 required) | `home.css` | ⚠️ Medium |
| S2 | Aside positioning uses magic numbers (`right: calc(-50vw + 1.25rem)`, `top: -17rem`) | `home.css` | ⚠️ Low |
| S3 | `.side p` uses Gill Sans — intentional exception to the Verdana/Arial system, but undocumented in ADR form | `home.css` | ⚠️ Low |
