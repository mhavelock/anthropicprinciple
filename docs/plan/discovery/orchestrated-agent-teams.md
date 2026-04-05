# Orchestrating an Agent Team

Orchestrating an agent team is the most effective way to handle a massive codebase without drowning in token costs.

By treating the AI not as a single brain, but as a Modular Workspace, you can achieve high-level innovation while keeping each individual interaction lean. Here is the blueprint for optimizing these advanced agentic patterns.

**1. Specialized Sub-Agents: The "Micro-Context" Strategy**
The biggest token-sink is sending your entire codebase to an agent for a small task.
- **The Strategy: Instead of one "Lead Developer" agent, create Transient Sub-Agents with "Micro-Context."**
-   - **The UI Specialist:** Only gets the components/ and styles/ folders.
  - **The Logic Auditor:** Only gets the lib/ and api/ folders.
- **Optimization Tip: Use Model-Tiering. Let a cheaper, faster model (like Gemini 1.5 Flash or Claude 3 Haiku) act as the "Router" to summarize what context the expensive model (like Claude 3.5 Sonnet) actually needs.**

**2. Agent Teams: The "Peer Review" Loop**
Innovation often comes from friction. Having agents with different "personalities" or "goals" prevents the "echo chamber" effect where an AI just agrees with its own mistakes.
- **The Duo Pattern: \* Agent A (The Innovator): Prompted to find the most "modern, performant" solution.**
-   - **Agent B (The Skeptic):** Prompted to find "technical debt, security flaws, and regression risks."
- **Token Saving: Instead of full chat histories, have the Innovator send a JSON Proposal to the Skeptic. The Skeptic responds with a Bullet Point Critique. You only see the final, refined output.**

**3. Persistent Memory & Tasking: "Knowledge Graphs" over "Chat Logs"**
Standard "Chat Memory" is a linear list of tokens that grows until it breaks. Persistent Memory in 2026 uses a Knowledge Graph (often via MCP).
- **How it works:** When a breakthrough happens, the agent writes a "Node" to a local memory file (e.g., MEM_STATE.json).
*Node: "We discovered that Next.js middleware is causing a 200ms delay on /auth. Solution: Moved logic to a Higher Order Component."*
- **The Benefit:** In a new session, the agent doesn't read 50 messages; it reads 10 "Nodes." This is **Context Compression**.

**4. Agent Skills & Automated Evaluation**
Think of Skills as "Pre-compiled Expertise." Instead of explaining how to audit a macOS app every time, you give the agent a "Skill" (a set of specialized tools and system prompts).
**The "Auto-Eval" Pipeline**
To learn and improve without wasting your own time, set up an automated "Judge" agent.
1. **Task: Agent A writes a fix for a bug.**
2. **Eval: Agent B (The Judge) runs a test command and checks the code against your SYSTEM.md.**
3. **Score: If the score is < 90, Agent A must refactor before you ever see the code.**
- **Why this saves tokens:** You stop reading (and paying for) "bad" attempts. You only interact with the "Gold Standard" results.

**The "Token-Efficient" Innovation Stack (2026)**
| Session State | Pro | Con | Best For |
| **Fresh (Clean)** | High logic, no distractions | Doesn't know the "why" behind hacks | New features / refactoring |
| **Bloated (Deep)** | High context, sees hidden links | Hallucinates, gets lazy, costs more | Bug hunting in complex systems |
| **Engineered (Hybrid)** | Best of both | Requires a 2-minute synthesis step | Day-to-day development |

Try creating a "Commit Auditor" Skill.
1. Create a small markdown file SKILL_AUDIT.md that contains 5 strict rules for the project.
2. In a fresh session, tell Claude: *"Use the rules in SKILL\_AUDIT.md to evaluate the last 3 files I changed. Only report violations."*
This uses Prompt Caching (because the rules are static) and Selective Context (only looking at changed files).

---

Claude uses agentic workflows to optimize tasks by breaking complex goals into smaller, parallel sub-tasks using specialized sub-agents. These agents, often deployed within the [Claude Code] CLI, handle specific roles like planning, coding, or testing, enabling faster, more accurate project completion compared to a single prompt. 

**Key Ways Claude Optimizes Tasks with Agents:**
- **Specialized Sub-agents: Claude creates specialized sub-agents (e.g., Explore, Plan, Code) to divide high-level goals into manageable, parallel, or sequential steps.**
- **Agent Teams (Opus 4.6+): Enables multiple agents to collaborate on complex projects, with a supervisor agent coordinating them to avoid duplication and improve quality.**
- **Persistent Memory & Tasking:** Agents use memory.md or the [Task tool] to maintain state across sessions, allowing long-running tasks and reducing the need for re-prompting.
- **Agent Skills (**[**SKILL.md**]**):** Users can package workflows into reusable "skills" (e.g., specific coding standards, security checks) that agents can call via slash commands.
- **Automated Evaluation: Agents can analyze their own performance and refine their tool-use techniques based on feedback, enhancing efficiency. **


### Steps to Optimise with Agents

1. **Define and Plan: Start by asking Claude to create a detailed implementation plan for complex projects.**
2. **Use Sub-agents:** Use the [/agent](https://www.google.com/search?q=%2Fagent&rlz=1C5CHFA_enGB1189GB1196&oq=claude+use+%2Fagents+to+optimise+tasks&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigAdIBCTEyMzM3ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8&mstk=AUtExfC8N6Rj35iTPYiWUkUdZHrTq8R7j8vUUiUOxq6Ni8nLQcTUT8a_pvCOyMPVa_2mesl75D3XK-_RseR2L-oYtWC1CHSCzAviz-CWSh8L9KFjqqrLuRlvThIaqvvRjwV89lip2WmKsCufa0IKGl5sfJOhvh9jpiFN88wZEAQdQTWIBaw&csui=3&ved=2ahUKEwjUm7yqmsyTAxU6VEEAHS_AESgQgK4QegQIBxAC) command (e.g., /agent create "name") to spawn specialized agents for specific tasks.
3. **Use Agent Skills: Implement SKILL.md files to provide agents with pre-defined playbooks for repetitive tasks.**
4. **Assign Tasks:** Delegate specific tasks using the [Task tool](https://www.google.com/search?q=Task+tool&rlz=1C5CHFA_enGB1189GB1196&oq=claude+use+%2Fagents+to+optimise+tasks&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigAdIBCTEyMzM3ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8&mstk=AUtExfC8N6Rj35iTPYiWUkUdZHrTq8R7j8vUUiUOxq6Ni8nLQcTUT8a_pvCOyMPVa_2mesl75D3XK-_RseR2L-oYtWC1CHSCzAviz-CWSh8L9KFjqqrLuRlvThIaqvvRjwV89lip2WmKsCufa0IKGl5sfJOhvh9jpiFN88wZEAQdQTWIBaw&csui=3&ved=2ahUKEwjUm7yqmsyTAxU6VEEAHS_AESgQgK4QegQIBxAF) for autonomous operation.
5. **Review Output: Evaluate the outputs from specialized agents for high-quality, comprehensive results. **


---

**The "CEO & Worker" Pattern**
- **The CEO (High-Level/Expensive): Use Claude 3.5 Sonnet. Give it the full ARCHITECTURE.md and context\_anchor.md. Its only job is to break the big task into 3 small sub-tasks.**
- **The Workers (Specialized/Cheap): Use Gemini 1.5 Flash. Give each worker only the specific file it needs and one Skill file.**
- **The Auditor: A final "Fresh" session reads the output of the workers to ensure they didn't break any "Past Wins" recorded in your Memory.**
1. Agent A writes a fix
2. Agent B (Judge) runs tests and checks against `SYSTEM.md`
3. If score < 90, Agent A refactors before you ever see the code


--

