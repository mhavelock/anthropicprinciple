# Sprint History — Architecture Documentation

Completed sprint log. Each entry is a summary of what was built, not a session transcript.

---

## Sprint: Iteration 1 — Foundation ✅ 2026-04-05

**Goal:** Establish accurate architecture documentation for anthropicprinciple.ai. Rewrite all files that were incorrectly copied from the that-guy iOS project.

**Delivered:**
- `ARCHITECTURE.md` — primary blueprint: structural decisions (8 ADRs), file structure, CSS load order, clock engine phases, controls → clock data flow, conventions, protected files
- `SYSTEM.md` — developer rules: naming conventions (CSS, JS, files), file organisation map, CSS/JS/HTML rules, commit conventions
- `CORE_PATTERNS.md` — G1–G13 global constraints, "why" history for each, detailed pattern examples (6 patterns), regression checklist
- `DECISIONS.md` — 11 ADRs covering: zero deps, CSS tokens, rAF/visibilitychange, pre-allocated buffers, Float64Array cache, GPU compositor, clock.css isolation, localStorage, --ctrl-* namespace, debounce, Gill Sans exception
- `ARCHITECTURE_EXTENSION.md` — coding standards, design token reference (breakpoints, spacing, colours, typography), known pitfalls, logger docs, testing reference, common commands
- `STANDARDS.md` — standards tables: performance (including PageSpeed 100 status), HTML, CSS, JS, accessibility (WCAG AA), SEO; needs-review register for 3 open items
- `FEEDBACK-LOOPS.md` — FL-01 to FL-10: 5 wins-that-became-rules, 2 deliberate limits, 3 hard rules
- `BREAKTHROUGHS.md` — B-01 to B-05: per-frame alloc, Float64 cache, GPU compositor, CSS namespace, debounce
- `deployment.md` — GitHub Pages, branches, deploy flow, local dev options, GitHub Actions history, verification checklist, DNS/domain
- `infrastructure.md` — what exists (GitHub Pages only) and what doesn't; security posture summary
- `security.md` — site security (user data, external links, JS safety) + dev environment security (path guards, session constraints)
- `CODEBASE-AUDIT.md` — exclusion list, Strategy A chunks (A1–A6), G1–G13 audit table, anti-hallucination rule, doc accuracy audit prompt
- `CLAUDE_ARCHITECTURE.md` — context file for architecture sessions, file map with load levels (L1/L2/L3), sub-project rules
- `system-design-tasks.md` — documentation task register, removed files log, backlog
- `.ai/context.md` — stable project facts, key constraints table, open items
- `.ai/active_sprint.md` — sprint state
- `.ai/sprint-history.md` — this file
- `.ai/roadmap.md` — coverage map, milestone tracker
- Deleted: `pedant-responsiveness.md`, `pipeline-listening.md`, `pipeline-roasting.md` (that-guy artefacts)
- Fixed: `docs/plan/discovery/digit-reference.md` project header
- Updated: `GEMINI-CONSULTANCY.md`, `REFLECTIVE-SYNC.md` project references
- Updated: `CHECKPOINTS.md` trigger points for web project
- `docs/plan/plan-rules.md` — rewritten for static web project (task types: CODE/STYLE/HTML/DOCS/DEPLOY/USER)
- `docs/plan/tasklist.md` — complete rewrite: open tasks S1–S3, H1, T1–T2, ARC1–ARC3; completed tasks PERF1–8, CSS1–5, A11Y1–4, SEO1–4, SEC1–3, GH1
