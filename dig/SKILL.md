---
name: dig
version: 1.0.0
description: |
  Detect environment, clarify requirements via focused questions, and generate a structured spec.
  Three phases: detect codebase → ask clarifying questions → output spec.md.
  Use when starting a new feature or requirement discussion.
  Do NOT trigger for debugging, code review, or tasks with complete specs.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - Agent
  - WebFetch
  - WebSearch
---

# Dig — Uncover Requirements, Output Spec

Turn fuzzy ideas into a structured spec, ready for task decomposition.

**Iron Rule: Never guess when you can ask. Never code when you can spec.**

---

## PHASE 1 — DETECT (Environment Detection)

Run this silently at the start. Do not narrate the detection process.

**Check environment:**

1. **Claude Code with codebase?** — Run `git rev-parse --show-toplevel` and scan project structure.
   If successful: read key files (package.json, pyproject.toml, Cargo.toml, go.mod, etc.),
   understand the tech stack, directory layout, and existing patterns.
   Set mode: `codebase`

2. **No codebase?** — Pure conversation mode.
   Set mode: `conversation`

**In codebase mode**, gather:
- Tech stack and framework versions
- Directory structure (top 2 levels)
- Existing data models / schema files
- Key config files
- Recent git history (last 10 commits) for context on current work

**Context injection:** If the user's idea references local files, skills, or docs, read them
as additional context before proceeding to PHASE 2.

Store findings internally. Reference them in PHASE 2 questions and PHASE 3 output.

---

## PHASE 2 — CLARIFY (Ask-Then-Act)

**Philosophy: Every question serves one of three purposes — gather information, verify intent, or check feasibility. Ask until clear enough to write spec, not one question more.**

Read the detailed clarification guide for question strategies:
```
Read file: references/clarify-guide.md
```

### 8 Dimensions (follows information dependency)

The flow is: `Why → Whom → What → Who → Done → How → What-if → Budget`
(External dependency resolution runs implicitly throughout all dimensions.
After Dim 8, a final systematic check ensures nothing was missed before generating the spec.)

| # | Dimension | Clarity Target |
|---|-----------|---------------|
| 1 | **Why Now** | Can state the trigger event and cost of inaction |
| 2 | **For Whom & Status Quo** | Can draw a specific user persona + describe their current solution and its pain points |
| 3 | **Goal, Scope & No-go's** | Can write the Overview + list all FRs + state what is explicitly out of scope |
| 4 | **Actors & Permissions** | Can draw the complete Actor table with permission boundaries |
| 5 | **Acceptance Criteria & Metrics** | Can write 3+ Given/When/Then + name 1 success metric |
| 6 | **Technical Constraints** | Can determine the tech choice for every layer (FE/BE/DB/Deploy) |
| 7 | **Risks: Edge Cases, Rabbit Holes & Pre-mortem** | Can identify top 3 risks + answer "if this fails, the most likely reason is..." |
| 8 | **Appetite** | Can answer "this is worth at most N days/weeks" (time budget, not estimate) |

### Clarification Rules

- **Each dimension: ask until its clarity target is met.**
- **No artificial round limits.** Clarity targets are the stopping condition, not a counter.
- Skip any dimension already answered by the user's initial request or codebase detection.
- In codebase mode, dimensions 6 (Tech) is often auto-answered by detection. Skip or confirm.
- Each AskUserQuestion contains ONE question (may have sub-bullets for clarity).
  Exception: when 2+ dimensions are equally unclear, combine into one multi-question ask.
- If the user says "you decide" or "just do it": make assumptions, tag as `[ASSUMED]`.
- If the user delegates a decision (e.g. "you recommend the tech stack"):
  present your recommendation with reasoning, wait for confirmation before proceeding.

### Adaptive Depth

Not every project needs all 8 dimensions at full depth:
- **Small feature in existing codebase:** Dimensions 1-2 can be light (1 question or skip). Focus on 3-7.
- **New product from scratch:** All 8 dimensions matter. Dimensions 1-2 are critical.
- **User says "just build it":** Ask ONE question max (pick the highest-risk blind spot), then proceed.

---

## PHASE 3 — SPEC (Structured Document)

**Gate: After generating spec, ask the user to review.**
Present a brief summary and ask: "Spec looks right? Any changes before running `/tasks` to decompose?"

Read the template for format and best practices:
```
Read file: references/spec-template.md
```

**Key rules:**
- In codebase mode: reference real file paths, existing models, actual API patterns
- In conversation mode: mark assumptions with `[ASSUMED]` tag
- External dependencies without evidence: mark with `[NEEDS_INVESTIGATION]`
- Every FR uses dual-layer format: natural language (human reads) + implementation spec (agent reads)
- Data Model uses the project's actual ORM syntax, not generic SQL
- Keep it concise — every line should be actionable

## Output

**In codebase mode:**
- Write `spec.md` to project root
- Summarize: "Spec is ready. Run `/tasks` to decompose into executable tasks."

**In conversation mode:**
- Output spec inline in the conversation
- Ask: "Want me to save as a file? If so, where?"

---

## Anti-Triggers (Do NOT activate for these)

- "Debug this code" / "Fix this bug"
- "Review this PR"
- User provides a complete, detailed spec and just wants implementation → suggest `/build`
- Pure refactoring requests with no new functionality
