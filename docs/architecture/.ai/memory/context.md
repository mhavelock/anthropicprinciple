# Architecture Context — Stable Project Facts

Stable reference. This changes infrequently. Load when you need project identity, stack, or constraint anchoring.

---

## Site Identity

| | |
|-|-|
| **Name** | anthropicprinciple.ai |
| **GitHub** | https://github.com/mhavelock/anthropicprinciple |
| **Live site** | https://anthropicprinciple.ai/ |
| **Hosting** | GitHub Pages — branch `main` auto-deploys |
| **Type** | Static art installation website |
| **Stack** | Vanilla HTML5, CSS3, JS (ES2020+) — zero dependencies |
| **Pages** | `index.html` (clock), `clock-controls.html` (settings) |

---

## Stack (confirmed from code)

- HTML5, CSS3 (custom properties, Grid, Flexbox), JS ES2020+ (IIFE modules, `const`/`let`)
- No npm, no bundler, no framework
- Two rAF loops: `js/clock.js`, `js/favicon-animator.js`
- Settings persistence: `localStorage` only (4 keys)
- CSS tokens: `--color-*`, `--space-*`, `--font-*` (global), `--clk-*` (clock), `--ctrl-*` (controls)

---

## Key Constraints — Never Regress These

| Constraint | Why |
|-----------|-----|
| `will-change: transform` on `.hand` | Promotes 168 hands to GPU compositor layers at paint time |
| `contain: layout style paint` on `.mc` | Scopes style recalculation to each cell — no cascade |
| Pre-allocated `_buf*` arrays in `clock.js` | No per-frame allocations in the hot path |
| `Float64Array _lastAngles` cache | Skip DOM write if angle unchanged |
| `visibilitychange` on both rAF loops | Zero background CPU usage |
| `clock.js` timing constants unchanged | 30-second cycle is the product — must never drift |
| `clock.css` visual values unchanged | Keyframes and grid are the product |
| Mobile-first CSS (`min-width` only) | All stylesheets comply — no `max-width` layout breakpoints |
| No inline styles | No `style` attribute anywhere in HTML |

---

## Open Items (as of 2026-04-05)

| Item | Status |
|------|--------|
| S1: Fix `.side p` WCAG contrast | ⚠️ Open |
| S2: Fix aside positioning magic numbers | ⚠️ Open |
| S3: Document Gill Sans exception as formal ADR | ⚠️ Open |
| H1: W3C validation pass after any HTML change | ⚠️ Ongoing |
| T1: PageSpeed audit after any JS/CSS change | ⚠️ Ongoing |
