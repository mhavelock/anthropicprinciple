# Plan — Architecture Redux (next session)

> **Source:** lessons learned from the white-hat-label architecture redux on 2026-05-03 (5 phases, 4 commits, 1,495 net insertions across 35 files). The white-hat-label redux ported maturation patterns from hardy-succulents back into the boilerplate scaffold. This plan applies the same patterns to anthropicprinciple — but adapted for a static-site art project, not a documentation scaffold.

---

## Context

anthropicprinciple's architecture docs are mature for a single-page art piece:

- 17 architecture files (vs white-hat-label's 14 post-redux — anthropicprinciple is ahead on `STANDARDS`, `deployment`, `infrastructure`, `security`, `system-design-tasks`)
- Sprint memory system in `.ai/memory/active_sprint.md` — equivalent to a state-of-play file but project-specific
- 11 ADRs, 10 feedback loops, 5 breakthroughs already recorded
- G1–G13 in CORE_PATTERNS

What the redux surfaced is **not** that anthropicprinciple is missing structure — it's that two patterns from white-hat-label/hardy-succulents are absent and would help:

1. **Public-facing live state-of-play** — `.ai/memory/active_sprint.md` is sprint-scoped and short. A `CLAUDE_MAINDOCS_INDEX.md`-style file is project-scoped and longer (Quick Reference table, Known Constraints, Changes Since Training Data, Settings — Current State of Play).
2. **Surgical quick-references** (`qref/`) — for AI-trap topics that need depth (≥ 200 words, ≥ 1 worked failure case).

And **two security-sweep lessons** that should land in the architecture docs:

3. **G14 + G15** — env-var-driven hook paths and gitignore session-tracker artefacts. These are project-agnostic and should mirror across.
4. **ADRs + BREAKTHROUGHS + FL** entries for the security-sweep work — each project that runs the playbook should accumulate the same durable record.

---

## Important: not a copy-paste

White-hat-label is a documentation scaffold. anthropicprinciple is a real project with code, deployments, and an art purpose. The redux applies *patterns*, not *content*. Specifically:

- White-hat-label's `qref/` was seeded with three boilerplate-relevant topics. anthropicprinciple's `qref/` should reflect *its* AI traps — the clock animation engine, GitHub Pages quirks, `localStorage` patterns it's already learned.
- White-hat-label's `audit-template/` is a generic chunked-audit pattern. anthropicprinciple may not need it — the project is small enough that the existing CODEBASE-AUDIT.md chunks suffice. **Audit-template is optional and should be skipped unless real value emerges.**
- White-hat-label's `STATE-OF-PLAY.md` template has subsections for "Migration / Cutover state" and "Vendor — Long-running flags" — irrelevant for a static art site. Drop those subsections in the anthropicprinciple version.

---

## Proposed phases (mirrors the white-hat-label redux structure)

### Phase A — Foundation (additive only, no deletions)

| File | Action |
|---|---|
| `docs/architecture/CLAUDE_MAINDOCS_INDEX.md` | **New.** Live state-of-play file. Pre-populate (this is a real project, not a template) — cite the live URL, the current performance state, the protected files, the open work. Cross-reference `.ai/memory/active_sprint.md` for sprint-level state; this file is project-level. |
| `docs/architecture/qref/README.md` | **New.** Same pattern as white-hat-label — naming, when to add, file skeleton. |
| `docs/architecture/qref/qr-clock-animation-engine.md` | **New.** First worked qref: the rAF loop, pre-allocated angle buffers, `Float64Array` cache, `will-change`/`contain` GPU hints. The constraints that mean Mat's edits to clock.js are "performance only, never structural." Most likely to be cited in future sessions. |
| `docs/architecture/qref/qr-github-pages-static.md` | **New.** Second worked qref: GitHub Pages serving rules, the CNAME file, why there's no SSR, how `_404.html` works (or doesn't), branch deploy quirks. |
| `docs/architecture/qref/qr-claude-code-hooks.md` | **New (mirror).** Copy from white-hat-label and adapt. Same content; this is a project-agnostic trap. |

**Deliberately omitting:**
- `audit-template/` — defer; revisit only if a future audit feels too unstructured.
- `PHASE-STATUS.md` — already covered by the existing tasklist + `.ai/memory/`.
- `STATE-OF-PLAY.md` — folded into MAINDOCS_INDEX directly.

**Commit:** `feat(architecture): add MAINDOCS_INDEX + qref/ with project-specific worked examples`

---

### Phase B — Update existing 17 docs (integration)

| File | Update |
|---|---|
| `CORE_PATTERNS.md` | Add **G14** (env-var-driven hook paths) and **G15** (gitignore session-tracker artefacts). Identical wording to white-hat-label — these are project-agnostic. |
| `DECISIONS.md` | Add **ADR-012** (two-phase security playbook), **ADR-013** (branch protection on `main`), **ADR-014** (`--skip-push-sessions` for AI session-trackers). Renumber if anthropicprinciple's existing ADR sequence differs. |
| `BREAKTHROUGHS.md` | Add **B-06** (entire.io leak diagnosis) — adapt the white-hat-label B-01 entry, citing this project's run of the security playbook (date TBC by next session). If anthropicprinciple hasn't run the playbook yet, defer this entry until after the run. |
| `FEEDBACK-LOOPS.md` | Add **FL-11** (assume hostile defaults on third-party tools). Same content as white-hat-label FL-10. |
| `CHECKPOINTS.md` | Add **Trigger 10** (security-relevant change). Identical to white-hat-label. |
| `REFLECTIVE-SYNC.md` | Add **Security Sync** prompt. Identical to white-hat-label. |
| `ARCHITECTURE_EXTENSION.md` | Add **Hook Conventions** subsection (env-var paths, exit 0 for diagnostic, `set -u`, input validation). Cross-ref `qref/qr-claude-code-hooks.md`. |
| `ARCHITECTURE.md` | Note CLAUDE_MAINDOCS_INDEX as L1; G1–G13 → G1–G15 wherever referenced. |
| `CLAUDE_ARCHITECTURE.md` (architecture sub-project file) | Update reading order — MAINDOCS_INDEX before ARCHITECTURE; update file map table to include MAINDOCS_INDEX, qref/. |
| `CODEBASE-AUDIT.md` | Add G14 + G15 to the constraint check table. |
| `STANDARDS.md`, `deployment.md`, `infrastructure.md`, `security.md`, `system-design-tasks.md` | No changes expected — review for cross-ref opportunities only. |
| `FE-VISUALISATION.md`, `six-hats.md`, `GEMINI-CONSULTANCY.md` | No changes expected. |

**Self-audit step:** grep all `.md` files for `G1–G13` → `G1–G15`. White-hat-label's audit caught 6 stale references; expect similar here.

**Commit:** `docs(architecture): integrate MAINDOCS_INDEX + capture security-sweep lessons across CORE_PATTERNS / DECISIONS / FEEDBACK-LOOPS / CHECKPOINTS / REFLECTIVE-SYNC`

---

### Phase C — Surface in user-facing docs

| File | Change |
|---|---|
| `CLAUDE.md` (project root) | Update `File Structure` section to show `qref/`, MAINDOCS_INDEX. Update reading-order references. Update `G1–G13` → `G1–G15` in any wording. |
| `README.md` | Likely no change — `README.md` is for the public art piece, not the AI-development scaffold. Leave alone unless review surfaces value. |
| `index.html`, `clock-controls.html`, `play.html` | No change — these are the art piece itself, not docs. |

**Commit:** `docs: surface MAINDOCS_INDEX + qref in CLAUDE.md`

---

### Phase D — Markdown sweep (fold in from white-hat-label's lesson)

White-hat-label's redux uncovered ~169 unannotated fenced code blocks across 35 docs. Run the same sweep on anthropicprinciple before committing Phase A–C — small enough to land in one commit if the fix is mostly mechanical.

```bash
# Single-language tag pass (default 'text'; bump to 'bash' for clear command blocks)
# White-hat-label has the Python script in its session history (commit e12cc86)
```

Plus the bare-URL sweep (3 found in white-hat-label) and heading-hierarchy verification (white-hat-label was clean — expect anthropicprinciple is too).

**Commit:** `docs: markdown syntax & hierarchy sweep across docs/`

---

### Phase E — Run the security playbook (after Phase B lands)

Once `CORE_PATTERNS.md` has G14/G15 and `DECISIONS.md` has the ADRs, the playbook updates from `plan-security-playbook-update-2026-05-03.md` should be in place. Run Phase 0 (3-min triage) on anthropicprinciple:

- `.env*` history check
- Vendor token regex
- Client-bundle env-var leak (no client bundle on this project — N/A)
- Shadow branches (entire/, aider/, cursor/)
- Branch protection state

If anything fails Phase 0, run the full playbook before continuing. If clean, document with a `docs/plan/security-phase1-2026-05-DD.md` deliverable (modelled on white-hat-label's `docs/security-phase1-2026-05-03.md`).

**Commit:** `chore(security): Phase 0/1 sweep — clean baseline / [findings if any]`

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| MAINDOCS_INDEX duplicates `.ai/memory/active_sprint.md` | They serve different scopes — sprint vs project. Make the distinction explicit in MAINDOCS_INDEX preamble. Sprint stays in `.ai/`; project state stays in MAINDOCS_INDEX. |
| qref content writes overlap with existing docs | The two project-specific qrefs (clock-animation-engine, github-pages-static) are net-new traps that don't have a home today. The third (claude-code-hooks) is project-agnostic and was missing entirely. |
| The security playbook hasn't run on this project yet | Defer B-06 (entire.io leak diagnosis breakthrough entry) until the playbook runs. ADRs and FL/G entries can land before the run — they're forward-looking rules. |
| Forcing G14 + G15 when there are no `.claude/hooks/*.sh` files in this project | Check `.claude/hooks/` first. If empty, G14 still applies (pre-emptive — hooks added in future must follow); G15 still applies (entire.io / aider could be added at any time). Land the rules; they're cheap to keep. |

---

## What this redux is NOT

- Not a rewrite. The 17 existing architecture docs stay intact.
- Not a content-fill. The qref files contain *project-specific* technical content; do not pad with white-hat-label boilerplate.
- Not a one-session job. Phase A alone is meaningful (~90 min). Phases B + D can land in a second session. Phase C is small. Phase E is a separate planned session.
- Not a security sweep. That's the companion plan (`plan-security-playbook-update-2026-05-03.md` then run it).

---

## Suggested entry prompt for next session

```text
Read docs/plan/plan-architecture-redux-2026-05-03.md.
Source patterns: ~/Claudette/Cowork/projects/white-hat-label/docs/architecture/REDUX-PLAN-2026-05-03.md
and the white-hat-label commits 689deba, b1cf304, 449671b, eb0815c, 2d21bc7, e12cc86.

Continue at Phase A. Show the proposed CLAUDE_MAINDOCS_INDEX.md structure
for sign-off before bulk-creating files (this is a real project, not a
template — sections will be pre-populated with anthropicprinciple-specific
content, not [FILL PER PROJECT] placeholders).

Important: the two project-specific qref files (clock-animation-engine,
github-pages-static) need genuinely-bitten technical content. Read clock.js,
clock.css, and the git log for past clock-related fixes before drafting.
Don't pad with boilerplate.

Stop after Phase A and commit. Phases B-E onwards are separate sessions.
```

---

## Cross-references

- white-hat-label redux plan: `~/Claudette/Cowork/projects/white-hat-label/docs/architecture/REDUX-PLAN-2026-05-03.md`
- white-hat-label MAINDOCS_INDEX (template form): `~/Claudette/Cowork/projects/white-hat-label/docs/architecture/CLAUDE_MAINDOCS_INDEX.md`
- white-hat-label qref pattern README: `~/Claudette/Cowork/projects/white-hat-label/docs/architecture/qref/README.md`
- white-hat-label CORE_PATTERNS G14/G15: `~/Claudette/Cowork/projects/white-hat-label/docs/architecture/CORE_PATTERNS.md`
- white-hat-label DECISIONS ADR-005/006/007: `~/Claudette/Cowork/projects/white-hat-label/docs/architecture/DECISIONS.md`
- Companion plan (security playbook update): `docs/plan/plan-security-playbook-update-2026-05-03.md`
