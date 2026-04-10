---
name: tasks
version: 1.0.0
description: |
  Decompose a spec into independently executable atomic tasks.
  Reads spec.md (or user-provided spec), breaks it into ordered tasks with
  dependencies, interface contracts, and verify steps.
  Use after /dig has produced a spec, or when the user has a spec ready.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - Agent
---

# Tasks — Decompose Spec into Executable Tasks

Turn a spec into atomic, ordered tasks ready for `/build`.

---

## PHASE 1 — LOCATE SPEC

1. Check if `spec.md` exists in the project root. If yes, read it.
2. If not found, ask the user: "Where is your spec? Provide a file path or paste it."
3. Validate the spec has at least: FRs, Data & State, and Acceptance Criteria.
   If missing critical sections, suggest running `/dig` first.

---

## PHASE 2 — DECOMPOSE

Read the task template for format and best practices:
```
Read file: references/task-template.md
```

**Decomposition Rules:**

### Sizing
- Each task = one Claude Code session (roughly 10-30 minutes of focused work)
- If a task has more than 5 output files, split it
- If a task spans more than 2 layers (e.g., DB + API + UI), split it

### Ordering (layer by layer)
- **Layer 0:** Schema migrations, data models, types/interfaces
- **Layer 1:** Core business logic, service functions
- **Layer 2:** API routes, controllers, handlers
- **Layer 3:** UI components, pages
- **Layer 4:** Integration tests, E2E tests
- **Layer 5:** Configuration, deployment, docs

### Interface Contracts
- Every task that has dependents MUST declare an interface contract
- The contract lists: exported functions, DB tables created, API endpoints available
- Downstream tasks reference the contract, not the implementation details
- This is what makes tasks independently executable by separate agent sessions

### Dependencies
- Minimize cross-task dependencies
- If Task B depends on Task A, state it explicitly
- Prefer tasks that can run in parallel when possible

### Investigation Task
- If spec contains `[NEEDS_INVESTIGATION]` items, generate a Task 0: Investigation
  before any development tasks. This task's output feeds into subsequent tasks.

### Context Quality
- In codebase mode: include file paths, function signatures, import patterns
- Reference the spec's FR and AC IDs — don't repeat the full text
- Verify step includes runnable commands, not just descriptions

---

## PHASE 3 — OUTPUT

**In codebase mode:**
- Write `tasks.md` to project root
- Summarize: task count, dependency graph, estimated sessions
- Tell the user: "Tasks are ready. Run `/build` to start implementing."

**In conversation mode:**
- Output tasks inline
- Ask: "Want me to save as a file?"

---

## Anti-Triggers

- No spec exists and user hasn't described requirements → suggest `/dig` first
- User asks to implement code → suggest `/build`
