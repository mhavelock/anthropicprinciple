# Deployment — anthropicprinciple.ai

## Overview

Single deployment target: **GitHub Pages** from the `main` branch. No build step. No server. Push to `main` and the site updates automatically.

---

## Site Identity

| Field | Value |
|-------|-------|
| Domain | anthropicprinciple.ai |
| Hosting | GitHub Pages |
| Repository | https://github.com/mhavelock/anthropicprinciple |
| Production branch | `main` |
| Development branch | `dev` |
| CNAME file | `CNAME` (root of repo — `anthropicprinciple.ai`) |

---

## Branches

| Branch | Purpose | Auto-deploys? |
|--------|---------|--------------|
| `dev` | Development work — not deployed | No |
| `main` | Production — GitHub Pages source | Yes |

**Workflow:** work on `dev` → test locally → merge to `main` → auto-deploys.

Never push untested changes directly to `main`.

---

## Deployment Process

No build required. Deployment = `git push origin main`.

```bash
# Standard deploy flow
git checkout dev
# ... make changes, test locally ...
git add [files]
git commit -m "type(scope): description"
git checkout main
git merge dev
git push origin main
# GitHub Pages updates within ~60 seconds
```

---

## Local Development

```bash
# Option 1: npx live-server (recommended)
npx live-server
# Opens http://127.0.0.1:8080 with auto-reload on file save

# Option 2: VS Code Live Server extension
# Opens http://127.0.0.1:5500

# Option 3: Python
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Why not just open `index.html` directly?** The `storage` event for cross-tab localStorage sync requires a proper origin (not `file://`). Use a local server for any controls ↔ clock testing.

---

## GitHub Actions

The repository has a portfolio analyst workflow (`portfolio-analyst.yml`) that runs on a schedule. It was patched on 2026-03-21:
- Fixed step ordering (download logs after install)
- Fixed binary path (`/opt/gh-aw/gh-aw logs` not `gh aw logs`)
- Fixed missing `actions: read` permission
- Changed from `CLAUDE_CODE_OAUTH_TOKEN` to `ANTHROPIC_API_KEY`

See `docs/plan/archive/legacy/handoff-2026-03-21-gh-aw-portfolio-analyst-fix.md` for full context.

---

## Verification After Deploy

1. Visit https://anthropicprinciple.ai — clock should animate immediately
2. Visit https://anthropicprinciple.ai/clock-controls.html — controls should load
3. Set UTC offset → return to clock page → time should reflect the change
4. Run Google PageSpeed Insights on both URLs — verify ≥ 95
5. Check browser console — no errors or warnings

---

## DNS / Domain

| Setting | Value |
|---------|-------|
| CNAME target | GitHub Pages (mhavelock.github.io) |
| Custom domain | anthropicprinciple.ai |
| HTTPS | Enforced by GitHub Pages |
| `CNAME` file | Must be present in repo root for custom domain to persist |

If the custom domain disappears after a push, check that `CNAME` file is still in the repo root.
