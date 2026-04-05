# FE Visualisation & Browser Co-working — Approach Reference

Documented approach models, wins, pitfalls, and hard rules for visual debugging on anthropicprinciple.ai. This site has specific visual challenges: 84 animated clock hands, precise angle rendering, 4 generative patterns, a countdown state, and a grid that must survive extreme viewport changes. Standard "does it look right" checking is not enough — correctness here means angles are right, patterns are coherent, and the digit resolution moment is clean.

Same format as FEEDBACK-LOOPS.md: what happened → what we extracted → how to apply it.

---

## Tool Decision Tree

Start here before reaching for any tool. Pick the **lowest-friction option that answers the question**.

```
Is there already a screenshot in the conversation?
  └─ YES → Use it. Don't re-capture.
  └─ NO ↓

Is this a "what does it look like right now?" question?
  └─ YES → Python snap (python3 ~/.claude/scripts/snap.py) — default, always first
  └─ NO ↓

Do you need a specific viewport width, or interaction before screenshotting?
  └─ YES → Playwright MCP
  └─ NO ↓

Is this a clock-specific angle or digit rendering question?
  └─ YES → Playwright at target viewport → screenshot → compare against digit-reference.md
  └─ NO ↓

Is the user reporting a bug they can see (not reproducible locally)?
  └─ YES → Ask user to provide screenshot — their view is ground truth
  └─ NO ↓

Is the page deployed/live and you need to inspect it remotely?
  └─ YES → Playwright MCP (navigate to live URL)
  └─ NO ↓

Is the user describing something verbally?
  └─ Use verbal to triage the problem TYPE. Then immediately capture before proposing a fix.
```

**Token rule:** Screenshots are single-use. Capture → describe → fix → release. Never hold an image in context longer than needed.

---

## Site-Specific Visual Challenges

This is not a generic content site. Visual bugs here require understanding what *correct* looks like in a way that doesn't apply to most web projects. Reference these before any visual debugging session.

### Challenge 1 — Digit Rendering

**Source of truth:** `docs/plan/discovery/digit-reference.md`

The hand angles for each digit are defined precisely in that file using the notation system:

| Notation | Angle pair | Shape |
|----------|-----------|-------|
| `H` | 3:45 | ─ horizontal |
| `V` | 12:30 | │ vertical |
| `TL` | 6:15 | ┌ top-left corner |
| `TR` | 9:30 | ┐ top-right corner |
| `BL` | 12:15 | └ bottom-left corner |
| `BR` | 12:45 | ┘ bottom-right corner |
| `I_D` | 6:30 | both hands pointing down (interior) |
| `I_U` | 12:00 | both hands pointing up (interior) |
| `NE/SW/NW/SE` | diagonal variants | ╱ ╲ diagonal hands |

Each digit occupies a 3-column × 6-row sub-grid. If the rendered digit looks wrong, cross-reference the actual cell against the table in digit-reference.md before touching any code. The mapping is the spec.

**Useful Playwright check:**
- Screenshot the clock at the exact moment of time display (during the 25s → 30s static window)
- Screenshot at a viewport that shows the full grid (≥ 768px wide recommended)
- Compare individual clock cells against the digit table — wrong corners are usually the symptom

### Challenge 2 — Clock Grid Layout

The grid is 6 rows × 14 columns of mini-clocks. Layout is CSS Grid inside a full-viewport flex container. Key failure modes:

| Failure | Symptom | Where to look |
|---------|---------|--------------|
| Grid overflow | Cells cut off at edges | `clock.css` `.clock-grid` `grid-template-columns` |
| Aspect ratio broken | Clocks are ellipses, not circles | `clock.css` `.mc` `aspect-ratio` |
| Landscape breakage | Grid doesn't fit on small landscape screens | Test at 568×320px (iPhone SE landscape) |
| CLS on load | Layout jumps when JS loads | `clock.css` `aspect-ratio` on `.clock-grid` |

**Viewport testing matrix for this site:**
```
320px  — minimum supported width
568px  — iPhone SE landscape (critical — clock must fit without scroll)
768px  — tablet portrait
1024px — laptop
1440px — wide desktop
```

### Challenge 3 — Pattern Rendering

Four generative patterns cycle continuously. Visual correctness check:

| Pattern | What to look for |
|---------|----------------|
| 0 — Concentric ripple | Elliptical wave emanating outward; hands rotate in rings |
| 1 — Diagonal wave | Linear phase sweep corner to corner; uniform hand flow |
| 2 — Radial V | Circular spread from centre; oscillating fan effect |
| 3 — Vortex | Radial distance + rotation; spiral hand movement |

A bug in pattern logic rarely shows as a hard error — it shows as an unexpected symmetry or a pattern that looks "close but wrong". If you can't describe what you're seeing in terms of the four patterns above, capture a screenshot before reading any code.

### Challenge 4 — Countdown State

When countdown reaches 00:00:
- Hand colour switches from `--clk-hand` (#4f001e) to `--clk-zero-hand` (#ff2020)
- A red glow pulses via `--clk-zero-glow` (rgba(255,32,32,0.45))

Visual check: all 84 clocks should show hands in red, with visible glow. If only some do, the CSS custom property is not propagating correctly. If none do, check the countdown end time logic in `controls.js` and `clock.js`.

### Challenge 5 — Homepage (index.html) Typography and Layout

The homepage has an aside component with `.side p` text using a custom `home.css` stack on top of `colors.css`. Known open issues:

| Issue | Status | File |
|-------|--------|------|
| S1: `.side p` WCAG contrast (`#727786` on `#292b31` ≈ 2.85:1, fails 4.5:1) | **Open** | `home.css` |
| S2: Aside positioning magic numbers (`right: calc(-50vw + 1.25rem)`, `top: -17rem`) | **Open** | `home.css` |

For contrast checking, Python snap shows the current rendered state. Compare visually against the known token values in `colors.css`. WCAG pass requires 4.5:1 minimum for normal text.

---

## Tool Reference

### 1. Python Snap — `python3 ~/.claude/scripts/snap.py`

**What it is:** OS-level full-screen capture via `pyautogui`. Low token cost. Captures whatever is visible on screen.

**Requires:** `pip install pyautogui pillow`

**Output:** File path printed to stdout. Read the path, then use the Read tool on the file.

**Invoke as:** `/run-python-screenshot` (skill)

**Best for:**
- "What does this look like right now?" checks on a local dev server
- Before/after comparisons when iterating a fix (critical for hand-angle fixes)
- Quick pattern verification — "are the patterns running?"

**Pitfalls:**
- The browser window must be the active/visible window.
- No viewport control — captures the browser at its current window size. For mobile testing, resize first or use Playwright.
- The clock animation is live — capture during the static display phase (25s–30s window) for digit verification.

---

### 2. Playwright MCP

**What it is:** Headless browser automation via MCP. Navigate, interact, screenshot, inspect network and console.

**Invoke as:** `/run-playwright` (skill) or directly via `mcp__playwright__*` tools

**Scale:** Always 75%, PNG.

**Best for:**
- Mobile breakpoint testing (568px landscape is the critical case for this site)
- Viewport-specific clock grid layout checks
- Console error inspection (rAF loop errors, localStorage failures)
- Deployed/live site screenshots without local server

**Clock-specific Playwright pattern:**
```
Navigate → wait 28 seconds (let one cycle complete) → screenshot during static window
```
Or: pause via devtools → screenshot at a known phase.

**Pitfalls:**
- Headless rendering of CSS animations can differ from live browser — hand angles should be correct, but timing/easing may appear frozen. For animation correctness, prefer the live browser via Python snap.
- 75% scale rule is non-negotiable.

---

### 3. Human-Provided Screenshot

**Best for:**
- Production bugs visible on the user's device
- Real device rendering (actual phone, real browser zoom)
- Countdown state bugs — user's actual timezone and time matters

**When to ask for it:**
> "Can you drop a screenshot? That'll be faster than me trying to reproduce it."

---

### 4. Verbal Description

**Best for:**
- Initial triage only — understand the problem type before deciding which tool to use

**Hard rule:** Never propose a visual fix based on verbal description alone. Always capture first.

**Clock-specific pitfall:** "The digits look wrong" is not a diagnosis. "Wrong" could be: wrong corner types, wrong interior shapes, wrong hand separation, wrong phase timing. The diagnosis requires comparing against `digit-reference.md` — which requires a screenshot.

---

## Category 1: Wins That Became Rules

### FV-01: Look before you fix — Python snap as default first move

**What happened:** Visual bugs described verbally; fixes proposed without capturing first. Proposed fixes missed because the actual rendered state differed from what the code suggested.

**Win locked in:** `/fe-visualisation` skill defaults to Python snap before any analysis. Describe → capture → fix — in that order.

**Rule extracted:** Never propose a visual or layout fix based on code-reading alone when a screenshot is obtainable.

**How to apply:** Any time a message contains "it looks", "spacing", "aligned", "colour seems" — snap before responding.

---

### FV-02: Screenshot single-use — release after describing

**What happened:** Screenshots held across many tool calls. Token cost ballooned; context pressure dropped earlier content.

**Win locked in:** Single-use rule. Capture → describe in text → propose fix → release. Text description is the durable artefact.

**Rule extracted:** Once you've described an image in text, the image is no longer needed. Describing it converts the visual information into a durable form.

---

### FV-03: digit-reference.md is the visual spec — use it before touching clock.js

**What happened:** Hand angle bugs were investigated by reading `clock.js` logic directly. The logic is correct but complex — the H/V/TL/TR/BL/BR notation has to be mentally translated to degrees to compare against what's rendered.

**Win locked in:** `digit-reference.md` is the rendered visual spec. Screenshot the clock during the static window → compare cells against the table → then look at the code if there's a discrepancy.

**Rule extracted:** For digit rendering questions, the correct workflow is screenshot → digit-reference.md comparison → code. Not code first.

**How to apply:** Before reading `clock.js` for a digit bug, capture the rendered state and cross-reference it against the digit table. This identifies which specific cell/digit is wrong before code investigation.

---

### FV-04: Viewport matrix before any layout change

**What happened:** Layout fixes tested at one viewport looked correct but broke at 568px landscape (iPhone SE) — the most constrained clock grid case.

**Win locked in:** Always verify at 568×320px (landscape) for any layout change on `index.html`. The clock grid must fit without overflow or scroll.

**Rule extracted:** Landscape on a small phone is the hardest case for the clock grid. Changes that look fine at 375px portrait can still break landscape.

**How to apply:** Add 568×320 to the Playwright test matrix for any layout change on index.html. This is the minimum bar before committing.

---

## Category 2: Limits Set Deliberately

### FV-05: Playwright at 75% scale — non-negotiable

**Limit:** Playwright screenshots always at 75% scale, PNG. Full-scale is wasteful for the detail gain.

---

### FV-06: No verbose Playwright for simple local checks

**Limit:** Python snap is the default for local dev server screenshots. Playwright only when viewport control, interaction, or live URL navigation is needed.

---

## Category 3: Tool Gaps and Redirections

### FV-07: Human screenshot > headless for device-specific bugs

**When:** User reports something wrong on their actual phone. Playwright headless won't show device-font rendering, actual hardware pixel density, or OS-level colour management.

**Rule:** For device-specific bugs, ask for the user's screenshot first. Don't try to reproduce headlessly first.

---

### FV-08: Verbal description → triage only

**Rule:** Verbal description identifies the component and symptom. Screenshot and digit-reference.md identify the cause. For clock visual bugs, the cause is almost never what the verbal description suggests.

---

## Hard Rules Extracted

```
FE VISUALISATION HARD RULES — anthropicprinciple.ai

1. Never fix a visual bug without looking first — snap or screenshot before proposing
2. Screenshots are single-use — describe in text, then release from context
3. Python snap is the default — Playwright only when viewport/interaction/live URL needed
4. Human screenshot beats headless for device-specific bugs — ask the user
5. Verbal description → triage only — never a diagnosis on its own
6. Playwright: always 75% scale, PNG — full-scale is wasteful
7. For digit rendering bugs: screenshot → digit-reference.md comparison → then code
8. Always test at 568×320px (landscape) for any clock grid layout change
9. Capture during the static window (25s–30s) for digit verification screenshots
10. Countdown state (red glow) requires checking both CSS token propagation AND clock.js logic
```

---

## Quick-Reference: When to Use What

| Situation | Best Tool | Why |
|-----------|-----------|-----|
| Local dev — "what does this look like?" | Python snap | Fast, low-token, OS-rendered |
| Mobile landscape check (568×320) | Playwright | Viewport control |
| Digit rendering verification | Playwright → compare vs digit-reference.md | Precise capture + spec comparison |
| User reports device bug | Ask for human screenshot | Ground truth |
| Deployed page inspection | Playwright → live URL | No local window needed |
| Pattern phase debugging | Python snap (live browser) | Animation renders correctly in live |
| Countdown zero state | Python snap or user screenshot | Need live state |
| WCAG contrast check | Python snap + token value from CSS | Rendered colour + token math |
| Before/after fix check | Python snap × 2 | Before fix → after fix → compare |
| Initial triage | Verbal → then snap | Verbal narrows; snap confirms |
