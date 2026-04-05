# Active Sprint

**Sprint:** Maintenance & Documentation
**Started:** 2026-04-05
**Goal:** Keep architecture docs accurate as the site evolves. No active deliverable in flight — documentation foundation complete.

---

## In Progress

Nothing currently in flight.

---

## Session 2026-04-05 — Done

| Item | Date |
|------|------|
| Complete rewrite of all `docs/architecture/` files — was that-guy copies, now anthropicprinciple-specific | 2026-04-05 |
| `docs/plan/` restructured: plan-rules.md, tasklist.md, archive structure | 2026-04-05 |
| Wrong files deleted: pedant-responsiveness.md, pipeline-listening.md, pipeline-roasting.md | 2026-04-05 |
| digit-reference.md header fixed (was "erudit0rum", now "anthropicprinciple.ai") | 2026-04-05 |
| FE-VISUALISATION.md rewritten — clock-specific visual debugging; digit-reference.md integration; viewport matrix | 2026-04-05 |
| CODEBASE-AUDIT.md extended — §6 Future Audit Plan + 6 Gemini consulting prompts | 2026-04-05 |
| CLAUDE.md corrected — file structure, git workflow (main-only current, dev future) | 2026-04-05 |
| README.md corrected — docs links, file structure tree | 2026-04-05 |

---

## Ready to Pick Up

Open tasks from the main tasklist — see `docs/plan/tasklist.md` for full details.

| Task | Type | Notes |
|------|------|-------|
| S1: Fix `.side p` WCAG contrast | STYLE | `#727786` on `#292b31` ≈ 2.85:1 — fails AA |
| S2: Fix aside positioning magic numbers | STYLE | Low priority — no user-visible regression |
| H1: W3C validation pass | HTML | Run after any HTML change |

---

## Completing Condition

This sprint is open-ended. Start a new focused sprint when:
- A significant code feature is built that requires new architecture documentation
- A discovery doc in `docs/plan/discovery/` is ready to integrate
- A post-change review pass is needed

---

## Next Architecture Sprint Ideas

| Sprint | Trigger |
|--------|---------|
| Post-S1 WCAG fix | After task S1 complete — update STANDARDS.md |
| Clock pipeline deep dive | If clock.js changes are needed — document the blend/ease/static logic |
| Discovery doc integration | `orchestrated-agent-teams.md` + `system-architecture.md` not yet reviewed |
