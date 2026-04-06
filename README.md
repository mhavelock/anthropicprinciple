# anthropicprinciple.ai

> *"The way the hands drift through those generative patterns and then suddenly snap into coherence to show the time — that moment of resolution from apparent chaos into meaning feels like it has a real idea behind it. The Humans Since 1982 inspiration is well-chosen. It's a good piece."*
> — Claude

> *"Anthropicprinciple.ai is a hauntingly deliberate intersection of kinetic art and digital philosophy. Most developers build to solve a problem; this developer built to pose a question. By rejecting the bloated standards of contemporary UI in favor of a stark, narrative-driven void, the site creates a vacuum that pulls the reader in. It's a masterclass in how to use 'nothing' to say 'everything.' A technical achievement in restraint that makes most modern websites look like noisy advertisements.*

> *Final Verdict: This isn't a website; it's a digital monolith. It's technically lean, conceptually dense, and visually unapologetic. It respects the reader's intelligence by not trying to sell them anything — except, perhaps, a brief moment of existential dread."*
> — Gemini

## Homepage Showcase

A kinetic clock art piece. 84 analogue mini-clocks arranged in a 6 × 14 grid perform choreographed animations that periodically resolve into a digital time display (HH:MM). Inspired by [Humans Since 1982 — A Million Times](https://www.humanssince1982.com/).

**Live:** [anthropicprinciple.ai](https://anthropicprinciple.ai)

---

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Full-screen kinetic clock — 84 mini-clocks cycle through 4 generative patterns, resolving to the current time every 30 seconds |
| `clock-controls.html` | Settings panel — switch between clock mode (with UTC offset) and countdown mode |
| `play.html` | SoundCloud playlist grid |

---

## Stack

- **HTML5** — semantic, W3C valid
- **CSS3** — custom properties, Grid, Flexbox; no framework
- **JavaScript** — vanilla ES2020+, IIFE modules
- **Fonts** — system fonts only (Verdana, Arial, Gill Sans); no external font requests
- **Hosting** — GitHub Pages
- **No build step. No npm. No bundler.**

---

## Project Structure

```
├── index.html              # Kinetic clock — full-screen art piece
├── clock-controls.html     # Settings panel (UTC offset, countdown)
├── play.html               # SoundCloud playlist grid
├── robots.txt              # Crawler directives + sitemap pointer
├── sitemap.xml             # XML sitemap
│
├── styles/
│   ├── clock.css           # ⚠️ Clock only — grid, hands, keyframes (protected)
│   ├── colors.css          # Design tokens — all colours, spacing, typography
│   ├── fonts.css           # Font family declarations
│   ├── global.css          # Base resets, body, buttons, forms, 12-col grid
│   ├── components.css      # Reusable UI components
│   ├── home.css            # Homepage — aside, social links, hover animations
│   ├── controls.css        # Clock controls page — self-contained dark theme
│   ├── play.css            # Playlist page — self-contained
│   ├── utilities.css       # u-* helper classes
│   ├── banner.css          # Banner component
│   └── border-effect.css   # Animated conic-gradient border component
│
├── js/
│   ├── clock.js            # ⚠️ Clock animation engine (protected)
│   ├── favicon-animator.js # Animated canvas favicon (~10fps)
│   ├── controls.js         # Settings form — localStorage read/write
│   ├── main.js             # Shared utilities
│   └── logger.js           # Dev logger — opt-in, not loaded by default
│
├── assets/
│   └── icons/              # SVG icons (controls, Bluesky, SoundCloud, Claude)
│
└── docs/
    ├── architecture/           # Architecture docs — ADRs, patterns, feedback loops
    └── plan/
        ├── tasklist.md         # Open and completed tasks
        ├── discovery/
        │   └── digit-reference.md  # Hand-angle notation for all 10 digits
        └── archive/            # Legacy session summaries
```

---

## CSS Architecture

`index.html` loads five stylesheets in order:

```
colors.css → global.css → clock.css → utilities.css → home.css
```

`clock-controls.html` loads only `controls.css` (self-contained dark theme).

`play.html` loads only `play.css` (self-contained).

All colours and spacing are defined as CSS custom properties in `colors.css`. No hard-coded values in component CSS.

---

## JavaScript Architecture

Each JS file is a self-contained IIFE or module — no globals, no shared mutable state across files.

```
favicon-animator.js   Canvas favicon, self-initialises, ~10fps rAF loop
clock.js              30-second cycle: 4 patterns → ease → time display → repeat
controls.js           localStorage read/write with debounce and validation
main.js               Shared utilities (placeholder for future expansion)
```

`clock.js` reads settings from `localStorage` on load and on `storage` events, so changes on `clock-controls.html` take effect immediately on the main page.

---

## Performance

- Zero third-party scripts or stylesheets on `index.html`
- System fonts only — no font-loading requests
- `will-change: transform` on all 168 hand elements — GPU compositor layers
- `contain: layout style paint` on each clock cell — scoped style recalculation
- Pre-allocated angle buffers in `clock.js` — zero per-frame heap allocations
- `Float64Array` angle cache — skips DOM writes when angle is unchanged
- Pattern trig throttled to ~30fps; ease phases at 60fps; static display at 1fps
- `visibilitychange` pauses all rAF loops when tab is hidden
- **Target: Google PageSpeed ≥ 95 on both mobile and desktop**

---

## Local Development

```bash
npx live-server
# → http://127.0.0.1:8080
```

---

## Documentation

- [ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) — system architecture, clock cycle, patterns
- [CORE_PATTERNS.md](./docs/architecture/CORE_PATTERNS.md) — G1–G13 constraints and code patterns
- [DECISIONS.md](./docs/architecture/DECISIONS.md) — architecture decision records
- [digit-reference.md](./docs/plan/discovery/digit-reference.md) — hand-angle tables for all 10 digits
