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
7. **Choose execution strategy deliberately.** Decide whether Codex `/goal` or
   subagents are useful before editing; default to single-agent execution.
8. **Primary agent owns completion.** Goal state and subagent output are inputs,
   not completion proof. The primary `/run` agent reviews, verifies, records,
   and hands off.
9. **Update maps before handoff.** Record progress, decisions, review findings,
   verification, failures, generated-index refreshes, and remaining work.

## Phase 0 - Orient

Run and read:

```bash
jkit update-check --quiet 2>/dev/null || true
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

## Phase 3 - Decide Execution Strategy

Before editing, choose an execution strategy from the plan shape, runtime
capabilities, task independence, risk level, and verification signals.

Strategy has two independent facets:

```text
goal tracking: none | Codex /goal
delegation: none | subagent review/investigation | subagent isolated implementation
```

Default:

```text
goal tracking: none
delegation: none
```

Use Codex `/goal` only when:

- the current runtime supports Codex `/goal`
- the active plan has a clear goal and verifiable milestones
- the work is long-running, has many checklist items, spans multiple sessions,
  or is likely to require continuation
- the active ExecPlan remains the durable source of truth for progress

Skip Codex `/goal` when:

- the runtime does not support it
- the run is narrow, small, or likely to complete in one session
- the plan is ambiguous or lacks verification
- goal state would become the only progress record

Use subagents for review or investigation when:

- independent files, docs, tests, or code areas need parallel inspection
- a bounded second-pass review would reduce risk before final verification
- the subagent can return findings without modifying files

Use subagents for isolated implementation only when:

- checklist items are independent and low-conflict
- file ownership is unlikely to overlap
- acceptance criteria and focused verification are clear
- each subagent can receive explicit scope, non-goals, and verification
- the primary `/run` agent can review and integrate the output before marking
  checklist items complete

Do not use subagents when:

- the work is safety-sensitive, destructive, external-live, migration-heavy, or
  secret-bearing
- the work is tightly coupled or likely to edit the same files
- the spec or plan has unresolved ambiguity that changes behavior, safety,
  data, compatibility, or irreversible operations
- verification is unclear or cannot be run by the primary `/run` agent
- delegation would obscure accountability for the final diff

Record the selected strategy in the active plan progress log before or during
execution:

```text
goal tracking: none | Codex /goal
delegation: none | subagent review/investigation | subagent isolated implementation
reason:
subagent scopes, if any:
review and verification approach:
fallback reason when a useful capability is unavailable:
```

## Phase 4 - Track The Goal Loop

Create task-tracking items for the selected run:

```text
1. choose and record execution strategy
2. implement ready pending checklist items
3. review diff and behavior against spec/plan
4. fix in-scope review findings
5. run verification
6. update maps and records
```

For long plans, include each pending checklist item as a task. Keep the task
list scoped to the selected plan unless the user explicitly expands scope.

Record the selected plan, goal, execution strategy, and whether the run is
full-plan or narrow in your working notes before editing.

## Phase 5 - Execute Pending Checklist Items

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
- If subagents are used, give each subagent a bounded prompt tied to one
  checklist item, review task, or investigation question.
- Integrate subagent outputs one at a time.
- Re-read files modified by subagents before relying on them.
- Treat subagent findings as inputs, not completion proof.

After each checklist item:

1. Run focused verification for that checklist item when available.
2. Review any subagent output involved in the item.
3. Mark the checklist item complete only if focused verification passed.
4. Leave it unchecked and record the blocker if verification failed or could
   not be run.

Continue to the next ready checklist item while meaningful progress is possible.

## Phase 6 - Review And Repair

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
- If subagents were used, did each output stay in scope, avoid conflicting
  edits, and receive primary-agent review?

For in-scope findings:

- fix the issue
- rerun focused checks affected by the fix
- update the plan progress log

For out-of-scope findings:

- record them as open questions, tech debt, or follow-up plan items
- do not let them silently expand the current run

## Phase 7 - Verification Loop

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
./scripts/codex-plugin-check
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

## Phase 8 - Update Maps

Always update the active plan:

- execution strategy selected for this run
- Codex `/goal` usage, if any
- subagent scopes and outcomes, if any
- checklist statuses
- progress log
- decisions
- review findings
- verification results
- blockers, if any

Each progress log entry for a run must include:

- selected execution strategy and reason
- whether Codex `/goal` was used, skipped, or unavailable
- whether subagents were used, skipped, or unavailable
- subagent scopes and reviewed outputs, when used
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

## Phase 9 - Completion Protocol

Before final response, answer these internally:

```text
Did implementation stay within the selected plan and referenced specs?
Was the execution strategy chosen and recorded?
If Codex /goal was used, did the active ExecPlan remain the durable source of
truth?
If subagents were used, were their scopes bounded and their outputs reviewed by
the primary /run agent?
Were all ready pending checklist items executed?
Were checklist items marked complete only after focused verification passed?
Was the resulting diff reviewed?
Were in-scope review findings fixed?
Did required verification pass?
Were failures recorded exactly?
Were maps updated for changed behavior or workflow?
Were generated indexes refreshed when needed?
Did the active plan progress log include execution strategy, checklist status,
verification commands and results, failures or exceptions, doc-update
decisions, generated index status, and new open questions?
```

If any answer is no, record why in the plan or records before handing off.

## Final Response

Summarize:

- plan and goal executed
- execution strategy used
- Codex `/goal` or subagent usage, if any
- checklist items completed
- files changed
- review result
- verification commands and results
- map updates made
- remaining checklist items or blockers
