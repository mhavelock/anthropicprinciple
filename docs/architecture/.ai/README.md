# .ai/ — Architecture Sprint System

Companion to `docs/plan/` session handoffs. Session handoffs capture what happened in a single session. This folder tracks mid-term goals, sprint progress, and stable architecture context across sessions.

---

## Files

| File | Purpose | Load when |
|------|---------|-----------|
| `README.md` (this file) | System guide | First time only |
| `roadmap.md` | Architecture doc coverage, next sprint, backlog | Starting a documentation sprint |
| `memory/active_sprint.md` | Current sprint goal + status | Every architecture session start |
| `memory/context.md` | Stable project facts, key constraints, open items | Session start (or reference) |
| `memory/sprint-history.md` | Completed sprint log | Reviewing what's been done |

---

## Load Order for Architecture Sessions

```
1. docs/plan/handoff_[latest].md         ← what happened last session
2. docs/architecture/.ai/memory/active_sprint.md  ← what are we doing now
3. docs/architecture/.ai/roadmap.md      ← where are we in the big picture
4. docs/architecture/.ai/memory/context.md  ← stable facts (if needed)
5. The specific arch file being worked on
```

Skip `context.md` if you have stable project knowledge from CLAUDE.md or MEMORY.md — it's reference material, not required reading every session.

---

## How This Works With Session Handoffs

```
docs/plan/handoff_*.md        → "What did we do today?"
docs/architecture/.ai/        → "Where are we in the multi-session plan?"
```

The handoff is short-term. The .ai/ system is mid-term. Together they give the full picture without each file trying to do both jobs.

**At session end:** Update `active_sprint.md` + write handoff to `docs/plan/`. If a sprint completes, move its entry to `sprint-history.md` and set up the next sprint.

---

## Updating the System

| Event | What to update |
|-------|---------------|
| Sprint starts | `active_sprint.md` — set goal + dates |
| Work done in sprint | `active_sprint.md` — tick off items |
| Sprint complete | Move to `sprint-history.md`, start new sprint |
| Stable fact changes (app identity, key constraint) | `context.md` |
| Architecture doc added or removed | `roadmap.md` coverage table |
| New mid-term goal | `roadmap.md` next-sprint section |

---

## Context Token Budget

The `.ai/` directory should not exceed ~15,000 tokens total. If it does, the system is accumulating rather than compressing — and it will start degrading session context rather than improving it.

**Healthy size targets:**

| File | Target |
|------|--------|
| `active_sprint.md` | < 60 lines |
| `context.md` | < 80 lines |
| `sprint-history.md` | 20–30 lines per sprint; compress older entries |
| `roadmap.md` | < 100 lines |
| `README.md` | < 60 lines |

**When a file exceeds its target:** compress the older/resolved entries to 2-line summaries and move the full details to a corresponding archive file (e.g., `sprint-history-archive.md`). The archive is kept as a permanent record but is never loaded into sessions unless specifically requested.

**Archive pattern — applies broadly across all project docs:**
- Active file: 2-line compressed entry (what + date)
- Archive file: full original content, appended in reverse-chronological order
- Archive files live alongside their parent (e.g., `BREAKTHROUGHS-archive.md` beside `BREAKTHROUGHS.md`)
- Load the archive only when you need to understand *why* something was done, not just *what*
