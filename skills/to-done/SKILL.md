---
name: to-done
version: 0.2.0
description: |
  Adaptive orchestration from intent to verified done. Use when the user asks
  for /to-done, to done, finish this, or do the current intent end to end.

  This command is not a shortcut around the workflow. It determines the current
  readiness stage, visibly routes through /explore, /grill-me, /to-spec,
  /clarify, /to-plan, or /run when needed, writes durable artifacts before
  implementation, verifies the result, and updates maps before claiming done.
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

# To Done - Adaptive Orchestration To Verified Done

`/to-done` is adaptive orchestration from intent to verified done.

It can handle clear small work directly, and it can handle complex work by
routing through the jkit stages required to make the work durable before
execution:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
                  \---------------------- /to-done ---------------------->/
```

Complexity is allowed. Unresolved ambiguity is not. Do not hide missing
requirements, untested assumptions, planning blockers, or verification gaps
inside a "done" shortcut.

## Core Rules

1. **Readiness first.** Classify the current stage before writing
   implementation code.
2. **Announce stage transitions.** When routing into `/explore`, `/grill-me`,
   `/to-spec`, `/clarify`, `/to-plan`, or `/run`, say which stage is needed
   and why.
3. **Complex work gets full artifacts.** Clear small work may use a minimal
   spec and minimal plan; complex work needs a full spec and full active
   ExecPlan sized to behavior, blast radius, and verification.
4. **Context can start the work, not finish it.** Final state must be
   recoverable from repository artifacts, not chat history.
5. **Use existing stage contracts.** When a prerequisite stage is needed,
   follow that stage's skill/spec behavior instead of reimplementing it inside
   `/to-done`.
6. **Use `/run` semantics.** Execution belongs to the Goal-Driven Execution
   loop in `skills/run/SKILL.md`, including its execution strategy decision for
   optional Codex `/goal` and subagents. Do not create a second execution loop.
7. **No risky shortcut.** Stop for unresolved safety, data, compatibility,
   package distribution, public workflow, production, external-live, or
   irreversible-operation questions.
8. **Verification decides done.** Failed, skipped, absent, or blocked
   verification means the work is not done.

## Supported Forms

```text
/to-done
/to-done <intent-or-brief>
/to-done <spec-slug>
/to-done <plan-slug>
```

First-class flows:

- `/to-done`: use current-session context as the input intent and run the
  readiness gate.
- `/to-done <intent-or-brief>`: use the supplied text as the primary intent and
  run the readiness gate.
- `/to-done <spec-slug>`: validate that the spec is plannable, create or update
  one matching active plan, then execute through `/run` semantics.
- `/to-done <plan-slug>`: delegate to `/run <plan-slug>`.

If multiple specs or plans plausibly match, ask which one to use.

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
docs/records/open-questions.md
skills/run/SKILL.md
```

If the repository has no agent map, stop and suggest `/map-init`.

If the worktree is dirty, proceed carefully. Do not overwrite unrelated user
changes. If target specs, plans, docs, package files, generated indexes, or
metadata are already modified, read them before editing and preserve the user's
changes.

## Phase 1 - Resolve Intent

Classify the input:

- current-session intent
- explicit intent or brief
- spec slug or spec path
- active plan slug or path

If the input is an active plan, announce:

```text
This is already an active plan, so /to-done is entering /run.
```

Then use `/run <plan-slug>` semantics. Do not wrap an existing active plan in a
new spec or plan.

If the input is a spec, validate that spec and continue to readiness
classification.

For current-session intent or an explicit brief, restate:

- goal
- current behavior
- desired behavior
- non-goals
- selected solution direction, if any
- acceptance criteria
- verification checks
- affected files, docs, skills, commands, package metadata, runtime surfaces,
  or public workflow surfaces

Also classify the request as one of:

- rough need or unselected solution direction
- selected but untested direction
- spec-ready behavior
- ambiguous existing spec
- plan-ready spec
- active-plan-ready work
- clear small request
- clear complex request

If you cannot restate the intent confidently, ask one concise question or enter
`/explore`.

## Phase 2 - Readiness Gate

Before implementation begins, the work must satisfy all of these:

- the requirement, solution direction, boundaries, acceptance criteria, and
  verification are represented in durable artifacts
- consequential design alternatives have been resolved or explicitly deferred
- implementation can follow existing project patterns
- no security, secret, permission, or sensitive-path ambiguity exists
- no data loss, migration, persistence, or destructive operation is required
- no production write or external live check is required without approval
- local verification is available, or a manual check is explicitly approved
- no blocking `[NEEDS_INVESTIGATION]` affects behavior, safety,
  compatibility, distribution, acceptance, or verification

Readiness routing:

- no agent map: stop and suggest `/map-init`
- rough need or unselected solution direction: enter `/explore`
- selected direction that has not been pressure-tested: enter `/grill-me`
- clear behavior with no durable spec: enter `/to-spec`
- existing spec with planning-blocking ambiguity: enter `/clarify <spec-slug>`
- plannable spec with no active plan: enter `/to-plan <spec-slug>`
- active plan ready for execution: enter `/run <plan-slug>`
- clear small request with no existing artifacts: create a minimal spec and
  minimal active plan, then enter `/run`
- clear complex request with no existing artifacts: create a full spec and full
  active plan, then enter `/run`

Record low-risk assumptions as `[ASSUMED]`. Record unresolved important facts as
`[NEEDS_INVESTIGATION]`.

Do not implement code while a readiness blocker remains.

## Phase 3 - Enter Required Prerequisite Stage

When a prerequisite stage is needed, visibly enter that stage and follow its
contract:

- `/explore`: discuss the need, compare solution directions, and return ready
  input for `/grill-me` or `/to-spec`.
- `/grill-me`: pressure-test the selected requirement and solution direction
  one question at a time, then return ready input for `/to-spec`.
- `/to-spec`: create or update the durable behavior spec.
- `/clarify`: resolve blocking ambiguity in one existing spec before planning.
- `/to-plan`: create or update the active ExecPlan.
- `/run`: execute the active plan through the Goal-Driven Execution loop,
  including `/run`'s execution strategy decision.

Use this transition shape:

```text
This can continue through /to-done, but <missing-context>. I am entering
/<stage> to <reason> before continuing.
```

Do not silently switch stages. If the next stage requires user input or
approval, ask or stop at that stage instead of pretending the work is ready.

## Phase 4 - Materialize Or Reuse A Spec

Use `agent-map.yaml` `docs.specs` when configured, otherwise `docs/specs`.

Search for an existing matching spec before creating a new one:

```bash
find docs/specs -maxdepth 1 -type f -name '*.md' | sort
```

Reuse an existing spec when it clearly covers the work. If no matching spec
exists:

- create a minimal spec for clear small work
- create a full spec for clear complex work

Every spec must include:

```md
# Spec: <name>

> Status: draft
> Product: <project or component>
> Scope: <short scope>

## 1. Summary
## 2. Goals
## 3. Non-goals
## 4. Behavior contract
## 5. Verification
## 6. Acceptance criteria
## 7. Assumptions and open questions
```

Rules:

- Update `docs/specs/index.md`.
- Do not mark the spec accepted unless the user explicitly accepts it or the
  repository has an approval convention.
- Do not hide requirements only in the plan or final response.
- Stop or route to `/clarify` if spec creation exposes consequential ambiguity.

## Phase 5 - Materialize Or Reuse An Active ExecPlan

Use `agent-map.yaml` `docs.plans` when configured, otherwise
`docs/exec-plans`.

Search active plans before creating one:

```bash
find docs/exec-plans/active -maxdepth 1 -type f -name '*.md' | sort
```

Reuse exactly one existing active plan when it references the selected spec or
clearly owns the same work. If multiple active plans match, ask which one to
use. If none match:

- create a minimal active ExecPlan for clear small work
- create a full active ExecPlan for clear complex work

Every plan must follow `docs/PLANS.md`:

```md
# Plan: <name>

## Goal
What this delivers.

## Context
- Source spec.
- Files and docs to read first.

## Non-goals
What this intentionally does not change.

## Design
Implementation shape and tradeoffs.

## Checklist
- [ ] Small, verifiable step.

## Verification
Commands or checks.

## Decisions
- YYYY-MM-DD: Decision and reason.

## Progress Log
- YYYY-MM-DD: What changed, what passed, what remains.

## Rollback
How to revert or disable the change.
```

Rules:

- Checklist items are the `/run` execution queue.
- Preserve completed checklist items when updating an existing plan.
- Avoid duplicate active plans for the same work.
- Stop or route to `/to-plan` if planning exposes unresolved implementation
  strategy.

## Phase 6 - Execute Through `/run` Semantics

After the active plan exists and is ready, read `skills/run/SKILL.md` and
follow its Goal-Driven Execution loop:

- let `/run` decide and record execution strategy before implementation
- treat Codex `/goal` and subagents as `/run` runtime choices, not
  `/to-done` shortcuts
- execute ready pending checklist items
- keep changes scoped to the spec and plan
- review the diff and behavior against the spec and plan
- fix in-scope review findings
- run focused and final verification
- rerun failed checks after in-scope fixes
- record exact blockers when verification cannot pass
- mark checklist items complete only after focused verification passes

Do not maintain a divergent execution loop in `/to-done`.

## Phase 7 - Verification Loop

Run the strongest local deterministic checks available, in this order when
applicable:

1. Focused checks for completed checklist items.
2. Automated tests named by the plan, spec, or project metadata.
3. Lint, type, static analysis, build, or smoke checks.
4. Project-specific checks from `agent-map.yaml`.
5. Map and documentation checks when docs or maps changed.
6. Generated context refresh when source layout, docs indexes, package layout,
   skills, or commands changed.
7. Package or distribution checks when package metadata, skills, commands,
   installer files, or plugin metadata changed.
8. Manual or external checks only when explicitly approved.

For this repository, common checks are:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
node bin/jkit.js status
./scripts/codex-plugin-check
npm pack --dry-run --json
```

If verification fails:

1. Fix in-scope failures and rerun affected checks.
2. If no meaningful progress remains, record the exact command, failure
   summary, suspected cause, and next step.
3. Add a record under `docs/records/verification-failures/` when the failure
   affects future agents.
4. Do not claim done.

## Phase 8 - Update Maps And Complete

Always update the active plan:

- checklist statuses
- Progress Log
- Decisions
- execution strategy selected by `/run`, if execution occurred
- readiness path chosen
- stage transitions, if any
- review result
- verification commands and results
- blockers, if any
- generated-index status
- whether specs, architecture/design docs, playbooks, records, and open
  questions needed updates

When relevant, update:

- specs
- `docs/WORKFLOW.md`
- architecture or design docs
- playbooks
- open questions
- verification failure records
- generated indexes
- package or plugin metadata
- `docs/QUALITY_SCORE.md`

If every checklist item is complete and final verification passed, move the
plan to `docs/exec-plans/completed/` when repository convention allows it.

## Phase 9 - Handoff

Final response must include:

- readiness path chosen
- workflow stage transitions, if any
- `/run` execution strategy used, if execution occurred
- spec created or reused
- plan created, reused, or completed
- checklist items completed
- review result
- verification commands and results
- map updates made
- records created, if any
- remaining blockers or open questions

## Stop Conditions

Stop before implementation when:

- no agent map exists
- the work cannot be restated from the session or brief
- completion or verification cannot be defined
- multiple specs or plans match and the user has not selected one
- a blocking `[NEEDS_INVESTIGATION]` affects delivery
- the required prerequisite stage needs user input or approval
- work is risky, destructive, production-facing, external-live, or irreversible
  without explicit approval

When stopping, explain the blocker briefly and suggest the smallest next action:
`/map-init`, `/explore`, `/grill-me`, `/to-spec`, `/clarify <spec-slug>`,
`/to-plan <spec-slug>`, or `/run <plan-slug>`.
