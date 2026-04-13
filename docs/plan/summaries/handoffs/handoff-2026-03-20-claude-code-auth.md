# Session Handoff — 2026-03-20 — Claude Code OAuth Setup

## Session Type
Configuration / tooling — no code changes to the project itself.

## What Was Done

### Goal
Set up `CLAUDE_CODE_OAUTH_TOKEN` for Claude Code authentication.

### Outcome
Resolved. Token is stored in macOS Keychain (written by Claude Code natively). Shell loads it securely at startup.

### Steps Covered
1. Discussed `CLAUDE_CODE_OAUTH_TOKEN` — what it is, how it works, auth priority order.
2. Attempted `claude setup-token` via Claude Code shell — failed (no raw mode in non-interactive shell). User ran it manually in their own terminal.
3. Discussed storage options — ruled out `~/.zshrc` (plain text, sync risk) and `~/.claude/.credentials.json` (macOS uses Keychain, not that file; also missing refreshToken/expiresAt).
4. Discovered actual Keychain service name: **`Claude Code-credentials`** (confirmed via `security dump-keychain`).
5. Recommended and confirmed this `~/.zshrc` pattern:

```bash
export CLAUDE_CODE_OAUTH_TOKEN=$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null)
```

6. User confirmed a GitHub agentic workflow ("Daily Testify Uber Super Expert #6") re-ran successfully. Pre-activation green; activation halted with skip condition (1 item found, threshold 1) — confirmed as expected deduplication behaviour, not an error.

## Key Facts Established

| Item | Value |
|------|-------|
| macOS Keychain service name | `Claude Code-credentials` |
| Credentials file (Linux/Windows only) | `~/.claude/.credentials.json` |
| Recommended macOS approach | Keychain + `security find-generic-password` in `.zshrc` |
| Token source | `claude setup-token` run interactively in terminal |

## State at Session End
- OAuth token working
- No project files modified
- GitHub workflow running as expected

## Next Session
No outstanding actions from this session. Resume normal project work.
