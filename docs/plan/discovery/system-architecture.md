# System Architecture — AI-Assisted Development


For maximum productivity, combine these techniques by providing detailed plans to agent teams, which can be managed directly in the Claude Code environment to ensure high-quality code and project continuity

---

## Codebase Audit Optimisation

### 1. Selective Context (The Ignore List)
Large codebases are full of noise. If you let an AI or a script crawl everything, you waste tokens, time, and memory.
- **The Fix: Create or reference a strict exclusion list. For Next.js, ensure you are skipping .next/, node\_modules/, and build artifacts. For macOS/iOS, skip DerivedData, Pods/, and .xcassets.**
- **macOS/iOS:** Skip `DerivedData`, `Pods/`, `.xcassets`

### 2. Parallelise the Scanning Process
If you are running scripts (like eslint, sonarqube, or custom grep patterns), running them sequentially on a massive repo is a recipe for a 20-minute wait.

- **The Fix:** Use tools that support **concurrency**. If you’re writing a custom audit script in Node.js, use Worker Threads or a library like p-limit.
- **Why:** Modern CPUs have multiple cores; an audit should use all of them to parse files simultaneously.

### 3. Chunking and MapReduce Logic
For massive codebases, avoid reading everything at once:

The Fix: 1. Map: Audit individual modules or directories independently.
Why: This prevents the "lost in the middle" phenomenon where an AI forgets the beginning of the codebase by the time it reaches the end.

Map: Audit individual modules/directories independently
Reduce: Aggregate findings into a high-level summary
Reduce: Aggregate the findings into a high-level summary.

### 4. Increase Memory Limits **(The "OOM" Killer)**

```bash
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB
```

For massive codebases, avoid reading everything at once:

The Fix: 1. Map: Audit individual modules or directories independently.
Why: This prevents the "lost in the middle" phenomenon where an AI forgets the beginning of the codebase by the time it reaches the end.

Map: Audit individual modules/directories independently
Reduce: Aggregate findings into a high-level summary
Reduce: Aggregate the findings into a high-level summary.


**5. Summary of Recommended Guidelines**
If you're updating your claude.md or a similar config file, consider adding these rules:
| Category | Guideline |
| --- | --- |
| Timeouts | Set `network_timeout` and `process_timeout` to at least 300s for large repos |
| Scope | Always use `.gitignore` or custom exclude patterns |
| Verbosity | Request streaming progress or incremental logs |
| Depth | Do a shallow audit (structure) before a deep audit (logic) |

---

## The Golden Thread Problem

That is the "Golden Thread" problem of AI development: how do you keep the AI focused on the current task without it accidentally "lobotomizing" the global architectural wins you established three hours (or three weeks) ago?

When you’re deep in a specific build, Claude (or any LLM) tends to suffer from Recency Bias. It optimizes for the immediate "fix" and ignores the "foundational" constraints.

To balance this in a Claude IDE or agentic workflow, you need to implement **Architectural Guardrails**. Here is how to maintain that synergy:

**1. The "Rule of Three" Documentation**
Don't just rely on the codebase. Large models need a "Source of Truth" that sits outside the active chat context. Maintain a SYSTEM.md or ARCHITECTURE.md file in your root and explicitly tell Claude to read it before every major change.

- **The Global Constraints: "Never use inline styles; always use Tailwind utility classes."**
- **The Performance Floor: "All new components must be Server Components by default unless state is required."**
- **The "Why": Briefly explain the reason for past wins (e.g., "We use Zustand for state to avoid the prop-drilling we fixed in v1.2").**

**2. Implement "Contextual Anchoring"**
When you start a new task in the IDE, don't just say "Fix the login bug." Use a prompt that anchors the task within the wider system.

**The Pro-Tip Prompt Structure:**
> "I need to implement [Task X]. Before you begin, analyse `CORE_PATTERNS.md` and the existing `/hooks` directory. Ensure your solution does not regress our [specific optimization, e.g., Tree Shaking/Bundle Size] achievements."

**3. The "Diff Review" Step**
Force a regression check before committing:

> "Review this new code. Identify any instances where it contradicts the architectural patterns in [Reference File]. Specifically, check if we are re-introducing the [Previous Issue] we solved earlier."

### 4. Platform-Specific Strategies

**For Next.js (Web)**
- **The bundle-analyzer Guardrail: If a "win" was based on bundle size, make it a rule that Claude must check the impact on chunking if it adds a new heavy library.**
- **The Hydration Constraint: If you’ve optimized for SEO/Speed, remind the IDE: "We prioritize Zero-JS where possible. Do not add 'use client' unless absolutely necessary."**

**For macOS/iOS (Native)**
- **Memory Management: If you’ve optimized for ARC (Automatic Reference Counting) and avoided retain cycles, keep a "Memory Safety" section in your guidelines.**
- **Concurrency Patterns: If you use Swift Concurrency (async/await), ensure Claude doesn't try to revert to older DispatchQueue patterns just because it's "easier" for a quick fix.**

### 5. Checkpoints as External Memory

Since the "lost in the middle" phenomenon is a limit of the **Context Window**, you can bypass it by creating **Summary Snapshots**:
1. Finish a major optimisation
2. **Ask Claude: "Summarize the architectural logic and performance wins we just implemented into a concise 5-bullet point list for my project\_memory.log."**
3. **Next Session: Paste that log back in. This "re-primes" the model's weights on your specific project history without wasting thousands of tokens on raw code.**

---

## System vs Architecture Documentation

### ARCHITECTURE.md — "The Why & The Skeleton"

Here is the breakdown of how to distinguish the two and how to avoid the pitfalls of AI-generated documentation.

**1. System vs. Architecture: Is there a difference?**
In a professional environment, they serve two distinct purposes. Having both is useful because it separates **what it is** from **how it works**.
**The ARCHITECTURE.md (The "Why" & The Skeleton)**
This is the high-level blueprint. It focuses on the structural choices that are expensive to change later.

- **Next.js Context: Why did we choose** App Router over Pages? How do Server Actions handle data?
- **macOS Context: Are we using MVVM or TCA? How is the local SQLite database synchronized?**
- **Key Insight: It’s about the relationship between components.**

### SYSTEM.md — "The How & The Manual"
This is the "Rules of Engagement" for the AI and the developers. It’s more about the standards, the environment, and the constraints.

- **Contents: Naming conventions, CI/CD pipeline steps, timeout settings, and specific "Never Do This" rules (like the timeout guideline you mentioned earlier).**
- **Key Insight: It’s about the integrity of the codebase.**

### Pitfalls of Post-Game Documentation
When you ask Claude to write these at the end of a project, watch out for these three traps:

**Trap A: Hallucinating Intent**
Claude might see a messy workaround you wrote at 3 AM and describe it as a "Sophisticated decoupling pattern."
- **The Fix:** Don't just ask "Write an architecture file." Ask: *"Analyze the data flow in /src/lib and explain why it was built this way. If it looks inconsistent, flag it as a 'Legacy/Debt' area rather than a 'Pattern'."*

**Trap B: The "Everything is Important" Problem**
If the codebase is large, Claude might generate a 50-page document that is too long for its own context window to read later.
- **The Fix:** Enforce a **Density Limit**. Tell Claude: *"Keep the ARCHITECTURE.md to under 1,000 words. Focus only on the 'irreversible' decisions."*

**Trap C: Stale Knowledge**
A SYSTEM.md written at 95% completion might ignore the fact that you're about to migrate a library or change a deployment target.
- **The Fix:** Add a "Future Directions" or "Pending Migrations" section so the AI knows which parts of the current code are actually "deprecated" in your mind.

**3. The "Audit-to-Doc" Workflow**
If you want Claude to write these files for optimum performance, follow this three-step sequence:
1. **The "Vibe Check" (Discovery):** > "Scan the folder structure and the 10 largest files. List what you perceive to be the top 5 architectural patterns and top 5 coding constraints I've been following."
*(You then correct him: "Actually, point 3 was a mistake, we're moving away from that.")*
2. **The Draft:**
"Based on our corrected list, generate ARCHITECTURE.md focusing on the 'Golden Thread' of logic, and SYSTEM.md focusing on the developer constraints and timeouts."
3. **The Recursive Test:**
"Now, read these two files. Based *only* on them, tell me how you would implement a new [Feature X]. If your answer differs from how the app is currently built, we need to update the docs."

**4. Summary Table: What goes where?**
| Trap | Fix |
| --- | --- |
| **Hallucinating Intent** | Ask Claude to flag inconsistencies as "Legacy/Debt" rather than "Pattern" |
| **Everything is Important** | Enforce a density limit — keep `ARCHITECTURE.md` under 1,000 words |
| **Stale Knowledge** | Add a "Future Directions" or "Pending Migrations" section |

The "multi-model consultation" (Claude and Gemini) you've discovered is actually a top-tier strategy in 2026. While one model might have a "blind spot" in a specific Next.js hydration issue or a Swift memory leak, having the other audit it often catches the "hallucination of logic" that happens during long sessions.
Here is the "out of the box" toolkit for 2026 to optimize your workflow, save tokens, and maintain that synergistic edge.

**1. The "Multi-Model Debate" (Claude + Gemini)**
Using Claude for generation and Gemini for auditing is the current meta.
- **The Setup: Use Claude (Sonnet/Opus) for the heavy lifting and refactoring. Then, pipe the diff or the new file to Gemini 3.1 Pro/Flash.**
- **Why it works: Claude is superior at "writing" maintainable, clean code, but Gemini’s massive context window (1M+ tokens) allows it to "see" your entire codebase at once.**
- **The Workflow: Ask Gemini: "Claude just refactored this. Based on the entire codebase I uploaded earlier, did he break any global state patterns or overlook an edge case in our macOS networking layer?"**

**2. MCP (Model Context Protocol) Optimizations**
If you are using the Claude IDE or Desktop, MCP servers are the best way to save tokens by moving "thinking" out of the context window.
- **Tool Search MCP: Instead of loading 50+ tool definitions into every prompt (which can eat 10k tokens alone), use MCP Tool Search. It only injects the tool schema when the AI actually needs it.**
- **Local Indexing (index1 / QMD): Instead of Claude "reading" your whole repo to find a function, use an MCP server like index1. It creates a local SQLite index of your code. Claude searches the index (cheap) rather than reading the files (expensive).**

**3. GitHub Advanced Security (GHAS) / CodeRabbit**
For an "out of the box" automated layer, look at CodeRabbit or Greptile.
- **Synergy:** These tools sit in your PRs. They act as the "Third Dev."
- **The Benefit:** They catch the "past wins" regressions automatically. If you fixed a performance bottleneck in a Next.js Server Component three months ago, these tools will flag a new PR that reintroduces 'use client' unnecessarily.
**4. Prompt Caching (The 90% Cost Saver)**
Anthropic and Google now heavily support Prompt Caching.
- **How to use it:** If you are using the API, keep your SYSTEM.md and ARCHITECTURE.md as a **prefix** in your calls.
- **The Result:** You only pay full price for these files once. Every subsequent message in that "turn" gets up to a 90% discount on the input tokens for those files. It makes having a massive, detailed Architecture file virtually free.

1. **Discovery:** "Scan the folder structure and the 10 largest files. List the top 5 architectural patterns and top 5 coding constraints." Then correct as needed.
2. **Draft:** "Generate `ARCHITECTURE.md` (Golden Thread of logic) and `SYSTEM.md` (developer constraints and timeouts)."
3. **Recursive Test:** "Read these two files. Based only on them, tell me how you would implement [Feature X]. If your answer differs from the current build, we need to update the docs."

### What Goes Where

| Feature | ARCHITECTURE.md | SYSTEM.md |
| --- | --- | --- |
| Focus | Structural integrity & data flow | Development rules & tooling |
| Example | "We use Repository Pattern for API calls" | "All API calls must have a 30s timeout" |
| Next.js | Choice of middleware for auth | ESLint rules and pre-commit hooks |
| macOS | Coordinator pattern for navigation | Minimum deployment target & SwiftLint config |
**One Final Tip for your NEXT.JS / macOS build:**
When getting Claude to write your final docs, give him this "Anti-Hallucination" constraint:
"Write the ARCHITECTURE.md based on the current state. If you find a pattern that is used inconsistently (e.g., half the project uses fetch and half uses axios), do not call it a 'Hybrid Approach.' Flag it as 'Inconsistent - Audit Required'."
This prevents the documentation from cementing your technical debt as "intended architecture."
**Between the "Consultation" and the "Caching" strategies, which one do you think would fit your current daily dev loop more naturally?**


## The Context-Innovation Paradox

Where breakthroughs happen at the "bloated" end of a session and again at the "fresh" start of the next—is the Context-Innovation Paradox.
At the end of a long session, the AI has high **"associative depth"** (it sees the messy connections); at the start of a fresh session, it has high **"architectural clarity"** (it isn't distracted by your three-hour-old debugging rabbit holes).
To mix it up for optimum performance in 2026, you should move from "chatting" to Context Engineering. Here is how to keep the breakthroughs coming without the token bloat.

**1. The "Gemini Reads, Claude Writes" Protocol**
This is the most effective "out of the box" synergy for large codebases. Gemini 3 Pro has a massive 1M+ token window but can sometimes be "wordy" in its code. Claude is a surgical coder but has a smaller functional "high-performance" window.
- **The Move: Use Gemini to ingest the entire "bloated" state. Ask it to generate a SESSION\_SYNTHESIS.md.**
- **The Prompt for Gemini: "I am ending this session. Synthesize the core breakthroughs, the hidden logic we discovered in the macOS networking layer, and the specific 'win' we had with Next.js hydration. Ignore the failed attempts. Produce a dense, 500-word 'Context Anchor' for a fresh Claude session."**
- **The Result: You start the fresh session with the "associative depth" of the old one, but with 95% fewer tokens.**

**2. Leverage Prompt Caching (The "Static vs. Dynamic" Split)**
In 2026, both Anthropic and Google offer Prompt Caching. If you are using the API or advanced IDEs, you can keep your SYSTEM.md and ARCHITECTURE.md permanently "warm" in the cache.
- **Pitfall: Users often put their "Task" at the top and "Code" at the bottom.**
- **The Optimization: Put your Codebase Context and Rules at the top of the prompt and mark them for caching.**

**3. The "State Summary" Skill (MCP)**
If you use Claude Desktop or Claude Code, install an MCP (Model Context Protocol) server for Memory/Knowledge Graph.
- In a fresh session, Claude’s first tool call is to read_memory. 
- Tool Search MCP: Only injects tool schema when actually needed (saves ~10k tokens per prompt)
- **Benefit: This breaks the linear nature of a "session." The AI can "forget" the 50 error messages from last hour but "remember" that you prefer pnpm over npm across every session you ever start.**

**Keep SYSTEM.md and ARCHITECTURE.md as a prefix in API calls. Only pay full price once — subsequent messages get up to 90% discount.**

Keep `SYSTEM.md` and `ARCHITECTURE.md` as a prefix in API calls. Only pay full price once — subsequent messages get up to 90% discount.

### Comparing the "Session Styles"

| **Session State** | **Pro** | **Con** | **Best For...** |
| --- | --- | --- | --- |
| **Fresh (Clean)** | High logic, no "distractions." | Doesn't know the "why" behind hacks. | Starting new features/Refactoring. |
| **Bloated (Deep)** | High context, sees "hidden" links. | Hallucinates, gets "lazy," costs more. | Bug hunting in complex systems. |
| **Engineered (Hybrid)** | Best of both. High clarity + specific memory. | Requires a 2-minute "synthesis" step. | **Day-to-day high-level development.** |

| Tool/Strategy | Purpose | Token Saving |
| --- | --- | --- |
| Claude + Gemini Consult | High-fidelity auditing & edge-case detection | Moderate |
| MCP Tool Search | Lazy-loads tool definitions when needed | High (85% reduction) |
| Local RAG (index1/QMD) | Search via local index, not raw context | Very High |
| Prompt Caching | Cache ARCHITECTURE.md and SYSTEM.md | Massive (90% off) |
| CodeRabbit | Automated PR reviewer with project history | Moderate |

**5. Innovation Trick: The "Red Team" Fresh Start**
When you feel a breakthrough at the end of a bloated session, don't implement it immediately. 1. Summarize the idea.
2. Summarise the idea
3. Open a fresh Gemini session and a fresh Claude session.
4. Tell them: "I have a theory that [Breakthrough Idea]. Gemini, look for architectural flaws. Claude, look for implementation bottlenecks."

**Pro-Tip for 2026:**
Use Gemini to ingest the bloated state and generate a `SESSION_SYNTHESIS.md`:

> "Synthesise the core breakthroughs and the specific wins we had. Ignore failed attempts. Produce a dense, 500-word Context Anchor for a fresh Claude session."

### 2. Prompt Caching — Static vs Dynamic Split
Keep SYSTEM.md and ARCHITECTURE.md as a prefix in API calls. Only pay full price once — subsequent messages get up to 90% discount.


---

## Memory & Skills

Focusing on Memory and Skills is the most sustainable way to scale your development because they solve the "Goldfish Problem" (the AI forgetting your preferences) and the "Generalist Problem" (the AI giving generic advice instead of expert-level Next.js/macOS auditing).
Here is a breakdown of how to implement these as a "system" that saves tokens while maximizing your learning.

**1. Persistent Memory: The "Project Brain"**
Instead of letting the chat history grow (which costs more tokens every turn), you move important discoveries into a static file that the AI treats as its "long-term memory."
- **The Concept:** Create a .cursor/rules (if using Cursor) or a MEMORIES.md file in your root directory.
- **The Workflow:** At the end of a breakthrough, tell Claude: *"Summarize the core logic of this breakthrough into three sentences and append it to MEMORIES.md. Then, forget this conversation."*
- **The Learning Benefit:** By forcing the AI to summarize, you see exactly what it "thinks" the win was. If the summary is wrong, you catch a potential hallucination immediately.

**2. Agent Skills: "Pre-compiled Expertise"**
A "Skill" is essentially a highly specialized System Prompt that you only call when needed. This prevents the AI from being "distracted" by UI logic when it should be focused on Security.

**How to build a "Skill Library": Create a folder called /specs or /skills. Inside, put small markdown files:**
- **UI Specialist:** Only gets `components/` and `styles/`
- audit_macos.md: Contains rules for Swift concurrency, memory management, and Sandbox constraints.
- security_red_team.md: Contains a "hacker mindset" for finding vulnerabilities.
**The Execution:** Instead of a giant prompt, you say: *"Apply the skill in /specs/audit\_nextjs.md to the current file."*
- **Token Saving:** Because these files are static, they are perfect candidates for **Prompt Caching**. You only pay for them once, and they stay "warm" for the rest of your session.

**3. The "Automated Evaluation" (Learning through Feedback)**
This is the fastest way to learn. You set up a "Junior Agent" to write the code and a "Senior Agent" (using a Skill) to critique it.
1. **Task:** Ask Claude (Sonnet) to write a feature.
2. **Evaluation:** Immediately pipe that code to Gemini (Flash) with this prompt: *"You are a Senior macOS Architect. Evaluate this code against the 'Performance' skill in our /specs folder. Score it 1-10 and explain every point lost."*
3. **The Result:** You see the "thought process" of the Senior Architect. This teaches you patterns you might not have known existed.

**4. Pitfalls for Beginners**
- **Over-Engineering: Don't build 10 agents for a 1-person project. Start with one memory file and two skill files.**
- **Stale Memory: If you change your mind about a library (e.g., switching from axios to fetch), you must update your Memory/Skill files. Otherwise, the AI will keep trying to "fix" your new code back to the old way.**
- **The "Context Chimera": Be careful not to give an agent two conflicting skills at once (e.g., "Be as concise as possible" vs "Explain everything in detail"). It will result in "mushy" logic.**

**Next Step:**
Look at your current project and "Draft a PROJECT_CONSTRAINTS.md file based on the last 3 breakthroughs we had."

---

## Integrating **Persistent Memory** & **Specialized Skills**

Integrating both Persistent Memory (the AI’s diary) and Specialized Skills (the AI’s manual) creates a "Self-Correcting Flywheel." The manual tells the agent how to behave, and the diary records what it actually learned while behaving that way.
To do this without drowning in tokens or complexity, you can set up a "Reflective Architecture." Here is how to structure that combination for your Next.js and macOS projects:

**1. The Folder Structure (The "Agent OS")**
Organize your codebase so that any agent—whether Claude, Gemini, or a sub-agent—immediately knows its boundaries.
Plaintext

.ai/
├── skills/
│   ├── nextjs-perf.md       # "The Manual": How to audit for speed
│   └── swift-security.md    # "The Manual": Memory safety & Sandbox
└── memory/
    ├── breakthroughs.json   # "The Diary": Lessons learned (structured)
    └── context_anchor.md    # The "Save Game": Current project state

**2. The "Sync" Ritual (Memory + Skills)**
The magic happens when you force the agent to update its "Memory" based on its "Skills."
**The Workflow:**
1. **Task: Use a Skill to perform an audit (e.g., "Use nextjs-perf.md to check my app/page.tsx").**
2. **Breakthrough: You find a new way to optimize image loading.**
3. **Persistence: You tell the agent: "Update breakthroughs.json with this new pattern, and check if it contradicts anything in our nextjs-perf.md skill."**

**3. Optimizing for "Tasking" and "Sub-Agents"**
Since you want to learn while staying token-efficient, use Task Decomposition. Instead of one long chat, break your goal into a "Chain of Experts."



**4. Advanced: Automated Evaluation (The "Learning Lab")**
To really "level up" your own understanding, have the agents debate your code. This is the best way to see the "why" behind the "what."
**The "Red Team" Prompt:** > *"Claude, you are a Senior Lead. Gemini, you are a Security Researcher. Both of you read our swift-security.md skill. Debate whether this new PR follows our memory safety standards. If you disagree, provide the documentation source for your argument."*
**Why this is a "Learning Win":** You aren't just getting code; you're getting a transcript of professional architectural reasoning.

**5. Token-Saving Checklist**

| **Strategy** | **Why it saves tokens** |
| --- | --- |
| **Snippet Injection** | Instead of "Read the whole repo," tell the agent "Use the grep tool to find where we use useEffect." |
| **State Compression** | Every 50 messages, ask the AI to "Summarize this entire chat into 10 bullet points" and start a fresh session with those points. |
| **Binary Skills** | Keep your Skill files as Markdown lists. AI parses lists much faster (and cheaper) than dense prose. |

| Concept | Bloated Way | Optimised Way |
| --- | --- | --- |
| Context | Attach all files to every prompt | Local RAG / MCP Indexing for relevant snippets |
| Agents | One big agent doing everything | Sub-agents with restricted file access |
| Memory | Scroll back through chat history | Central `MEM.md` or Knowledge Graph |
| Iteration | Manually review every draft | Automated evaluator filters low-quality first |

## Persistent Memory — The Project Brain
**Next step "Agentic" Task:**
Try creating a file called .ai/memory/active_sprint.md. Tell Claude:
*"Read my current package.json and my last 3 commits. Write a summary of what we are currently trying to achieve and what 'gotchas' we've hit. This is our new 'Active Memory'."*


---
