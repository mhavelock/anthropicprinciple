# Thinking Approach Models

> **Load guard:** This is an L3 on-demand file. Do not load it as part of standard session context. Load it only when a specific decision, audit, or creative challenge calls for a structured thinking approach — ammunition held in reserve, loaded for a specific gun fight.

A menu of deliberate thinking modes. These are not processes to follow rigidly — they are lenses to pick up intentionally. The skill is knowing which lens fits the moment.

**How this file is organised:**
- **Decision tools** — for in-session choices: Six Hats, Inversion, Architectural Diff, Two-Model Debate
- **Session tools** — for how to run a session: Red Team Fresh Start, Rubber Duck, Contextual Anchoring, Chunking/MapReduce
- **Audit tools** — for reviewing the system itself: Architecture Audit Mode, Reflective Rituals
- **Design tools** — for planning and generating: Disney Strategy, Double Diamond, SCAMPER
- **Incentive design** — for making the system self-improving: Incentive Architecture, Knowledge Graph
- **Alternative perspectives** — cross-disciplinary imports to try: Pre-Mortem, Steelmanning, Chesterton's Fence, Second-Order Thinking, First Principles, OODA Loop, Socratic Method, Theory of Constraints, Johari Window, Oblique Strategies
- **Selector table** — at the end: pick based on situation

---

## Contradiction Hunt

Apply when: you want a quality gate before a major release, after a documentation sprint, or when you suspect the architecture docs have drifted out of sync with each other.

**The premise:** Complex systems generate contradictions over time. Constraint A was written in one sprint; Constraint B was written in another. Nobody notices they now conflict until a code change forces a choice — at the worst possible moment.

**How to use:**
> "Here are [N] architecture documents: [paste]. Find the top 5 internal contradictions or tensions — places where one document's constraint conflicts with, undermines, or silently ignores another's. Do not suggest fixes. Just surface the contradictions, quote the conflicting lines, and rate severity (blocker / warning / minor)."

**Best sent to:** Gemini Pro (Pattern 5 in GEMINI-CONSULTANCY.md) — pass all L1/L2 architecture docs as the payload. This is a stateless read with no Claude context to anchor against.

**Rule:** No hypothesis. Don't tell Gemini what you think the contradiction is. Let it find its own.

**When to run:**
- Before any App Store submission
- After a documentation sprint that touched multiple architecture files
- When the codebase has grown enough that you can't hold all constraints in working memory

---

## The Full-Spectrum Architect

**The meta-model.** Every thinking approach in this file maps to a specific AI coworking mode. Once you see the mapping, you stop treating Claude as a single mind and start treating it as a multidimensional team where each role has distinct context requirements, interaction patterns, and outputs.

> "Stop treating Claude as a single mind. Use your Skills as the 'Hats' you put on the AI, and use your Memory as the 'Transcript' of what those hats discovered. This creates a project that doesn't just get finished — it gets mastered."

### Hat → AI Role Mapping

| Hat | AI Role | Context to load | Key principle |
|-----|---------|----------------|---------------|
| ⚪ **White** | Data Collector | Indexed facts, ARCHITECTURE.md, code grep results | Never pay for Claude to "read" files — pay for it to query an index of known facts. Opinions are contamination here. |
| 🔴 **Red** | Intuition Validator | Minimal — this hat is yours | Your gut about "brittle code" is a valid architectural signal. Feed Claude your hunch; ask it to find the evidence. Hunches are often ahead of logic. |
| ⚫ **Black** | Risk Auditor | FEEDBACK-LOOPS.md, CORE_PATTERNS.md, DECISIONS.md | Assign a sub-agent or fresh session to this role. Never run Black Hat in the same session as Green Hat — it kills innovation before it starts. |
| 🟡 **Yellow** | Value Archaeologist | Codebase read + BREAKTHROUGHS.md | Don't just fix — amplify what works. Ask Claude to find hidden strengths in the existing architecture. "What's quietly good here that we could amplify?" |
| 🟢 **Green** | Creative Innovator | Fresh context, no previous errors loaded | Recency bias is the enemy of creativity. Fresh session = unloaded from accumulated constraints. When the Green Hat finds a win: capture it immediately before context closes. |
| 🔵 **Blue** | Process Controller | You. You hold this permanently. | Managing which hat is active, when to switch, and what to decide first. Delegate hats to Claude; never delegate Blue Hat. "Are we thinking about this the right way?" is always your question. |

### Rules of the Full-Spectrum Architect

1. **Never mix Black + Green in one session.** Black Hat kills Green Hat thinking. Separate them.
2. **Green Hat discoveries must be captured before the session closes.** Unreported wins are lost wins.
3. **White Hat work is the most expensive.** Use indexes, grep, and pre-loaded facts rather than having Claude read full files.
4. **You are permanently the Blue Hat.** All other roles are delegatable. This one is not.
5. **Match context to role.** Green Hat needs minimal context (fresh). White Hat needs facts, not prose. Black Hat needs constraint docs, not code.

### The Knowledge Graph Goal

You're not just building software — you're building a **Knowledge Graph** of the project. Every session that follows the system should leave the project more knowable than before:

- **Semantic memory** (what the project IS): ARCHITECTURE.md, SYSTEM.md, DECISIONS.md
- **Episodic memory** (what happened): BREAKTHROUGHS.md, FEEDBACK-LOOPS.md, sprint history
- **Procedural memory** (how to do things): this file, CORE_PATTERNS.md, skills, commands

When all three are alive and in sync, any session — human or AI — can reach fluency quickly. The goal is not to load everything every time, but to have the right thing available for any query.

---

## Six Thinking Hats (De Bono)

Apply when: a decision is generating circular discussion, or when the same voice keeps winning.

| Hat | Mode | Apply When |
|-----|------|-----------|
| **White** | Pure data. What do we know? What's confirmed? What's missing? | Before starting any new feature — audit what's actually true vs assumed |
| **Red** | Gut feeling, no justification required. "This feels wrong." | When something technically works but feels like the wrong direction |
| **Black** | Devil's advocate. What can go wrong? What are the risks? | Before committing to a dependency, architecture choice, or major refactor |
| **Yellow** | Best case. What's the upside if this works? | When Black Hat is stalling progress — force a positive case |
| **Green** | Creative alternatives. What if we tried something completely different? | When stuck on one approach. "Is there a third option?" |
| **Blue** | Process meta. Are we thinking about this the right way? What should we decide first? | At session start (orientation) and when the conversation has drifted off track |

**Usage prompt:**
> "Put on the [colour] hat. From that perspective only, what's your read on [decision]?"

---

## Red Team Fresh Start

Apply when: a feature has been iterated many times and keeps breaking, OR a pattern is about to be embedded that may be hard to change.

**The premise:** Claude (or any AI) accumulates recency bias. After 10 iterations on a problem, it optimises for the constraints it has learned, not for the ideal solution. A Red Team reset bypasses this.

**How to use:**
1. Start a new session (fresh context — no previous conversation loaded)
2. Load only: `docs/architecture/ARCHITECTURE.md`, `docs/architecture/SYSTEM.md`, `docs/architecture/FEEDBACK-LOOPS.md`
3. Do NOT load the code in question yet
4. Ask: *"You are a senior iOS architect reviewing this project for the first time. Here is the architecture. Here is the problem we're trying to solve: [description]. How would you approach it?"*
5. Compare the fresh answer to the current approach. Differences = things worth interrogating.

**Trigger conditions:**
- Same bug fixed 3+ times without root cause found
- Feature works but "feels fragile" (Red Hat signal)
- About to add a constraint that cannot be easily removed later
- A decision that would be expensive to reverse (ADR candidates)

---

## Rubber Duck with Persona

Apply when: stuck on a problem and Claude is going in circles.

Rather than asking Claude to solve it, ask Claude to roleplay as someone who has never seen the code:
> "You are a new developer joining this project. You have read only `ARCHITECTURE.md`. I am going to describe a problem. Ask me clarifying questions about it — don't solve it yet."

The act of answering the questions usually surfaces the real issue.

---

## Inversion (Munger's Mental Model)

Apply when: optimising for success and not seeing clearly.

Instead of "how do we make this work?" ask "what would guarantee this fails?"

Examples applied to this project:
- "What would guarantee the pipeline fires false corrections constantly?" → Reveals the MIN_WORD_COUNT and trimTrailingFragments constraints
- "What would guarantee the API key leaks?" → Reveals the SecureStore-only rule and the `__DEV__` log guard requirement
- "What would guarantee users abandon the app in the first 30 seconds?" → Revealed the warmup mode requirement

**Usage prompt:**
> "Invert this: instead of asking how to make [X] work well, tell me the top 3 ways to guarantee it fails."

---

## The Architectural Diff

Apply when: considering adding a new dependency, refactoring a core module, or changing a constraint.

Three questions, in order:
1. **What is true now?** (White Hat — current state from code, not memory)
2. **What would this change touch?** (Map the blast radius — components, hooks, services, tests)
3. **Which documented constraint does this most stress?** (Read SYSTEM.md §"What We Never Do" + DECISIONS.md)

If question 3 produces a conflict: that conflict must be explicitly resolved (and documented as an ADR update) before proceeding.

---

## Two-Model Debate

Apply when: a decision has meaningful tradeoffs and one perspective keeps winning.

Use Claude for drafting; use Gemini (or Claude in a fresh session) for auditing.

**Roles:**
- **Claude (author):** Implements. Optimises for the current context. Knows the codebase deeply.
- **Gemini / fresh Claude (auditor):** Reviews the diff or the decision. Has 1M+ token context. Finds regressions. Doesn't have the same recency bias.

**Workflow:**
1. Claude drafts the change or decision
2. Export to Gemini: *"Claude just made this change. Based on [ARCHITECTURE.md + SYSTEM.md + FEEDBACK-LOOPS.md], did this introduce any regressions or pattern violations?"*
3. Adjudicate any conflicts before committing

**This worked in practice:** The 15s fallback removal, GARBLED smart trim, and extracted_claim CoT were all confirmed or improved via Gemini consultation (see `docs/architecture/BREAKTHROUGHS.md`).

---

## Contextual Anchoring

Apply when: starting work on any file in `hooks/` or `services/`, before adding a component, before any LLM/API change, or before committing a significant diff.

**The premise:** Don't just say "Fix the login bug." Anchor the task within the wider system before Claude begins. An unanchored prompt produces code that works in isolation but regresses something established. An anchored prompt produces code that works AND preserves existing wins.

**Core anchoring document:** `docs/architecture/CORE_PATTERNS.md` — read this before any significant code change.

---

### Anchoring Prompt Templates (for this project)

**Before any pipeline change:**
> "Read `CORE_PATTERNS.md`. Then read `hooks/useListeningPipeline.ts`. I need to [task]. Ensure your solution does not regress: P2 governance (isInterrupting as first check), AVAudioSession release on all 3 stop paths, or the setTimeout chain for the recording loop."

**Before any LLM/API change:**
> "Read `CORE_PATTERNS.md §LLM Rules`. I need to [task]. Ensure: XHR not fetch, getActiveModel() used not hardcoded model name, extracted_claim is still first in the JSON response schema, and sanitiseInput + trimTrailingFragments applied before dispatch."

**Before any store or state change:**
> "Read `CORE_PATTERNS.md §State Rules`. I need to [task]. Ensure: API key is not stored in Zustand (hasApiKey boolean only), any cross-session data goes to SecureStore not Zustand, and clearAllData() covers any new SecureStore keys you add."

**Before adding a new UI component:**
> "Read `SYSTEM.md §Component Patterns`. I need to add [component]. Ensure: BlurView glass pattern used correctly (overflow:hidden on borderRadius), no Alert.alert in any error path (in-character card instead), and no high-frequency values passed via Zustand."

**Before adding a new dependency:**
> "Read `ARCHITECTURE.md §What We Never Do`. I want to add [library] for [reason]. Run Black Hat: what does this dependency cost in terms of app size, native rebuild requirement, and long-term maintenance? What is the minimum implementation without this library?"

---

### Force a Regression Check Before Committing

Run this after completing any significant change — before writing the commit message.

> "Before we commit: read `CORE_PATTERNS.md §Quick Regression Checklist`. Walk through each item against the code we just changed. Report any item that is uncertain or potentially violated."

For pipeline changes, also check:
> "Verify the three AVAudioSession stop paths are still complete. Verify P2 (`if (isInterrupting) return`) is still the first check in `scheduleAnalysis`. Verify `segmentIdRef` and `epochIdRef` are reset on all stop paths."

For LLM prompt changes, also check:
> "Verify `extracted_claim` is still the first field in the JSON schema. Verify the COMPLETE/INCOMPLETE/GARBLED definitions are intact and not contradicted by any new instruction."

---

### The Recursive Test

Apply after writing or updating any architecture documentation.

> "Read `CORE_PATTERNS.md` and `ARCHITECTURE.md §Core Structural Decisions`. Based only on these files, tell me how you would implement [a new feature similar to what we just built]. If your answer differs from how we actually built it, the docs need updating."

This catches documentation drift — where the docs describe an idealized version that diverges from the actual code.

---

### Diff Review Prompt

For significant refactors, run this before closing the session:

> "Review the changes we made this session. Identify any place where the new code contradicts the patterns in `CORE_PATTERNS.md`. Specifically check: are we re-introducing any issue from `FEEDBACK-LOOPS.md §Category 1`? Report violations and uncertainties — don't assume correctness."

---

## Chunking and MapReduce

Apply when: running a full codebase audit, doing a deep architectural review, or handing work to sub-agents where loading everything at once would cause "lost in the middle" degradation.

**The principle:** An AI reading 36 files sequentially in one context will give progressively worse attention to the later files. Chunking splits the codebase into cohesive, independently-auditable units. Each chunk is read and analysed on its own. Findings are then aggregated (the Reduce step).

**Two decomposition strategies are available for this project.** Choose the one that matches the audit goal.

> **Execution-slice note:** Bugs at seams, not centres. When diagnosing a fault, prioritise the interfaces between chunks (e.g. the boundary between useListeningPipeline and llmClient) over the internal logic of any single chunk. Functional areas rarely fail in their own territory — they fail where they hand off to another. Strategy B (feature/UX chunks) is better than Strategy A for catching seam bugs because each chunk includes the full hand-off chain.

---

### Strategy A — By Code Function Area

Use when: auditing implementation patterns, checking for constraint violations, reviewing a specific technical concern (e.g. "are all API calls using XHR?", "are all stop paths releasing AVAudioSession?").

**6 chunks — selected for this project's size and Sonnet's working context.**

| Chunk | Name | Files | Audit Focus |
|-------|------|-------|-------------|
| **A1** | Audio Pipeline | `hooks/useListeningPipeline.ts`, `services/audioLevel.ts`, `services/rateLimit.ts`, `services/snipes.ts` | Chunked recording loop (setTimeout chain), P1/P2/G3 guards, warmup mode, first-minute mode, all 3 stop paths, AVAudioSession release, metering poll 200ms floor |
| **A2** | LLM & AI Engine | `services/llmClient.ts`, `services/pedantEngine.ts`, `services/remoteConfig.ts`, `services/parseUtils.ts`, `services/contentFilter.ts` | XHR not fetch, no hardcoded model names, getActiveModel() usage, extracted_claim first field, trimTrailingFragments, content filter applied before TTS |
| **A3** | Roasting & TTS Output | `hooks/useRoastingPipeline.ts`, `services/roastEngine.ts`, `services/ttsOutput.ts` | Roasting loop timing, isFetching guard, TTS routing (speaker vs earpiece), speakWithFullVolume path, roast fallback, stopAll completeness |
| **A4** | State, Config & IAP | `store/useAppStore.ts`, `constants.ts`, `types.ts`, `services/iapService.ts`, `services/responsePacks.ts` | API key never in Zustand (hasApiKey boolean only), SecureStore key names in constants.ts, discriminated union correctness, clearAllData() completeness, IAP non-consumable setup |
| **A5** | Home Screen UI | `components/ListenButton.tsx`, `components/WaveGridBackground.tsx`, `components/FloatingBubbles.tsx`, `components/CorrectionCard.tsx`, `components/HistoryCards.tsx`, `styles/glassEffects.ts` | No Animated.Value in Zustand, audioLevel subscription pattern, BlurView pattern (overflow:hidden on borderRadius), no Alert.alert (in-character cards only), spring animations |
| **A6** | App Shell, Settings & Onboarding | `App.tsx`, `index.ts`, `components/BottomNav.tsx`, `components/ErrorBoundary.tsx`, `components/LoadingScreen.tsx`, `components/SettingsModal.tsx`, `components/OnboardingModal.tsx`, `components/ApiKeyPanel.tsx`, `components/ApiKeyFAQ.tsx`, `components/RoastingScreen.tsx`, `components/RoastVictimSheet.tsx`, `components/FlameBackground.tsx`, `components/RelayKillSwitchModal.tsx` | URL scheme handler, mid-session access recovery useEffect, in-tree sheet (not Modal) for settings, in-character ErrorBoundary copy, all __DEV__ guards on console calls |

**Audit per chunk (Map step):**
> "Audit this chunk against the hard rules. Files: [list]. Hard rules: [FEEDBACK-LOOPS.md §Hard Rules]. Report: violations, drift, and anything that looks like a previously-solved problem. Do not suggest new features."

**Aggregate (Reduce step):**
> "Here are the findings from 6 independent chunk audits: [paste all]. Identify: any cross-chunk concerns, the highest-priority violation, and whether any finding contradicts another."

---

### Strategy B — By Feature/UX Area

Use when: diagnosing a user-reported bug, reviewing the end-to-end behaviour of a specific flow, or checking that a feature is consistent across all its code paths (hooks + services + components).

**5 chunks — covers all user-facing journeys.**

| Chunk | Name | Files | Audit Focus |
|-------|------|-------|-------------|
| **B1** | Activate & Listen | `App.tsx`, `hooks/useListeningPipeline.ts`, `components/ListenButton.tsx`, `components/FloatingBubbles.tsx`, `components/WaveGridBackground.tsx` | API key check → intro TTS → isActivating guard → warmup mode start → recording begins → audio-reactive UI. Cancel-during-activation path. Background AppState stop. |
| **B2** | Correct & Interrupt | `hooks/useListeningPipeline.ts` (scheduleAnalysis + correction fire sections), `services/pedantEngine.ts`, `services/llmClient.ts`, `services/ttsOutput.ts`, `components/CorrectionCard.tsx`, `components/HistoryCards.tsx` | P1/P2/G3 stale guards, in-character correction card (not Alert), correction fires TTS then resumes recording, AVAudioSession re-assert before resume, history card logged |
| **B3** | Roast Mode | `hooks/useRoastingPipeline.ts`, `services/roastEngine.ts`, `services/ttsOutput.ts`, `components/RoastingScreen.tsx`, `components/RoastVictimSheet.tsx`, `components/FlameBackground.tsx`, `store/useAppStore.ts` (victimName) | Victim name flow, isFetching guard, roast TTS loop, stopAll on tab switch, flame animation state, in-character failure cards |
| **B4** | Settings, Onboarding & IAP | `components/SettingsModal.tsx`, `components/OnboardingModal.tsx`, `components/ApiKeyPanel.tsx`, `components/ApiKeyFAQ.tsx`, `services/iapService.ts`, `services/responsePacks.ts`, `store/useAppStore.ts` | Disclosure step on first launch, secureTextEntry on key input, key written to SecureStore (not Zustand), isPro gate on response packs, IAP restore path |
| **B5** | Error, Relay & Character Voice | `services/llmClient.ts` (error types), `components/RelayKillSwitchModal.tsx`, `App.tsx` (mid-session recovery useEffect), `components/ErrorBoundary.tsx` | RelayDisabledError/RelayTransientError handling, HAS_USED_RELAY check, kill switch modal for returning users, in-character ErrorBoundary copy, no raw system dialogs anywhere |

**Audit per chunk (Map step):**
> "Audit this user journey end-to-end. Files: [list]. Report: any broken step in the flow, any constraint violation, any place where the in-character voice is broken, any missing error path. Do not suggest new features."

**Aggregate (Reduce step):**
> "Here are 5 journey audits: [paste]. What is the weakest journey? Are there any cross-journey inconsistencies (e.g. error handling works differently in roast vs listen mode)?"

---

### Choosing between A and B

| Goal | Use |
|------|-----|
| Technical constraint check ("are all XHR calls using abort correctly?") | Strategy A |
| Bug report ("user says the app crashes after roasting") | Strategy B |
| Pre-release audit (all constraints + all journeys) | Run both: A first for constraints, B for journeys |
| Regression check after a specific file change | Strategy A — only the affected chunk |
| New developer onboarding | Strategy B — journey chunks read like a feature spec |

---

## FE Visualisation Protocol

Apply when: debugging visual layout, implementing animations, working on imagery, or co-working with design tools.

**Core principle:** Look before you fix. Verbal description is triage. Screenshots are diagnosis.

### Tool Hierarchy (pick the lowest-friction option first)

| Situation | Tool | Notes |
|-----------|------|-------|
| "What does it look like right now?" | Python snap | Default. Fast, OS-rendered. `python3 ~/.claude/scripts/snap.py` |
| Specific viewport / mobile width | Playwright MCP | 75% scale, PNG. Only when snap is insufficient. |
| User reports device-specific bug | Human screenshot | Their view is ground truth. Ask for it. |
| Deployed page / live URL inspection | Playwright → live URL | No local window needed. |
| Competitor / external data extraction | Apify | Escalation from Playwright when blocked or at scale. |
| Code → design file | Penpot MCP | `/penpot-html-to-design` skill. One component per call. |
| Design → code | Figma MCP | `get_design_context` with nodeId from URL. |
| Image asset management | Cloudinary MCP | Search, transform, upload from within Claude. |
| Verbal description | Triage only | Never a diagnosis. Snap immediately after triage. |

### Penpot session checklist (before starting any Penpot work)

1. Penpot desktop app open + MCP plugin active?
2. Smoke-test: `penpotUtils.getPages()` returns?
3. Job sequence planned: Audit → Components → Frame → Compose → Verify
4. One component per `execute_code` call (30s bridge timeout)
5. Use `board.appendChild(shape)` — NEVER `board.flex.appendChild`
6. Brand tokens read from codebase — not guessed

Full reference: `docs/architecture/FE-VISUALISATION.md`

---

---

## Architecture Audit Mode

Apply Six Hats to the architecture docs and system itself — not to the code, but to the documentation layer. Run this before a major release, when starting a new project phase, or quarterly on long-running projects.

Each hat asks a different question about the system. Run them in sequence; the Blue Hat question (last) produces the action item.

| Hat | The Question | What you're looking for |
|-----|-------------|------------------------|
| ⚪ **White** | "List every architecture doc, its last validation date, and the specific code files it references. Which docs have NO direct code reference?" | Orphaned docs; claims that can't be verified |
| 🔴 **Red** | "Which part of the architecture system feels like dead weight? Which section do you never open?" | Over-engineered areas; docs nobody reads |
| ⚫ **Black** | "Which constraint could be silently violated without anyone noticing? Which doc goes stale the fastest when the codebase changes?" | Hidden single points of failure; drift-prone docs |
| 🟡 **Yellow** | "Which doc has earned its keep? Which pattern has paid for itself 10×? Which constraint has prevented the most regressions?" | What to amplify; what to make more prominent |
| 🟢 **Green** | "If you rebuilt this architecture system from scratch today, what would you drop? What's missing that would change how sessions go?" | Structural improvements; gaps worth filling |
| 🔵 **Blue** | "Given all of the above: what ONE change to the architecture system has the highest leverage?" | The single action item that comes out of the audit |

**Prompt template:**
> "We're running an architecture audit. Put on the [colour] hat. From that perspective only: [question from table above]. Based on the current state of `docs/architecture/`."

---

## Reflective Architecture Rituals

Repeatable techniques for keeping the system alive and self-improving. These complement the daily `/arch-check` and `/sync-arch` rituals — they're the deeper maintenance layer.

---

### 1. The Freshness Audit

**What:** Validate key architecture doc claims against actual code.

**When:** Before any major release. After significant refactors. When a session feels like the docs and code are diverging.

**How:**
```
For each architecture doc:
  1. Identify 3 specific claims (e.g. "audioLevel is a module-level Animated.Value")
  2. Run grep to confirm each claim is still true
  3. Mark claims: ✅ confirmed / ⚠️ drifted / ❌ incorrect
  4. Update the doc for any drifted or incorrect claims
```

**Prompt template:**
> "Audit `[doc].md` for documentation drift. For each specific technical claim, either confirm it with a grep result or flag it as potentially stale. Report: confirmed, drifted, or wrong — don't suggest improvements."

**The signal:** If you find more than 2 incorrect claims in a single doc, that doc needs a full rewrite pass.

---

### 2. The Five Whys — Regression Root Cause

**What:** When the same bug or pattern violation appears 3+ times, the real problem is a missing or unclear constraint.

**When:** After a third occurrence of the same issue. When a Hard Rule (FEEDBACK-LOOPS.md) keeps getting violated despite being documented.

**How:**
```
Start with: "This [bug/pattern/violation] happened again."
Why 1: What caused it this session?
Why 2: What caused that cause?
Why 3: What underlying condition made that possible?
Why 4: What in the architecture/docs allowed that condition?
Why 5: What constraint is unwritten or underspecified?
```

The 5th answer is the one worth acting on. Write it immediately to `CORE_PATTERNS.md` or `FEEDBACK-LOOPS.md §Hard Rules`.

**Universal example:**
- Issue: API key appeared in log output (3rd time).
- Why 1: Dev logged the response object. Why 2: The response object included request headers. Why 3: Headers include the API key. Why 4: No rule said "never log response objects raw." Why 5: **The constraint was "never store the key" but not "never log the key's context."** → New constraint written.

---

### 3. SCAMPER on Architecture

**What:** Apply the SCAMPER ideation framework to evolve the architecture docs and patterns systematically. Not for code — for the documentation and process layer.

**When:** When the system feels over-complex, when onboarding is harder than it should be, or when a sprint feels like it's producing diminishing returns.

**The seven passes:**

| Letter | Question | Applied to architecture docs |
|--------|----------|------------------------------|
| **S**ubstitute | What if we replaced [doc/pattern] with something simpler? | Is ARCHITECTURE_EXTENSION.md worth a standalone file, or should its contents live in ARCHITECTURE.md? |
| **C**ombine | Which two docs have too much overlap? | Could FEEDBACK-LOOPS.md and BREAKTHROUGHS.md merge into a single "lessons" file? |
| **A**dapt | What from BREAKTHROUGHS.md should be promoted to CORE_PATTERNS.md? | A breakthrough that's been validated repeatedly is a constraint waiting to be written |
| **M**odify/Magnify | Which constraint is underspecified? Which doc is too thin to be load-bearing? | Which doc produces the most follow-up questions when Claude reads it? |
| **P**ut to another use | Which approach model in six-hats.md hasn't been tried yet? | "We've never tried the Disney Strategy for feature planning" |
| **E**liminate | Which doc has become noise at this project stage? | Pre-launch checklist items that are permanently done shouldn't be re-read every session |
| **R**everse | If this constraint were the OPPOSITE, what would fail first? | "What if we DID store the API key in Zustand?" → surfaces why the constraint exists |

---

### 4. The Fresh Contributor Test

**What:** Simulate approaching the codebase as a new developer — no prior context — to find documentation gaps.

**When:** Before adding a new developer or AI agent to the project. When documentation hasn't been validated in a while. As a quality gate before closing a documentation sprint.

**How:**
1. Start a fresh session with no project context loaded
2. Load only: `ARCHITECTURE.md`, `SYSTEM.md`, `CORE_PATTERNS.md`
3. Ask: *"A new developer joins this project. They have read only these three docs. They are asked to implement [specific feature]. Walk through what they would do — and where they would go wrong."*
4. Each wrong answer = a documentation gap

**The recursive test** (for doc writers):
> "Read `CORE_PATTERNS.md` and `ARCHITECTURE.md §Core Structural Decisions`. Based only on these, tell me how you would implement [feature similar to what we just built]. If your answer differs from how we actually built it, which doc needs updating?"

This catches the most common documentation failure: docs that describe an idealised version that diverges from actual code.

---

### 5. The Context Window Budget

**What:** Account for your context spend per session to detect when the system is over-engineered.

**When:** Periodically, or when sessions feel expensive and slow.

**Budget reference:**

| Layer | What | Typical tokens |
|-------|------|---------------|
| L1 — Always | CLAUDE.md + MEMORY.md | ~2,000 |
| L2 — Session start | Handoff + tasklist + CORE_PATTERNS.md | ~5,000–8,000 |
| L3 — On demand | One specialist file per need | ~1,000–4,000 each |
| **Target** | **Total per session start** | **<15,000** |

If you regularly exceed budget: run SCAMPER Eliminate. If L2 alone exceeds budget: the foundation docs are too long and need compression.

**Binary skills rule:** Keep skill and context files as structured lists and tables, not prose paragraphs. AI parses lists faster and more reliably than flowing text.

---

## Incentive Architecture — Designing Self-Improving Systems

The system only works if the right actions are rewarded. Design the incentives, not just the rules.

**The core principle:** Make capturing knowledge the path of LEAST resistance. If recording a win takes longer than not recording it, it won't happen.

### The Four Feedback Loop Types

Every well-designed AI coworking system runs four loops:

| Loop | Mechanism | Failure mode |
|------|-----------|-------------|
| **Learning** | Wins are captured immediately into BREAKTHROUGHS.md | Wins get discussed but not written; forgotten next session |
| **Regression** | Mistakes permanently close the door (FEEDBACK-LOOPS.md Hard Rules, CORE_PATTERNS.md constraints) | Same mistakes recur because "we know not to do this" but it isn't written |
| **Alignment** | Every session starts from the same ground truth (Layer 1/2/3 load sequence) | Context drift leads to architectural decisions that contradict earlier ones |
| **Improvement** | Every sprint makes the system itself better (sprint history, roadmap backlog) | Sessions get better at building but the system for building gets stale |

### Automated Evidence

Make compliance evidence automatic, not remembered. The best architecture systems produce audit trails without the developer doing anything:

- **PostToolUse change-log** — every Edit/Write produces a timestamped diff file. Evidence of every change without any manual effort.
- **Commit messages** — Conventional Commits format means every commit is self-describing. No archaeology needed.
- **Command log** — every Bash command recorded. Debugging sessions become reconstructable.
- **Pre-edit backups** — sensitive files backed up automatically before modification. Recovery requires no thought.

The signal of a well-designed incentive system: when a session goes well, the architecture docs update almost automatically as a side-effect of normal work.

### The Anti-Regress Rule

When you catch yourself doing something the system said not to (a Hard Rule violation):

1. Fix it immediately
2. Write a note in the FEEDBACK-LOOPS.md entry about **how** the violation happened — not that it happened, but what made it tempting or easy
3. Update the constraint to make that specific path harder

Violations are valuable data about where the system is brittle. Don't waste them.

### Completing Condition Discipline

Every sprint must have a Completing Condition — what does done look like? Without this:
- Sprints drift into open-ended work
- "Maintenance mode" becomes "nothing mode"
- Documentation sprints never end because "there's always more to add"

Good completing condition: *"Done when: all new feature code has a corresponding architecture doc entry AND the Fresh Contributor Test passes on those entries."*

---

## Additional Creative Methods

---

### Disney Creative Strategy

**Apply when:** Moving from a raw idea to a workable plan. Most useful at the START of a new feature or architectural decision, before any code.

**Three strictly separated roles:**

| Role | Mindset | Constraint |
|------|---------|-----------|
| **Dreamer** | Unbounded. "If there were no limits, what would this feature do?" | No reality checks allowed. No "but we can't because..." |
| **Realist** | Implementation only. "How would we actually build the Dreamer's best idea?" | No new ideas. No criticism. Just: what's the path? |
| **Critic** | Risk only. "What are the three ways this would fail in production?" | No cheerleading. Only failure modes, edge cases, gotchas. |

**Rules:**
- Never mix roles in one session. Dreamer first. Realist second. Critic last.
- The Critic role is natural for Black Hat — assign to a sub-agent or fresh session.
- If the Critic kills the Realist's plan: loop back to Dreamer, not to scrap the idea.

**Usage prompt:**
> "You are the [Dreamer / Realist / Critic] only. No other roles. [Frame the problem]. From that perspective: [specific question]."

---

### The Double Diamond

**Apply when:** Planning a major architecture iteration, a new feature from scratch, or any significant scope definition.

```
◇ DISCOVER (diverge)     → ◆ DEFINE (converge)     → ◇ DEVELOP (diverge)     → ◆ DELIVER (converge)
  What are all options?       What exactly are we         Multiple approaches        Which version ships?
  All constraints?            building? Not building?     tried and compared         What gets cut?
```

**Each phase is a conscious mode switch:**

- **Discover:** Green Hat + White Hat. Gather options, research constraints, generate alternatives. No decisions yet.
- **Define:** Blue Hat. Pick the problem worth solving. Write the completing condition. Everything else is explicitly out of scope.
- **Develop:** Green Hat + Yellow Hat. Build, prototype, experiment. The goal is learning, not shipping.
- **Deliver:** Black Hat + Blue Hat. Which version actually ships? What gets cut? Commit to one path.

**The two anti-patterns:**
1. Jumping Discover → Deliver: skipping Define leads to scope drift and rebuilt work
2. Stuck in Develop: no convergence mechanism means experiments multiply without resolution

---

### Five Whys

**Apply when:** The same problem recurs. A constraint keeps getting violated. Something breaks in production that "shouldn't have been possible."

**How:**
```
State the problem clearly.
Why 1: What directly caused it?
Why 2: What caused that cause?
Why 3: What underlying condition enabled that?
Why 4: What in the system/docs allowed that condition?
Why 5: What rule was unwritten, unclear, or easy to bypass?
```

**The rule:** The 5th answer — and only the 5th — is worth writing as a new constraint. Writing down Why 1 or Why 2 just documents symptoms.

**In practice:** If you can't get to 5 without looping back to the same answer, you've found the root. If the 5th answer is "we didn't know," you need a document. If it's "we knew but forgot," you need automation.

---

## Alternative Perspectives — Approaches to Try

The following are drawn from adjacent disciplines: military strategy, philosophy, economics, systems theory, and creative practice. Each is well-validated in its original domain. These are proposals — candidate lenses for specific tricky circumstances or for reaching a higher standard of excellence. Most have not been applied systematically to AI coworking yet; that's the point.

---

### The Pre-Mortem (Gary Klein)

Distinct from Black Hat. Black Hat asks: *"What could go wrong?"* Pre-Mortem assumes the worst has already happened and asks: *"How did we get here?"*

**Apply when:** Before shipping a significant release. Before committing to an irreversible architecture decision. When Black Hat isn't producing concrete enough concerns.

**How:** Set a future date. State the failure confidently:
> *"It is six months from now. We shipped version X and it failed catastrophically — pulled from the App Store, users abandoned it, critical bug in production. Describe in specific detail what went wrong."*

Work backwards from the assumed failure. The exercise forces specificity that "what could go wrong?" often doesn't. People will say things in the Pre-Mortem they wouldn't say in a risk review.

**Paired with:** Black Hat (for risk identification), Disney Critic (for final vetting before launch).

---

### Steelmanning

Build the strongest possible version of the argument you're about to reject — before you reject it.

**Apply when:** Making a binary architectural choice. Removing a dependency or constraint. Challenging a pattern that's been inherited rather than designed. Any time you find yourself dismissing an approach quickly.

**How:**
> *"Build the strongest possible argument FOR [the approach I'm about to reject]. What is the best case for it? What would a smart person who chose it be seeing that I'm not?"*

The rule: you must be able to articulate the steelman to the other side's satisfaction before proceeding. If you can't, you haven't understood the choice.

**Why it matters for AI coworking:** Claude will often agree with whatever framing you lead with. Steelmanning forces an adversarial check on that confirmation bias before it sets.

**Paired with:** Two-Model Debate (have Gemini steelman the other side independently).

---

### Chesterton's Fence

*"Do not remove a fence until you understand why it was built."*

Before deleting any constraint, pattern, rule, or piece of code, you must first be able to clearly articulate why it exists. If you can't: find out before touching it.

**Apply when:** About to remove a constraint that "seems unnecessary." Deleting code that looks dead. Relaxing a security rule. Cleaning up "over-engineered" architecture.

**The test:**
1. Can you explain what scenario this was built to prevent?
2. Has that scenario been confirmed to be impossible now?
3. Is there evidence in the git log, ADRs, or FEEDBACK-LOOPS.md?

If all three are no: don't remove. Add a code comment explaining you don't know why it's there, and set a reminder to investigate. Removing things you don't understand is how half the hard rules in FEEDBACK-LOOPS.md got re-learned.

**Works in reverse too:** When adding constraints, always document WHY, not just WHAT. Future sessions thank you.

---

### Second-Order Thinking (Howard Marks)

*"And then what?"* Most decisions look correct at the first-order level. Most problems are caused by second and third-order effects that weren't traced.

**Apply when:** Evaluating architecture changes with cascading effects. Dependency additions. UX changes that touch multiple flows. Anything with the word "refactor" in it.

**How:** Write it out explicitly:
```
Decision: [what we're doing]
1st order: [the direct effect]
2nd order: and then what?
3rd order: and then what after that?
```

**Example:** *"We add a required field to the LLM JSON schema. First: richer data. Second: old relayed responses from the cached/relay model that don't have the field now fail to parse. Third: repairJson() needs updating AND integration tests need new fixtures AND the relay model prompt needs the field described."*

**The rule:** If you can't trace to at least the 2nd order before shipping, you're flying blind.

---

### First Principles

Strip away all analogies and received wisdom. Ask: *"What is literally, fundamentally true about this problem?"* Rebuild from axioms, not inherited patterns.

**Apply when:** Something keeps breaking despite "correct" implementation. A constraint exists "just because that's how it's done." You need a genuinely novel solution, not an improved version of a failing one.

**How:**
> *"Ignore how this is typically implemented. If we knew nothing except [the goal to achieve], what would we derive from first principles? What is the irreducible truth here?"*

**Example applied:** *"Why does the transcript have to be sent as a string at all? Because the LLM needs text to reason about. Does it need the FULL string? No — it needs enough signal to detect errors. What's the minimum?"* → Leads to the trimming/gating approach rather than sending everything.

**Caution:** First Principles thinking is expensive in tokens and session time. Reserve it for genuine dead ends where incremental improvement is clearly insufficient. Don't use it to reinvent patterns that are fine.

---

### The OODA Loop (Boyd)

**Observe → Orient → Decide → Act** — then loop immediately. Originally a military decision cycle for fast-changing environments; the insight maps directly to rapid iteration debugging.

**Apply when:** Debugging under time pressure. Rapid iteration cycles where each change produces a new failure. When requirements or context is shifting mid-session.

**The key insight:** The "Orient" phase — interpreting your observations through your current mental model — is where most errors hide. Code bugs are usually symptoms of model bugs. If you can't explain *why* a fix should work, you're in the wrong loop.

**For AI coworking:** After every Act (code change), the next step is Observe — not Decide. Don't stack decisions without observing the effect of each. One change at a time, with deliberate observation between. Speed comes from tight loops, not from skipping loops.

**Signal that you're in a broken OODA:** You've made three consecutive changes to fix the same bug without it improving. Stop. Go back to Observe. Read logs, add debug output, check assumptions.

---

### The Socratic Method

Pure questioning. No assertions — only questions that expose assumptions and contradictions.

**Apply when:** A pattern is being defended on authority ("we always do it this way"). Interrogating inherited code before modifying it. When a session is going in circles because everyone agrees but nothing resolves.

**How:** Ask a question. Take the answer. Ask why THAT is true. Keep going until you hit either a bedrock truth or someone (including Claude) says "I don't know."

*"Why is [constraint] necessary?"* → *"Because X."* → *"Why is X true?"* → *"Because Y."* → *"Why is Y true?"* → *"I... don't know."*

**That "I don't know" is the actual question worth answering.** Everything above it was symptom.

**Paired with:** Five Whys (which is structured Socratic drilling on a single causal chain). Red Team Fresh Start (which is Socratic at the session level — don't assume the approach is right).

---

### Theory of Constraints (Goldratt)

Every system has exactly ONE bottleneck that limits its overall throughput. Improving anything other than the bottleneck produces no measurable improvement.

**Apply when:** Performance optimization has produced diminishing returns. Multiple things feel "slow" or "expensive" and you can't tell which to fix first. Context budget feels exhausted but you can't identify why.

**Three questions in order:**
1. **What is the constraint?** The one thing that limits the whole system's performance.
2. **How do we elevate it?** Make the constraint non-binding — either remove it or make it no longer the limiting factor.
3. **What is the new constraint after that?** The next bottleneck will surface; identify it before declaring victory.

**Applied to AI sessions:** The constraint is often context budget — not reasoning quality, not prompt length. Fix the loading strategy before optimising prompts. If L2 loading takes 8K tokens, reducing prompt word count by 10% saves nothing.

**Applied to pipeline architecture:** The constraint might be LLM latency, transcription time, or TTS queuing. Profiling before optimising avoids improving a non-constraint.

---

### The Johari Window — Applied to AI Coworking

Four-quadrant model of shared knowledge between two parties. Applied to developer + AI sessions:

```
                    Known to YOU    Unknown to YOU
Known to Claude  │  Open (load     │  Blind spot
                 │  efficiently)   │  (ask for it)
─────────────────┼─────────────────┼──────────────
Unknown to Claude│  Hidden         │  Unknown
                 │  (you must      │  (needs
                 │  state it)      │  exploration)
```

**Apply when:** Session output feels off-target despite clear instructions. AI keeps making the same wrong assumption. Starting a new type of session or working with a new area of the codebase.

**The insight:** Most session failures happen in the **Hidden** quadrant. You know something crucial but haven't stated it because it seems obvious to you. Claude fills that gap with an assumption — usually a plausible one that's wrong for your specific context.

**Prompt:**
> *"Before we start: what do I know about this problem that you don't, that I might be taking for granted? Ask me clarifying questions about the context before proposing anything."*

This surfaces the Hidden quadrant before it causes errors. Costs one exchange; saves many.

---

### Oblique Strategies (Brian Eno / Peter Schmidt)

A deck of abstract provocations designed to break habitual thinking. Originally for music composition; applies anywhere the obvious approach has stopped working.

**Apply when:** Genuinely stuck after trying direct approaches. Creative block on a UX, aesthetic, or architectural problem. Sessions that keep producing the same unsatisfying answer.

**The method:** Apply a random provocation literally and see what it dislodges. The goal isn't to follow the instruction — it's to use it as a mental interrupt on a locked pattern.

**Provocations useful in a build/audit context:**

| Provocation | What it might unlock |
|-------------|---------------------|
| *"Use an old idea."* | What approach did we try and reject earlier that might actually work here? |
| *"What is the simplest thing that could possibly work?"* | Often the direct answer to "we've been over-engineering this" |
| *"Remove ambiguities and convert to specifics."* | Forces White Hat grounding when you're stuck in abstraction |
| *"Emphasize the flaws."* | Directed Black Hat — find what's wrong, not what's right |
| *"Work at a different speed."* | What if we shipped the minimal version first? What if we slowed down and wrote the ADR before coding? |
| *"What would your most critical friend say?"* | Combine with Steelmanning |
| *"Is it finished?"* | Quality gate — apply the Fresh Contributor Test |

**Best for:** Aesthetic and UX decisions. Naming things. Architectural decisions that don't have an obvious "right answer." Breaking out of optimisation loops that are no longer improving anything.

---

## When to Pick Which Model

| Situation | Recommended Model |
|-----------|------------------|
| **In-session decisions** | |
| Stuck in a loop, same approach not working | Red Team Fresh Start |
| Decision with competing tradeoffs | Six Hats (Black + Yellow) |
| Something feels wrong but hard to articulate | Red Hat + Rubber Duck |
| About to make a hard-to-reverse choice | Architectural Diff + ADR |
| Long session, context degrading | Blue Hat + `/session-synthesis` |
| Just finished a major change | Two-Model Debate (Gemini audit) |
| **Planning and ideation** | |
| Raw idea → workable plan | Disney Creative Strategy |
| Scoping a new feature or major iteration | Double Diamond (Discover → Define first) |
| Generating creative alternatives | Six Hats — Green Hat only, fresh session |
| Optimising or improving what already exists | SCAMPER on Architecture |
| **Audit and reflection** | |
| Reviewing architecture docs for drift | Architecture Audit Mode (hat-by-hat) |
| Same bug or violation appearing for 3rd time | Five Whys → new constraint written |
| Pre-release quality gate | Fresh Contributor Test + Freshness Audit |
| Architecture system feels over-engineered | Context Window Budget + SCAMPER Eliminate |
| Reviewing whether the system itself is working | Architecture Audit Mode — Green Hat + Blue Hat |
| Full codebase audit or pre-release check | Chunking and MapReduce — Strategy A then B |
| Bug spans multiple files / unclear which layer | Chunking and MapReduce — Strategy B (feature/UX) |
| Passing codebase context to Gemini | Chunking and MapReduce — one chunk per Gemini call |
| **Visual and design** | |
| Visual / layout bug or UI work | FE Visualisation Protocol |
| Working with design tools (Penpot / Figma) | FE Visualisation Protocol → Penpot checklist |
| **System health** | |
| Incentive system not working (wins not captured) | Incentive Architecture — Learning Loop audit |
| Same constraint violated repeatedly | Five Whys + Anti-Regress Rule → FEEDBACK-LOOPS.md |
| Onboarding a new developer or AI agent | Fresh Contributor Test |
| Deciding what to document next | Architecture Audit Mode — Yellow Hat + Green Hat |
| **Alternative perspectives** | |
| Before a major release or irreversible decision | Pre-Mortem (assume failure, trace backwards) |
| About to reject an approach quickly | Steelmanning (build the strongest case for it first) |
| Removing code/constraint you don't fully understand | Chesterton's Fence (find the reason before touching it) |
| Architecture change with cascading effects | Second-Order Thinking (trace 3 levels deep) |
| Pattern keeps breaking despite "correct" implementation | First Principles (strip analogies, rebuild from axioms) |
| Debugging under pressure, changes not improving things | OODA Loop (stop stacking decisions; observe first) |
| Circular justification / inherited pattern | Socratic Method (keep asking "why" until "I don't know") |
| Performance optimisation with unclear bottleneck | Theory of Constraints (find the ONE limiting factor) |
| Session output feels off despite clear instructions | Johari Window (surface what you're taking for granted) |
| Stuck after all direct approaches exhausted | Oblique Strategies (random provocation as mental interrupt) |
| Need breakthrough not incremental improvement | 10x Challenge (what assumption must we abandon entirely?) |
