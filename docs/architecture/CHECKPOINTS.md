# Checkpoints as External Memory

Automatic checkpoint writing at defined trigger points — not requiring the user to ask. The goal is a GitHub-workflow cadence: each significant step produces a written record, so context loss never destroys progress.

---

## The Problem

Without explicit checkpoints, the session handoff is the only durability mechanism. If context compacts mid-session, or a session ends abruptly, the in-progress state is lost. The user has to reconstruct it from memory or the chat history.

**The GitHub analogy:**

```text
Issue opened → branch created → commit pushed → CI runs → PR merged → deploy → monitoring
   ↕               ↕              ↕              ↕          ↕           ↕          ↕
 ticket          state         diff saved     test log   merged     live log   alert log
```

Every stage produces an artifact. No stage is invisible. For this project:

```text
Task starts → work done → checkpoint written → session ends → handoff → next session
   ↕              ↕              ↕                  ↕             ↕          ↕
tasklist.md   CORE_PATTERNS  mini-checkpoint     handoff.md    MEMORY.md  /session-start
```

---

## Trigger Table — When to Auto-Write a Checkpoint

Claude should self-trigger a write at each of these events without being asked.

| Trigger | What fires it | Written to | Format |
|---------|--------------|-----------|--------|
| **Significant code change complete** | Any Write/Edit to `js/`, `styles/`, or `index.html` | `docs/plan/handoff_[date].md` (running append) | "Changed: [file] — [what + why]. Regression check: [result]." |
| **Bug root-caused** | Root cause identified after investigation | `docs/plan/handoff_[date].md` | Root cause + fix in 2 sentences. Reference BREAKTHROUGHS.md if it's a meaningful pattern. |
| **Gemini consultation complete** | `ask_gemini` or `ask_gemini_pro` call resolved | `docs/plan/handoff_[date].md` | "Gemini finding: [confirmed / flagged drift / recommended change]." |
| **Browser test result** | User confirms test pass or fail in browser | `docs/plan/tasklist.md` | Update task status. Log result one line. |
| **Architecture decision made** | New pattern, constraint change, ADR-level choice | `docs/architecture/DECISIONS.md` | New ADR entry (see DECISIONS.md format). |
| **New breakthrough** | Novel approach, correct decision under pressure, avoided a wrong path | `docs/architecture/BREAKTHROUGHS.md` | New B-XX entry (see BREAKTHROUGHS.md format). |
| **New feedback loop** | Win locked in, limit set, Mat said no | `docs/architecture/FEEDBACK-LOOPS.md` | New FL-XX entry (see FEEDBACK-LOOPS.md format). |
| **Context ~70% full** | Estimated from session length / output density | `docs/plan/recovery_[date].md` | Current open tasks + any critical in-progress state. Notify user. |
| **Session end** | User signals end or context compaction imminent | `docs/plan/handoff_[date].md` | Full handoff (see plan-rules.md Rule 1 format). |

---

## Mini-Checkpoint Format

For mid-session writes (not the full end-of-session handoff), use this compact format. Append to the active handoff file.

```markdown
### Checkpoint [HH:MM]

**Changed:** `[filename]`
**What:** [One sentence — what was changed]
**Why:** [One sentence — the reason / problem solved]
**Regression check:** [Pass / OPEN items / concern flagged]
**Next:** [What comes next, or BLOCKED: reason]
```

Example:

```markdown
### Checkpoint 14:32

**Changed:** `styles/home.css`
**What:** Replaced hardcoded `#727786` with `--side-text-muted` CSS custom property
**Why:** WCAG AA contrast fix (task S1) — value was failing 4.5:1 requirement
**Regression check:** Pass — dark mode checked, layout unchanged
**Next:** Run W3C validator + PageSpeed audit — USER tasks T1/H1
```

---

## Log Awareness

Claude should proactively check these log sources at the appropriate moment — not wait for the user to paste them.

### Git Log

Always check at session start and before any diff review.

```bash
git log --oneline -10            # What changed recently
git diff HEAD~1 -- [file]        # Specific file diff
git log --oneline -- [file]      # History of a specific file
git blame [file] -L [from],[to]  # Who/what changed specific lines
```

**When to run unprompted:**
- At `/session-start` — to understand what's changed since last session
- When a user reports "something broke" — before touching any code
- Before writing any handoff — to ensure all commits are accounted for

### Browser Console Output

For runtime JS errors on the page.

**When to check console output (F12 → Console):**
- Clock animation not running
- Controls page not responding to input
- localStorage not persisting between pages
- Any visual glitch that could be JS-related

**When to ask the user to paste console output:**
- "The clock isn't animating" — check for rAF loop errors or syntax issues
- "Controls aren't saving" — check for localStorage errors or sanitisation failures
- "Favicon isn't updating" — check `favicon-animator.js` init errors

**Common patterns to look for:**

```text
Uncaught TypeError: ...             → JS error — check the file and line
Failed to read 'localStorage'       → Private browsing mode or storage quota
ReferenceError: X is not defined    → Module not loaded or wrong load order
```

### Log Triage Flow

When the user reports a runtime problem, run this sequence before touching code:

```text
1. git log --oneline -5           → Did something recent change?
2. Python snap (fe-visualisation) → What does the UI actually look like?
3. Ask for browser console output → Any JS errors?
4. Check clock.js rAF loop        → Is the loop running? visibilitychange present?
5. Check localStorage directly    → F12 → Application → Local Storage
```

---

## Implementation — How Auto-Checkpoints Work

Claude Code does not have a PostToolUse hook that can write structured content automatically. The checkpoint system works via explicit rules that Claude follows as part of its operating mode.

**Rules added to `plan-rules.md` (Rule 7)** make checkpoint writing part of the session protocol — not optional, not prompted.

**The discipline is:**
- After any Write or Edit to a source file, append a mini-checkpoint to the active handoff
- After any Gemini call, note the finding
- After a root cause is identified, write it before proposing the fix
- Before estimating context is >70% full, write a recovery checkpoint

This mirrors GitHub Actions' approach: the trigger conditions are defined upfront; the actions are automatic when conditions are met. The difference is the "automation" runs in Claude's head, not a CI runner. The key is that the triggers are explicit and the format is lightweight enough to not interrupt flow.
