# Security Sweep Playbook

A two-phase repeatable process for any project — works whether the repo is public, private-but-shared, or solo-local. Phase 1 is **fast triage** (~10 minutes) so you can decide what's urgent and divide the work. Phase 2 is **sweep + fix** (deeper, can take hours) — Claude does the audit, you do the rotations.

The whole point: never push code without knowing what's in your history.

---

## When to run this

- Before turning a private repo public.
- After noticing anything that looks like a leak (a token in a chat log, a `.env` accidentally staged, a Bash output that captured a secret).
- Periodically — once a quarter, or before any major release.
- When onboarding a new developer (helps you find the gunk before they do).
- When a tool you trusted (transcript-tracker, AI agent, IDE plugin) starts persisting things you didn't realise it was persisting.

---

## Phase 0 — Critical-only first pass (≤ 3 min)

When the repo is **already public** (or about to go public) and you only have a few minutes, run this slimmer pass first. It answers one question: *"Is anything alarming exposed right now that I'd need to rotate before the day is out?"*

Anything that hits here jumps straight to Phase 2 rotation — don't wait for the rest of Phase 1.

### Three checks

**1. `.env*` ever committed** (single command, full history):

```bash
git log --all --diff-filter=A --name-only --pretty=format: | grep -iE '(\.env(\.|$)|\.envrc|secrets|credentials)' | sort -u
```

Any output = treat the values as published; rotate before anything else.

**2. Vendor-prefixed live tokens in history** (the secret-shaped strings that don't lie):

```bash
git log --all -p | grep -aoE 'shpat_[A-Za-z0-9]{20,}|shpca_[A-Za-z0-9]{20,}|sk_live_[A-Za-z0-9]{20,}|sk-or-[A-Za-z0-9_-]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|sk-proj-[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|glpat-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|whsec_[A-Za-z0-9]{30,}|-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----' | sort -u
```

Each unique hit = a real key to rotate at the vendor. AIza/Google Maps and JWT patterns are noisier — defer those to Phase 1's deeper sweep.

**3. Server-only env var leaking into client bundle** (the live-site equivalent of the above):

```bash
grep -rE "process\.env\.[A-Z_]+" app src components --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' 2>/dev/null \
  | grep -v "NEXT_PUBLIC_\|VITE_\|PUBLIC_" \
  | grep -lE "'use client'" $(grep -rlE "process\.env\.[A-Z_]+" app src components --include='*.ts' --include='*.tsx' 2>/dev/null) 2>/dev/null
```

Any file listed = a non-public env var is referenced in a client component. The build will inline the value into the JS bundle. Rotate the value AND move the reference server-side.

### Phase 0 deliverable

Three lines:

```text
.env in history:        <count of paths or NONE>
Vendor token hits:      <count of unique tokens or NONE>
Client-side env leaks:  <count of files or NONE>
```

If all three are NONE → proceed to Phase 1 at normal pace.
If any is non-zero → start rotation NOW (per Phase 2 order), then come back for Phase 1.

---

## Phase 1 — Fast Top-Level Sweep (≤ 10 min)

Goal: produce a one-page **status table** that tells you (a) is the repo public, (b) what kind of secrets *could* be in history, (c) is anything obviously committed that shouldn't be, and (d) is the live site leaking anything via the client.

You can divide the rotation work the moment Phase 1 finishes. Don't wait for Phase 2.

### Checklist

#### A. Repo visibility
- [ ] `git remote -v` — note the host and path.
- [ ] Open the repo URL in an **incognito/private window**. If it loads without auth → **public**. If it asks for login → private.
- [ ] If public: every commit on every pushed branch, every tag, every PR diff is world-readable. Treat anything ever committed as published.

#### B. Branch + tag inventory
- [ ] `git branch -a | wc -l` — number of branches (local + remote).
- [ ] `git tag | wc -l` — number of tags.
- [ ] `git for-each-ref refs/remotes/origin --format='%(refname:short)'` — remote branches that get force-pushed nuke history; you need to know what's pushed.
- [ ] `git log --all --oneline | wc -l` — total commits.
- [ ] Watch out for `entire/`, `checkpoint/`, `snapshot/`, `backup/`, `transcript/` branches — automated tools sometimes commit session data without you realising.

#### C. `.gitignore` sanity check
- [ ] Read `.gitignore` end-to-end. If it doesn't mention `.env*`, `node_modules`, your IDE cache, your OS metadata (`.DS_Store`, `Thumbs.db`), and any AI-tool session dirs (e.g. `.cursor/`, `.aider*`, `.claude/scheduled_tasks.lock`, `.entire/`, `00/`–`ff/` hex dirs), it's stale.
- [ ] `git ls-files | grep -E '\.env|secrets|credentials'` — should be empty (except `.env.example`).

#### D. Five-grep history sweep

Run these five commands (adjust pattern set for your provider stack):

```bash
# 1. Anything ever named .env-ish that got tracked
git log --all --diff-filter=A --name-only --pretty=format: | grep -iE '(\.env|\.envrc|secrets|credentials)' | sort -u

# 2. Vendor-prefixed token leaks (Shopify / Stripe / OpenAI / Anthropic / OpenRouter / Resend / GitHub / GitLab / AWS / Slack)
git log --all -p | grep -aoE 'shpat_[A-Za-z0-9]{20,}|shpca_[A-Za-z0-9]{20,}|sk_live_[A-Za-z0-9]{20,}|sk_test_[A-Za-z0-9]{20,}|sk-or-[A-Za-z0-9_-]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|sk-proj-[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|glpat-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ya29\.[A-Za-z0-9_-]{20,}|xoxb-[A-Za-z0-9-]{30,}|xoxp-[A-Za-z0-9-]{30,}|whsec_[A-Za-z0-9]{30,}' | sort -u

# 3. PEM keys
git log --all -p | grep -E 'BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY' | head

# 4. JSON Web Tokens
git log --all -p | grep -aoE 'eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}' | sort -u

# 5. Env-var = value lines (catches anything missed above)
git log --all -p | grep -aoE '(SECRET|TOKEN|PASSWORD|API_KEY|PRIVATE_KEY|ACCESS_KEY)[\":= ]{1,3}[\"']?[A-Za-z0-9._/+=:-]{16,}' | grep -vE 'your[-_]|placeholder|example|YOUR_|<[^>]+>' | sort -u
```

**Real hit on any of these = Phase 2 is mandatory.** False positives are common (placeholders, base64-encoded binary content) — eyeball each match.

#### E. Live site ten-minute checks

If the project deploys to a live URL:

- [ ] `curl -sI <live-url>` — note Sentry DSN, X-Powered-By, etc.
- [ ] Open DevTools Network tab on the homepage and any auth/cart/account page. Filter for `Authorization`, `cookie`, `set-cookie`, `x-api-key` headers. Check tokens are short-lived / HttpOnly / scoped.
- [ ] View-source for `process.env.*` strings inlined into client bundles (only `NEXT_PUBLIC_*` / `VITE_*` / `PUBLIC_*` should appear).
- [ ] `<live-url>/robots.txt` — sanity check (not exposing `/api/`, draft-mode endpoints, admin paths).
- [ ] `<live-url>/sitemap.xml` — should not list internal/admin URLs.
- [ ] `<live-url>/.well-known/security.txt` — exists? Does it have a working contact?
- [ ] Open `_next/static/chunks/*.js` (or your framework equivalent) in DevTools and search for any `process.env` env-var name from your `.env.local` that's NOT `NEXT_PUBLIC_*`. Any hit = leak.

#### F. Codebase client-boundary audit

- [ ] `grep -rE 'process\.env\.[A-Z_]+' src app components --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx'` — list every env var referenced in code.
- [ ] For each: is it referenced inside a file marked `'use client'` (or that gets bundled to the client)? Is the var name `NEXT_PUBLIC_*` / `VITE_*` / `PUBLIC_*`? If non-public env var is reachable from a client file → leak.

### Phase-1 deliverable

Single one-page table:

| Area | Finding | Severity | Owner | Action |
|---|---|---|---|---|
| Repo visibility | (public/private + URL) | INFO | — | — |
| .env files in history | (count + paths) | CRITICAL / NONE | YOU | Rotate immediately |
| Vendor-prefixed token hits | (count + sample prefixes) | CRITICAL / NONE | YOU | Rotate at vendor |
| Client-side env leak | (vars + files) | HIGH / NONE | DEV | Move to server-only |
| Live site missing security.txt | (yes/no) | LOW | — | Add file |
| (etc.) | | | | |

**Severity definitions:**
- **CRITICAL** — confirmed real secret in public history, or active client-side leak of a server token.
- **HIGH** — pattern match that needs human eyeballs to confirm; treat as compromised until verified.
- **MEDIUM** — strategy/IP exposure (handoff docs, internal architecture notes) on a public repo.
- **LOW** — best-practice gap (no security.txt, missing CSP, broad CORS).
- **INFORMATIONAL** — helpful to note but no immediate action.

---

## Phase 2 — Sweep + Fix

Goal: every CRITICAL/HIGH from Phase 1 is closed. **Rotation comes before history rewriting.** You cannot un-leak something already cloned by a third party — the only thing that closes the door is changing the value at the source.

### Rotation order (highest blast radius first)

1. **Identity / auth provider tokens** — anything that grants login or session minting (`AUTH_SECRET`, `NEXTAUTH_SECRET`, OAuth client secrets).
2. **Admin / write-scope vendor tokens** — Shopify Admin (`shpca_*`/`shpat_*`), Stripe live key, AWS root keys, Cloud admin service-account JSON. These are the keys-to-the-kingdom.
3. **Webhook HMAC secrets** — let attackers forge event payloads to your endpoints.
4. **Read-scope vendor tokens** — Sanity read tokens, Storefront API public/private tokens, Cloudinary signed-upload preset.
5. **Personal access tokens for source-control + deploy host** — GitLab PAT, GitHub PAT, Vercel/Netlify/CloudFlare CLI token, npm publish token.
6. **CDN / asset-host signing keys** — image-resize HMAC, pre-signed URL secrets.
7. **Public-but-restrict tokens** — Google Maps API key (referrer restrict), Mapbox token (URL restrict), Sentry DSN (publish DSN, not the auth token).

For each rotation:
- Generate the new token at the vendor.
- Update `.env.local`.
- Update your hosted env (Vercel / Netlify / Fly / etc. — all environments: production, preview, development).
- Redeploy.
- **Invalidate the old token at source if the vendor supports it** (most do). Don't just rotate-and-forget.
- Log it in a `rotation_log_<date>.md` so future-you knows what was touched.

### Personal account hygiene (do alongside repo work)

- [ ] Source-host password (GitLab/GitHub/Bitbucket).
- [ ] Source-host PAT(s).
- [ ] Source-host OAuth grants ("Authorized OAuth apps") — revoke anything you don't recognise.
- [ ] Source-host SSH keys — re-issue if any were on machines you no longer trust.
- [ ] Sign-out-all-devices on each host.
- [ ] Deploy-host password + PAT (Vercel / Netlify / etc.).
- [ ] AI-tool keys (Anthropic, OpenAI, OpenRouter — anything that pays per token).
- [ ] macOS Keychain / Windows Credential Manager / `secret-tool` — purge stale cached entries from CLIs.

### History rewrite (only after rotation)

> **Force-push to a public repo doesn't undo what's already cloned.** Anyone who cloned before now has the original history on disk. Rewrite history because you don't want *new* viewers to see the old data, not because it makes secrets safe.

#### Tool of choice: `git filter-repo`

`git filter-branch` is deprecated. BFG works but is less flexible. `git filter-repo` is the modern default.

```bash
# Install (macOS Homebrew)
brew install git-filter-repo

# Install (Python pip)
pip3 install git-filter-repo
```

#### Pre-rewrite safety checks

- [ ] Working tree is clean (`git status` empty).
- [ ] You know exactly which paths to strip — write them down.
- [ ] Take an OS-level backup of the entire repo directory (`cp -r repo repo-backup-<date>`). Don't rely on a backup ref inside the same repo — filter-repo rewrites `refs/backup/*` along with everything else.
- [ ] If the repo is shared, tell collaborators: this is going to invalidate their working clones; they will need to re-clone.

#### Run filter-repo

```bash
# Strip a folder from all history
git filter-repo --invert-paths --path plan/ --force

# Strip a single file pattern
git filter-repo --invert-paths --path-glob '**/full.jsonl' --force

# Strip multiple paths
git filter-repo --invert-paths \
  --path plan/ \
  --path-glob '[0-9a-f][0-9a-f]/' \
  --path .entire/ \
  --force

# Replace a leaked literal (e.g. accidentally-committed token)
echo 'shpat_oldtoken==>REDACTED' > /tmp/replacements.txt
git filter-repo --replace-text /tmp/replacements.txt --force
```

#### Post-rewrite

- [ ] `git filter-repo` removes the `origin` remote as a safety. **Re-add it manually**: `git remote add origin <url>`.
- [ ] Filter-repo also wipes the working-tree files for stripped paths. If you wanted them on disk locally (because they were gitignored), restore them from origin BEFORE force-push: `git fetch origin && git archive origin/main path/ | tar -x`.
- [ ] Verify: `git log --all --diff-filter=A --name-only --pretty=format: | grep <stripped-pattern>` should be empty.
- [ ] Push: `git push --force-with-lease origin <branch>` for each rewritten branch.
- [ ] Tell collaborators to re-clone. Trying to merge old branches into the rewritten history will resurrect the stripped content.
- [ ] Note in your project's task list: "history rewritten on `<date>` for `<paths>`. Old SHAs invalid."

### Lock the door behind you

- [ ] Update `.gitignore` to permanently exclude the stripped paths.
- [ ] Add a pre-commit hook (`.husky/pre-commit` or `lefthook` or `pre-commit.com`) that scans staged diff for known token prefixes:
  ```bash
  if git diff --cached | grep -qE 'shpat_|shpca_|sk_live_|sk_test_|sk-or-|sk-ant-|sk-proj-|AKIA|github_pat_|glpat-'; then
    echo "Token-shaped string in staged diff. Aborting."
    exit 1
  fi
  ```
- [ ] Add a CI check (`gitleaks`, `trufflehog`, `detect-secrets`) that runs on every PR.
- [ ] If using AI dev tools (Claude Code, Cursor, Aider, etc.):
  - Audit `.claude/settings.local.json` (or equivalent) — make sure no broad-power Bash patterns (`Bash(node -e ...)`, `Bash(python3 *)`, `Bash(git config *)`) are pre-authorized without thought.
  - Confirm any session-tracking tool (entire.io, etc.) writes its data to a path your `.gitignore` actually excludes.
- [ ] For public repos: add a `SECURITY.md` with disclosure contact + a `.well-known/security.txt` on the live site.

---

## When *not* to do this in-place

If the leak is severe (real Stripe live key, customer PII, credentials for production infra), consider:

1. **Make the repo private** at the host level first (revokes public clone access *for new clients* — old clones still have the data).
2. Rotate everything.
3. Decide whether to keep the repo or **archive it and start a new one**. For severe leaks the cleanest move is: new repo, copy the cleaned working tree over, set the old repo to read-only with a notice, never push to it again.

In-place filter-repo is right for "I want to pre-emptively clean up before going public" or "low-severity strategy/IP cleanup." It's NOT a clean-room reset.

---

## Per-project quick reference

When applying to a new project, fill these in and save it next to this file:

```
Project: <name>
Repo URL: <url>
Visibility: <public/private>
Live URL: <url or N/A>
Vendor stack: <list — Shopify, Stripe, Sanity, etc.>
Last sweep: <YYYY-MM-DD>
Hosted-env provider: <Vercel/Netlify/etc.>
Auth tokens to rotate (in order): <list>
Pre-commit hook installed: <yes/no>
CI secret scan: <yes/no — tool>
```
