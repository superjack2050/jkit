---
name: to-done
version: 0.1.0
description: |
  Fast-path clear, bounded work to verified completion. Use when the user asks
  for /to-done, to done, finish this clear request, or do the already-discussed
  work end to end.

  This is an orchestration command, not a shortcut around the workflow. It may
  start from clear current-session context or a simple one/two sentence brief,
  but it must materialize a minimal spec and active ExecPlan before
  implementation, delegate execution semantics to /run, verify the result, and
  update maps before claiming done.
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

# To Done - Fast Path To Verified Done

`/to-done` is the fast-path orchestration stage in the jkit v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
                                               \-> /to-done ->/
```

It is allowed only when the request is already clear from the current session
or simple enough to explain in one or two sentences. The fast path still writes
durable artifacts:

```text
/to-done = minimal /to-spec -> minimal /to-plan -> /run
```

Do not skip specs, plans, review, verification, records, or generated indexes.
Do not claim done until the work is reviewed, repaired when needed, verified,
recorded, and the plan is completed or left with an exact blocker.

## Core Rules

1. **Fast path is earned.** Proceed only when the work is clear, bounded,
   locally verifiable, and low risk.
2. **Context can start the work, not finish it.** Current-session clarity may
   justify `/to-done`, but final state must be recoverable from repo artifacts.
3. **Durable artifacts first.** Write or reuse a minimal spec, then write or
   reuse a minimal active ExecPlan, before implementation begins.
4. **Use `/run` semantics.** Once the active plan exists, follow
   `skills/run/SKILL.md`; do not create a second execution loop.
5. **Fallback instead of forcing.** Unclear behavior falls back to `/to-spec`;
   unresolved implementation strategy falls back to `/to-plan`; an existing
   active plan falls back to `/run`.
6. **No risky fast path.** Stop for unresolved safety, data, compatibility,
   package distribution, public workflow, production, external-live, or
   irreversible-operation questions.
7. **Verification decides done.** Failed, skipped, absent, or blocked
   verification means the work is not done.
8. **Update maps before handoff.** Record checklist status, progress, review,
   verification, failures, generated-index status, and remaining questions.

## Supported Forms

```text
/to-done
/to-done <brief>
/to-done <spec-slug>
/to-done <plan-slug>
```

First-class flows:

- `/to-done`: use current-session context only when the requirement, solution
  direction, boundaries, acceptance criteria, and verification are clear.
- `/to-done <brief>`: use the brief only when one or two sentences define the
  desired change and completion signal.
- `/to-done <spec-slug>`: validate that the spec is plannable, create or update
  one active plan, then execute it through `/run` semantics.
- `/to-done <plan-slug>`: delegate to `/run <plan-slug>`.

If multiple specs or plans plausibly match, ask which one to use.

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
docs/records/open-questions.md
skills/run/SKILL.md
```

If the repository has no agent map, stop and suggest `/map-init`.

If the worktree is dirty, proceed carefully. Do not overwrite unrelated user
changes. If target specs, plans, docs, package files, or generated indexes are
already modified, read them before editing and preserve the user's changes.

## Phase 1 - Resolve Input

Classify the request:

- current-session context
- one/two sentence brief
- spec slug or spec path
- active plan slug or path

If the input is an active plan, stop orchestration and use `/run <plan-slug>`.
Do not wrap an existing active plan in a new spec or plan.

If the input is a spec, validate that spec and continue to planning.

If the input is current-session context or a brief, restate:

- goal
- current behavior
- desired behavior
- non-goals
- implementation direction
- acceptance criteria
- verification checks
- affected files, docs, skills, commands, package metadata, or runtime surfaces

If you cannot restate those facts confidently, ask one concise question or stop
and suggest `/to-spec`.

## Phase 2 - Eligibility Gate

Proceed only when one of these is true:

- The current session already established the requirement, solution direction,
  boundaries, acceptance criteria, and verification.
- The user supplied a one/two sentence brief that clearly says what to change
  and how completion will be judged.
- The user supplied a plannable spec.
- The user supplied an existing active plan, in which case delegate to `/run`.

The work must also satisfy all of these:

- scope is small enough for one short ExecPlan
- implementation can follow existing project patterns
- no major design alternative needs selection
- no security, secret, permission, or sensitive-path ambiguity exists
- no data loss, migration, persistence, or destructive operation is required
- no production write or external live check is required without approval
- local verification is available, or a manual check is explicitly approved
- no blocking `[NEEDS_INVESTIGATION]` affects behavior, safety,
  compatibility, distribution, acceptance, or verification

Record low-risk assumptions as `[ASSUMED]`. Record unresolved important facts as
`[NEEDS_INVESTIGATION]`.

Fallback rules:

- behavior unclear: stop and suggest `/to-spec`
- spec exists but has blocking open questions: stop and suggest
  `/clarify <spec-slug>`
- implementation strategy unresolved: stop and suggest `/to-plan <spec-slug>`
- existing active plan found: use `/run <plan-slug>`
- verification cannot be defined: stop and suggest `/to-spec`

Do not implement code while an eligibility failure remains.

## Phase 3 - Materialize Or Reuse A Minimal Spec

Use `agent-map.yaml` `docs.specs` when configured, otherwise `docs/specs`.

Search for an existing matching spec before creating a new one:

```bash
find docs/specs -maxdepth 1 -type f -name '*.md' | sort
```

Reuse an existing spec when it clearly covers the work. If no matching spec
exists, create a minimal spec under the configured specs directory.

The minimal spec must include:

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
- Stop if spec creation exposes a consequential ambiguity.

## Phase 4 - Materialize Or Reuse A Minimal Active ExecPlan

Use `agent-map.yaml` `docs.plans` when configured, otherwise
`docs/exec-plans`.

Search active plans before creating one:

```bash
find docs/exec-plans/active -maxdepth 1 -type f -name '*.md' | sort
```

Reuse exactly one existing active plan when it references the selected spec or
clearly owns the same work. If multiple active plans match, ask which one to
use. If none match, create a minimal active ExecPlan.

The minimal plan must follow `docs/PLANS.md`:

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
- Stop if planning exposes an unresolved implementation strategy.

## Phase 5 - Execute Through `/run` Semantics

After the active plan exists, read `skills/run/SKILL.md` and follow its
Goal-Driven Execution loop:

- execute ready pending checklist items
- keep changes scoped to the spec and plan
- review the diff and behavior against the spec and plan
- fix in-scope review findings
- run focused and final verification
- rerun failed checks after in-scope fixes
- record exact blockers when verification cannot pass
- mark checklist items complete only after focused verification passes

Do not maintain a divergent execution loop in `/to-done`.

## Phase 6 - Verification Loop

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
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
```

If verification fails:

1. Fix in-scope failures and rerun affected checks.
2. If no meaningful progress remains, record the exact command, failure
   summary, suspected cause, and next step.
3. Add a record under `docs/records/verification-failures/` when the failure
   affects future agents.
4. Do not claim done.

## Phase 7 - Update Maps And Complete

Always update the active plan:

- checklist statuses
- Progress Log
- Decisions
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

## Phase 8 - Handoff

Final response must include:

- whether fast-path eligibility passed
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
- behavior is unclear
- completion or verification cannot be defined
- multiple specs or plans match and the user has not selected one
- a blocking `[NEEDS_INVESTIGATION]` affects delivery
- implementation strategy needs real planning
- work is broad, risky, destructive, production-facing, external-live, or
  irreversible without explicit approval

When stopping, explain the blocker briefly and suggest the smallest next action:
`/to-spec`, `/clarify <spec-slug>`, `/to-plan <spec-slug>`, or
`/run <plan-slug>`.
