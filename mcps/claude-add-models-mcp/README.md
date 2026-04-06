# claude-additional-models-mcp

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/Arkya-AI/claude-additional-models-mcp/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)](https://github.com/Arkya-AI/claude-additional-models-mcp/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/Arkya-AI/claude-additional-models-mcp/blob/main/CONTRIBUTING.md)

**Break the Claude Pro wall. Offload heavy lifting to Gemini 3.x and GLM-5 via MCP while Claude orchestrates. Reduce consumption by 10x.**

---

## The Problem: The "Claude Pro Wall"

Claude Pro users paying $20/month and even those paying $ 100 per month frequently encounter a frustrating reality:

### The 28% Availability Math

Most power users exhaust their weekly message limits in approximately **2 days**. This leaves them blocked for the remaining 5 days of the week. You are effectively paying for a service that is unavailable **71% of the time** -- $100/month for 28% availability unable to do heavy work. This creates a scarcity mindset where users hesitate to use Claude for complex tasks, fearing they will run out of limits before the week resets.

### The Sonnet 4.5 Degradation

Since the release of Claude 4.6, multiple users have reported noticeable **performance degradation in Sonnet 4.5**. When Sonnet 4.5 is forced to handle orchestration, file I/O, *and* heavy code generation simultaneously, reasoning quality drops. It begins to lose track of project structure, hallucinate file paths, or forget earlier instructions mid-session.

This MCP approach specifically helps Sonnet 4.5 users by **offloading heavy analysis and code generation** to capable external models, letting Sonnet focus on what it does best: orchestration and file I/O. The result is **superior work output** from Sonnet 4.5 compared to making it do everything itself.

### The Opus 4.6 Cost Barrier

**Opus 4.6** remains the gold standard for intelligence, but its consumption rate is punishing -- **3-5x higher** than Sonnet. On the Pro plan, using Opus for documentation reading, boilerplate generation, or routine analysis burns through your weekly allocation at an alarming rate.

By delegating heavy work to external models, you get **Opus-quality orchestration** and **Parallel Agents** with **80% to 90%+ reduction in consumption**.

---

## The Solution

`claude-additional-models-mcp` is a production-ready Model Context Protocol (MCP) server that integrates external AI models directly into Claude Desktop. Instead of Claude doing everything itself, it delegates heavy computational work to specialized external models and focuses on what it does best: orchestration, file management, and final synthesis.

**The result:**

| User Type | Benefit | Improvement |
|:---|:---|:---|
| **Sonnet 4.5** | Superior output quality via offloading | **10x** consumption reduction |
| **Opus 4.6** | Cost control with full capability | **80%+** consumption reduction |
| **All Users** | Extended Pro subscription value | **18-30x** ROI |

---

## What's New in v2.0: Gemini Integration

While the original **GLM-5 (Z.ai)** integration offers a massive 744B parameter model with strong reasoning, we observed **frequent interruptions and timeouts** during long-running delegated tasks. Sessions would break mid-generation, forcing users to retry and wasting both time and tokens.

**v2.0 introduces Google Gemini 3.x as the recommended integration:**

| Feature | GLM-5 (Z.ai) | Gemini 3.x (Google) |
|:---|:---|:---|
| **Stability** | Occasional interruptions | Rock-solid uptime |
| **Context Window** | Standard | **1M tokens** |
| **Max Output** | 4,000 tokens | **65,000 tokens** |
| **Free Tier** | No | Yes (generous limits) |
| **Search Grounding** | Via separate API | **Native** (`google_search`) |
| **Status** | Original (v1.0) | **Recommended (v2.0)** |

Both integrations remain fully supported. Choose based on your needs.

---

## How It Works

### The MCP Protocol

The [Model Context Protocol](https://modelcontextprotocol.io) allows Claude Desktop to discover and execute tools provided by a local server. This MCP server acts as a bridge: Claude calls a tool (e.g., `ask_gemini_pro`), the server forwards the request to the external model's API, and returns the result to Claude.

Claude never needs to "think through" the heavy content. It sends the task, receives the output, and writes it to disk.

### Hybrid API Architecture (Gemini)

The Gemini integration uses a dual-path communication strategy for maximum capability:

1. **OpenAI-Compatible Path** (`generativelanguage.googleapis.com/v1beta/openai/`): Used for standard chat completions -- `ask_gemini` and `ask_gemini_pro` tool calls.
2. **Native Google API Path** (`generativelanguage.googleapis.com/v1beta`): Used for advanced features like **search grounding** (`web_search`) and **URL context** (`web_reader`). These features are not available through the OpenAI-compatible interface.

### Tool Discovery

When Claude Desktop starts, it reads `claude_desktop_config.json`, launches the MCP server as a child process, and queries it for available tools. The tools then appear in Claude's interface alongside its built-in capabilities.

---

## Quick Start: Gemini (Recommended)

### 1. Get a Google API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your key -- the free tier provides generous rate limits

### 2. Clone and Install

```bash
git clone https://github.com/Arkya-AI/claude-additional-models-mcp.git
cd claude-additional-models-mcp/gemini
npm install
```

### 3. Configure Claude Desktop

Open your Claude Desktop configuration file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the Gemini MCP server:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/absolute/path/to/claude-additional-models-mcp/gemini/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

> **Important:** Replace `/absolute/path/to/` with the actual path where you cloned the repo.

### 4. Restart Claude Desktop

Quit Claude Desktop completely (from the menu bar, not just closing the window) and relaunch it.

### 5. Verify It Works

1. Look for the tools icon in the bottom-right of the Claude input box
2. Ask Claude: *"What tools do you have access to?"* -- it should list `ask_gemini`, `ask_gemini_pro`, `web_search`, `web_reader`, and `parse_document`
3. Test: *"Use Gemini to explain the difference between TCP and UDP"* -- you should see a tool call animation followed by the response

---

## Quick Start: GLM-5 (Z.ai)

### 1. Get a Z.ai API Key

1. Visit [Z.ai](https://z.ai) and create an account
2. Navigate to [API Keys](https://z.ai/manage-apikey/apikey-list)
3. Create and copy your API key

### 2. Install

```bash
git clone https://github.com/Arkya-AI/claude-additional-models-mcp.git
cd claude-additional-models-mcp
npm install
```

### 3. Configure Claude Desktop

```json
{
  "mcpServers": {
    "glm5": {
      "command": "node",
      "args": ["/absolute/path/to/claude-additional-models-mcp/index.js"],
      "env": {
        "ZAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. Restart and Verify

Same process as Gemini above. Tools will be named `ask_glm5`, `ask_glm5_pro`, etc.

---

## Available Tools

Both integrations expose the same 5-tool interface. The tool names differ by prefix (`ask_gemini` vs `ask_glm5`).

### Core AI Tools

| Tool | Description | Key Parameters | Default Max Tokens |
|:---|:---|:---|:---|
| `ask_gemini` / `ask_glm5` | General analysis, synthesis, summarization | `prompt` (required), `system_prompt`, `temperature`, `max_tokens` | 8192 / 4000 |
| `ask_gemini_pro` / `ask_glm5_pro` | Code generation, complex reasoning, architecture | `prompt` (required), `system_prompt`, `temperature`, `max_tokens` | 16384 / 4000 |

### Research and Intelligence Tools

| Tool | Description | Key Parameters |
|:---|:---|:---|
| `web_search` | Real-time web search with grounding | `search_query` (required), `count` (1-50), `search_recency_filter`, `search_domain_filter` |
| `web_reader` | Fetch and parse full web page content | `url` (required), `return_format` (markdown/text), `with_images_summary`, `with_links_summary` |
| `parse_document` | Extract text from PDFs and images via OCR | `file_url` (required), `return_format` (markdown/text), `parse_mode` (auto/ocr/layout) |

---

## Usage Strategy: The 3-Tier Execution Priority

To maximize efficiency, Claude is instructed (via `CLAUDE.md`) to follow this execution hierarchy for every task:

### Priority 1: Spawn Parallel Sub-Agents (Fastest Path)

When facing a task with multiple independent parts, Claude spawns sub-agents that each independently call the external model. This is the **fastest execution path** and must be preferred over sequential calls.

*Example:* Writing a full-stack feature -- Sub-agent A generates the backend via `ask_gemini_pro`, Sub-agent B generates the frontend, Sub-agent C generates the tests. All run in parallel.

### Priority 2: Direct Delegation (Single-Unit Tasks)

For tasks that cannot be parallelized, Claude sends the entire prompt directly to the external model.

*Example:* "Analyze this codebase and explain the authentication flow" -- a single `ask_gemini_pro` call.

### Priority 3: Claude Does It Itself (Last Resort)

Claude should only perform work internally when:
- Orchestrating tool calls and sub-agents
- Performing file I/O (reading/writing to disk)
- Providing responses under 100 words
- Applying final client-facing polish to delegated content

### Orchestration Model

```
Claude (Parent)
    |-- Planning & coordination (stays in Claude)
    |-- File operations & disk I/O (stays in Claude)
    |-- Quick responses <100 words (stays in Claude)
    |
    |-- PRIORITY 1: Spawn parallel sub-agents (for multi-part tasks)
    |    \-- Each sub-agent uses external model for code/analysis
    |         |-- ask_[model]_pro for code generation
    |         |-- ask_[model] for analysis/docs
    |         \-- Sub-agent writes output to disk
    |
    \-- PRIORITY 2: Delegate to external model directly (for single-unit tasks)
         |-- Analysis >300 words
         |-- Code generation >50 lines
         |-- Research synthesis from multiple sources
         \-- Document processing & OCR
```

### Sub-Agent Enforcement

The `CLAUDE.md` file in this repository acts as a "constitution" for all Claude sessions. It enforces that **sub-agents must also delegate** to the external model -- they cannot generate large content blocks themselves.

**The pattern:** External model generates content -> Claude/sub-agent writes output to disk.

Any sub-agent that generates >50 lines of code or >300 words of content without delegating to the external model is violating the delegation rules.

---

## Model-Specific Strategies

### Sonnet 4.5: The Orchestrator

Sonnet 4.5 excels at following complex instructions, managing project structure, and coordinating multi-step workflows. Its degradation occurs when it is forced to also do the heavy lifting.

| Task | Sonnet Handles | External Model Handles |
|:---|:---|:---|
| Project structure decisions | Yes | -- |
| File read/write operations | Yes | -- |
| Final code integration | Yes | -- |
| Code generation (>50 lines) | -- | `ask_[model]_pro` |
| Analysis and documentation (>300 words) | -- | `ask_[model]` |
| Web research | -- | `web_search` + `web_reader` |
| Document processing | -- | `parse_document` |

**Result:** Sonnet becomes a lean orchestrator. Output quality increases because it is no longer context-overloaded.

### Opus 4.6: The Architect

Opus should function as the strategic decision-maker, not the laborer.

| Task | Opus Handles | External Model Handles |
|:---|:---|:---|
| Architectural decisions | Yes | -- |
| Complex multi-step coordination | Yes | -- |
| Security and logic review | Yes | -- |
| Boilerplate and CRUD code | -- | `ask_[model]_pro` |
| First drafts of any content | -- | `ask_[model]` |
| Data processing and comparison | -- | `ask_[model]` |
| Research and intelligence | -- | `web_search` + `web_reader` + `ask_[model]` |

**Result:** 90%+ reduction in Opus consumption. You get Opus-level orchestration at Sonnet-level cost.

---

## Consumption Optimization Rules

Four critical rules to ensure delegation is working:

### 1. Never Synthesize in Claude What the External Model Can Do

- **Bad:** Claude reads 5 competitor websites and writes a 2,000-word analysis
- **Good:** `web_search` -> `web_reader` -> `ask_gemini` synthesizes -> Claude presents the result

### 2. Delegate All Multi-Document Analysis

- **Bad:** Claude analyzes 3 PDFs and compares them
- **Good:** `parse_document` x3 -> `ask_gemini` comparison -> Claude formats output

### 3. Use External Model for First Drafts, Claude for Polish

- **Bad:** Claude generates an entire proposal section from scratch
- **Good:** `ask_gemini` generates the content -> Claude adapts to the project voice -> writes to disk

### 4. Parallel Delegation When Possible

- Parse multiple documents simultaneously
- Read multiple web sources in parallel
- Then aggregate with a single `ask_gemini` call

---

## Expected Savings

### Before vs. After: Token Consumption

#### Competitive Analysis Task

| Step | Claude-Only | With MCP |
|:---|:---|:---|
| Research | 3,000 Claude tokens | 200 tokens (web_search) |
| Read sources | 10,000 Claude tokens | 1,500 tokens (web_reader) |
| Analysis | 8,000 Claude tokens | 6,000 tokens (ask_gemini) |
| **Claude total** | **21,000 tokens** | **800 tokens** |
| **Reduction** | -- | **96%** |

#### Code Generation Task

| Step | Claude-Only | With MCP |
|:---|:---|:---|
| Architecture design | 2,000 Claude tokens | 300 Claude tokens (orchestration) |
| Implementation | 8,000 Claude tokens | 5,000 tokens (ask_gemini_pro) |
| Tests | 4,000 Claude tokens | 3,000 tokens (ask_gemini_pro) |
| **Claude total** | **14,000 tokens** | **500 tokens** |
| **Reduction** | -- | **96%** |

#### Document Analysis Task

| Step | Claude-Only | With MCP |
|:---|:---|:---|
| Read PDF | 5,000 Claude tokens | 0 (parse_document) |
| Extract key terms | 3,000 Claude tokens | 4,000 tokens (ask_gemini) |
| Summary | 2,000 Claude tokens | -- |
| **Claude total** | **10,000 tokens** | **300 tokens** |
| **Reduction** | -- | **97%** |

### Overall Impact

| Metric | Before MCP | After MCP |
|:---|:---|:---|
| Claude Pro exhaustion | ~2 days | **14+ days** |
| Sonnet 4.5 output quality | Degraded under load | **Superior** (orchestration-only) |
| Opus 4.6 consumption | 100% | **<10%** |
| Effective ROI on Pro subscription | 1x | **18-30x** |

---

## Real-World Workflows

### Research Pipeline

```
1. Claude receives: "Research the current state of edge AI deployment"
2. Claude calls web_search("edge AI deployment trends 2025", count=30)
3. Claude calls web_reader() on the top 5 URLs (parallel)
4. Claude calls ask_gemini("Synthesize these sources into a 2000-word report
   covering: key trends, major players, deployment challenges, and outlook")
5. Claude writes the report to research-output.md
6. Claude presents a 3-sentence summary to the user

Total Claude consumption: ~800 tokens (orchestration + file I/O)
```

### Code Generation Pipeline

```
1. Claude receives: "Build a FastAPI backend with user auth and CRUD endpoints"
2. Claude calls ask_gemini_pro("Generate SQLAlchemy models and Pydantic schemas
   for a user authentication system with roles and permissions")
3. Claude writes models.py to disk
4. Claude calls ask_gemini_pro("Generate FastAPI CRUD routes for these models: [models]")
5. Claude writes routes.py to disk
6. Claude runs tests locally

Total Claude consumption: ~500 tokens (orchestration + file I/O)
```

---

## Project Structure

```
claude-additional-models-mcp/
├── index.js              # GLM-5 MCP server (Z.ai 744B model)
├── package.json          # Root dependencies (@modelcontextprotocol/sdk, node-fetch)
├── gemini/
│   ├── index.js          # Gemini 3.x MCP server (hybrid API approach)
│   └── package.json      # Gemini dependencies (@modelcontextprotocol/sdk, openai)
├── CLAUDE.md             # GLM-5 delegation rules (root-level)
├── gemini/CLAUDE.md      # Gemini delegation rules
├── EXAMPLES.md           # Real-world usage examples and templates
├── CONTRIBUTING.md       # Contribution guidelines
├── LICENSE               # MIT License
├── .github/              # GitHub issue/PR templates
└── .gitignore
```

**npm scripts:**
```bash
npm run start:glm5    # Start GLM-5 server
npm run start:gemini  # Start Gemini server
```

---

## Troubleshooting

### Tools Not Appearing in Claude Desktop

1. **Check config syntax:** Validate `claude_desktop_config.json` with a JSON linter. A single trailing comma will break it.
2. **Verify absolute path:** The path to `index.js` must be absolute, not relative.
3. **Full restart:** Quit Claude Desktop from the menu bar (not just closing the window) and relaunch.
4. **Check server manually:** Run `node /path/to/gemini/index.js` in a terminal. If it errors, the issue is in the server setup.

### Empty Responses

1. **Verify API key:** Ensure your `GOOGLE_API_KEY` or `ZAI_API_KEY` is valid and active.
2. **Increase max_tokens:** Try setting `max_tokens` to 16384 for Gemini or 4000 for GLM-5.
3. **Lower temperature:** For analytical tasks, use temperature 0.3-0.5 for more deterministic output.

### Rate Limit Errors (429)

1. **Free tier limits (Gemini):** 15 RPM for Flash, 5 RPM for Pro. Wait and retry.
2. **Upgrade for higher limits:** Visit [Google AI Studio](https://aistudio.google.com) to check your tier.
3. **GLM-5 limits:** Check your Z.ai dashboard for remaining credits.

### Model Not Found Errors

1. Ensure you are using the correct environment variable names: `GOOGLE_API_KEY` for Gemini, `ZAI_API_KEY` for GLM-5.
2. The server handles model selection internally. Do not override model names in the config.

### GLM-5 Interruptions

GLM-5 can experience timeouts during peak hours or with very long prompts. If reliability is critical, switch to the Gemini integration.

### High Claude Consumption Despite Delegation

Audit checklist:
- Are you letting Claude do analysis that should go to `ask_gemini`?
- Are you reading web content in Claude instead of using `web_reader`?
- Are you generating code in Claude instead of `ask_gemini_pro`?
- Are you processing PDFs in Claude instead of `parse_document`?
- Are sub-agents generating content themselves instead of delegating?

**Expected token patterns per task:**
- Research task: Claude 800-2,000 tokens
- Code generation: Claude 500-1,000 tokens
- Proposal writing: Claude 1,500-3,000 tokens

If Claude consumption exceeds 3,000 tokens on analytical work, delegation is not optimized.

---

## Roadmap

- [ ] DeepSeek-V3 integration
- [ ] Local LLM fallback via Ollama for offline delegation
- [ ] Streaming support for real-time tool outputs
- [ ] Image/vision delegation support
- [ ] Automated cost-tracking dashboard
- [ ] Response caching for repeated queries
- [ ] Configuration UI for managing multiple model backends
- [ ] Pre-built prompt templates for common workflows

---

## Contributing

Contributions are welcome! Whether it is adding a new model provider, optimizing the sub-agent delegation prompts, or improving error handling, please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Anthropic](https://anthropic.com) for Claude and the Model Context Protocol
- [Z.ai](https://z.ai) for GLM-5 API access
- [Google](https://ai.google.dev) for the Gemini 3.x API and generous developer tiers
- The MCP community for the protocol specification

---

## Links

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Google AI Studio](https://aistudio.google.com)
- [Z.ai Documentation](https://docs.z.ai)
- [Claude Desktop](https://claude.ai/download)
- [Issue Tracker](https://github.com/Arkya-AI/claude-additional-models-mcp/issues)

---

*Built by [Arkya AI](https://github.com/Arkya-AI) to make Claude truly limitless.*
