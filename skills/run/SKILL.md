---
name: run
version: 0.2.0
description: |
  Execute the selected active ExecPlan as a Goal-Driven Execution loop:
  implement all ready pending plan work, review the result, fix issues, run
  verification, update maps, and continue until the goal is genuinely
  achieved or a concrete blocker is recorded.

  Use when the user asks for /run, run the plan, execute the plan, continue the
  active plan, finish the goal, drive the goal loop, or implement from an
  ExecPlan. This is not a generic shell executor and not a one-item helper.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - TaskCreate
  - TaskUpdate
  - TaskList
---

# Run - Goal-Driven Execution Loop

`/run` drives an active ExecPlan to verified completion. It is the execution
stage in the jkit v2 flow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

Do not treat `/run` as "run arbitrary commands" or "do the next checklist
item." The job is to follow the referenced spec and plan, complete all ready
pending work, review and repair the result, run verification, update the
maps, and keep looping until the goal is achieved or a concrete blocker is
recorded.

## Core Rules

1. **Goal loop by default.** Execute all ready pending checklist items in the
   selected active plan unless the user explicitly requests a narrow item.
2. **Read the map first.** Use `AGENTS.md`, `agent-map.yaml`,
   `docs/WORKFLOW.md`, `docs/PLANS.md`, and `docs/specs/index.md` before
   implementation.
3. **Follow the spec and plan.** The selected ExecPlan and referenced specs are
   the source of truth.
4. **No silent late decisions.** Stop or ask when a missing decision affects
   behavior, security, data, external services, compatibility, public workflow,
   or irreversible operations.
5. **Review before final verification.** Inspect the diff and behavior; fix
   in-scope findings before claiming completion.
6. **Verification or blocker.** Run the strongest local deterministic checks
   available. If they fail, fix and rerun while meaningful progress is possible.
7. **Update maps before handoff.** Record progress, decisions, review findings,
   verification, failures, generated-index refreshes, and remaining work.

## Phase 0 - Orient

Run and read:

```bash
pwd
git status --short
```

Read, when present:

```text
AGENTS.md
agent-map.yaml
docs/WORKFLOW.md
docs/PLANS.md
docs/specs/index.md
```

If the repository has no agent map, stop and suggest `/map-init`.

If the worktree is dirty, proceed carefully. Do not touch unrelated user
changes. If existing plan, spec, or map files are modified, read them before
deciding how to update them.

## Phase 1 - Resolve Active Plan

Find active plans:

```bash
find docs/exec-plans/active -maxdepth 1 -type f -name '*.md' | sort
```

Selection rules:

- If user supplied a plan path, read it.
- If user supplied a slug, match it against active plan filenames.
- If one active plan exists, use it.
- If multiple active plans exist, ask which one to run unless the immediate
  conversation clearly identifies a plan.
- If none exist, stop and suggest `/to-plan`.

Read the selected plan completely. Read specs and docs referenced in its
header, Context, Design, Checklist, Verification, Decisions, or Rollback
sections.

## Phase 2 - Resolve Goal And Work Queue

Extract from the plan:

- goal
- referenced specs
- non-goals
- design constraints
- pending checklist items
- dependency order
- acceptance criteria
- verification commands
- rollback constraints

Default work queue:

```text
all unchecked checklist items whose dependencies are complete
```

If the user explicitly requested a narrow run, such as
`/run --item <name>`, select only that checklist item and record that the run is
intentionally narrow.

Stop before editing when:

- the plan has no verifiable goal
- dependencies are incomplete
- required spec context is missing
- the requested work would require destructive or external-live action not
  approved by the user
- multiple active plans match and the user has not selected one

If a checklist item is ambiguous but safe to narrow, ask one concise question
or record `[NEEDS_INVESTIGATION]` in the plan.

## Phase 3 - Track The Goal Loop

Create task-tracking items for the selected run:

```text
1. implement ready pending checklist items
2. review diff and behavior against spec/plan
3. fix in-scope review findings
4. run verification
5. update maps and records
```

For long plans, include each pending checklist item as a task. Keep the task
list scoped to the selected plan unless the user explicitly expands scope.

Record the selected plan, goal, and whether the run is full-plan or narrow in
your working notes before editing.

## Phase 4 - Execute Pending Checklist Items

Implement pending checklist items in dependency order.

Rules:

- Prefer existing project patterns.
- Keep changes scoped to the selected plan and referenced specs.
- Do not refactor unrelated code.
- Do not introduce new commands or dependencies unless the plan requires them.
- Do not edit generated files unless generation is unavailable or the plan says
  to edit them directly.
- If a new decision appears, resolve it through evidence, user confirmation, or
  an explicit `[NEEDS_INVESTIGATION]` entry before continuing.

After each checklist item:

1. Run focused verification for that checklist item when available.
2. Mark the checklist item complete only if focused verification passed.
3. Leave it unchecked and record the blocker if verification failed or could
   not be run.

Continue to the next ready checklist item while meaningful progress is possible.

## Phase 5 - Review And Repair

After implementing the ready work queue, review before final verification:

```bash
git status --short
git diff --stat
```

Inspect changed files and check:

- Does the work satisfy the plan goal?
- Does it match referenced specs and acceptance criteria?
- Did the implementation stay inside non-goals and scope?
- Were generated files refreshed instead of hand-edited when appropriate?
- Are docs, records, and indexes aligned with changed behavior?
- Are there obvious regressions, missing checks, or stale references?

For in-scope findings:

- fix the issue
- rerun focused checks affected by the fix
- update the plan progress log

For out-of-scope findings:

- record them as open questions, tech debt, or follow-up plan items
- do not let them silently expand the current run

## Phase 6 - Verification Loop

Run verification in this order:

1. Focused checks named by completed checklist items.
2. Automated tests named by the active plan, referenced specs, or project
   metadata.
3. Lint, type, static analysis, build, or smoke checks named by the project.
4. Project-specific checks from `agent-map.yaml` when relevant.
5. Map and documentation checks when docs or maps changed.
6. Generated context refresh when source layout, docs indexes, or package
   layout changed.
7. Package/distribution checks when package metadata, skills, commands, or
   installer files changed.
8. Manual or external checks only when explicitly approved.

For this repository, common checks are:

```bash
./scripts/agent-map-check
./scripts/agent-map-generate
node bin/jkit.js status
npm pack --dry-run
```

Verification loop:

```text
run verification checks
if checks pass: update maps and hand off
if checks fail and fix is in scope: fix, then rerun affected checks
if checks fail and no meaningful progress remains: record blocker
```

Do not treat file-existence checks as enough when stronger project checks are
available. Do not run external live checks unless explicitly approved.

## Phase 7 - Update Maps

Always update the active plan:

- checklist statuses
- progress log
- decisions
- review findings
- verification results
- blockers, if any

Each progress log entry for a run must include:

- checklist items completed in this run
- current status of each touched checklist item
- verification commands executed and their results
- failures, blockers, or workflow exceptions recorded
- whether specs needed updates
- whether architecture or design docs needed updates
- whether playbooks needed updates
- whether generated indexes were refreshed or intentionally skipped
- whether new open questions appeared

If verification failed:

1. Create a record under `docs/records/verification-failures/`.
2. Include date, command, short failure summary, suspected cause, and next step.
3. Do not mark unverified checklist items complete.

When relevant:

- update specs for behavior changes
- update architecture docs for structural changes
- update design docs for architecture changes
- update playbooks for repeated workflows
- update `docs/QUALITY_SCORE.md` for harness quality changes
- run generated-index refresh

If work happened outside the expected flow, add a record under
`docs/records/workflow-exceptions/`.

If every checklist item is complete and final verification passed, either move
the plan to `docs/exec-plans/completed/` when repository convention allows it
or record that it is ready to complete.

## Phase 8 - Completion Protocol

Before final response, answer these internally:

```text
Did implementation stay within the selected plan and referenced specs?
Were all ready pending checklist items executed?
Were checklist items marked complete only after focused verification passed?
Was the resulting diff reviewed?
Were in-scope review findings fixed?
Did required verification pass?
Were failures recorded exactly?
Were maps updated for changed behavior or workflow?
Were generated indexes refreshed when needed?
Did the active plan progress log include checklist status, verification
commands and results, failures or exceptions, doc-update decisions, generated
index status, and new open questions?
```

If any answer is no, record why in the plan or records before handing off.

## Final Response

Summarize:

- plan and goal executed
- checklist items completed
- files changed
- review result
- verification commands and results
- map updates made
- remaining checklist items or blockers
