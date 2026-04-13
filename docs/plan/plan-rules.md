# Plan System — Rules

Working rules for the `docs/plan/` session management system. These exist so any AI session can pick up cleanly without losing context or making inconsistent decisions.

---

## The System

```text
docs/plan/
├── plan-rules.md           This file — read first
├── tasklist.md             Canonical task register (all tasks, open + completed)
├── handoff_YYYY-MM-DD.md   Latest session handoff — updated at session end
└── archive/                Historic handoffs and old summaries — moved here when no longer active
```

---

## Rule 1 — Always write a handoff at session end

Before the session ends (or before context compaction), write `handoff_YYYY-MM-DD.md`.

Use today's date. If a handoff already exists for today, append session letter: `handoff_2026-04-05b.md`.

**Minimum handoff content:**
- What was accomplished (files changed, decisions made)
- Current state (what works, what doesn't)
- Open tasks (which are unblocked, which are blocked and why)
- Any open questions (mark OPEN — never silently assume)
- Next session recommendation

**Never:** Leave session state only in the chat context. It will be lost.

---

## Rule 2 — All tasks go in tasklist.md

`tasklist.md` is the canonical task register. Every task — open or completed — lives here.

- Open tasks: ⚠️ TODO or 🔲 Untested
- Completed tasks: ✅ Done YYYY-MM-DD
- Blocked tasks: ⛔ Blocked (reason + what unblocks it)
- Abandoned tasks: ~~Struck through~~ with reason

**Never delete completed tasks.** The history is the record.

Tasks are grouped by type:
- **CODE** — JS changes (no build step — edit and test in browser)
- **STYLE** — CSS-only changes
- **HTML** — HTML markup changes (structure, accessibility, SEO)
- **DOCS** — Documentation updates only
- **DEPLOY** — GitHub, CI, CNAME changes
- **USER** — Manual browser testing, PageSpeed audits, W3C validation — no code changes

---

## Rule 3 — Mark OPEN, not ASSUMED

If a question arises mid-session and cannot be definitively answered, write it explicitly:

```text
OPEN: Does the float64 cache handle the countdown edge case?
ASSUMED: Yes, based on the equality check — needs browser confirmation.
```

Never silently resolve open questions by assuming. If an assumption is wrong, the next session inherits a bug.

---

## Rule 4 — Archive old handoffs

When a sprint closes (major milestone: refactor complete, PageSpeed audit, significant feature), move all but the most recent handoff to `docs/plan/archive/`. Keep the latest handoff active for next-session pickup.

---

## Rule 5 — Context degradation recovery

If context has clearly degraded (AI references old state, gives contradictory answers, forgets constraints):

1. Write `recovery_YYYY-MM-DD.md` immediately — capture current state of all open tasks
2. Tell the user what may have been lost
3. Recommend a fresh session with this handoff as the entry point

---

## Rule 6 — Legacy summaries

`docs/plan/archive/legacy/` contains older session summaries and the original task history. **Do not modify** those files. `docs/plan/` is the active system going forward. Historical context from the archive may be referenced but is not maintained.

---

## Rule 7 — Write checkpoint after every significant code change

Do not wait until session end to write state. After any Write or Edit to a file in `js/`, `styles/`, or `index.html`, append a mini-checkpoint to the active `handoff_[date].md`.

**Mini-checkpoint format:**

```markdown
### Checkpoint [HH:MM]
**Changed:** `[filename]`
**What:** [one sentence]
**Why:** [one sentence — problem solved]
**Regression check:** [Pass / OPEN: concern]
**Next:** [next step or BLOCKED: reason]
```

Additional auto-triggers (see `docs/architecture/CHECKPOINTS.md` for full table):
- After a Gemini consultation → note the finding in the handoff
- After a root cause is identified → write it before proposing the fix
- After a browser test result → update `tasklist.md` task status
- After a new architectural decision → add ADR to `DECISIONS.md`
- When context is approaching full → write `recovery_[date].md` and notify user

Full reference: `docs/architecture/CHECKPOINTS.md`

---

## Rule 8 — Choose the right session style

Three session styles exist. Before starting work, decide which one fits the task.

| Style | When | Trigger |
|-------|------|---------|
| **Engineered Hybrid** *(default)* | Day-to-day dev, feature work, bug fixing | Read handoff + ARCHITECTURE.md + CORE_PATTERNS.md |
| **Fresh (Red Team)** | Architecture decisions, new feature design, avoiding tunnel vision | New session, ARCHITECTURE.md + task description only — no handoff |
| **Bloated (Deep)** | Mystery bugs, >2 failed attempts, "why is this failing?" | Load handoff + ARCHITECTURE_EXTENSION.md + browser console output |

**Use Hybrid unless the task explicitly requires Fresh or Deep.**

---

## Entry Prompts for New Sessions

**Engineered Hybrid (default):**

```text
Read docs/plan/handoff_[latest].md, docs/plan/tasklist.md, and docs/ARCHITECTURE.md. The task is: [task description].
```

**Fresh (Red Team):**

```text
Read docs/ARCHITECTURE.md and docs/architecture/CORE_PATTERNS.md. The task is: [task description]. Do not read any handoffs or session history. Approach this as if you have never seen this code before.
```

**Deep (Bloated):**

```text
Read docs/plan/handoff_[latest].md, docs/plan/tasklist.md, docs/ARCHITECTURE.md, docs/architecture/CORE_PATTERNS.md, and docs/architecture/ARCHITECTURE_EXTENSION.md. The issue is: [bug description]. Include browser console output below.
```

---

## Reference

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | What the site is, structural decisions, data flow |
| `docs/SYSTEM.md` | Developer rules, naming conventions, never-do constraints |
| `docs/architecture/DECISIONS.md` | Why specific technical choices were made (ADRs) |
| `docs/architecture/CORE_PATTERNS.md` | Compact do-not-break checklist — read before code changes |
| `CLAUDE.md` (project root) | Full project context for AI sessions |
