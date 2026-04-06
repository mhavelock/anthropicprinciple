# CLAUDE.md - GLM-5 MCP Server Project Memory

## Project Overview

**Purpose:** MCP server that integrates Z.ai's GLM-5 (744B parameter model) with Claude Desktop to reduce Claude API consumption by 10x through intelligent task delegation.

**Core Value:** Solve the "weekly Claude Pro limit exhausted in 2 days" problem by using a hybrid orchestration approach where Claude (Sonnet 4.5 or Opus 4.6) coordinates while GLM-5 handles heavy computational tasks.

**Key Metrics:**
- 10x reduction in Claude consumption
- 18-30x ROI improvement on Claude Pro subscriptions
- 100% availability (no more multi-day blockages)

## Architecture

### Hybrid Orchestration Model

```
User Request
    ↓
Claude / Opus (Parent)
    ├─→ Planning & Coordination (stays in Claude)
    ├─→ File Operations (stays in Claude)
    ├─→ Quick Responses <100 words (stays in Claude)
    │
    ├─→ PRIORITY 1: Spawn parallel sub-agents (for multi-part tasks)
    │    └─→ Each sub-agent uses GLM-5 for code/analysis
    │         ├─→ ask_glm5_pro for code generation
    │         ├─→ ask_glm5 for analysis/docs
    │         └─→ Sub-agent writes output to disk
    │
    └─→ PRIORITY 2: Delegate to GLM-5 directly (for single-unit tasks)
         ├─→ Complex Analysis (>300 words)
         ├─→ Code Generation (>50 lines)
         ├─→ Research Synthesis
         └─→ Document Processing
```

### Technology Stack

- **MCP Server:** Node.js + @modelcontextprotocol/sdk
- **API Provider:** Z.ai (https://api.z.ai/api/paas/v4)
- **Models Used:**
  - GLM-5 (744B params) - General reasoning & coding
  - GLM-4.6V - Vision & OCR tasks
  - search-prime - Web search engine

## GLM-5 Delegation Gate (MANDATORY)

**STOP. Run this checklist BEFORE writing code or documentation. This applies to you AND to any Task sub-agents you spawn.**

### Execution Priority (follow this order)

**When facing a task with multiple independent parts:**
1. **FIRST: Spawn parallel sub-agents** — each sub-agent uses GLM-5 for its heavy work. This is the fastest path and MUST be preferred over sequential GLM-5 calls.
2. **SECOND: Delegate to GLM-5 directly** — when the task is a single unit that cannot be parallelized, use `ask_glm5` or `ask_glm5_pro`.
3. **LAST RESORT: Do it yourself** — only for orchestration, file I/O, client polish, and responses <100 words. Opus/Claude should almost never generate content directly.

### Pre-Flight Checks

1. **Am I (or my sub-agent) generating >50 lines of code?**
   → Use `ask_glm5_pro` to generate the code, then write the output to disk.

2. **Am I (or my sub-agent) writing >300 words of analysis, docs, or summaries?**
   → Use `ask_glm5` to generate the content, then write the output to disk.

3. **Task sub-agents MUST also use GLM-5.**
   Sub-agents have access to all MCP tools including `ask_glm5_pro` and `ask_glm5`. When spawning a Task sub-agent, **explicitly instruct it to use GLM-5 for code generation and analysis** in the prompt. Sub-agents that generate >50 lines of code or >300 words of content themselves (without delegating to GLM-5) are violating this rule.

4. **Pattern: GLM-5 generates → Claude/sub-agent writes to disk.**
   Claude's role (parent or sub-agent) is orchestration + file I/O. GLM-5's role is content generation.

**Violation of this gate wastes the user's Anthropic budget. There is no acceptable excuse.**

---

## Tool Delegation Guidelines

### When to Use Each Tool

#### `ask_glm5` - Complex Reasoning
**ALWAYS delegate when:**
- Analysis requires >300 words output
- Multi-step logical reasoning chains
- System design or architecture decisions
- Strategic analysis or synthesis
- Research report generation (>1000 words)

**Examples:**
```javascript
// Good delegation
"Analyze the competitive landscape of AI agent platforms. Include market size,
key players, differentiation strategies, and growth projections."

// Poor delegation (too simple, keep in Claude)
"What is an AI agent?"
```

**Parameters:**
- `temperature`: 0.3-0.5 for analytical tasks, 0.7-0.9 for creative tasks
- `max_tokens`: 4000 default, increase to 8000 for comprehensive reports

#### `ask_glm5_pro` - Code Generation
**ALWAYS delegate when:**
- Generating >50 lines of code
- Complex algorithms or data structures
- Full component implementations
- Refactoring large code sections
- Code optimization or performance improvements

**Examples:**
```javascript
// Good delegation
"Implement a React component for OAuth authentication with Google, GitHub,
and email/password. Include form validation, error handling, loading states,
and token management."

// Poor delegation (keep in Claude)
"Fix this typo in the button text"
```

**System Prompt Customization:**
```javascript
ask_glm5_pro({
  prompt: "Build a REST API...",
  system_prompt: "You are a senior backend engineer specializing in Node.js
                  and PostgreSQL. Follow best practices for error handling,
                  input validation, and security."
})
```

#### `web_search` - Intelligence Gathering
**ALWAYS delegate when:**
- Need >3 sources of information
- Competitive intelligence research
- Market trends or real-time data
- News and current events
- Finding multiple perspectives

**Parameters:**
- `count`: 5-10 for quick checks, 30-50 for deep research
- `search_recency_filter`:
  - "oneDay" for breaking news
  - "oneWeek" for recent developments
  - "oneMonth" for current trends
  - "noLimit" for comprehensive research

**Examples:**
```javascript
// Competitive intelligence
web_search({
  search_query: "OpenAI GPT-5 launch features pricing 2024",
  count: 30,
  search_recency_filter: "oneMonth"
})

// Domain-filtered research
web_search({
  search_query: "MCP Model Context Protocol tutorials",
  search_domain_filter: "github.com,modelcontextprotocol.io"
})
```

#### `web_reader` - Content Extraction
**ALWAYS use after web_search to:**
- Extract full article content
- Read competitor documentation
- Analyze landing pages
- Parse blog posts for detailed information

**Workflow:**
```javascript
// 1. Search for sources
web_search("AI agent market analysis 2024", count=10)

// 2. Read top 3-5 articles
web_reader(url1, return_format="markdown")
web_reader(url2, return_format="markdown")
web_reader(url3, return_format="markdown")

// 3. Synthesize with GLM-5
ask_glm5("Based on these articles: [content], create an executive summary...")
```

#### `parse_document` - OCR & Document Processing
**ALWAYS delegate when:**
- Extracting text from PDFs
- Processing scanned documents
- Reading invoices, receipts, business cards
- Analyzing multi-page contracts or proposals

**Examples:**
```javascript
// Contract analysis
parse_document({
  file_url: "https://example.com/contract.pdf",
  return_format: "markdown"
})
// Then analyze with GLM-5
ask_glm5("Extract key obligations, risks, dates, and payment terms from this contract...")

// Batch processing
parse_document(invoice1_url)
parse_document(invoice2_url)
parse_document(invoice3_url)
// Then summarize
ask_glm5("Create a summary table of these invoices with vendor, amount, date, status")
```

## Model Selection Strategy

### Use Sonnet 4.5 When:
✅ **Working with files and codebase**
- File operations (read, write, edit)
- Git operations
- Code navigation and search
- Quick code fixes (<50 lines, otherwise use ask_glm5_pro)

✅ **Orchestration and planning**
- Breaking down user requests
- Coordinating multiple tool calls
- Presenting results to user
- Managing conversation flow

✅ **Quick responses**
- Simple questions (<100 word answers)
- Clarifications
- Status updates
- Command execution

### Use Opus 4.6 When:
✅ **Complex orchestration needed**
- Multi-step workflows with many decision points
- Advanced planning requiring deep reasoning
- Coordinating 5+ tool calls with dependencies
- Strategic architecture decisions

✅ **Execution priority for Opus:**
- **Priority 1:** Spawn parallel sub-agents for independent tasks (each sub-agent uses GLM-5)
- **Priority 2:** Delegate to GLM-5 directly when task is single-unit
- **Priority 3 (last resort):** Opus does it itself — only for orchestration, file I/O, <100 words

**Opus Optimization Strategy:**
```
Opus = Architect & Coordinator (NEVER generates content directly)
Sub-agents = Parallel workers (MUST use GLM-5 for heavy work)
GLM-5 = Content engine (code, analysis, docs)

Parallelism FIRST → GLM-5 delegation SECOND → Opus self-execution LAST
```

## Consumption Optimization Rules

### Critical Rules for Both Sonnet and Opus

1. **Never synthesize in Claude what GLM-5 can do**
   - ❌ Bad: Claude reads 10 articles and writes 2000-word analysis
   - ✅ Good: web_reader fetches articles → ask_glm5 synthesizes

2. **Delegate all multi-document analysis**
   - ❌ Bad: Claude analyzes 3 PDFs and compares
   - ✅ Good: parse_document x3 → ask_glm5 comparison

3. **Use GLM-5 for first drafts, Claude for integration**
   - ❌ Bad: Claude generates entire React component
   - ✅ Good: ask_glm5_pro generates code → Claude integrates into project

4. **Parallel tool usage when possible**
   - ✅ Call web_reader on multiple URLs simultaneously
   - ✅ Parse multiple documents in parallel
   - Then aggregate results with ask_glm5

### Expected Consumption Patterns

**Before GLM-5 MCP (Opus 4.6 only):**
```
Competitive analysis task:
- Search: 500 tokens
- Read 5 articles: 10,000 tokens
- Analysis: 8,000 tokens
Total: 18,500 tokens per task
```

**After GLM-5 MCP (Opus + delegation):**
```
Same task:
- Opus orchestration: 800 tokens
- GLM web_search: 200 tokens (Z.ai)
- GLM web_reader: 1,500 tokens (Z.ai)
- GLM ask_glm5: 6,000 tokens (Z.ai)
Opus total: 800 tokens (96% reduction!)
```

## Development Workflow

### Adding New Tools

1. **Research the API**
   - Read Z.ai docs: https://docs.z.ai
   - Test with curl/Postman first
   - Understand response format

2. **Design the tool**
   - Choose verb-based name: `action_target`
   - Define clear parameters with defaults
   - Plan LLM-friendly output format

3. **Implement**
   ```javascript
   // In ListToolsRequestSchema handler
   {
     name: "tool_name",
     description: "When to use + what it does + use cases",
     inputSchema: {
       type: "object",
       properties: { /* params */ },
       required: ["required_param"]
     }
   }

   // In CallToolRequestSchema handler
   if (name === "tool_name") {
     try {
       // API call with error handling
       // Format response for LLM
       return { content: [{ type: "text", text: result }] };
     } catch (error) {
       console.error(`[Tool] Error:`, error);
       return {
         content: [{ type: "text", text: `Error: ${error.message}` }],
         isError: true
       };
     }
   }
   ```

4. **Test thoroughly**
   - Happy path (correct input)
   - Error cases (invalid params, API errors)
   - Edge cases (empty results, timeouts)
   - End-to-end in Claude Desktop

### Code Quality Standards

**Error Handling:**
```javascript
// Always log context with errors
console.error(`[Tool Name] API Error ${response.status}:`, errorText);

// Never expose API keys in errors
throw new Error(`API returned ${response.status}: ${errorText}`);
// NOT: throw new Error(`Failed with key ${API_KEY}`);

// Return helpful error messages
return {
  content: [{
    type: "text",
    text: `Error in tool_name: ${error.message}\n\nTry: [helpful suggestion]`
  }],
  isError: true
};
```

**Logging:**
```javascript
// Use console.error for debugging (goes to stderr, not user)
console.error(`[Tool Debug] Request:`, { param1, param2 });
console.error(`[Tool Debug] Response:`, { resultCount, status });

// Never log sensitive data
console.error(`[Tool Debug] API Key:`, API_KEY); // ❌ NEVER
```

**Parameter Validation:**
```javascript
// Validate at schema level when possible
{
  count: {
    type: "number",
    minimum: 1,
    maximum: 50,
    default: 10
  }
}

// Runtime validation for complex cases
if (!args.prompt || args.prompt.trim().length === 0) {
  throw new Error("Prompt cannot be empty");
}
```

## API Reference

### Z.ai Endpoints Used

**Base URL:** `https://api.z.ai/api/paas/v4`

**Authentication:**
```javascript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.ZAI_API_KEY}`
}
```

**Models:**
- `glm-5` - Latest flagship (744B params)
- `glm-4.7`, `glm-4.7-flash` - Previous generation
- `glm-4.6v` - Vision model for OCR
- `search-prime` - Web search engine

**Rate Limits:**
- Check Z.ai dashboard for current limits
- Implement exponential backoff if needed
- Log rate limit warnings

## Testing Guidelines

### Manual Testing Checklist

Before committing:
- [ ] Test in Claude Desktop (end-to-end)
- [ ] Test error cases (invalid input, network errors)
- [ ] Verify no API keys logged
- [ ] Check token consumption (should be minimal for orchestration)
- [ ] Test with both Sonnet 4.5 and Opus 4.6

### Performance Testing

Monitor Claude consumption:
```javascript
// Before GLM-5
console.log("Starting task with Claude only");
// Do task entirely in Claude
console.log("Tokens used:", /* check Claude usage */);

// After GLM-5
console.log("Starting task with GLM-5 delegation");
// Delegate to GLM-5
console.log("Claude tokens used:", /* should be ~90% less */);
```

## Security

### API Key Management

**Never commit:**
- `.env` files
- API keys in code
- Test API keys
- User credentials

**Always:**
- Use environment variables: `process.env.ZAI_API_KEY`
- Add to `.gitignore`: `*apikey*`, `*api-key*`, `.env*`
- Validate keys exist at startup
- Fail gracefully if missing

### Data Privacy

- Never log user prompts in production
- Don't cache sensitive document content
- Respect Z.ai data retention policies
- Clear temp files after processing

## Roadmap

### Phase 1 (Current)
- [x] GLM-5 text generation (ask_glm5, ask_glm5_pro)
- [x] Web search (search-prime engine)
- [x] Web reader (markdown extraction)
- [x] Document parsing (GLM-OCR)

### Phase 2 (Next)
- [ ] Translation agent (40+ languages)
- [ ] Slide generation (GLM Slide Agent)
- [ ] Streaming support for real-time responses
- [ ] Response caching for repeated queries

### Phase 3 (Future)
- [ ] Image generation (GLM-Image)
- [ ] Audio transcription (GLM-ASR)
- [ ] Video analysis (GLM-4.6V video mode)
- [ ] Preset prompt templates
- [ ] Usage analytics dashboard

## Common Patterns

### Pattern 1: Research Pipeline
```javascript
// 1. Find sources
web_search("topic", count=30)

// 2. Extract content (parallel)
Promise.all([
  web_reader(url1),
  web_reader(url2),
  web_reader(url3)
])

// 3. Synthesize with GLM-5
ask_glm5("Analyze these sources and create executive summary...")

// 4. Claude presents results
```

### Pattern 2: Document Analysis
```javascript
// 1. Parse documents
parse_document(pdf_url, return_format="markdown")

// 2. Analyze with GLM-5
ask_glm5("Extract key terms, obligations, risks from this contract...")

// 3. Claude formats as structured output
```

### Pattern 3: Code Generation + Integration
```javascript
// 1. GLM-5 generates implementation
ask_glm5_pro("Build a React authentication component...")

// 2. Claude writes to files
Write(path, glm5_code)

// 3. Claude runs tests
Bash("npm test")

// 4. Claude commits
Bash("git add . && git commit")
```

## Troubleshooting

### Tools Not Appearing

1. Check config path: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Verify absolute path to `index.js`
3. Restart Claude Desktop (quit completely, not just close)
4. Check stderr logs: `node index.js` in terminal

### Empty GLM-5 Responses

1. Check API key is valid and has credits
2. Verify thinking mode: `thinking: { type: "disabled" }`
3. Check both `content` and `reasoning_content` fields
4. Increase `max_tokens` if response is cut off

### High Claude Consumption

**Audit your workflow:**
- Are you delegating analysis tasks to GLM-5?
- Are you using web_reader before Claude processes content?
- Are you letting Claude generate >50 line code blocks?
- Are you using GLM-5 for multi-document synthesis?
- Are Task sub-agents using GLM-5 for their heavy work (not generating code/content themselves)?

**Optimization checklist:**
- [ ] Analysis >300 words delegated to ask_glm5
- [ ] Code >50 lines uses ask_glm5_pro
- [ ] Research uses web_search → web_reader → ask_glm5
- [ ] Documents parsed with parse_document before analysis
- [ ] Task sub-agents use GLM-5 for heavy work (not generating code/content themselves)
- [ ] Claude only does orchestration + file ops

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- PR process
- Testing requirements
- Tool design principles

## Resources

- [Z.ai API Docs](https://docs.z.ai)
- [MCP Specification](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/download)
- [Repository](https://github.com/Arkya-AI/glm5-mcp)

---

**Remember:** The goal is to reduce Claude consumption while maintaining quality. Delegate heavy work, keep Claude for coordination. Both Sonnet 4.5 and Opus 4.6 benefit from this approach. **Task sub-agents are encouraged for parallelism — but each must use GLM-5 for code generation and analysis, not do it themselves.**
