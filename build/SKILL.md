---
name: build
version: 0.0.2
description: |
  Execute tasks from a plan-<feature-slug>.md file. Reads PART 3 (Tasks)
  sequentially, picks the next pending task, implements it, verifies, and
  moves to the next. Uses PART 1/2/4 as context. Use after /before-build
  has produced a plan-<slug>.md.
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

# Build — Execute Tasks from plan-<slug>.md

Implement PART 3 tasks, one by one, with verification. Use PART 1 (Spec),
PART 2 (Design), and PART 4 (Ambiguity Ledger) as context.

---

## PHASE 1 — LOCATE PLAN

1. Run `ls plan-*.md` in the project root to list candidate plans.
2. Resolve which plan to execute:
   - **Invoked with `/build <slug>`** → read `plan-<slug>.md`
   - **One plan exists** → use it automatically
   - **Multiple plans, no arg** → list filenames, ask the user which to run
   - **No plans found** → suggest: "Run `/before-build` first to generate a plan."
3. Read the chosen plan file fully. Parse:
   - PART 1 (Spec) and PART 2 (Design) — context for every task
   - PART 3 (Tasks) — the work queue
   - PART 4 (Ambiguity Ledger) — the checklist of surfaced assumptions
4. Verify plan is ready: `Status: locked` (PART 3 should exist). If
   `Status: draft`, stop and tell the user the plan needs to pass
   PHASE 7 checkpoint in `/before-build` first.

---

## PHASE 2 — CREATE TRACKING

Convert PART 3 tasks into TaskCreate items for progress tracking.
Set dependencies using TaskUpdate (addBlockedBy) per each task's
"Depends on" field.

Update the plan's metadata: `Status: locked` → `Status: in-progress`.

---

## PHASE 3 — EXECUTE

For each task in order:

1. **Start** — Mark task as `in_progress` via TaskUpdate
2. **Read context** — Read all files mentioned in the task's Context section;
   re-scan PART 1/2 entries referenced (FR-N, D-N, §X)
3. **Implement** — Write code following the task's Goal, Constraints, Output,
   and Assumptions
4. **Verify** — Run every command in the task's Verify section
5. **Fix** — If verify fails, diagnose and fix. Do not move on until verify passes.
6. **Complete** — Mark task as `completed` via TaskUpdate
7. **Next** — Pick the next unblocked pending task

### Rules

- **One task at a time.** Finish and verify before starting the next.
- **Follow the plan.** FR indented blocks (PART 1 §5) and D entries
  (PART 2 §12) are implementation instructions. Follow precisely.
- **Respect the File Map.** Don't create files outside PART 1 §8 without
  reason — if you must, surface it as a new PART 4 §D entry first.
- **No scope creep.** Don't add features, refactoring, or "improvements"
  beyond what the task specifies.
- **Interface contracts.** When a task declares an interface contract for
  downstream tasks, verify the contract is fulfilled before marking complete.
- **Blocked tasks.** If a task is blocked by an incomplete dependency,
  skip and come back.
- **Errors.** If a task fails and you can't fix it after 2 attempts, report
  to the user with diagnosis. Don't silently skip.
- **Late-detected ambiguity.** If during a task you hit a decision not
  covered by PART 1/2 and not listed in the task's Assumptions field,
  STOP — this is a PHASE 11 Late-detected item. Surface it, add to PART 4,
  get user confirmation, then resume.

### Per-Task Workflow

```
Read task → Read PART 1/2 references → Read task context files →
Implement → Build/compile check → Run verify commands → Mark complete
```

---

## PHASE 4 — SUMMARY

After all tasks are complete:

1. Run a final full build/compile check
2. Update plan metadata: `Status: in-progress` → `Status: complete`
3. Summarize what was implemented (reference FRs and tasks)
4. List any remaining verify steps that need manual testing
   (e.g., requires running server)
5. Suggest next steps (e.g., "Run `make start-dev` to test end-to-end")

---

## Anti-Triggers

- No `plan-*.md` in project → suggest `/before-build` first
- Plan exists but `Status: draft` → tell user to finish `/before-build`
  (PHASE 7 checkpoint not passed)
- User asks to plan or discuss requirements → suggest `/before-build`
- User asks to decompose a plan → `/before-build` already does this
