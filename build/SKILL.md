---
name: build
version: 1.0.0
description: |
  Execute tasks from tasks.md sequentially. Reads the task list, picks the next
  pending task, implements it, verifies, and moves to the next.
  Use after /dig and /tasks have produced spec.md and tasks.md.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - WebFetch
  - WebSearch
  - TaskCreate
  - TaskUpdate
  - TaskList
---

# Build — Execute Tasks

Implement tasks from tasks.md, one by one, with verification.

---

## PHASE 1 — LOCATE TASKS

1. Check if `tasks.md` exists in the project root. If yes, read it.
2. If not found, ask the user: "Where is your task file? Provide a file path."
3. If no task file exists at all, suggest: "Run `/dig` then `/tasks` first."
4. Read `spec.md` as reference context.

---

## PHASE 2 — CREATE TRACKING

Convert tasks from tasks.md into TaskCreate items for progress tracking.
Set dependencies using TaskUpdate (addBlockedBy).

---

## PHASE 3 — EXECUTE

For each task in order:

1. **Start** — Mark task as `in_progress` via TaskUpdate
2. **Read context** — Read all files mentioned in the task's Context section
3. **Implement** — Write code following the task's Goal, Constraints, and Output
4. **Verify** — Run every command in the task's Verify section
5. **Fix** — If verify fails, diagnose and fix. Do not move on until verify passes.
6. **Complete** — Mark task as `completed` via TaskUpdate
7. **Next** — Pick the next unblocked pending task

### Rules

- **One task at a time.** Finish and verify before starting the next.
- **Follow the spec.** FR indented blocks are implementation instructions. Follow precisely.
- **Respect file map.** Don't create files outside the spec's File Map without reason.
- **No scope creep.** Don't add features, refactoring, or "improvements" beyond what the task specifies.
- **Interface contracts.** When a task declares an interface contract for downstream tasks, verify the contract is fulfilled before marking complete.
- **Blocked tasks.** If a task is blocked by an incomplete dependency, skip and come back.
- **Errors.** If a task fails and you can't fix it after 2 attempts, report to the user with diagnosis. Don't silently skip.

### Per-Task Workflow

```
Read task → Read referenced files → Implement → Build/compile check → Run verify commands → Mark complete
```

---

## PHASE 4 — SUMMARY

After all tasks are complete:

1. Run a final full build/compile check
2. Summarize what was implemented
3. List any remaining verify steps that need manual testing (e.g., requires running server)
4. Suggest next steps (e.g., "Run `make start-dev` to test end-to-end")

---

## Anti-Triggers

- No tasks.md and no spec.md → suggest `/dig` first
- User asks to plan or discuss requirements → suggest `/dig`
- User asks to decompose a spec → suggest `/tasks`
