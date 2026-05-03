# qr-github-pages-static: Hosting on GitHub Pages with a CNAME apex

> **GitHub Pages serves files literally from the `main` branch — no SSR, no env vars at runtime, no preview branches, and no graceful 404 unless you ship one. The CNAME apex points to GitHub's IPs, not a Pages-managed proxy. iOS Safari has its own quirks layered on top. This qref documents the rules that actually bite on this project.**

---

## Symptom

You assume a hosting capability that GitHub Pages doesn't provide, or you write CSS that works in dev but jitters on a real iPhone, and find:

- A request to `https://anthropicprinciple.ai/anything-not-a-real-file` returns GitHub's generic 404, not a project-styled page.
- A new branch (`dev`, `feature/xyz`) doesn't get a preview URL — there's no automatic deploy other than `main` → apex.
- Code that reads `process.env.SOMETHING` returns `undefined` in production. There is no env layer.
- A Liquid include or Jekyll-ism creeps into the source and is silently rendered (this repo has Jekyll *off*; the next contributor may not know).
- The clock grid jitters or jumps as iOS Safari's address bar shows/hides during scroll, or after orientation change.
- A change to the apex DNS doesn't propagate; users see "domain not configured" intermittently.

These aren't bugs in the site. They're consequences of the hosting model.

---

## Root cause

GitHub Pages is a **static file server, not a platform**. The repo's `main` branch is mounted at the configured domain, with three notable behaviours:

1. **No build step in this repo.** Jekyll *can* run on Pages, but this site is plain HTML/CSS/JS — no Jekyll directives. A `.nojekyll` file in the repo root would make this explicit; absent it, GitHub Pages skips folders starting with `_` and ignores certain Liquid-looking content. Don't introduce `_includes/` or `_layouts/` directories accidentally.
2. **CNAME apex points at GitHub's IPs, not a smart proxy.** The file `CNAME` in the repo root contains `anthropicprinciple.ai`. DNS A records at the registrar point to the four GitHub Pages IPs (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`). There is no Cloudflare/Vercel-style edge layer in front — TTL changes can take minutes; HTTPS cert provisioning takes minutes more on first setup.
3. **Branches other than `main` don't auto-deploy.** This project's `CLAUDE.md` mentions a planned `dev` → `main` PR workflow; there's still no preview URL for `dev`. To preview pre-merge changes, run `npx live-server` locally.

Layered on top, **iOS Safari** has viewport quirks that do not bite desktop dev:

- `dvw`/`dvh` (dynamic viewport units) update *as the address bar transitions*, causing layout shifts during scroll.
- Window-level `resize` events fire late or not at all after orientation change, so any JS-set `--vw`/`--vh` strategy fails on rotation.
- `svw`/`svh` (small viewport units, the smallest stable size) are stable and update immediately.

This project's `clock.css` notes this directly:

> svw/svh (small viewport units) are used instead of dvw/dvh to avoid jitter as the iOS address bar shows/hides, and instead of JS-set `--vw`/`--vh` custom properties which relied on the resize event — which iOS Safari fires late (or not at all) after orientation change. svw/svh are stable and update immediately on orientation change.

---

## Worked example — the orientation-change viewport fix

Commit [`5a3adf8`](https://github.com/mhavelock/anthropicprinciple/commit/5a3adf8) ("fix(clock): replace JS viewport hack with svw/svh for instant orientation change") replaced a JS-driven viewport-unit shim with pure CSS.

Before — JS shim listening to `resize` (broken on iOS rotation):

```js
function setVH() {
  document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
setVH();
```

```css
.grid-14x6 {
  width: min(calc(var(--vw) * 90), calc(var(--vh) * 90 * (14/6)), 900px);
}
```

Symptom: rotating an iPhone from portrait to landscape produced a half-rendered grid for ~1–2 seconds while iOS Safari delayed firing `resize`. Sometimes the event never fired and the grid stayed wrongly sized until the next interaction.

After — CSS-only, using stable small-viewport units:

```css
.grid-14x6 {
  aspect-ratio: 14 / 6;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  width: min(90svw, calc(90svh * (14/6)), 900px);
}

@media (min-width: 540px) {
  .grid-14x6 {
    width: min(75svw, calc(90svh * (14/6)), 900px);
  }
}

@media screen and (orientation: landscape) and (max-height: 500px) {
  .grid-14x6 {
    width: min(95svw, calc(85svh * (14/6)), 900px);
  }
}
```

`svw`/`svh` resolve at the smallest stable viewport size and update instantly with the layout viewport, which iOS Safari does emit synchronously on orientation change. No JS needed. Grid lands correctly within one frame of rotation.

---

## Remedy — the rules that hold on this project

### 1. Treat the site as a static file server, not a platform

- No `process.env.*`. No runtime config. Settings live in `localStorage` (client-side) or hardcoded in source.
- No server-side anything. If you need a feature that requires a runtime, the answer is "this isn't the right project for that" — use one of the Vercel/Cloudflare projects in the parent Cowork directory.
- Tools that hint at a build step (Jekyll, Liquid, Hugo) are not in play here. Don't introduce a `_layouts/` directory; if you need to, ship `.nojekyll` first to be explicit.

### 2. Ship a `404.html` if routes are added

Currently the project has only three pages (`index.html`, `clock-controls.html`, `play.html`) and no client-side routing, so misses are rare. If client-side routes are ever added, drop a `404.html` at repo root — GitHub Pages serves it for any unmatched path on the apex. Without one, users see GitHub's generic 404.

### 3. CNAME is the source of truth for the apex domain

The file `CNAME` in repo root must contain exactly `anthropicprinciple.ai` and nothing else (no protocol, no path, no trailing newline beyond a single `\n`). Editing the domain in GitHub's Pages UI also rewrites this file — keep them in sync, and never `.gitignore` it.

### 4. Mobile-first viewport units: prefer `svw`/`svh` for layout-defining sizes

For anything whose layout must remain stable across iOS address-bar transitions and orientation change, use `svw`/`svh`. Use `dvw`/`dvh` only when you genuinely want the size to track the visual viewport during scroll (rare on this project). Avoid JS-set `--vw`/`--vh` shims entirely — they don't work reliably on iOS rotation.

### 5. There are no preview deploys

If a change needs visual sign-off before going to production, the loop is:

```bash
npx live-server                    # local preview
git diff                           # review every line
# show diff to Mat, get sign-off
git commit -m "..."
git push                           # production deploy on push to main
```

`git push` to `main` is the deploy. There's no PR-preview safety net. This is why `CLAUDE.md` requires explicit user confirmation before pushing.

### 6. DNS / cert quirks to know about

- First-time custom domain setup: HTTPS provisioning can take 15–60 min after the CNAME is added. The "Enforce HTTPS" checkbox in Pages settings only becomes available once Let's Encrypt has issued.
- Apex `A` records, not `CNAME`. The four GitHub Pages IPs are stable but if GitHub publishes new ones, registrar A records need updating. (See <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>.)
- Cache-busting for users with stale DNS: educate, don't fight. There's no edge cache to purge.

---

## See also

- `infrastructure.md` — full hosting setup (DNS records, GitHub Pages settings, GitHub Actions CI).
- `deployment.md` — release process and pre-push checklist.
- Commit `5a3adf8` — the `svw`/`svh` orientation-change fix.
- GitHub Pages docs: <https://docs.github.com/en/pages> (custom domains, Jekyll behaviour, `.nojekyll`).
- MDN: [Viewport units (`svw`, `svh`, `dvw`, `dvh`, `lvw`, `lvh`)](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths).
