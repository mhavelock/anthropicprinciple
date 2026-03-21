# Session Handoff — 2026-03-20 — GitHub Agentic Workflows Secret Fix

## Session Type
Configuration / tooling — no code changes to the project itself.

## What Was Done

### Goal
Fix GitHub Agentic Workflows failing in a forked/copied repo with auth errors.

### Outcome
Resolved. All workflows running. Root cause was the `CLAUDE_CODE_OAUTH_TOKEN` GitHub secret containing the full JSON credentials blob instead of just the raw access token.

### Steps Covered

1. **Initial error: missing secret** — Forked repo had no `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY` secret set in GitHub. Fix: add secret via GitHub Settings → Secrets and variables → Actions.

2. **Second error: invalid header value** — After adding the secret, workflows still failed:
   ```
   API Error: Headers.append: "***" is an invalid header value.
   apiKeySource: "none"
   ```
   Root cause: user had copied the raw output of `security find-generic-password -s "Claude Code-credentials" -w`, which returns a full JSON blob, and pasted that as the secret.

3. **Keychain JSON structure discovered:**
   ```bash
   security find-generic-password -s "Claude Code-credentials" -w | jq 'keys'
   # ["claudeAiOauth"]
   ```
   The token is nested at `.claudeAiOauth.accessToken`, not `.accessToken` as initially assumed.

4. **Correct extraction command:**
   ```bash
   security find-generic-password -s "Claude Code-credentials" -w | jq -r '.claudeAiOauth.accessToken'
   ```
   Returns a plain `sk-ant-oat01-...` string. This is the value that must be stored as the GitHub secret.

5. **Disable workflows question** — User wanted to disable GitHub AW temporarily. Options discussed:
   - GitHub UI: Actions tab → click workflow name → `...` menu → "Disable workflow" (requires workflow to have run at least once; only shows if user has admin)
   - Delete lock files (recommended): `rm .github/workflows/*.lock.yml` — regenerate with `gh aw compile`
   - Rename to `.lock.yml.disabled`

## Key Facts Established

| Item | Value |
|------|-------|
| Keychain JSON key path | `.claudeAiOauth.accessToken` (not `.accessToken`) |
| Correct extraction command | `security find-generic-password -s "Claude Code-credentials" -w \| jq -r '.claudeAiOauth.accessToken'` |
| GitHub secret name | `CLAUDE_CODE_OAUTH_TOKEN` |
| GitHub secret value | Raw `sk-ant-oat01-...` string only — not the JSON blob |
| AWF proxy warning (safe to ignore) | "API proxy enabled but no API keys found" — proxy looks for `ANTHROPIC_API_KEY`; OAuth token is handled directly by Claude Code, not the proxy |
| `aw/imports` folder | Must be copied manually when forking — does not auto-regenerate |

## State at Session End
- All GitHub Agentic Workflows running correctly in forked repo
- No project files modified

## Next Session
No outstanding actions from this session. Resume normal project work.
