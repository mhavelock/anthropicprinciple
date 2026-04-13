# Ideas for 'six-hats' type of approach options

Cognitive Diversification or Parallel Thinking.

While often broadly labeled as "Creative Thinking," its true value lies in Metacognition—the act of thinking about how you think. By separating emotion from logic and creativity from caution, it prevents the "argumentative" style of thinking and replaces it with a collaborative, multi-perspective approach.

Here are the specific categories and similar methodologies you can use to build your innovation toolkit:

1. Category: Parallel Thinking & Perspective Shifting
These methods focus on looking at a single problem from multiple, distinct angles to ensure no "blind spots" remain.

Disney Creative Strategy: This method divides the thinking process into three specific roles: The Dreamer (unbounded ideas), The Realist (practical application), and The Critic (identifying risks). It is remarkably effective for moving from a "wild idea" to a "workable plan."

The Five Whys: Developed by Sakichi Toyoda, this is a "Root Cause Analysis" tool. By asking "Why?" five times, you peel away layers of symptoms to find the core issue—essential for effective problem-solving before you start innovating.

2. Category: Structured Ideation & Lateral Thinking
If the Six Hats is about organizing thought, these methodologies are about generating the thoughts to be organized.

SCAMPER: An acronym (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse) used to spark innovation by forcing you to look at an existing product or task and suggest specific changes.

TRIZ (Theory of Inventive Problem Solving): A more technical, systematic approach based on global patent patterns. It uses a "Contradiction Matrix" to find solutions that have already worked in other industries.

3. Category: Design Thinking & Human-Centered Design
This category focuses on empathy and iterative testing, making it the modern gold standard for innovation in business.

The Double Diamond: A process model divided into four phases: Discover, Define, Develop, and Deliver. It alternates between "Divergent" thinking (creating choices) and "Convergent" thinking (making choices).

The Sprint Method (Google Ventures): A five-day process for answering critical business questions through design, prototyping, and testing ideas with customers.






| Methodology | Best For... | Core Philosophy |
| --- | --- | --- |
| Six Thinking Hats | Group alignment & logic | Parallel Thinking |
| Disney Strategy | Refining raw ideas | Role-based evaluation |
| SCAMPER | Product/Process evolution | Systematic modification |
| Double Diamond | Full-scale innovation | Diverge/Converge cycles |
| Five Whys | Efficiency & Troubleshooting | Root Cause Analysis |

---

## The Full-Spectrum Architect: Auditing Code with Claude and the Six Thinking Hats
In the high-stakes environment of a large-scale Next.js or macOS codebase audit, "brute force" AI interaction—simply dumping code and asking for "improvements"—is a recipe for token bloat and architectural drift. To achieve a truly synergistic, innovative, and cost-effective audit, we can apply Edward de Bono’s Six Thinking Hats.
By consciously switching between these cognitive "modes," you transform Claude from a simple chatbot into a multidimensional engineering team.

⚪ The White Hat: The Data Collector
**Objective: Objective facts, figures, and information requirements.**
Before diving into logic, you must establish the "ground truth." This is where your SYSTEM.md and ARCHITECTURE.md files live.
- **The Advice: Use the White Hat to define the scope. Tell Claude: "Provide a cold analysis of the current dependency tree. List every instance of useClient vs. Server Components without offering an opinion."**
- `audit_macos.md` — Swift concurrency, memory management, sandbox constraints
- **Token Optimization: Use Local RAG or MCP Indexing here. Don't pay for Claude to "read" the files; pay for it to query an index of the facts.**

🔴 The Red Hat: The Intuitive Gut-Check
**Objective: Emotions, feelings, and hunches.**
AI is often viewed as purely logical, but your human intuition is a vital sensor.
- **The Advice:** If a specific module "feels" brittle or "smells" like technical debt, tell Claude. "I have a hunch that our navigation logic in the macOS app is over-complicated. Audit this specific folder for 'spaghetti code' patterns."
- **Innovation Trigger:** Use this hat to identify the "bloated session" breakthroughs. Your gut often notices the synergy before your logic can map it.

⚫ The Black Hat: The Risk Auditor

### The Reflective Architecture

```text
.ai/
├── skills/
│   ├── nextjs-perf.md       # "The Manual": How to audit for speed
│   └── swift-security.md    # "The Manual": Memory safety & Sandbox
└── memory/
    ├── breakthroughs.json   # "The Diary": Lessons learned (structured)
    └── context_anchor.md    # The "Save Game": Current project state
```

### The Sync Ritual

**Objective:** Caution, risks, and critical judgment.
This is the most critical hat for a code audit. It prevents you from losing "past wins" by ruthlessly identifying regressions.
- **The Advice: Assign a Specialized Sub-agent the permanent Black Hat. Its only job is to find why a new idea won't work. "Analyze this refactor. Identify three ways this could increase our Vercel function execution time or break ARC memory management in Swift."**
- **Stale Memory:** Update memory/skill files when you change libraries
- **The Pitfall: Don't let the Black Hat run in the same session as the Green Hat (see below), or it will kill innovation before it starts.**

🟡 **The Yellow Hat: The Optimist & Value-Hunter**
**Objective:** Benefits, feasibility, and "best-case" outcomes.
While the Black Hat looks for holes, the Yellow Hat looks for hidden gold in the existing mess.
- **The Advice:** Ask Claude to perform a "Value Audit." "What are the hidden benefits of our current state management? How can we amplify these strengths in the next build?"
- **Synergy:** This hat ensures that when you refactor, you don't just "fix" things—you evolve them.

🟢 **The Green Hat: The Creative Innovator**
**Objective: Creativity, possibilities, and new ideas.**
This is where the "breakthroughs" happen. This hat should be worn in fresh sessions to avoid being weighed down by the "bloat" of previous errors.
- **The Advice: Use Agent Teams. Let a "Green Hat" Claude propose three radical ways to restructure the Next.js API layer.**
- **Persistent Memory: When the Green Hat finds a win, immediately record it in your breakthroughs.json diary before the context window closes.**
- **Auditor:** Fresh session reads worker output to check for regressions.

🔵 **The Blue Hat: The Process Controller**
**Objective:** Metacognition, organization, and the "Big Picture."
You, the developer, are the permanent Blue Hat. You manage the other hats and the "Agentic Workflow."
- **The Advice: Use the Blue Hat to manage Agent Skills. You decide when it’s time to stop "Green Hat" ideation and start "Black Hat" auditing.**
- **Automated Evaluation: Set up a Blue Hat agent (perhaps Gemini 1.5 Flash for cost-efficiency) to summarize the day's work and update the context\_anchor.md.**
- **Context Chimera:** Don't give conflicting skills simultaneously

### Token-Saving Checklist


**The Integrated Result: A Self-Sustaining System**
By utilizing this framework, you aren't just running a code audit; you are building a **Knowledge Graph** of your project.
| Strategy | Why |
| --- | --- |
| Snippet Injection | "Use grep to find where we use `useEffect`" instead of "read the whole repo" |
| State Compression | Every 50 messages, summarise into 10 bullet points and start fresh |
| Binary Skills | Keep skill files as markdown lists — AI parses lists faster than prose |

**Summary:** To optimize performance, stop treating Claude as a single mind. Instead, use your **Skills** as the "Hats" you put on the AI, and use your **Memory** as the "Transcript" of what those hats discovered. This creates a project that doesn't just get finished—it gets mastered.
