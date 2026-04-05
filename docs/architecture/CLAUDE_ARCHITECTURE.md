# CLAUDE.md — Architecture Sub-Project

Context file for Claude Code sessions focused on anthropicprinciple.ai architecture documentation.
Working directory: `docs/architecture/`

---

## What This Sub-Project Is

Architecture documentation for the anthropicprinciple.ai static site. Written with hindsight from the working codebase. Purpose: reliable memory, context enforcement, and convention guardrails across AI sessions.

This is documentation work — not site code. The deliverables are `.md` files. When in doubt, read the source code before writing anything. Do not document features that don't exist. Do not claim constraints are met without verifying against the actual files.

---

## Reading Order for Architecture Sessions

1. `docs/architecture/.ai/memory/active_sprint.md` — current sprint state
2. `docs/architecture/ARCHITECTURE.md` — project blueprint (start here for context)
3. `docs/architecture/SYSTEM.md` — developer rules
4. `docs/plan/handoff_[latest].md` — what happened last session
5. The specific file being worked on

---

## File Map — What Each File Does

| File | Role | Load level |
|------|------|-----------|
| `ARCHITECTURE.md` | Primary: structural decisions, file structure, data flows, protected files | L1 — always |
| `SYSTEM.md` | Developer rules, naming conventions, never-do constraints | L1 — always |
| `CORE_PATTERNS.md` | Compact do-not-break reference — G1–G13, the "why" history | L1 — before any code change |
| `DECISIONS.md` | 11 ADRs — why specific choices were made | L2 — when a decision needs context |
| `ARCHITECTURE_EXTENSION.md` | Secondary: coding standards, token reference, pitfalls, testing | L2 — code audit, new dev environment |
| `STANDARDS.md` | Quality standards table: performance, HTML, CSS, JS, a11y, SEO | L2 — quality review |
| `FEEDBACK-LOOPS.md` | Wins locked in, limits set, hard rules — FL-01 to FL-10 | L2 — before any significant change |
| `BREAKTHROUGHS.md` | Reflective record: B-01 to B-05 | L3 — understanding the history |
| `CHECKPOINTS.md` | Auto-trigger table, mini-checkpoint format | L2 — session management |
| `deployment.md` | GitHub Pages, branches, deploy process, local dev | L2 — deploy or CI work |
| `infrastructure.md` | What infrastructure exists (answer: almost none) | L2 — when adding anything server-related |
| `security.md` | Site security posture + dev environment security | L2 — security review |
| `CODEBASE-AUDIT.md` | Exclusion list, audit chunks, G1–G13 check table | L2 — full codebase review |
| `GEMINI-CONSULTANCY.md` | Gemini MCP patterns — audit, decision validation, research | L2 — Gemini consultancy session |
| `six-hats.md` | Approach models — Six Hats, Contradiction Hunt, Red Team, MapReduce | L3 — structured decision-making |
| `FE-VISUALISATION.md` | Visual debug approach — Python snap, Playwright, tool decision tree | L2 — visual debugging |
| `REFLECTIVE-SYNC.md` | Folder map, sync ritual, memory stack — how the system works | L3 — first-time orientation |
| `system-design-tasks.md` | Architecture documentation task register | L2 — documentation sprint |
| `.ai/README.md` | Sprint system guide | L2 — architecture session start |
| `.ai/roadmap.md` | Coverage map, backlog | L2 — documentation sprint |
| `.ai/memory/active_sprint.md` | Current sprint goal + status | L2 — every architecture session |
| `.ai/memory/context.md` | Stable project facts | L2 — context anchoring |
| `.ai/memory/sprint-history.md` | Completed sprints log | L3 — reviewing history |

**Load levels:**
- **L1:** Load in every session — essential context
- **L2:** Load when the task requires it — operational reference
- **L3:** Load on demand — history, deep reference

---

## Rules for This Sub-Project

1. **Read before documenting.** Every claim about the codebase must be verified against the actual source files.
2. **Concise.** Every file should be under 1,000 words unless the content demands more. No padding.
3. **Living documents.** Update when the code changes. A doc that doesn't match the code is worse than no doc.
4. **Flag inconsistencies.** If the code contradicts the docs, mark it as "Doc debt" or "Known tension" — don't silently normalise it.
5. **No speculation.** Don't document planned features as if they exist. Document what is in the code today.
