---
name: to-plan
version: 0.1.0
description: |
  Convert a reviewable or plannable repository spec into an active ExecPlan.
  Use when the user asks for /to-plan, to plan, write a plan from a spec,
  create an ExecPlan, update an active plan, or prepare work for /run.

  This is not a spec-writing or implementation command. It reads the
  repository agent map, validates that the selected spec is plannable, creates
  or updates exactly one active ExecPlan by default, writes a dependency-ordered
  Checklist and Verification Loop, updates maps, and leaves /run as the usual
  next step.
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

# To Plan - Turn A Spec Into An Executable ExecPlan

`/to-plan` is the planning stage in the jkit v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

The job is to translate a spec's behavior contract into an active ExecPlan that
`/run` can execute without chat history. Do not implement code, rewrite product
requirements, or silently work around blocking unknowns.

## Core Rules

1. **Plan from a spec.** Resolve one source spec first; do not plan from loose
   chat intent when the behavior is not captured in `docs/specs/`.
2. **One active plan by default.** Create or update exactly one active ExecPlan
   unless the user explicitly asks for multiple linked plans.
3. **Read the map first.** Use `AGENTS.md`, `agent-map.yaml`,
   `docs/WORKFLOW.md`, `docs/PLANS.md`, and `docs/specs/index.md` before
   writing.
4. **Validate plannability.** A spec needs clear scope, goals, non-goals,
   acceptance criteria, verification signals, and no blocking open questions.
5. **Do not invent decisions.** Stop or ask when a missing decision changes
   behavior, safety, data, compatibility, external services, distribution, or
   verification.
6. **Checklist is the run queue.** Write small, dependency-ordered, verifiable
   `## Checklist` items that `/run` can mark complete only after checks pass.
7. **Preserve completed work.** When updating an existing plan, keep completed
   checklist items and progress log entries unless the user explicitly asks to
   replan them.
8. **Update maps before handoff.** Keep open questions, generated indexes, and
   final status aligned.

## Supported Forms

```text
/to-plan
/to-plan <spec-slug>
/to-plan <spec-file>
/to-plan --from <spec-slug>
/to-plan --update <plan-slug>
```

First-class flows:

- `/to-plan <spec-slug>`: create or update the active plan for that spec.
- `/to-plan <spec-file>`: create or update the active plan for that spec file.
- `/to-plan --from <spec-slug>`: explicit form of planning from a spec.
- `/to-plan --update <plan-slug>`: update only the named active plan and its
  referenced spec.

Use `/to-plan` with no argument only when one recent or obvious plannable spec
exists. If multiple candidates exist, ask which spec to plan.

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
```

If the repository has no agent map, stop and suggest `/map-init`.

If the worktree is dirty, proceed carefully. Do not overwrite unrelated user
changes. If the target spec, active plan, or map files are already modified,
read them before editing and preserve the user's changes.

## Phase 1 - Resolve Specs And Plans Directories

Use `agent-map.yaml` when available:

- `docs.specs` for specs
- `docs.plans` for ExecPlans
- `docs.records` for records

Fallbacks:

```text
docs/specs
docs/exec-plans
docs/records
```

New plans go under:

```text
docs/exec-plans/active
```

Do not move, rename, archive, or delete existing specs or plans unless the user
explicitly asks.

## Phase 2 - Resolve The Source Spec

Selection rules:

- If the user provided a spec path, use that spec.
- If the user provided a spec slug, match it in the configured specs directory.
- If `--from <spec-slug>` was provided, resolve that spec only.
- If `--update <plan-slug>` was provided, read the named active plan and use
  its referenced spec.
- If no spec was supplied and exactly one obvious recent plannable spec exists,
  use it.
- If multiple specs plausibly match, ask which one to plan.
- If no spec exists for the requested behavior, stop and suggest `/to-spec`.

Read the selected spec completely. Extract:

- status
- summary and scope
- goals
- non-goals
- behavior or command contract
- required phases
- safety, data, compatibility, and distribution constraints
- acceptance criteria
- verification signals
- assumptions and open questions

Draft specs are allowed when they are plannable. Accepted specs are preferred
when the project has an approval convention.

## Phase 3 - Validate Plannability

A spec is plannable when it has:

- a clear behavior or command scope
- goals
- non-goals
- acceptance criteria
- verification signals
- enough implementation boundary to choose affected surfaces
- no blocking open questions for delivery shape

Blocking questions include missing decisions that affect:

- user-visible behavior
- command names or public workflow contracts
- security, secrets, permissions, or sensitive paths
- data model, data loss, migrations, or persistence
- package distribution, install behavior, or compatibility
- external services, network calls, production systems, or live checks
- acceptance criteria or required verification

Not every `[NEEDS_INVESTIGATION]` blocks planning. Treat it as non-blocking
only when the spec or repository already defines a safe default or non-goal
that keeps implementation scope clear. Record that reasoning in the plan
Decisions section.

If a blocking question remains:

1. Do not create a new active plan.
2. Record the blocker in the spec or `docs/records/open-questions.md`.
3. Tell the user the smallest next action, usually `/clarify <spec-slug>`.

## Phase 4 - Resolve The Target Plan

Search active plans before creating a new one:

```bash
find docs/exec-plans/active -maxdepth 1 -type f -name '*.md' | sort
```

Use the configured plans directory if it is not `docs/exec-plans`.

Selection rules:

- If `--update <plan-slug>` was provided, update only that active plan.
- If one active plan references the selected spec, update it.
- If multiple active plans reference the selected spec, ask which one to update.
- If no active plan references the spec, create a new active plan with a slug
  derived from the spec.

Avoid duplicate active plans for the same deliverable. Do not overwrite or move
completed plans.

## Phase 5 - Design The Plan

Translate the spec into implementation context:

- files, docs, skills, commands, scripts, package metadata, or runtime surfaces
  likely affected
- existing patterns to follow
- compatibility constraints
- distribution and install concerns
- docs, records, and generated indexes that may need updates
- rollout, rollback, or disablement path
- tradeoffs that future agents need to understand

The plan Goal should derive from the spec. The spec remains the source of truth
for what behavior should exist; the plan owns how that behavior will be
delivered and verified.

Do not choose implementation details that need user approval when the spec does
not authorize them. Record those as open questions and stop when they are
blocking.

## Phase 6 - Build The Checklist

Checklist items must be:

- scoped to the selected spec
- dependency-ordered
- small enough for focused verification
- written as observable delivery steps
- connected to the Verification section
- free of unrelated refactors or opportunistic cleanup

Use `- [ ]` for pending items. Preserve existing `- [x]` items when updating an
active plan unless the user explicitly asks to replan completed work.

Prefer grouped checklist sections when they make the run queue easier to scan:

```md
## Checklist

Spec and plan foundation:

- [x] Existing completed setup.

Implementation:

- [ ] Small, verifiable step.

Verification:

- [ ] Run focused and package checks.
```

## Phase 7 - Define The Verification Loop

The plan's Verification section must name the strongest practical checks for
the work. Tests are one type of verification, not the whole loop.

Use this order when applicable:

1. Focused checks for each checklist item.
2. Automated tests named by the spec or project metadata.
3. Lint, type, static analysis, build, or smoke checks.
4. Project-specific map checks from `agent-map.yaml`.
5. Documentation and generated index checks.
6. Package or distribution checks for skills, commands, installer, or metadata
   changes.
7. Manual or external checks only when explicitly approved.

For this repository, common checks are:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
```

If a check cannot be run during planning, list it in the plan and explain when
`/run` should run it.

## Phase 8 - Write Or Update The ExecPlan

New plans must follow `docs/PLANS.md`:

```md
# Plan: <name>

## Goal
What user-visible, operational, or harness outcome this plan delivers.

## Context
- Files and docs to read first.
- Existing behavior and constraints.

## Non-goals
What this plan intentionally does not change.

## Design
Architecture, interfaces, rollout shape, and tradeoffs.

## Checklist
- [ ] Small, verifiable step.

## Verification
Commands, smoke checks, fixtures, dashboards, or manual checks.

## Decisions
- YYYY-MM-DD: Decision and reason.

## Progress Log
- YYYY-MM-DD: What changed, what passed, what remains.

## Rollback
How to revert or disable the change.
```

When updating an existing plan:

- preserve completed checklist items
- preserve prior progress log entries
- add new checklist items instead of rewriting history
- add decisions for new assumptions or tradeoffs
- keep the rollback path current

## Phase 9 - Update Maps

Always update:

- the selected active plan

Update when relevant:

- `docs/specs/index.md` if spec index drift is discovered
- `docs/records/open-questions.md` for project-level unresolved questions
- `docs/WORKFLOW.md` when the standard workflow changes
- `docs/PLANS.md` when the required plan shape changes
- `agent-map.yaml` when command routing or update rules change
- `docs/generated/repo-map.md` by running `./scripts/agent-map-generate` when
  source layout, docs indexes, package layout, skills, or commands changed

Do not update implementation docs, architecture docs, or playbooks just because
a plan mentions possible future changes. Update those only when the planning
artifact changes durable workflow behavior.

## Phase 10 - Verify Planning Work

For docs-only planning changes, run:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

If command, skill, installer, package, or plugin files changed while planning,
also run the relevant package checks from `agent-map.yaml`, commonly:

```bash
node bin/jkit.js status
npm pack --dry-run
```

If verification fails:

1. Record the exact command and a short summary.
2. Add a record under `docs/records/verification-failures/` when the failure
   affects future agents.
3. Do not claim the plan is ready without naming the blocker.

Do not run destructive commands, production writes, or external live checks.

## Phase 11 - Handoff

The `/to-plan` handoff means:

```text
plan is ready for execution
```

Final response must be short, structured, and recoverable:

Artifact:

- source spec
- active plan created or updated
- map updates made

Readiness:

- whether the spec was plannable
- high-level checklist shape
- verification loop summary
- remaining open questions or blockers

Next command:

- next recommended command, usually `/run <plan-slug>`

## Stop Conditions

Stop before writing when:

- no agent map exists
- no source spec can be resolved
- multiple candidate specs or plans match and no user selection was provided
- the spec lacks goals, non-goals, acceptance criteria, or verification signals
- a blocking `[NEEDS_INVESTIGATION]` affects delivery shape
- the requested plan would duplicate an existing active plan
- the work would require destructive or external-live action
- the user is asking for implementation rather than planning

When stopping, explain the blocker briefly and suggest the smallest next action.
