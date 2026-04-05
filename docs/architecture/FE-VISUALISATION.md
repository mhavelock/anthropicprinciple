# FE Visualisation & Browser Co-working — Approach Reference

Documented approach models, wins, pitfalls, and hard rules for working with visual UI, animations, imagery, browser state, and design tools. Same format as FEEDBACK-LOOPS.md: what happened → what we extracted → how to apply it.

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

Is the user reporting a bug they can see (not reproducible locally)?
  └─ YES → Ask user to provide screenshot — their view is ground truth
  └─ NO ↓

Is the page deployed/live and you need to inspect it remotely?
  └─ YES → Playwright MCP (navigate to live URL)
  └─ SCRAPING → Playwright first; Apify for structured extraction at scale
  └─ NO ↓

Is this a design → code or code → design task?
  └─ CODE → DESIGN → Penpot MCP (penpot-html-to-design skill)
  └─ DESIGN → CODE → Figma MCP (get_design_context tool)
  └─ IMAGE ASSETS → Cloudinary MCP

Is the user describing something verbally?
  └─ Use verbal to triage the problem TYPE. Then immediately capture before proposing a fix.
```

**Token rule:** Screenshots are single-use. Capture → describe → fix → release. Never hold an image in context longer than needed.

---

## Tool Reference

### 1. Python Snap — `python3 ~/.claude/scripts/snap.py`

**What it is:** OS-level full-screen capture via `pyautogui`. Low token cost. Captures whatever is visible on screen.

**Requires:** `pip install pyautogui pillow`

**Output:** File path printed to stdout. Read the path, then use the Read tool on the file.

**Invoke as:** `/run-python-screenshot` (skill)

**Best for:**
- "What does this look like right now?" checks on a local dev server
- Before/after comparisons when iterating a fix
- Any window — browser, IDE, Simulator, terminal

**Pitfalls:**
- The browser window must be the active/visible window. If something else is on top, you get the wrong capture.
- No viewport control — captures the browser at its current window size. For mobile-width testing, resize the window first or use Playwright.
- Captures OS-rendered output — includes fonts, shadows, and system-level rendering. This is usually a feature, not a bug.

---

### 2. Playwright MCP

**What it is:** Headless browser automation via MCP. Navigate, interact, screenshot, inspect network and console.

**Invoke as:** `/run-playwright` (skill) or directly via `mcp__playwright__*` tools

**Scale:** Always 75%, PNG. Keeps token cost manageable.

**Best for:**
- Specific viewport widths (mobile breakpoints — e.g. 375px)
- Page interaction before screenshotting (click, scroll, form fill)
- Headless rendering verification
- Inspecting console errors and network requests
- Screenshotting deployed/live URLs (no local window required)

**Pitfalls:**
- Overkill for simple "what does it look like" on a local dev server. Python snap is cheaper and faster.
- Headless rendering differs from OS-rendered: web fonts may not load, some CSS effects render differently, system fonts differ.
- Always check that the dev server is running at the expected URL first (check `package.json` scripts).
- 75% scale rule is non-negotiable — full-scale Playwright screenshots bloat context fast.

---

### 3. Human-Provided Screenshot

**What it is:** User captures and pastes/uploads a screenshot directly into the conversation.

**Best for:**
- Production bugs the user can see but that aren't reproducible locally
- Real device rendering (actual iPhone, actual browser at their OS zoom level)
- "Here's what I'm looking at" reports — most accurate ground truth

**Pitfalls:**
- Cannot be triggered autonomously — must ask the user.
- User may capture partial screen or wrong element. Ask for "full browser window" when layout context matters.
- Retina/2x screenshots: dimensions are doubled vs CSS pixels. Account for this when reasoning about sizes.

**When to ask for it:**
> "Can you drop a screenshot? That'll be faster than me trying to reproduce it."

---

### 4. Verbal Description

**What it is:** User describes what they see in text. No capture tool used.

**Best for:**
- **Initial triage only** — understanding the type of problem before deciding which tool to use
- Low-stakes "is this roughly right?" checks where the fix is obvious from code alone

**Hard rule:** Never propose a visual fix based on verbal description alone. Triage with verbal → capture before proposing → fix → verify.

**Pitfalls:**
- "It's a bit off to the left" can mean 2px or 200px. You don't know until you look.
- Colour descriptions are unreliable — "it looks grey" is not diagnostic.
- Missing context: verbal describes the symptom, not the cause. The cause is in the code; the evidence is in the screenshot.

---

### 5. Apify

**What it is:** Web scraping and automation platform. Use for extracting structured data from external sites at scale, or for sites with bot detection that Playwright headless trips.

**Best for:**
- Scraping competitor/reference pages for structured data (price lists, copy, image URLs)
- Sites that block headless Playwright (JS-heavy SPAs, bot detection)
- Repeated or scheduled extraction tasks

**Pitfalls:**
- Overkill for one-off page reads — Playwright is simpler and free.
- Has its own rate limits and cost model. Don't reach for it by default.
- Use Playwright first; escalate to Apify only if Playwright is blocked or insufficient.

---

### 6. Penpot MCP — Code → Design

**What it is:** Programmatic Penpot design file creation via MCP plugin bridge. Write JavaScript that creates shapes, components, and frames directly inside the Penpot desktop app.

**Invoke as:** `/penpot-html-to-design` (skill)

**Requires:** Penpot desktop app open with MCP plugin active.

**Best for:**
- Mirroring coded UI components into a design file for documentation or stakeholder review
- Creating design mocks from existing frontend code
- Maintaining a living design system alongside the codebase

**Job sequence (always follow this order):**

| Job | What |
|-----|------|
| 1 — Audit | Read source files. Extract layout, brand tokens, component list. Never guess. |
| 2 — Components | Build library components. **One per `execute_code` call** — bridge timeout is ~30s. |
| 3 — Frame setup | Create/find target frame. Add flex layout. |
| 4 — Compose | Place component instances. `appendChild` in visual top-to-bottom order. |
| 5 — Verify | `shapeStructure()` check. Export snapshot. |

**Confirmed API gotchas (from live sessions — these will silently break things):**

| Gotcha | Rule |
|--------|------|
| `board.flex.appendChild` is broken | Always use `board.appendChild(shape)` |
| `appendChild` in flex col/row inserts at FRONT of children array | Children array order is REVERSED vs visual order. Call `appendChild` in the visual order you want (top-to-bottom = first call → first visual position). |
| `shape.width` / `shape.height` are read-only | Always use `shape.resize(w, h)` |
| `shape.parentX` / `shape.parentY` are read-only | Use `penpotUtils.setParentXY(shape, x, y)` |
| `text.growType` resets to `"fixed"` on every `resize()` | Re-set: `text.growType = "auto-width"` after every resize on a text shape |
| `shape.fills` is a full-replace array | `shape.fills = [{ fillColor: "#hex", fillOpacity: 1 }]` — cannot mutate individual items |
| Plugin bridge timeout | If terminal doesn't log `success=true`, the call timed out. Split further. |
| Brand tokens | Always read from actual codebase (`globals.css`, Tailwind config) — never guess hex values |

**Storage pattern for multi-call sessions:**
```js
// Call 1 — create and store
storage.frame = frame;
return frame.id;

// Call 2 — retrieve
const frame = storage.frame; // persists across calls within session
```

---

### 7. Figma MCP — Design → Code

**What it is:** Official Figma MCP. Reads design context, screenshots, metadata from Figma files. Provides code-connect mappings.

**Best for:**
- Reading a Figma design to implement it in code
- Design → code direction (opposite of Penpot)
- Extracting design tokens, component specs, annotations from a Figma URL

**Invoke:** Share a `figma.com/design/...` URL → Figma MCP activates automatically. Use `get_design_context` as the primary tool.

**URL parsing:**
- `fileKey` and `nodeId` from the URL
- Convert `-` to `:` in `nodeId`

**Pitfall:** `get_design_context` output is React + Tailwind enriched with hints — it's a reference, not final code. Always adapt to the project's actual stack and components. Don't copy-paste Figma output verbatim.

---

### 8. Cloudinary MCP

**What it is:** Asset management MCP. Search, list, tag, transform, upload, and organise media assets in a Cloudinary cloud account.

**Best for:**
- Managing project image pipeline (hero images, thumbnails, walk photos)
- Finding assets by tag or folder without leaving Claude
- Transforming existing assets (resize, format convert, quality)
- Uploading new assets directly

**Invoke:** `mcp__claude_ai_Cloudinary__*` tools — search-assets, list-files, upload-asset, transform-asset, etc.

**Pitfalls:**
- Transformation operations may have delivery costs. Check usage via `get-usage-details` first on large batches.
- Asset public IDs are path-based — know your folder structure before searching.
- `search-assets` with tags is more reliable than folder browsing when assets aren't well-organised.

---

## Category 1: Wins That Became Rules

### FV-01: Look before you fix — Python snap as default first move

**What happened:** Multiple sessions where visual bugs were described verbally and fixes were proposed without capturing the state first. The proposed fix was based on incorrect assumptions about what "a bit off" meant in absolute terms. Iterations wasted.

**Win locked in:** `/fe-visualisation` skill defaults to Python snap before any analysis. The rule is: describe, capture, fix — in that order. Never fix a visual issue without first seeing it.

**Rule extracted:** Never propose a visual or layout fix based on code-reading alone when a screenshot is obtainable. "Looking at the CSS, I think the issue is X" is hypothesis. Looking at the screenshot confirms or denies it in one step.

**How to apply:** Any time a message contains words like "it looks", "the spacing", "it's not aligned", "the colour seems" — run a snap before responding with a fix. Capture first, diagnose second.

---

### FV-02: Screenshot single-use — release after describing

**What happened:** Long sessions where screenshots were held in context across many tool calls. Token cost ballooned, context pressure caused earlier content to be dropped.

**Win locked in:** Screenshot single-use rule. Capture → describe what you see in text → propose fix → release the image. The text description is the durable artefact; the image is ephemeral.

**Rule extracted:** The moment you've described an image in text, the image itself is no longer needed in context. Describing it is the act of converting the visual information into a durable form.

**How to apply:** After describing a screenshot, do not re-read or re-reference the image. If the description was accurate, it's sufficient. If more detail is needed, capture again — don't hold the old image.

---

### FV-03: Penpot job sequence — one component per call

**What happened (2026-03-07):** Attempted to build multiple Penpot components in a single `execute_code` call. The plugin bridge timed out at ~30 seconds, operations failed silently (no error, no output), and the canvas state was partially corrupted.

**Win locked in:** Strict job sequence: Audit → Components (one per call) → Frame → Compose → Verify. Each job is a separate call or cluster. `storage` persists references between calls within a session.

**Rule extracted:** The Penpot plugin bridge timeout is a hard architectural constraint, not a guideline. One complex operation per call. Large loops (10 card instances) get split across calls.

**How to apply:** Before any `execute_code` call, ask: "could this take more than 30 seconds to execute?" If yes, split it. If unsure, split it.

---

### FV-04: `board.appendChild` vs `board.flex.appendChild`

**What happened:** Used `board.flex.appendChild(shape)` following what seemed like the logical API path. The shape was created but not attached — silent failure, no error thrown. Spent a session debugging what was actually a one-word API mistake.

**Win locked in:** `board.flex.appendChild` is broken. Always use `board.appendChild(shape)`. Confirmed in the live session and documented.

**Rule extracted:** Penpot MCP API has undocumented broken methods that fail silently. Trust only the methods confirmed in the gotcha table. When in doubt, check the worked example first.

**How to apply:** Before any Penpot shape insertion, verify the method against the gotcha table in this document. `board.appendChild(shape)` is the only insertion method to use.

---

### FV-05: Flex children visual order is reversed

**What happened:** Built a flex column layout, placed header first with `appendChild`, then content, then footer. The Penpot canvas showed them in reverse order (footer at top). The confusion cost most of a session.

**Win locked in:** For any flex board (`dir="column"` or `dir="row"`), `appendChild` inserts at the FRONT of the children array. The children array is REVERSED relative to visual order. Call `appendChild` in the visual order you want — the reversal is automatic.

**Rule extracted:** `children[0]` = visually LAST. `children[last]` = visually FIRST. This is counterintuitive but consistent. Once understood, visual-order `appendChild` calls produce correct results reliably.

**How to apply:** When composing a Penpot flex layout, list what you want visually top-to-bottom, then call `appendChild` in that order. The reversal happens automatically.

---

### FV-06: `growType` reset trap

**What happened:** Built a text shape, set `growType = "auto-width"`, then called `resize()` on it later for layout adjustments. The text started overflowing its bounding box after the resize. Root cause: `resize()` silently resets `growType` to `"fixed"`.

**Win locked in:** Always re-set `text.growType = "auto-width"` (or appropriate value) after any `resize()` call on a text shape.

**Rule extracted:** In Penpot MCP, `resize()` has a side effect on text shapes that is not signalled in any output. It's a silent state mutation. The fix is always to re-set growType immediately after.

**How to apply:** Any time you call `resize()` on a shape that contains or is a text element, add `shape.growType = "auto-width"` on the next line as standard practice.

---

## Category 2: Limits Set Deliberately

### FV-07: Playwright at 75% scale — non-negotiable

**Limit set:** Playwright screenshots are always taken at 75% scale, PNG format. Full-scale screenshots at 1440px or retina resolution consume disproportionate context tokens for marginal additional detail.

**Rule extracted:** At 75% scale, layout, spacing, colour, and text are all clearly legible. The extra detail in a full-scale screenshot is almost never what you need.

**How to apply:** Any Playwright `browser_take_screenshot` call specifies 75% scale. If a specific detail requires zoom, crop the relevant area — don't capture full-page at full scale.

---

### FV-08: No verbose Playwright for simple local checks

**Limit set:** Playwright is not the default for local dev server screenshots. Python snap is. The difference: Python snap is instantaneous, zero setup, and captures the OS-rendered output. Playwright requires navigating to the URL, loading the browser, and rendering the page headlessly.

**Rule extracted:** Playwright adds overhead that is only worth it when its specific capabilities (viewport control, interaction, live URL navigation) are needed. For "what does this look like right now?", Python snap wins.

**How to apply:** If the question can be answered by Python snap, use Python snap. Escalate to Playwright only when snap is insufficient.

---

## Category 3: Tool Gaps and Redirections

### FV-09: Human screenshot > any automated tool for device-specific bugs

**Session context:** User reported a visual issue on their actual iPhone. Playwright was used to try to reproduce the issue at 375px viewport. The Playwright headless render didn't show the issue.

**Outcome:** Issue was device-specific (system font rendering difference). Only the user's screenshot showed the real state.

**What this forced:** Ask for a human screenshot when the reported issue is "I see X on my device" — don't try to reproduce headlessly first.

**Rule extracted:** For device-specific or OS-specific visual bugs, automated tools are unreliable. The user's screenshot is always more authoritative than a headless reproduction.

---

### FV-10: Verbal description as triage, not diagnosis

**Session context:** User said "the button is slightly off". Several layout fixes were proposed based on code reading alone. All missed. Eventually a screenshot showed the button had a stale cached style from a different rule entirely — nothing the code read suggested.

**Outcome:** Verbal triage → capture → fix. Verbal description correctly identified the location (button) and approximate symptom (off) but couldn't identify the cause. The screenshot made the cause immediately obvious.

**Rule extracted:** Verbal description is useful for narrowing the search space (which component, which breakpoint). It is not sufficient for diagnosis. The moment you know which component to look at, capture it.

---

## Hard Rules Extracted

```
FE VISUALISATION HARD RULES

1. Never fix a visual bug without looking first — snap or screenshot before proposing
2. Screenshots are single-use — describe in text, then release from context
3. Python snap is the default — Playwright only when viewport/interaction/live URL needed
4. Human screenshot beats headless for device-specific bugs — ask the user
5. Verbal description → triage only — never a diagnosis on its own
6. Penpot: one component per execute_code call — 30s bridge timeout is a hard limit
7. Penpot: use board.appendChild(), NEVER board.flex.appendChild()
8. Penpot: flex children are reversed — call appendChild in visual order
9. Penpot: always re-set text.growType after any resize()
10. Playwright: always 75% scale, PNG — full-scale is wasteful
11. Apify: escalation only — try Playwright first for any page read
12. Brand tokens in Penpot always come from the codebase — never guess hex values
```

---

## Quick-Reference: When to Use What

| Situation | Best Tool | Why |
|-----------|-----------|-----|
| Local dev — "what does this look like?" | Python snap | Fast, low-token, OS-rendered |
| Mobile width check | Playwright at 375px | Viewport control |
| User reports device bug | Ask for human screenshot | Ground truth |
| Deployed page inspection | Playwright → live URL | No local window needed |
| Competitor data extraction | Apify | Scale, bot detection |
| Code → design file | Penpot MCP | Programmatic, version-controllable |
| Design → code | Figma MCP | `get_design_context` with nodeId |
| Image asset management | Cloudinary MCP | Search, transform, upload |
| Initial triage | Verbal → then snap | Verbal narrows; snap confirms |
| Before/after fix check | Python snap × 2 | Before fix, after fix — compare |
