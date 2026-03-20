# Claude Templates — anthropicprinciple.ai

Prompt templates and document templates for use with Claude Code on this project.

---

## Template 1 — Code Review

Use after any significant change. Paste this prompt directly into Claude Code.

```
Taking into account the best practices docs in the project docs/ folder, please run a code review on what we have. Look for:
- Better code organisation
- Clean code improvements
- Performance improvements
- Browser memory usage issues
- Security issues

Update the md docs and memory file, then add and commit to git. Suggest any additional best practice improvements and anything important I may have forgotten. Check changes didn't break completed task functionality.
```

---

## Template 2 — Commit Message

Invoke the skill instead of writing manually:

```
/git-commit-messaging
```

Or describe the change and ask:

```
Write a commit message for: [describe what changed]
```

Format: `type(scope): description` — types: `feat` `fix` `style` `refactor` `docs` `perf` `test` `chore`

Examples:
- `feat(clock): add pattern 5`
- `fix(controls): persist UTC offset on reload`
- `perf(clock): throttle pattern phase to 30fps`
- `docs(claude): update file manifest`

---

## Template 3 — GitHub Agentic Workflow Debug

Use when a gh-aw workflow fails in GitHub Actions.

```
The workflow [workflow-name] is failing. Here are the logs: [paste logs]

Please identify the root cause and suggest a fix.
```

**Common causes checklist:**
- [ ] `CLAUDE_CODE_OAUTH_TOKEN` secret not set in repo Settings → Secrets → Actions
- [ ] Secret is a JSON blob — extract the raw token with:
  ```bash
  security find-generic-password -s "Claude Code-credentials" -w | jq -r '.claudeAiOauth.accessToken'
  ```
- [ ] `.github/aw/imports/` folder missing (must be copied manually when forking)
- [ ] Lock file (`.lock.yml`) missing — regenerate with `gh aw compile`

---

## Template 4 — Session Handoff

### Light Handoff (use for tooling/config sessions with no code changes)

File path: `docs/summaries/handoff-YYYY-MM-DD-[topic].md`

```markdown
# Session Handoff — YYYY-MM-DD — [Topic]

## Session Type
[Configuration / Feature / Bug fix / Refactor / Docs] — [brief qualifier]

## What Was Done

### Goal
[One sentence: what were we trying to achieve?]

### Outcome
[Resolved / Partial / Blocked] — [one sentence on result]

### Steps Covered
1. [Step]
2. [Step]
3. [Step]

## Key Facts Established

| Item | Value |
|------|-------|
| [Fact] | [Value] |

## State at Session End
- [Bullet: what is working]
- [Bullet: what files were modified, if any]

## Next Session
[What to pick up next, or "No outstanding actions."]
```

### Full Handoff (use for feature/code sessions)

```markdown
# Session Handoff — YYYY-MM-DD — [Topic]

## Session Type
[Type] — [qualifier]

## What Was Done

### Goal
[What were we trying to achieve?]

### Outcome
[Result summary]

### Changes Made

| File | Change |
|------|--------|
| [path] | [what changed] |

### Steps Covered
1. [Step with outcome]
2. [Step with outcome]

## Key Facts & Decisions

| Item | Value / Decision |
|------|-----------------|
| [Item] | [Value] |

## Known Constraints
- [Any gotchas, limits, or non-obvious rules established this session]

## State at Session End
- [What is working]
- [What is not working / deferred]

## Checklist Status

### Mat's Checklist
- [ ] Clock animation runs correctly
- [ ] Countdown mode works
- [ ] localStorage persists across reload
- [ ] Controls page inputs save on change
- [ ] Keyboard accessible
- [ ] Responsive at 320 / 480 / 768 / 1024 / 1440px
- [ ] Landscape mode fits viewport
- [ ] Dark mode verified

### Claude's Checklist
- [ ] No inline styles
- [ ] No `!important`
- [ ] No `max-width` media queries
- [ ] `box-sizing: border-box` in every reset
- [ ] CSS custom properties for all colours/spacing
- [ ] `defer` on all scripts
- [ ] Schema.org JSON-LD present

## Next Session
[What to pick up, with priority order]
```

---

## Template 5 — New Feature Brief

Use to kick off a new feature implementation cleanly.

```
I want to add [feature name] to anthropicprinciple.ai.

Context:
- [What it should do]
- [Where it lives — index.html / clock-controls.html / new page]
- [Any constraints — no JS if CSS can do it, no dependencies, etc.]

Before writing any code, please:
1. Read the relevant existing files
2. Confirm your approach with me
3. Then implement
```

---

## Template 6 — PageSpeed Audit

```
Please run a PageSpeed / performance audit on the current state of the project.

Check against the criteria in CLAUDE.md (Performance Features section) and identify anything that would drop the score below 95 on mobile or desktop. List issues by priority.
```
