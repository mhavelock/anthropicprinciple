# Reflective Architecture — Sync System

How the documentation, memory, and skills work together to maintain architectural coherence across sessions. Read this once to understand the system; then follow the rituals automatically.

---

## The Core Problem

AI sessions have context limits. Without explicit anchoring, Claude will:
- Drift from established patterns ("recency bias" — optimises for the immediate fix)
- Re-introduce solved problems
- Invent "architectural patterns" from accidental code
- Lose track of the "why" behind constraints

The Reflective Architecture system solves this with three mechanisms: **live docs** (what the architecture is), **memory files** (what the AI needs to know between sessions), and **commands** (how to trigger the right checks at the right moment).

---

## Folder Map

```text
anthropicprinciple/
│
├── CLAUDE.md                           ← Full project context (read on every session)
│
├── docs/
│   ├── architecture/                   ← Architecture sub-project
│   │   ├── ARCHITECTURE.md             ← Blueprint: structural decisions + data flows (primary) ★
│   │   ├── ARCHITECTURE_EXTENSION.md   ← Coding standards, token ref, pitfalls, testing
│   │   ├── SYSTEM.md                   ← Rules: naming, never-do, patterns ★
│   │   ├── DECISIONS.md                ← 11 ADRs
│   │   ├── FEEDBACK-LOOPS.md           ← Wins, limits, hard rules ★
│   │   ├── BREAKTHROUGHS.md            ← Reflective process record
│   │   ├── GEMINI-CONSULTANCY.md       ← Gemini MCP audit + consultancy protocol ★
│   │   ├── FE-VISUALISATION.md         ← Visual debug — Python snap, Playwright ★
│   │   ├── six-hats.md                 ← Approach models (Six Hats, Red Team, MapReduce…)
│   │   ├── CODEBASE-AUDIT.md           ← Exclusion list, Strategy A chunks, G1–G13 table
│   │   ├── CORE_PATTERNS.md            ← Compact do-not-break checklist — read before code changes ★
│   │   ├── CHECKPOINTS.md              ← Auto-checkpoint triggers, mini-checkpoint format
│   │   ├── REFLECTIVE-SYNC.md          ← This file
│   │   ├── CLAUDE_ARCHITECTURE.md      ← CLAUDE.md for architecture sessions
│   │   ├── system-design-tasks.md      ← Documentation task register
│   │   ├── deployment.md               ← GitHub Pages, branches, deploy process
│   │   ├── infrastructure.md           ← What exists server-side (answer: nothing)
│   │   ├── security.md                 ← Site security + dev environment security
│   │   ├── STANDARDS.md                ← Performance, HTML, CSS, JS, a11y, SEO tables
│   │   └── .ai/                        ← Architecture sprint system
│   │       ├── README.md               ← Load order + system guide
│   │       ├── roadmap.md              ← Coverage map, backlog, milestones
│   │       └── memory/
│   │           ├── active_sprint.md    ← Current sprint (lean) ★
│   │           ├── context.md          ← Stable project facts
│   │           └── sprint-history.md   ← Completed sprints log
│   │
│   ├── plan/                           ← Session management (active)
│   │   ├── plan-rules.md               ← Rules for this system
│   │   ├── tasklist.md                 ← Canonical task register ★
│   │   ├── handoff_YYYY-MM-DD.md       ← Latest session handoff ★
│   │   ├── archive/                    ← Historic handoffs + legacy summaries
│   │   └── discovery/                  ← Research + reference material
│   │       ├── digit-reference.md      ← Hand-angle tables for all 10 digits
│   │       ├── system-architecture.md  ← General AI dev workflow reference
│   │       ├── orchestrated-agent-teams.md ← Multi-agent orchestration patterns
│   │       └── parallel-thinking.md    ← Parallel thinking / Full-Spectrum Architect notes
│   │
│   ├── ARCHITECTURE.md                 ← Brief legacy overview (superseded by architecture/)
│   └── FILE_MANIFEST.md                ← Every file described
│
└── .claude/
    └── settings.local.json
```

★ = Read at session start

---

## The Sync Ritual

### Session Start

Load minimum context:

```text
Read docs/plan/handoff_[latest].md, docs/plan/tasklist.md, and docs/ARCHITECTURE.md.
The task is: [task description].
```

For architecture work, also load `active_sprint.md`.

### Before a Significant Code Change

Check against constraints:

```text
Read docs/architecture/CORE_PATTERNS.md.
I'm about to [describe change]. Does this violate any of G1–G13?
```

### After Completing Code Changes

Check if docs need updating:

```text
I changed [file]. Does docs/ARCHITECTURE.md or docs/SYSTEM.md need updating?
```

### Session End

Write handoff per `docs/plan/plan-rules.md` Rule 1.

---

## Skills Reference

| Skill | Relevance to This Project | When to Use |
|-------|--------------------------|-------------|
| `git-commit-messaging` | ★★★ Universal | Every commit — generates Conventional Commits format |
| `fe-visualisation` | ★★★ Primary | Default for any visual/layout question — Python snap first |
| `frontend-standards` | ★★★ Always relevant | Any HTML/CSS/JS writing or review |
| `run-python-screenshot` | ★★ Explicit snap | Force OS-level screenshot |
| `run-playwright` | ★ Browser-specific | When viewport or interaction is needed before screenshot |

---

## Anti-Patterns to Watch For

| Anti-pattern | Symptom | Fix |
|-------------|---------|-----|
| **Recency bias** | Re-introduces `setInterval` after seeing it in another codebase | `CORE_PATTERNS.md` G3 — check before changes |
| **Goldfish memory** | Re-adds `max-width` breakpoints that were already removed | Load `SYSTEM.md §CSS Rules` at session start |
| **Hallucinating intent** | Documents a workaround as a "deliberate pattern" | Read source before writing docs |
| **Stale documentation** | `ARCHITECTURE.md` describes a buffer system that was refactored | Run doc accuracy audit after any clock.js change |
| **Silent assumptions** | Assumes `will-change` is still in `clock.css` without checking | Mark OPEN/check in handoffs |
| **Context cliff** | Mid-session context >70% full — constraints get forgotten | Early handoff write + recovery checkpoint |

---

## The Three-Layer Memory Stack

```text
Layer 1 — PERSISTENT (always loaded)
  CLAUDE.md                      Project identity, constraints, terminology
  MEMORY.md (auto-memory)        Cross-session facts

Layer 2 — SESSION CONTEXT (loaded at session start)
  docs/plan/handoff_[latest].md  What happened, what's open
  docs/plan/tasklist.md          Canonical tasks
  active_sprint.md               Architecture sprint state
  ARCHITECTURE.md                Structural decisions, protected files

Layer 3 — ON-DEMAND (loaded when relevant)
  CORE_PATTERNS.md               Before any code change — do-not-break checklist
  SYSTEM.md                      Before writing code or reviewing patterns
  DECISIONS.md                   When a decision needs historical context
  FEEDBACK-LOOPS.md              When passing context to Gemini; before risky changes
  ARCHITECTURE_EXTENSION.md      Before audits, code review, new dev environment
  GEMINI-CONSULTANCY.md          Before a Gemini consultancy call
  FE-VISUALISATION.md            Before visual/layout debugging
  six-hats.md                    When a decision needs structured thinking
  CODEBASE-AUDIT.md              Before any full audit session
  CHECKPOINTS.md                 Log awareness reference, auto-trigger conditions
```

Keep Layer 3 files out of context unless actively needed.
