# Architecture Documentation — Roadmap

Mid-term view. What's been built, what's next, and what's in the backlog.

---

## Current Sprint

**Sprint:** Maintenance & Documentation
**Goal:** Keep architecture docs accurate as the site evolves. No active deliverable in flight.
**Status:** Active — open-ended maintenance. See `active_sprint.md`.

---

## Coverage Map — Architecture Docs

All files in `docs/architecture/`. Every row is ✅ Done, 🔄 Needs update, or ⬜ Planned.

| File | Status | Last update | Summary |
|------|--------|-------------|---------|
| `ARCHITECTURE.md` | ✅ Done | 2026-04-05 | Primary: 8 structural decisions, file structure, CSS load order, clock engine, data flow, protected files |
| `SYSTEM.md` | ✅ Done | 2026-04-05 | Developer rules: naming conventions, file organisation, CSS/JS/HTML rules, commit conventions |
| `CORE_PATTERNS.md` | ✅ Done | 2026-04-05 | G1–G13 global constraints + "why" history, 6 code patterns, regression checklist |
| `DECISIONS.md` | ✅ Done | 2026-04-05 | 11 ADRs |
| `ARCHITECTURE_EXTENSION.md` | ✅ Done | 2026-04-05 | Coding standards, design token reference, pitfalls, logger, testing reference |
| `STANDARDS.md` | ✅ Done | 2026-04-05 | Performance, HTML, CSS, JS, a11y, SEO standards tables + needs-review register |
| `FEEDBACK-LOOPS.md` | ✅ Done | 2026-04-05 | FL-01–FL-10: wins, limits, hard rules |
| `BREAKTHROUGHS.md` | ✅ Done | 2026-04-05 | B-01–B-05: 5 documented breakthroughs |
| `CHECKPOINTS.md` | ✅ Updated | 2026-04-05 | Auto-trigger table adapted for web project |
| `deployment.md` | ✅ Done | 2026-04-05 | GitHub Pages, branches, deploy process, DNS |
| `infrastructure.md` | ✅ Done | 2026-04-05 | What exists and doesn't; security summary |
| `security.md` | ✅ Done | 2026-04-05 | Site security + dev environment security |
| `CODEBASE-AUDIT.md` | ✅ Done | 2026-04-05 | Exclusion list, Strategy A chunks, G1–G13 table |
| `CLAUDE_ARCHITECTURE.md` | ✅ Done | 2026-04-05 | Architecture session context, file map with load levels |
| `system-design-tasks.md` | ✅ Done | 2026-04-05 | Documentation task register |
| `GEMINI-CONSULTANCY.md` | ✅ Updated | 2026-04-05 | Project examples updated; 7 patterns valid |
| `six-hats.md` | ✅ Carried over | Carried from that-guy | Generic approach models — fully valid |
| `FE-VISUALISATION.md` | ✅ Carried over | Carried from that-guy | Visual debug system — generic and valid |
| `REFLECTIVE-SYNC.md` | ✅ Updated | 2026-04-05 | Folder map updated for anthropicprinciple |
| `pedant-responsiveness.md` | 🗑️ Deleted | 2026-04-05 | iOS-specific — no equivalent |
| `pipeline-listening.md` | 🗑️ Deleted | 2026-04-05 | iOS-specific — no equivalent |
| `pipeline-roasting.md` | 🗑️ Deleted | 2026-04-05 | iOS-specific — no equivalent |

---

## Discovery Material to Process

Files in `docs/plan/discovery/` that may warrant architecture integration:

| File | What | Integration status |
|------|------|--------------------|
| `digit-reference.md` | Hand-angle notation for all 10 digits (0–9) in the clock display | ⬜ Not integrated — reference only |
| `orchestrated-agent-teams.md` | Multi-agent orchestration patterns | ⬜ Not reviewed for this project |
| `parallel-thinking.md` | Cognitive diversification / parallel thinking patterns | ⬜ Not reviewed — likely absorbed by six-hats.md |
| `system-architecture.md` | General AI-assisted dev reference | ⬜ Not reviewed — generic reference |

**Note:** Discovery docs are research/reference material, not project documentation. Integrate only if a specific technique is worth capturing in the project's approach docs.

---

## Backlog — Future Architecture Work

| Item | What | Trigger |
|------|------|---------|
| Clock animation pipeline deep dive | Full `clock.js` data flow: phase detection, pattern computation, blend, ease, static, apply | When changes to clock.js are needed |
| Favicon animator deep dive | Canvas animation approach, throttle, visibilitychange | If debugging favicon issues |
| ADR-011 expansion | Gill Sans exception formally documented in DECISIONS.md | When S3 task is addressed |
| STANDARDS.md update | Mark S1 (WCAG contrast) as resolved | After task S1 complete |
| Discovery doc integration | Review `orchestrated-agent-teams.md` + `system-architecture.md` | When using multi-agent session approaches on this project |

---

## Milestone Tracker

| Milestone | Status | Notes |
|-----------|--------|-------|
| Architecture foundation — all core docs | ✅ Complete 2026-04-05 | Full rewrite: ARCHITECTURE, SYSTEM, CORE_PATTERNS, DECISIONS, STANDARDS, deployment, infrastructure, security |
| Reflective system — approach models, checkpoints | ✅ Complete 2026-04-05 | Carried over from that-guy: six-hats, GEMINI-CONSULTANCY, FE-VISUALISATION, CHECKPOINTS, REFLECTIVE-SYNC, CODEBASE-AUDIT |
| Operational records — breakthroughs, feedback loops | ✅ Complete 2026-04-05 | BREAKTHROUGHS (B-01–B-05), FEEDBACK-LOOPS (FL-01–FL-10) |
| .ai/ sprint system | ✅ Complete 2026-04-05 | README, roadmap, context, active_sprint, sprint-history |
| Post-open-tasks documentation update | ⬜ Future | After S1, S2, S3 tasks resolved |
