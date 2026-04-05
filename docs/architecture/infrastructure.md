# Infrastructure — anthropicprinciple.ai

## Overview

anthropicprinciple.ai has no server-side infrastructure. The entire site is a static file set served by GitHub Pages.

No database. No backend. No CDN. No API. No server costs. No dependencies to maintain.

---

## Hosting

| Component | Details |
|-----------|---------|
| Host | GitHub Pages |
| Source branch | `main` |
| Build step | None — files served as-is |
| HTTPS | Enforced automatically by GitHub Pages |
| CDN | GitHub Pages includes Fastly CDN globally |
| Uptime | GitHub Pages SLA — no additional monitoring needed |

---

## Domain

| Component | Details |
|-----------|---------|
| Domain | anthropicprinciple.ai |
| CNAME target | mhavelock.github.io |
| DNS provider | Wherever the domain is registered |
| CNAME file | `CNAME` in repo root — must be present or GitHub Pages loses the custom domain |

---

## What Does Not Exist

This project has none of the following. Any suggestion to add these requires a new ADR:

- No backend server or API
- No database (settings stored only in user's `localStorage`)
- No authentication
- No cookies
- No analytics tracking scripts on the main clock page
- No CDN configuration (GitHub Pages handles this)
- No environment variables
- No secret management
- No deployment pipeline beyond `git push origin main`

---

## Security Posture

Static sites have a very small attack surface. The relevant security considerations for this project are:

| Concern | Approach |
|---------|----------|
| No user data collected | Nothing transmitted to any server |
| localStorage only | User preferences — no sensitive data; user can clear at any time |
| External links | All `target="_blank"` links use `rel="noopener noreferrer"` |
| No eval / no innerHTML | Not used anywhere in the JS codebase |
| Dependency supply chain | Zero dependencies — nothing to audit |

Full detail: `security.md`.

---

## Monitoring

No automated monitoring is configured. If the site goes down, the quickest signal is:

1. Check https://anthropicprinciple.ai directly
2. Check GitHub Pages status: https://www.githubstatus.com/
3. Check the `main` branch in the repository for unexpected commits
