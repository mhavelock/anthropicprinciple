# qr-claude-code-hooks: Writing portable, fork-safe hooks

> **Hooks in `.claude/hooks/*.sh` run on every tool call. They must work on every developer's machine, never block legitimate work, and never leak the original author's username via hardcoded paths. This qref documents the four rules that make a hook portable.**
>
> *Forward-looking on this project: anthropicprinciple has no `.claude/hooks/*.sh` today. The user-level guard at `~/.claude/hooks/guard-paths.sh` is the only active hook. These rules apply pre-emptively — any future repo-level hook must comply on first commit.*

---

## Symptom

You fork a repo (or share `.claude/` with a collaborator) and discover one or more of:

- `bash: /Users/<original-author>/.../change-log.sh: No such file or directory` — the hook references the original author's home dir.
- The hook silently fails to log because `mkdir` couldn't create a directory in someone else's home.
- A `change-log.sh` ran successfully but wrote to a path you can't see (cross-host shared volume).
- A hook returns non-zero and Claude Code refuses to run the tool — even though the hook's intent was diagnostic, not gating.

The repo's CLAUDE.md mentions hooks "should just work" but they don't, and the failure mode is silent or noisy in unhelpful ways.

---

## Root cause

Hooks are shell scripts. They inherit no portability for free. Three failure patterns:

1. **Hardcoded absolute paths.** `/Users/mat/...` is fine on Mat's machine, useless on a fork. Path must be derived at runtime.
2. **Fail-loud when fail-silent is right.** A logging hook that exits non-zero blocks the tool call. Logging is diagnostic — it should never gate.
3. **Assume root.** Hooks run wherever Claude Code's CWD is. They cannot assume `git rev-parse` will succeed (e.g. running outside a repo) or that any absolute path exists.

---

## Worked example — the `change-log.sh` portability fix

Original (works only on the author's machine):

```bash
#!/bin/bash
# .claude/hooks/change-log.sh — pre-edit log

LOG_DIR="/Users/mat/Claudette/Cowork/.claude-logs"
mkdir -p "$LOG_DIR"
echo "$(date) | $TOOL_NAME | $TOOL_INPUT" >> "$LOG_DIR/edits.log"
```

Problems:

- `/Users/mat/...` doesn't exist on a fork.
- `mkdir -p` fails silently, then `>>` fails loudly with "No such file or directory."
- The hook's exit code is non-zero on failure, so Claude Code may refuse the underlying tool call.
- Mat's username appears in tracked files — small but real privacy leak.

Portable rewrite:

```bash
#!/bin/bash
# .claude/hooks/change-log.sh — pre-edit log

set -u  # error on undefined vars; do NOT set -e (we want to fail-soft)

# Cross-project log dir if env-var set, else project-local fallback.
# Fallback resolves to <repo-root>/.claude/logs/, which is in .gitignore.
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
LOG_DIR="${COWORK_LOG_DIR:-$PROJECT_ROOT/.claude/logs}"

mkdir -p "$LOG_DIR" 2>/dev/null || exit 0

LOG_FILE="$LOG_DIR/edits.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') | ${TOOL_NAME:-unknown} | ${TOOL_INPUT:-}" >> "$LOG_FILE" 2>/dev/null

exit 0  # always succeed — logging never blocks a tool call
```

What changed:

- **`COWORK_LOG_DIR` env var first.** A user who wants centralised cross-project logs sets `COWORK_LOG_DIR=~/Claudette/.claude-logs` in `~/.zshrc`. Otherwise the hook falls back per-project.
- **`git rev-parse --show-toplevel` derives repo root** with `2>/dev/null || pwd` fallback for non-repo contexts.
- **`mkdir -p ... 2>/dev/null || exit 0`** — if mkdir fails, give up cleanly without breaking the tool call.
- **`exit 0` at the end** — diagnostic hooks never gate.

---

## Remedy — the four rules

### Rule 1: No hardcoded user paths

**Bad:**

```bash
LOG_DIR="/Users/mat/Claudette/Cowork/.claude-logs"
BACKUP_DIR="/Users/mat/.claude-backups"
```

**Good:**

```bash
LOG_DIR="${COWORK_LOG_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.claude/logs}"
BACKUP_DIR="${COWORK_BACKUP_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.claude/.backups}"
```

Pattern: **env-var primary, project-local fallback**. The fallback path must be in `.gitignore` so logs/backups don't get committed.

### Rule 2: Diagnostic hooks always exit 0

If the hook's purpose is **logging, backup, or telemetry** — never block on failure:

```bash
do_logging || true
exit 0
```

If the hook's purpose is **gating** (e.g. path-guard, secret-scanner) — exit non-zero is intentional. But document it explicitly at the top of the file:

```bash
#!/bin/bash
# guard-paths.sh — GATING HOOK. Exits non-zero to block out-of-zone edits.
```

The default for "is this a gating hook?" should be "no."

### Rule 3: Use `set -u` not `set -e`

- `set -u` — error on undefined variables. Catches typos.
- `set -e` — exit on any non-zero return. **Avoid in hooks** because it turns "the log directory doesn't exist" into "the tool call is blocked."

If a section of the hook genuinely needs `set -e`, scope it:

```bash
(
  set -e
  # critical section
)
# back to fail-soft
```

### Rule 4: Validate inputs at the top

```bash
TOOL_NAME="${TOOL_NAME:-unknown}"
TOOL_INPUT="${TOOL_INPUT:-}"

# Sanitise — TOOL_INPUT may contain newlines or shell metacharacters
TOOL_INPUT_SAFE="$(echo "$TOOL_INPUT" | tr -d '\n' | head -c 500)"
```

Hooks receive arbitrary tool input via env vars. Don't pipe it directly into commands without truncating and stripping.

---

## Adding a new hook

1. **Pick the trigger.** Pre-tool-use? Post-tool-use? Document this in the script header.
2. **Decide gating vs diagnostic.** If diagnostic, exit 0 always.
3. **Use the env-var-first path pattern** — never hardcode.
4. **Test on a fresh clone.** `git clone <repo> /tmp/test-fork && cd /tmp/test-fork && claude` — verify hooks run cleanly without the original author's home dir.
5. **Document in CLAUDE.md.** A hook that exists but isn't documented in the project's CLAUDE.md is a hook that confuses every fork.
6. **Add the path to `.gitignore` if it produces output** (logs, backups). Use the project-local fallback path.

---

## Sample hook header

```bash
#!/bin/bash
#
# .claude/hooks/<name>.sh
#
# Trigger: <PreToolUse|PostToolUse|UserPromptSubmit|Stop|SubagentStop>
# Type:    <gating|diagnostic>
# Outputs: <path or none>
#
# Env vars consumed:
#   - TOOL_NAME, TOOL_INPUT (set by Claude Code)
#   - COWORK_LOG_DIR, COWORK_BACKUP_DIR (optional cross-project paths)
#
# This hook is <gating|diagnostic>. <Failure mode statement>.

set -u
```

The header alone tells a fork everything they need to fork-test.

---

## See also

- `CORE_PATTERNS.md` — **G14** (env-var-driven hook paths) and **G15** (gitignore session-tracker artefacts), once Phase B of the architecture redux lands.
- `DECISIONS.md` — **ADR-014** (`--skip-push-sessions` for AI session-trackers), once Phase B lands.
- Claude Code docs: [Hooks reference](https://docs.claude.com/en/docs/claude-code/hooks).
- This repo's hooks: *(none at repo level today; only `~/.claude/hooks/guard-paths.sh` at user level)*.
