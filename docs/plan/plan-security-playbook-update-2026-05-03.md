# Plan — Security Playbook Update (next session)

> **Source:** lessons learned from the white-hat-label security sweep + architecture redux on 2026-05-03. The current playbook here (`docs/plan/security-sweep-playbook.md`) is an upstream copy from white-hat-label and is byte-identical at the time of writing. This plan adds the gaps surfaced during the redux that the playbook does not yet codify.

---

## Why an update

The white-hat-label playbook served well during its own first run. Several things became clearer *after* the sweep that should be folded back in:

1. **`entire.io` was the worst offender, but it's a generic problem.** Any AI session-tracker tool with default-on push is a leak vector. The playbook mentions session-tracker dirs in passing; it should call out a category.
2. **Branch protection isn't a deliverable yet.** The playbook covers rotation and history rewriting but stops short of the "lock the door" step where you make accidental force-push impossible.
3. **Hook portability is a security concern.** Hardcoded `/Users/<name>/...` paths in tracked scripts leak the original author's username — small but real on a public repo. The playbook doesn't cover this.
4. **`settings.local.json` accumulation.** The playbook mentions Claude Code settings once. After this session, it's clear the file accumulates broad-scope permissions over weeks unless explicitly trimmed (e.g. `Bash(python3 *)`, `Bash(git filter-repo *)`).
5. **Phase 0 is good but missing two checks.** It catches `.env` history, vendor tokens, and client-side env leaks. It should also check (a) shadow branches like `entire/checkpoints/v1`, and (b) branch protection state.

---

## Proposed changes (sequential, each independently committable)

### Change 1 — Phase 0 expansion: two new checks

Add two checks to the Phase 0 triage block (sits alongside the existing `.env`, vendor-token, and client-bundle checks):

**4. Shadow branches from session-tracker tools:**

```bash
git for-each-ref refs/remotes/origin --format='%(refname:short)' \
  | grep -iE '^origin/(entire|aider|cursor|checkpoint|snapshot|backup|transcript)/' \
  || echo "NONE"
```

**5. Branch protection on default branch (GitHub):**

```bash
gh api repos/:owner/:repo/branches/main/protection 2>/dev/null \
  | jq -r '"force_pushes:" + (.allow_force_pushes.enabled|tostring) + " deletions:" + (.allow_deletions.enabled|tostring)' \
  || echo "NO PROTECTION"
```

Update the Phase 0 deliverable block to show all five checks:

```text
.env in history:        <count or NONE>
Vendor token hits:      <count or NONE>
Client-side env leaks:  <count or NONE>
Shadow branches:        <list or NONE>
Branch protection:      <intact / no protection / disabled>
```

---

### Change 2 — New section: "AI session-tracker hygiene"

Sits between Phase 1 §C (`.gitignore` sanity) and §D (five-grep history sweep). Generalises the entire.io lesson.

Content to include:

- **Category definition:** any tool that watches your editor session and persists artefacts is a session-tracker. entire.io, aider, cursor-derived tools, AI commit-message generators with auto-push.
- **Default-on push is the failure mode.** Most assume auto-push to `origin` is helpful. On a public repo, those checkpoint commits are full transcripts.
- **Three controls** (in priority order):
  1. **Opt out at the tool** before first use (e.g. `entire enable --skip-push-sessions`). Gitignore alone is not enough — the tool's own push hook bypasses the working tree.
  2. **Gitignore the artefact dir** as a defence-in-depth.
  3. **Branch protection** so even if the tool tries to push, the remote refuses force/non-fast-forward.
- **Worked example:** the entire.io case from white-hat-label (8 local + 1 remote shadow branch, 9 transcript commits, no credentials but full IP/process leak). Cite the commit (`62c7752` in white-hat-label).

---

### Change 3 — New section: "Tracked-script portability"

Add to "Lock the door behind you" (§Phase 2). Two rules:

- **No hardcoded `/Users/<name>/...` paths** in any tracked shell/script file. Pattern:

  ```bash
  LOG_DIR="${COWORK_LOG_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.claude/logs}"
  ```

  Cross-project env var if set; project-local fallback otherwise. Fallback path goes in `.gitignore`.

- **Diagnostic hooks always exit 0.** A logging hook that exits non-zero blocks the underlying tool call. `set -u` (catch typos) but not `set -e` (don't propagate non-fatal failures). Gating hooks (path-guards) are the exception and must document this at the top of the script.

Cross-ref white-hat-label's `qref/qr-claude-code-hooks.md` for the full four-rule pattern with worked example.

---

### Change 4 — Expand `settings.local.json` audit

The current playbook has one bullet ("audit `.claude/settings.local.json`"). Replace with a sub-section:

- **List broad wildcards.** `Bash(python3 *)`, `Bash(node -e *)`, `Bash(git config *)`, `Bash(git filter-repo *)` — each is an arbitrary-code-execution surface within the allowed sandbox. Default to denying them; allow narrow patterns instead.
- **List session-scoped one-offs.** Permissions that were granted for a single diagnostic command (e.g. an `awk` invocation with a literal filename argument) are dead weight after the session. Trim periodically.
- **List read paths outside the repo.** `Read(~/.zshrc)`, `Read(~/.config/**)`, etc. — review whether they're still needed.
- **Quarterly cadence:** trim alongside the security sweep.

---

### Change 5 — Branch protection as a deliverable (not just a tip)

Promote branch protection from a one-bullet mention in "Lock the door behind you" to a numbered Phase 2 step. Concrete command:

```bash
gh api -X PUT repos/<owner>/<repo>/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

Note: `enforce_admins: false` retains owner bypass for legitimate emergency rewrites (e.g. the filter-repo that often accompanies a sweep). Document the bypass; do not hide it.

---

### Change 6 — Phase 1 deliverable: add three rows

Two rows for the new Phase 0 checks, one for hook portability:

| Area | Finding | Severity | Owner | Action |
|---|---|---|---|---|
| Shadow branches (entire/, aider/, cursor/) | (count or NONE) | HIGH / NONE | YOU | Strip + opt out + gitignore |
| Branch protection on `main` | (intact / disabled / absent) | LOW | YOU | Re-add via `gh api` |
| Hardcoded user paths in tracked scripts | (count or NONE) | LOW | DEV | Convert to env-var with fallback |

---

### Change 7 — Update "Per-project quick reference"

Add three new fields to the template:

```text
Branch protection:           <intact/disabled/absent — date verified>
AI session-tracker tools:    <list — entire.io, aider, etc. — opt-out status>
Tracked-script portability:  <verified/un-audited>
```

---

## Suggested entry prompt for next session

```text
Read docs/plan/plan-security-playbook-update-2026-05-03.md and the upstream
playbook at docs/plan/security-sweep-playbook.md. Apply the seven proposed
changes in order. Each change is independently committable — show the diff
for the first one, get sign-off, then proceed. Do not push.

The white-hat-label playbook is at:
~/Claudette/Cowork/projects/white-hat-label/docs/security-sweep-playbook.md
(currently byte-identical to ours; this update intentionally diverges).

Cross-reference white-hat-label's qref/qr-public-repo-hygiene.md and
qref/qr-claude-code-hooks.md for the worked-example detail. Decide whether
to mirror those qref files into this project or just link to the white-hat-label
copies.

Stop after all 7 changes commit; suggest user push.
```

---

## Estimated effort

~60–90 minutes of focused session time. Each change is small (≤ 50 lines of doc additions). The bulk of the time is verifying that white-hat-label's playbook hasn't drifted again before fork-merging.

---

## What this plan is NOT

- Not a rewrite of the playbook. The current playbook is good; this is targeted additions.
- Not a security sweep of anthropicprinciple itself. That's a separate task — run the playbook (after these updates land) as its own session.
- Not the architecture redux. That's the companion plan (`plan-architecture-redux-2026-05-03.md`).
