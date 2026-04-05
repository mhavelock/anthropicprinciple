# Architecture Documentation — Task Register

Sub-project: `docs/architecture/`
Purpose: Track the state of architecture documentation for anthropicprinciple.ai — what's been written, what needs updating, and what's in the backlog.

---

## Principles
- Every file must be derived from the actual code, not assumed or invented.
- Flag inconsistencies as "Doc debt" or "Known tension" rather than silently correcting them.
- Keep files dense and load-bearing. No padding. Under 1,000 words unless complexity demands more.
- Files are living documents — update when the code changes.

---

## Current State — All Documentation Files

| File | Status | Notes |
|------|--------|-------|
| `ARCHITECTURE.md` | ✅ Done 2026-04-05 | Structural decisions, file structure, data flows, protected files |
| `SYSTEM.md` | ✅ Done 2026-04-05 | Developer rules, naming, CSS/JS/HTML rules, commit conventions |
| `CORE_PATTERNS.md` | ✅ Done 2026-04-05 | G1–G13 global constraints + "why" history, patterns 1–6, regression checklist |
| `DECISIONS.md` | ✅ Done 2026-04-05 | 11 ADRs: zero deps, CSS tokens, rAF, buffers, Float64 cache, compositor, clock isolation, localStorage, ctrl namespace, debounce, Gill Sans |
| `ARCHITECTURE_EXTENSION.md` | ✅ Done 2026-04-05 | Coding standards, design token reference, known pitfalls, logger docs, testing reference |
| `STANDARDS.md` | ✅ Done 2026-04-05 | Performance, HTML, CSS, JS, a11y, SEO standards tables |
| `FEEDBACK-LOOPS.md` | ✅ Done 2026-04-05 | FL-01 to FL-10: wins, limits, hard rules |
| `BREAKTHROUGHS.md` | ✅ Done 2026-04-05 | B-01 to B-05: per-frame alloc, Float64 cache, compositor, CSS namespace, debounce |
| `CHECKPOINTS.md` | ✅ Carried over | Generic checkpoint system — valid for this project with minor reference updates |
| `deployment.md` | ✅ Done 2026-04-05 | GitHub Pages, branches, deploy process, local dev, CNAME |
| `infrastructure.md` | ✅ Done 2026-04-05 | What exists (GitHub Pages only), what doesn't exist |
| `security.md` | ✅ Done 2026-04-05 | Site security + dev environment security |
| `CODEBASE-AUDIT.md` | ✅ Done 2026-04-05 | Exclusion list, Strategy A chunks, G1–G13 table, anti-hallucination rule |
| `CLAUDE_ARCHITECTURE.md` | ✅ Done 2026-04-05 | Context file for architecture sessions, file map with load levels |
| `GEMINI-CONSULTANCY.md` | ✅ Updated 2026-04-05 | Project examples updated; patterns 1–7 generic and valid |
| `six-hats.md` | ✅ Carried over | Generic approach models — valid for this project |
| `FE-VISUALISATION.md` | ✅ Carried over | Visual debug system — generic and valid |
| `REFLECTIVE-SYNC.md` | ✅ Updated 2026-04-05 | Folder map updated for anthropicprinciple |
| `system-design-tasks.md` | ✅ Done 2026-04-05 | This file |
| `.ai/README.md` | ✅ Carried over | Sprint system guide — generic and valid |
| `.ai/roadmap.md` | ✅ Done 2026-04-05 | Coverage map, backlog |
| `.ai/memory/active_sprint.md` | ✅ Done 2026-04-05 | Current sprint state |
| `.ai/memory/context.md` | ✅ Done 2026-04-05 | Stable project facts |
| `.ai/memory/sprint-history.md` | ✅ Done 2026-04-05 | Sprint history |

---

## Removed Files (that-guy artefacts)

These files were copied from the that-guy project and have been deleted as they have no equivalent in anthropicprinciple.ai:

| File | Why removed |
|------|------------|
| `pedant-responsiveness.md` | iOS app feature — no equivalent |
| `pipeline-listening.md` | iOS audio pipeline — no equivalent |
| `pipeline-roasting.md` | iOS roasting feature — no equivalent |

---

## Backlog — Future Documentation Work

| Item | What | Trigger |
|------|------|---------|
| Clock animation pipeline deep dive | Document the blend/ease/static phase logic in detail | When changes to clock.js are needed |
| Favicon animator deep dive | Document the canvas animation approach | If debugging favicon issues |
| `DECISIONS.md` ADR-011 expansion | Document Gill Sans exception formally | When S3 task is addressed |
| Post-WCAG-fix update | Update STANDARDS.md when S1 is resolved | After task S1 complete |
