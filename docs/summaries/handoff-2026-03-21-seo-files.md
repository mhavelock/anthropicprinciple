# Session Handoff — 2026-03-21 — robots.txt + sitemap.xml

## Session Type
Short SEO task — no code changes.

## What Was Done

Added `robots.txt` and `sitemap.xml` for Google Search Console compliance and improved SEO crawlability.

### Files Created

| File | Purpose |
|------|---------|
| `robots.txt` | Allows all crawlers; points to sitemap via `Sitemap:` directive |
| `sitemap.xml` | XML sitemap — homepage only (`priority 1.0`, `changefreq monthly`) |

### Files Modified

| File | Change |
|------|--------|
| `index.html` | Added `<link rel="sitemap" type="application/xml" href="/sitemap.xml">` after canonical tag |
| `README.md` | Added `robots.txt` and `sitemap.xml` to project structure table |

### Notes
- `clock-controls.html` excluded from sitemap — it has `<meta name="robots" content="noindex">` which would conflict.
- `<link rel="sitemap">` added to `index.html` only (not controls page) for the same reason.
- `play.html` excluded from sitemap — scratch/dev page, not a public destination.

## State at Session End
- All changes committed to `main`
- No outstanding actions

## Next Session
No pending SEO tasks. Remaining project work: Vercel deployment check, any new features.
