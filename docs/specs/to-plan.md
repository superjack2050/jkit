# Spec: to-plan

> Status: draft
> Product: jkit v2
> Scope: convert reviewable specs into executable ExecPlans

## 1. Summary

`/to-plan` turns an accepted or plannable spec into a durable ExecPlan under the
repository's configured active plans directory.

It is the planning stage in the jkit v2 workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
```

`/to-plan` is not a spec-writing command and not an implementation command. Its
job is to translate a behavior contract into a dependency-ordered checklist,
verification loop, progress log structure, and rollback path that `/run` can
execute to completion.

## 2. Background

jkit v2 separates durable work into three different artifacts:

- Specs own the user-visible behavior, acceptance criteria, constraints,
  non-goals, and open questions.
- ExecPlans own the delivery goal, implementation design, checklist,
  verification loop, decisions, progress log, and rollback plan.
- Records own exceptions, failures, unresolved project questions, and facts
  that future agents must not guess.

`/to-spec` already defines how unclear behavior becomes a reviewable spec.
`/run` already defines a Goal-Driven Execution loop that executes active
ExecPlans, reviews changes, fixes issues, verifies results, and updates maps.
`/to-plan` fills the gap between those commands by creating the executable plan
that `/run` consumes.

## 3. Goals

- Locate the requested spec or the only clear candidate spec.
- Validate that the spec is plannable before creating an ExecPlan.
- Convert spec goals, non-goals, acceptance criteria, and verification signals
  into an active ExecPlan.
- Create or update exactly one active ExecPlan by default.
- Keep the plan scoped to the selected spec and repository map.
- Use the required ExecPlan shape from `docs/PLANS.md`.
- Make `## Checklist` the execution queue for `/run`.
- Make checklist items small, dependency-ordered, scoped, and verifiable.
- Define the strongest practical Verification Loop for the planned work.
- Record assumptions, decisions, blockers, and open questions durably.
- Update specs index, plan records, generated indexes, and project maps when
  needed.
- Leave a clear next step, usually `/run <plan-slug>`.

## 4. Non-goals

- Do not initialize repository maps; use `/map-init`.
- Do not create or rewrite the behavior spec by default; use `/to-spec` for
  unclear or changing behavior.
- Do not mark a draft spec accepted unless the user explicitly accepts it.
- Do not implement code, commands, package changes, migrations, or tests.
- Do not run the plan's Verification Loop except for checks needed to validate
  the planning artifact itself.
- Do not silently plan around blocking `[NEEDS_INVESTIGATION]` items.
- Do not invent product facts, architecture, acceptance criteria, or
  verification commands that are not supported by the spec, repo, or user
  context.
- Do not duplicate an existing active plan for the same spec.
- Do not run destructive commands, production writes, or external live checks.

## 5. User stories

### 5.1 Create a plan from a spec

As a user with a reviewable spec, I can run `/to-plan <spec-slug>` and get an
active ExecPlan ready for `/run`.

Acceptance criteria:

- The command reads the repository map before writing.
- The command resolves the requested spec from the configured specs directory.
- The command creates `docs/exec-plans/active/<plan-slug>.md` or the configured
  equivalent.
- The plan contains Goal, Context, Non-goals, Design, Checklist,
  Verification, Decisions, Progress Log, and Rollback sections.
- The plan references the source spec.
- The final response names the plan file and suggests `/run <plan-slug>`.

### 5.2 Update an existing active plan

As a user refining a planned feature, I can ask `/to-plan` to update the
existing active plan instead of creating a duplicate.

Acceptance criteria:

- The command searches active plans for references to the selected spec.
- If exactly one matching active plan exists, the command updates it.
- If multiple matching plans exist, the command asks which plan to update.
- Existing completed checklist items are preserved unless the user explicitly
  asks to replan them.
- The update records changed assumptions, decisions, verification, or open
  questions when relevant.

### 5.3 Stop when the spec is not plannable

As a user with an incomplete spec, I want `/to-plan` to expose the missing
decision instead of producing a fake plan.

Acceptance criteria:

- The command checks for goals, non-goals, acceptance criteria, verification
  signals, and blocking open questions.
- The command stops when a blocking `[NEEDS_INVESTIGATION]` item would change
  behavior, safety, data, compatibility, external dependencies, distribution,
  or acceptance criteria.
- The command records the exact blocker in the spec or
  `docs/records/open-questions.md`.
- The final response suggests `/clarify <spec-slug>` when the blocker belongs
  to an existing spec, or `/to-spec --update <spec-slug>` when the user is
  changing behavior.

### 5.4 Build a checklist that `/run` can execute

As a future `/run` agent, I want the plan checklist to be clear enough to drive
implementation without relying on chat history.

Acceptance criteria:

- Checklist items are ordered by dependency.
- Each checklist item has an observable completion condition.
- Each checklist item can be verified by one or more checks from the plan's
  Verification section.
- Checklist items do not combine unrelated behavior changes.
- Blocked or optional work is marked clearly instead of hidden inside prose.

### 5.5 Preserve the map learning loop

As a future agent, I want `/to-plan` to leave durable context about why the
plan is shaped the way it is.

Acceptance criteria:

- Relevant decisions are recorded in the plan's Decisions section.
- Assumptions and unresolved questions are recorded in the plan or project
  records.
- Generated indexes are refreshed when source layout, docs indexes, or package
  layout changes.
- The final response reports map updates and any remaining open questions.

## 6. Command behavior

User-facing command:

```text
/to-plan
```

Plugin skill folder:

```text
skills/to-plan/
```

Plugin command wrapper:

```text
commands/to-plan.md
```

Optional forms:

```text
/to-plan
/to-plan <spec-slug>
/to-plan <spec-file>
/to-plan --update <plan-slug>
/to-plan --from <spec-slug>
```

Default behavior:

- With a spec slug or file, create or update the active plan for that spec.
- With `--from`, resolve the named spec and create or update its plan.
- With `--update`, update only the named active plan and its referenced spec.
- With no argument and one plannable draft or accepted spec changed recently,
  use that spec.
- With no argument and multiple candidate specs, ask which spec to plan.
- With no plannable spec, stop and suggest `/clarify <spec-slug>` when one
  incomplete spec is the clear target, otherwise suggest `/to-spec`.

## 7. Required phases

### 7.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/WORKFLOW.md`.
- Read `docs/PLANS.md`.
- Read `docs/specs/index.md` when present.
- Inspect `git status --short`.
- Preserve unrelated dirty worktree changes.
- If no agent map exists, stop and suggest `/map-init`.

### 7.2 Resolve specs and plans locations

- Use `agent-map.yaml` `docs.specs` when configured.
- Fall back to `docs/specs/`.
- Use `agent-map.yaml` `docs.plans` when configured.
- Fall back to `docs/exec-plans/`.
- Write new plans under the active plans directory.
- Do not move existing specs or plans unless the user explicitly asks.

### 7.3 Resolve the source spec

- If the user provided a spec file, use that file.
- If the user provided a slug, search the configured specs directory.
- If no spec was provided, inspect recent specs and ask when there is not one
  clear candidate.
- Read the selected spec completely.
- Identify its status, goals, non-goals, behavior contract, acceptance
  criteria, verification section, assumptions, and open questions.

### 7.4 Validate plannability

A spec is plannable when it has:

- a clear behavior or command scope
- goals
- non-goals
- acceptance criteria
- verification signals
- no blocking open questions for delivery shape

Blocking questions include missing decisions that affect:

- user-visible behavior
- command names or public interfaces
- security, secrets, or permissions
- data model, data loss, migrations, or persistence
- package distribution or install behavior
- external services, network calls, or production systems
- compatibility with existing workflow contracts
- acceptance criteria or required verification

If a blocking question remains, stop before writing a plan, record the question
as `[NEEDS_INVESTIGATION]`, and suggest `/clarify <spec-slug>` when the
blocker belongs to an existing spec.

### 7.5 Resolve the target plan

- Search active plans for references to the selected spec.
- If exactly one active plan references the spec, update it.
- If multiple active plans reference the spec, ask which one to update.
- If no active plan exists, create a new plan slug from the spec slug.
- Avoid duplicate active plans for the same deliverable.
- Do not overwrite completed plans.

### 7.6 Design the plan

The plan design must translate spec requirements into an implementation shape:

- files, docs, commands, skills, metadata, scripts, or tests likely affected
- compatibility constraints
- distribution or install concerns
- docs and generated indexes that may need updates
- rollout, rollback, or disablement path
- tradeoffs that matter to future agents

Do not choose implementation details that require user approval when the spec
does not authorize them. Record those as open questions.

### 7.7 Build the checklist

Checklist items must be:

- scoped to the selected spec
- dependency-ordered
- small enough for focused verification
- written as observable delivery steps
- connected to the Verification section
- free of unrelated refactors or opportunistic cleanup

Use `- [ ]` for pending items and preserve existing `- [x]` items when updating
an active plan.

### 7.8 Define the Verification Loop

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
./scripts/agent-map-check
./scripts/agent-map-generate
node bin/jkit.js status
npm pack --dry-run
```

### 7.9 Update maps

Always update:

- the selected active plan
- `docs/specs/index.md` when planning reveals spec index drift

When relevant, update:

- `docs/records/open-questions.md`
- `docs/WORKFLOW.md`
- `docs/PLANS.md`
- `agent-map.yaml`
- generated indexes

Do not update implementation docs, architecture docs, or playbooks just because
a plan mentions possible future changes. Update those only when the planning
artifact changes durable workflow behavior.

### 7.10 Handoff

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

- next command, usually `/run <plan-slug>`

## 8. Required ExecPlan shape

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

The plan Goal derives from the spec. The spec remains the source of truth for
what behavior should exist; the plan records how that behavior will be delivered
and verified.

## 9. Safety, data, and compatibility

- Preserve unrelated dirty worktree changes.
- Do not run destructive commands.
- Do not plan production writes or live external checks unless the spec and user
  explicitly authorize them.
- Do not add new dependencies, commands, or package surfaces unless the spec
  requires them.
- Preserve Claude Code and Codex plugin compatibility when planning package or
  skill distribution changes.
- Treat command wrappers, skills, installer behavior, plugin metadata, and
  package contents as distribution surfaces.
- Record compatibility risks in the plan before implementation begins.

## 10. Verification

Planning `/to-plan` itself is verified by:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

When `/to-plan` is implemented as a command, implementation verification must
also include:

```bash
node bin/jkit.js status
npm pack --dry-run
```

Dogfood verification should include:

- creating a plan from `docs/specs/to-plan.md`
- updating an existing active plan without duplicating it
- stopping on a spec with a blocking `[NEEDS_INVESTIGATION]`
- confirming the produced plan uses `## Checklist`
- confirming the produced plan gives `/run` enough verification detail to
  execute without chat history

## 11. Acceptance criteria

- `docs/specs/to-plan.md` exists.
- `docs/specs/index.md` lists `to-plan.md`.
- `skills/to-plan/SKILL.md` exists when the command is implemented.
- `commands/to-plan.md` exists when the command is implemented.
- `bin/jkit.js` installs `map-init`, `to-spec`, `to-plan`, and `run` when the
  command is implemented.
- README lists `/to-plan` with the shipped commands when implemented.
- `agent-map.yaml` includes `/to-plan` once the command is implemented.
- `/to-plan` creates or updates active ExecPlans using `## Checklist`.
- `/to-plan` refuses to plan specs with blocking open questions.
- `/to-plan` does not implement code or run the plan's full Verification Loop.
- Produced plans include source spec, Goal, Context, Non-goals, Design,
  Checklist, Verification, Decisions, Progress Log, and Rollback.
- Produced plans identify docs/spec/playbook/generated-index update needs for
  `/run`.
- Running `./scripts/agent-map-check` passes.
- Running `npm pack --dry-run` includes `commands/to-plan.md` and
  `skills/to-plan/SKILL.md` after implementation.

## 12. Assumptions and open questions

- [ASSUMED] A plannable draft spec with no blocking questions is enough for
  `/to-plan`; explicit user acceptance is not required unless repository rules
  or the user require it.
- [ASSUMED] One spec creates or updates one active plan by default. Broad specs
  should be split before planning unless the user explicitly asks for multiple
  linked plans.
- [ASSUMED] Dogfood plan generation is a required implementation acceptance
  check for future command specs.
