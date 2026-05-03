# `qref/` — Quick Reference

> **Surgical reference files. One topic per file. Linked from `CLAUDE_MAINDOCS_INDEX.md`'s Quick Reference table.**

---

## Why qref exists

The 17 architecture docs (`CLAUDE_ARCHITECTURE.md`, `CORE_PATTERNS.md`, `DECISIONS.md`, etc.) cover *rules and history* — broad-strokes, slow-changing. `CLAUDE_MAINDOCS_INDEX.md` covers *current state* — terse, lots of bullets.

Neither is the right home for **deep technical traps** that need worked examples. Examples in this project:

- The clock animation engine has invariants (no per-frame allocation, GPU-promoted `.hand`, throttled phase) that are not obvious from reading `clock.js` cold — and breaking them silently regresses Lighthouse.
- GitHub Pages has serving rules (no SSR, CNAME apex behaviour, no preview deploys) that are easy to assume away.
- Hooks in `.claude/hooks/*.sh` need to be portable across forks — hardcoding a username is a one-line mistake that fails on every collaborator's machine.

These need ≥ 200 words, code samples, a "what we tried" trail, and a "what to do instead" outcome. That's a `qref/` file.

---

## When to add a qref

A topic earns a qref when **all four** apply:

1. **It bites.** The trap has cost session time at least once. Not theoretical.
2. **It's surgical.** One topic. One root cause. Not "all our caching" — that's an ADR.
3. **It needs depth.** ≥ 200 words. ≥ 1 worked failure case (what was tried, what broke, why). ≥ 1 working remedy.
4. **It's recurring-relevant.** Future sessions will hit this again. A one-time migration step doesn't qualify; a permanent constraint does.

If you can capture the lesson in ≤ 3 bullets in `CLAUDE_MAINDOCS_INDEX.md`'s **Known Constraints**, do that instead. qref is reserved for the topics where bullets aren't enough.

---

## Naming convention

```text
qref/qr-<kebab-topic>.md
```

- Lowercase. Kebab-case. Always prefixed `qr-`.
- Topic should be readable on its own — `qr-clock-animation-engine.md` not `qr-engine.md`.
- One file per concern. Don't multiplex: `qr-everything-clock.md` is wrong; split it.

---

## File structure

Every qref file follows this skeleton:

```markdown
# qr-<topic>: <short title>

> **One-sentence summary.** What the trap is, in plain English.

## Symptom
What you see when this trap fires. The error, the silent failure, the wrong output.

## Root cause
Why it happens. The technical mechanism, not the workaround.

## Worked example
Code that triggers the trap. Annotated.

## Remedy
The fix. Code that works. Why it works.

## See also
- Cross-refs to ADRs, BREAKTHROUGHS entries, or external docs.
```

Sections can be expanded as needed (multiple symptoms, multiple remedies). Don't drop sections — even if a section is one line, keep the heading so the structure is scannable.

---

## When NOT to add a qref

- **Ephemeral state.** "We're currently waiting on X" → goes in `CLAUDE_MAINDOCS_INDEX.md` § Open work.
- **Decision rationale.** "Why we chose CSS custom properties over Sass" → goes in `DECISIONS.md` (ADR).
- **Pattern guidance.** "How we structure components" → goes in `STANDARDS.md` or `ARCHITECTURE_EXTENSION.md`.
- **History narrative.** "How we diagnosed the GC pressure" → goes in `BREAKTHROUGHS.md`.
- **Personal preference.** "Mat prefers tabs" → goes in CLAUDE.md or memory, not here.

A qref should still be useful three years from now to a contributor who has never met any of the original team.

---

## Maintaining qref/

- **Review when the linked tech changes.** GitHub Pages quirks change rarely; iOS Safari quirks change more often — check `qr-github-pages-static.md` after any `clock.css` viewport-units edit.
- **Delete when no longer relevant.** A qref about a constraint that's been engineered away can be moved to `BREAKTHROUGHS.md` (as history) and deleted from qref.
- **Don't let it become a graveyard.** If `qref/` has > 15 files, audit. Some may have moved past their useful life.
- **Cross-ref from `CLAUDE_MAINDOCS_INDEX.md`.** Every qref must be listed in the Quick Reference table — otherwise sessions won't find it.

---

## Current qref files (this repo)

| File | Topic |
|---|---|
| `qr-clock-animation-engine.md` | rAF cycle, `Float64Array` cache, pre-allocated buffers, `will-change` + `contain`; protected-files invariants |
| `qr-github-pages-static.md` | GitHub Pages serving rules; CNAME apex; `svw`/`svh` over `dvw`/`dvh`; no SSR / no env vars / no preview branches |
| `qr-claude-code-hooks.md` | Env-var hook paths; diagnostic hooks always exit 0; never `set -e`; portable across forks |
