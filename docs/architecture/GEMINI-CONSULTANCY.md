# Gemini MCP — Consultancy Protocol

How to use the Gemini MCP for architectural audit, decision validation, root cause analysis, and research within a Claude Code session. This replaces the manual copy-paste approach previously used.

---

## Why Gemini

Claude accumulates recency bias in a working session. After 10+ iterations on a problem, it optimises for the constraints it has learned, not for the ideal solution. Gemini — called fresh with only the context you explicitly pass — has no prior history with the problem. It audits from the outside.

This is the "Gemini Reads, Claude Writes" protocol: Claude authors and implements; Gemini validates and challenges.

**When Gemini has been useful in this project:**
- Code review (2026-03-20): provided independent second opinion on the post-refactor codebase — confirmed CSS architecture, JS patterns, and performance optimisations. No regressions found.
- The "Gemini Reads, Claude Writes" protocol is most valuable when Claude has been iterating on the same problem for many steps — Gemini's unbiased read can break the deadlock.

---

## Tool Reference

| Tool | Model | Max Response | Use For |
|------|-------|-------------|---------|
| `mcp__gemini__ask_gemini` | Gemini 3 Flash | 8,192 tokens | Analysis, synthesis, architecture audit, second opinion. Fast. |
| `mcp__gemini__ask_gemini_pro` | Gemini 3 Pro | 16,384 tokens | Complex architectural reasoning, multi-constraint decisions, deep code review. |
| `mcp__gemini__web_search` | Gemini + Google | — | Research — libraries, RN issues, API behaviour, competitor patterns. |
| `mcp__gemini__web_reader` | Gemini | — | Read a specific URL — docs, specs, Stack Overflow threads, release notes. |
| `mcp__gemini__parse_document` | Gemini multimodal | — | Parse PDFs, images, scanned docs (up to 20MB public URL). |

**Flash vs Pro:**
- Flash first — it's fast and sufficient for most audits and second opinions.
- Pro when: the problem is genuinely complex (multi-constraint, deep reasoning required), Flash's response lacks the depth needed, or you're making a hard-to-reverse architectural decision.

---

## Consultancy Patterns

### Pattern 1 — Architecture Audit (most common)

Use after significant changes, before committing a major refactor, or when `FEEDBACK-LOOPS.md` rules may have been under pressure.

**Prompt structure:**

```
system_prompt: "You are performing a cross-session architectural audit of a static website called 'anthropicprinciple.ai'. You are the AUDITOR, not the author. Claude Code wrote this code. Your job is to find drift, regressions, and constraint violations — not to suggest new features."

prompt: """
ARCHITECTURE CONSTRAINTS (do not violate these):
[Paste ARCHITECTURE.md §Core Structural Decisions + §What We Never Do]

SYSTEM RULES:
[Paste SYSTEM.md §Rules of Engagement]

HARD RULES (derived from feedback loops):
[Paste FEEDBACK-LOOPS.md §Hard Rules Extracted]

CHANGED CODE:
[Paste the relevant file(s) or diff]

AUDIT QUESTION:
Does the changed code above introduce any:
1. Violations of the "What We Never Do" constraints?
2. Drift from the documented architecture patterns?
3. Regressions of issues documented in the Hard Rules?
4. New race conditions or sequencing risks?

Output:
- Confirmed solid: [list]
- Potential drift: [specific file + pattern violated]
- Regressions to check: [list]
- Recommended action: [1-2 sentences max]
"""
```

**Which tool:** `ask_gemini` (Flash) unless the diff is large and multi-file → use `ask_gemini_pro`.

---

### Pattern 2 — Stuck in a Loop (break deadlock)

Use when the same bug has been fixed 3+ times without finding root cause, or when every approach feels like a patch.

**Prompt structure:**

```
system_prompt: "You are a senior iOS architect reviewing a problem cold, with no prior history. You have not seen this code before."

prompt: """
PROJECT CONTEXT:
[Paste ARCHITECTURE.md §Core Structural Decisions — the minimum needed to understand the system]

THE PROBLEM:
[Describe the symptom exactly — what is observed, what is expected]

WHAT HAS BEEN TRIED:
[List the approaches attempted and why each didn't work]

THE RELEVANT CODE:
[Paste the specific function or hook section, not the whole file]

QUESTION:
What is the most likely root cause? What would you check first that hasn't been checked yet?
Do not suggest patching the symptoms. Identify the source.
"""
```

**Which tool:** `ask_gemini_pro` — root cause analysis is complex reasoning.

**Trigger condition:** Same bug attempted 3+ times. Also triggered by: "this feels fragile" (Red Hat signal) or "I keep coming back to this".

---

### Pattern 3 — Decision Validation (Black Hat)

Use before committing to a dependency, architecture choice, or constraint that is hard to reverse.

**Prompt structure:**

```
system_prompt: "You are a devil's advocate auditor. Your job is to find what can go wrong with this decision."

prompt: """
CURRENT ARCHITECTURE:
[Relevant constraint from ARCHITECTURE.md or DECISIONS.md]

PROPOSED DECISION:
[The change being considered]

QUESTION:
Play Black Hat. What are the top 3 ways this decision could fail or introduce problems?
What documented constraint does it most stress?
Is there a simpler alternative that covers the same use case?
"""
```

**Which tool:** `ask_gemini` (Flash) — decision validation is analysis, not deep reasoning.

---

### Pattern 5 — Recursive Architecture Test

Use when: you want to verify that your architecture docs actually reflect the code, before relying on them as a source of truth (e.g. pre-launch, pre-onboarding a new collaborator, after a documentation sprint).

**The premise:** Docs written post-hoc can drift from what the code actually does. The Recursive Test uses the docs themselves as input and asks: "based only on these, how would you build X?" If the answer diverges from the actual implementation, either the docs are wrong or the code has drifted.

**Prompt structure:**

```
system_prompt: "You are a new developer joining this project. You have read only the two documents provided. You have not seen the codebase."

prompt: """
ARCHITECTURE DOCUMENT:
[Paste ARCHITECTURE.md §Core Structural Decisions + §What We Never Do]

SYSTEM RULES:
[Paste SYSTEM.md §Rules of Engagement]

QUESTION:
Based only on these two documents, describe how you would implement the [listening pipeline / correction flow / roasting flow]. Walk through the key decisions you would make and why.
"""
```

After receiving the response, compare it against the actual code. Where it diverges: update the doc or flag the code as drifted.

**Which tool:** `ask_gemini` (Flash) — this is synthesis, not deep reasoning.

**When to run:** Before App Store submission, after a documentation sprint, before handing the project to anyone else.

---

### Pattern 6 — Delete Code / Quality Advocate

Use when: the codebase has grown and you want a cold assessment of what should be removed — dead code, redundant abstractions, stale docs, unnecessary dependencies. Also: when you suspect that recent feature work has optimised for your near-term demands at the expense of the project's overall integrity.

This pattern has two modes — run either or both:

**Mode A — Removal Candidate Audit:**
> What should not exist? Find candidates for deletion.

**Mode B — Value Degradation Audit:**
> Has the recent work left the project *less* coherent than it found it? Not "is anything broken?" but "has anything been subtly undermined?"

**Prompt structure:**

```
system_prompt: "You are a senior architect reviewing a codebase for removal candidates and value drift. You are not looking for bugs. You are asking: what should not exist, and has recent work made this project less coherent?"

prompt: """
PROJECT ARCHITECTURE:
[Paste ARCHITECTURE.md §Core Structural Decisions + §What We Never Do]

CURRENT PACKAGE LIST:
[Paste package.json dependencies]

[For Mode A — add the relevant code files or file tree]
RECENT CHANGES (if Mode B):
[Describe what was built in the recent session or paste the diff]

QUESTIONS:
Mode A: Identify up to 5 removal candidates — dead code, redundant abstractions, stale documentation, unnecessary dependencies. For each: name it, explain why it's a candidate, and state the risk of removing it.
Mode B: Has the recent work prioritised near-term delivery over long-term coherence? Where has complexity been added that doesn't pull its weight? Where has a shortcut quietly violated a constraint?

Output format:
- Removal candidates: [name, reason, removal risk]
- Value drift findings: [finding, specific constraint stressed, recommended action]
- Overall verdict: net positive / neutral / net negative for project health
"""
```

**Which tool:** `ask_gemini_pro` — this requires reasoning across the full architecture, not just pattern matching.

**Rule:** No hypothesis. Don't tell Gemini which files you think are stale. Let it find its own candidates.

---

### Pattern 4 — Research

Use when evaluating a library, investigating an API behaviour, or checking how others have solved a class of problem.

**Web search:**
```
search_query: "expo-audio AVAudioSession setAudioModeAsync allowsRecording after TTS ios"
search_recency_filter: "oneYear"  // or "oneMonth" for fast-moving areas
count: 10
```

**Read a specific page:**
```
url: "https://docs.expo.dev/versions/latest/sdk/audio/"
return_format: "markdown"
```

**Parse a PDF** (e.g. patent office filing, API spec):
```
file_url: "https://[publicly accessible PDF URL]"
parse_mode: "auto"
```

**Which tool:** `web_search` for discovery; `web_reader` when you have a specific URL. `parse_document` only for PDFs or images that can't be read via `web_reader`.

---

### Pattern 7 — Model-Tiering (CEO + Worker)

Use when: the question is complex enough to warrant Pro, but you're not sure which parts of the codebase or docs are actually relevant — and you don't want to pay Pro token cost on material it doesn't need.

**The premise:** Flash is cheap and fast. Use it as a **router** — give it the full context and ask it to identify exactly what the expensive model needs to see. Then call Pro with only that filtered payload.

**Two-step structure:**

**Step 1 — Flash as router:**
```
tool: ask_gemini (Flash)

system_prompt: "You are a context triage assistant. Your job is to identify the minimum information a senior architect needs to answer the question below. Do not answer the question yourself."

prompt: """
FULL ARCHITECTURE CONTEXT:
[Paste everything — ARCHITECTURE.md, SYSTEM.md, relevant code files]

QUESTION:
[The actual question you want answered]

OUTPUT:
List the specific sections, constraints, and code snippets that are directly relevant to this question. Everything else can be omitted.
"""
```

**Step 2 — Pro with filtered payload:**
```
tool: ask_gemini_pro (Pro)

system_prompt: [persona for the actual question — audit, decision, root cause, etc.]

prompt: """
[Only the sections Flash identified as relevant]

QUESTION:
[Same question]
"""
```

**When it's worth it:** Only when (a) the question is genuinely complex and (b) you have more context than you know how to scope. For well-scoped questions, go straight to the right tool. The two-step adds latency — don't use it as a default.

**Which tool:** Flash (Step 1) → Pro (Step 2).

---

## Payload Assembly Guide

Gemini is called with a `prompt` string. Unlike Claude Code which can read files directly, you must paste content into the prompt. Follow this selection hierarchy to keep the payload focused:

| What to include | Why |
|----------------|-----|
| `ARCHITECTURE.md §Core Structural Decisions` + `§What We Never Do` | The never-break constraints |
| `SYSTEM.md §Rules of Engagement` | The coding rules |
| `FEEDBACK-LOOPS.md §Hard Rules Extracted` | The distilled guardrail list |
| Only the changed file(s) or diff | Not the whole codebase |
| A specific, focused question | One question per call |

**What to omit:**
- Full files when only a function is relevant — excerpt the function
- Session history and prior conversation context — Gemini shouldn't know what Claude tried
- Boilerplate project description if the static prefix already covers it

**Information order rule:** LLMs attend most heavily to tokens immediately before generation begins. The question goes last. Structure every prompt as: persona/role → architecture constraints → code → question. Never open with the question.

**No-hypothesis rule (anchoring):** When asking for root cause analysis or a contradiction hunt, do not tell Gemini your current theory. State the symptom and the code. Let Gemini form its own hypothesis independently. A hypothesis fed as context becomes a confirmation bias anchor — Gemini will reason toward it even when it's wrong.

**Blind audit option:** For a specific, localised issue (~150–200 lines max) where you want a genuinely unanchored read — omit the architecture constraints and rules entirely. Pass only the code and the question. Use sparingly: most audits need the constraint context. Blind audit is for cases where you want Gemini to find the issue without knowing what the rules say about it.

**Token headroom:** Flash's 8,192 token response limit is on the *output*. The input can be much larger. For very large payloads (full files + architecture docs), use Pro which has 16,384 output tokens.

**Personal note — forced negative:** When a decision feels very obviously right, before calling Gemini with "validate this", try running the prompt as: "Assume this decision is wrong. What is the most plausible reason it will fail?" This is not a formal rule — it's a useful personal check when confirmation bias risk is high.

---

## Output Handling

Gemini's output is returned as a string in the tool result. It is not visible to the user until you relay it.

**Standard relay pattern:**
1. Call the Gemini tool with assembled prompt
2. Read Gemini's output
3. Adjudicate: does it confirm the current approach, or does it flag something?
4. If it flags something: present the finding to the user with the specific concern quoted
5. If it confirms: proceed and note "Gemini audit: no violations found"

**Do not:**
- Blindly accept Gemini's output — it doesn't have full session context
- Ignore Gemini findings because they contradict the current approach — that's the point
- Use Gemini output as a reason to refactor things that weren't the audit subject

---

## When to Call Gemini (Trigger Table)

| Trigger | Pattern | Tool |
|---------|---------|------|
| Same bug fixed 3+ times | Stuck in a Loop | `ask_gemini_pro` |
| About to add a new dependency | Decision Validation | `ask_gemini` |
| Just completed a major refactor | Architecture Audit | `ask_gemini` |
| "This feels fragile" (Red Hat) | Architecture Audit | `ask_gemini` |
| Evaluating a library or API | Research | `web_search` → `web_reader` |
| Long session, context degrading | Session synthesis (Blue Hat first, Gemini as cross-check) | `ask_gemini` |
| Hard-to-reverse architectural choice | Decision Validation | `ask_gemini_pro` |
| Parsing a PDF document | Document extraction | `parse_document` |
| Post-sprint: what should be removed? | Delete Code / Quality Advocate (Mode A) | `ask_gemini_pro` |
| Recent feature work may have degraded coherence | Delete Code / Quality Advocate (Mode B) | `ask_gemini_pro` |
| Pre-release: do the architecture docs contradict each other? | Contradiction Hunt (six-hats.md) | `ask_gemini_pro` |
| Do the architecture docs accurately reflect the actual code? | Recursive Architecture Test | `ask_gemini` |
| Complex question, unclear which context is relevant | Model-Tiering / CEO+Worker | Flash → `ask_gemini_pro` |

**Hard rule:** Call Gemini when stuck in a loop **after the 2nd failed attempt**, not the 5th. The cost of a Gemini call (a few seconds) is much lower than the cost of three more wrong iterations.
