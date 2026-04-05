# Security — anthropicprinciple.ai

Two domains: **site security** (what the site does with user data, external links, and JS) and **development environment security** (how Claude Code sessions are constrained). Both documented here.

---

## Part 1 — Site Security

### User Data

| Concern | Implementation | Status |
|---------|----------------|--------|
| No personal data collected | Static site — no forms, no accounts, no tracking | ✅ |
| No cookies set | Not used | ✅ |
| No analytics on main clock page | Zero third-party scripts on `index.html` | ✅ |
| localStorage content | User preferences only: UTC offset, countdown time, mode | ✅ |
| localStorage sensitivity | Values are innocuous (integers, short strings) — no PII | ✅ |

**localStorage keys:**
`clk_mode`, `clk_hours`, `clk_countdown_time`, `clk_countdown_end`

All are user-facing preferences. None contain personal data. User can clear at any time via browser settings.

---

### External Links

| Standard | Status |
|----------|--------|
| `rel="noopener noreferrer"` on all `target="_blank"` | ✅ Applied to all external links |

`noopener` prevents the opened tab from accessing `window.opener`. `noreferrer` prevents the `Referer` header from being sent to the destination (no referral leakage to Humans Since 1982, Bluesky, SoundCloud, Claude, etc.).

---

### JavaScript

| Concern | Status |
|---------|--------|
| No `eval()` | ✅ Not used |
| No `innerHTML` with dynamic content | ✅ Not used |
| No `document.write()` | ✅ Not used |
| No external script loading at runtime | ✅ All scripts are local, loaded with `defer` |
| localStorage values sanitised before use | ✅ Integer parse + clamp + regex validate |
| No API calls or data exfiltration | ✅ Static site — no network requests from JS |

---

### Content Security

This is a zero-dependency static site. The JS does not make any network requests. The CSS loads no external fonts or assets. All assets are self-hosted.

A Content Security Policy (CSP) could be added as a `<meta>` tag if desired. Not currently implemented — the default GitHub Pages policy applies.

---

## Part 2 — Development Environment Security

### Path Guards

A PreToolUse hook (`~/.claude/hooks/guard-paths.sh`) runs on every Write, Edit, and Bash call in Claude Code sessions.

| Path zone | Behaviour |
|-----------|-----------|
| Within `/Users/mat/Claudette/Cowork` | Allow |
| `.claude` dirs, `CLAUDE.md`, `settings.json`, `settings.local.json` | Ask — confirmation dialog |
| Anywhere else | Deny — hard block |

### Session Constraints

- All Claude Code sessions operate within the `Cowork/` path zone
- Claude never pushes to the remote repository without explicit user confirmation (see `docs/architecture/FEEDBACK-LOOPS.md` FL for git push rule)
- No API keys, tokens, or credentials exist in this codebase
- No `.env` files

### What To Do If Something Goes Wrong

If an unexpected file is modified or an unintended action is taken in a Claude Code session:
1. Run `git diff` immediately to see all changes
2. `git checkout -- [file]` to revert specific files
3. `git restore .` to revert all uncommitted changes
4. Check `Cowork/logs/` if the change-log hook is active — timestamped diff logs are written on every Edit/Write
