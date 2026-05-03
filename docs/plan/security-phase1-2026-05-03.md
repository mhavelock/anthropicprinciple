# Security Sweep — anthropicprinciple.ai — 2026-05-03

> Run of the playbook in `docs/plan/security-sweep-playbook.md`. This deliverable mirrors the format used by white-hat-label's `docs/security-phase1-2026-05-03.md` and is referenced from the architecture-redux Phase E specification.

---

## Per-project quick reference

```text
Project:               anthropicprinciple.ai
Repo URL:              https://github.com/mhavelock/anthropicprinciple
Visibility:            PUBLIC
Live URL:              https://anthropicprinciple.ai/
Vendor stack:          (none — static HTML/CSS/JS, GitHub Pages, no third-party services on the live site)
Adjacent dev tooling:  Gemini MCP (env-ref to GOOGLE_API_KEY), Anthropic API (used by gh-aw workflow only)
Last sweep:            2026-05-03
Hosted-env provider:   GitHub Pages (apex CNAME)
Auth tokens to rotate: NONE (Phase 0 found zero in-history secrets)
Pre-commit hook:       not yet installed
CI secret scan:        not yet installed
Branch protection:     not yet enabled (recommended next step)
```

---

## Phase 0 result — clean

| Check | Finding |
|---|---|
| `.env*` ever committed (full history) | NONE |
| Vendor-prefixed live tokens (Shopify, Stripe, OpenAI, Anthropic, OpenRouter, Resend, GitHub PAT, GitLab PAT, AWS, Slack webhook, Google `AIza`, OAuth `ya29.`, JWT `eyJ.*.*.*`) | NONE |
| PEM private-key blocks in history | NONE |
| Generic `(SECRET\|TOKEN\|...) = value` patterns | NONE (one false positive matched the literal string `"TOKEN ANTHROPIC_API_KEY"` — the env var *name*, not a value) |
| Client-bundle env-var leak | N/A — static site, no JS bundling, no `process.env.*` in source |

**No keys to rotate.** Same posture as the white-hat-label run — IP/process exposure only, no credentials in history.

---

## Phase 1 findings — entire.io exposure

The structural shape was identical to white-hat-label: an AI session-tracker tool (`entire.io`) had been silently committing transcripts to the public repo since the project began.

| Area | Finding | Severity | Status |
|---|---|---|---|
| Public shadow branch | `origin/entire/checkpoints/v1` @ `4a4e695` — full session content world-readable on the public GitHub repo | **HIGH** | ✅ Closed: branch deleted on origin |
| `.entire/` directory tracked in `main` history | `.entire/.gitignore`, `.entire/settings.json`, `.entire/metadata/cc200072-…/full.jsonl`, `prompt.txt`, three `tasks/toolu_…/checkpoint.json` files | **HIGH** | ✅ Closed: `git filter-repo --invert-paths --path .entire/` |
| Hex content dirs (`01/`, `0a/`, `18/`, …) tracked in `main` history | 303 paths total: `metadata.json`, `full.jsonl`, `prompt.txt`, `content_hash.txt` per session | **HIGH** | ✅ Closed: `git filter-repo --path-glob '[0-9a-f][0-9a-f]/'` |
| 4 local `entire/*` branches | Local-only (never pushed) — `entire/3e8502d-…`, `entire/910f78c-…`, `entire/d0de779-…`, `entire/checkpoints/v1` | LOW | ✅ Intentionally retained — local rewind capability; not a leak vector |
| `Entire-Checkpoint:` trailers in 54 commit message bodies on `main` | Metadata referencing the now-stripped session content | INFORMATIONAL | ✅ Closed: stripped via `--message-callback` in same filter-repo run |
| `.gitignore` missing `.entire/`, `[0-9a-f][0-9a-f]/`, `.env.*`, `.aider*`, `.cursor/`, `.DS_Store` | Future entire/aider/cursor sessions could re-introduce the leak | MEDIUM | ✅ Closed: `.gitignore` expanded |
| `entire enable --skip-push-sessions` not configured | Without it, session payloads auto-push on every `git push` | MEDIUM | ✅ Closed: `entire.io` v0.5.5 configured with `push_sessions: false` in `.entire/settings.json` (lives in gitignored dir) |
| `/Users/mat/` paths in 2 tracked files | `qref/qr-claude-code-hooks.md` (pedagogical "bad-example" code in a markdown fence) and `security.md` (documents the `Cowork`-zone path-guard hook) | INFORMATIONAL | Verified pedagogical, no leak |
| `.mcp.json` Gemini MCP config | Always env-referenced (`${GOOGLE_API_KEY}`); never had inline key in any commit | INFORMATIONAL | No action needed |
| Branch protection on `main` | Currently OFF (`gh api .../protection` returns 404) | MEDIUM | ⚠️ Open — recommended next step: enable with `allow_force_pushes:false`, `allow_deletions:false` |
| 4 stale remote branches | `assets/automated-portfolio-analyst`, `fix/portfolio-analyst-gh-aw-step-order`, `memory/campaigns`, `memory/testify-expert` | LOW | ⚠️ Open — separate decision |

---

## What was actually executed (commands)

```bash
# 1. Pre-flight
git fetch origin
git add .gitignore
git commit -m "chore(security): expand .gitignore for AI session-tracker artefacts"
cp -r ../anthropicprinciple ../anthropicprinciple-backup-2026-05-03   # 84 MB safety copy

# 2. Configure entire to stop pushing session logs (preserves local-only use)
entire enable --skip-push-sessions --force --agent claude-code

# 3. Strip entire artefacts + trailers from main only (keeps local entire/* rewind branches)
git filter-repo --force --refs main \
  --invert-paths \
  --path .entire/ \
  --path-glob '[0-9a-f][0-9a-f]/' \
  --message-callback "return b'\n'.join(l for l in message.split(b'\n') if not l.startswith(b'Entire-Checkpoint:')).rstrip() + b'\n'"

# 4. Push the rewritten history (force-with-lease, run by user — harness deny on git push --force*)
git push --force-with-lease origin main
git push origin --delete entire/checkpoints/v1
```

### Pre/post metrics

| Metric | Before | After |
|---|---|---|
| Commits on `main` | 81 | 80 (one all-empty commit dissolved) |
| `Entire-Checkpoint:` trailers on `main` | 54 | 0 |
| `.entire/` + hex-dir paths added on `main` | 303 | 0 |
| Local `entire/*` rewind branches | 4 | 4 (preserved) |
| Public `entire/*` branches on origin | 1 (`entire/checkpoints/v1`) | 0 |

---

## Reality check

`git filter-repo` + force-push **does not un-leak** what was already cloned. Anyone who had cloned `anthropicprinciple` before 2026-05-03 retains the original `.entire/` content on disk. Working assumption (per Mat): no clones in the wild. The point of the rewrite is to stop *new* viewers from seeing the transcripts, not to retroactively redact.

Phase 0 confirmed zero credential strings in the leaked content — the practical exposure is bounded to chat transcripts (prompts, file paths discussed, design conversations). Same shape as the white-hat-label finding.

Mat opted to rotate `GOOGLE_API_KEY` and `ANTHROPIC_API_KEY` as defence-in-depth; neither was observed in the leak.

---

## Outstanding items (for a follow-up session)

1. **Enable branch protection on `main`** — `gh api -X PUT repos/mhavelock/anthropicprinciple/branches/main/protection ...`. Requires user hand (`gh api -X PUT` likely deny-listed in current Claude Code permissions).
2. **Decide on the 4 stale remote branches** — `memory/campaigns`, `memory/testify-expert`, `assets/automated-portfolio-analyst`, `fix/portfolio-analyst-gh-aw-step-order`. None contain leaked content; cleanup is hygiene-only.
3. **Pre-commit token-scan hook + CI secret scanner (`gitleaks` / `trufflehog`)** — listed in the playbook's "lock the door" section. Not yet installed on this project.
4. **`SECURITY.md` + `.well-known/security.txt`** — public-repo disclosure contact. Listed in the playbook; not yet added.

---

## Cross-references

- Playbook used: `docs/plan/security-sweep-playbook.md`
- Plan that drove this run: `docs/plan/plan-architecture-redux-2026-05-03.md` § Phase E
- Companion plan with playbook gaps to fold in: `docs/plan/plan-security-playbook-update-2026-05-03.md`
- Backup taken before filter-repo: `~/Claudette/Cowork/projects/anthropicprinciple-backup-2026-05-03/` (84 MB; safe to delete after a working week of confirmed normality)
