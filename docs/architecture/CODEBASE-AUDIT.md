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
