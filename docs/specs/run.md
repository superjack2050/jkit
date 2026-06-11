# Spec: run

> Status: draft
> Product: jkit v2
> Scope: execute an active plan to verified completion and update agent maps

## 1. Summary

`/run` executes the selected active ExecPlan against its referenced specs until
all planned tasks are complete, reviewed, fixed, and verified by the strongest
available checks.
It writes implementation facts, decisions, verification results, and blockers
back into the repository's agent maps.

It is the execution command in the jkit v2 workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
```

`/run` is not a generic shell executor and not a single-step helper. It is a
delivery loop: follow the spec and plan, complete the plan's pending work,
review the result, fix issues, rerun verification, and stop only when the work
is genuinely done or a clear blocker is recorded.

Before editing, `/run` chooses an execution strategy from the selected
ExecPlan. The default is single-agent execution. When the runtime supports it,
`/run` may use Codex `/goal` for evidence-based continuation loops, and may use
subagents for bounded review, investigation, or isolated implementation. These
are optional runtime capabilities, not requirements, and the primary `/run`
agent remains accountable for final review, verification, progress logging, and
map updates.

`/run` is the only stage that derives the executable runtime goal contract.
That contract is built from the selected active ExecPlan, referenced specs,
ready work queue, verification loop, non-goals, and stop conditions. It may be
passed to Codex `/goal` when goal tracking is selected, but the active ExecPlan
remains the durable source of truth.

## 2. Goals

- Locate the relevant active ExecPlan.
- Read the referenced specs, plan context, and agent map configuration.
- Execute all pending, unblocked checklist items in the selected plan by
  default.
- Keep implementation within the selected plan and referenced specs.
- Run focused verification as checklist items complete.
- Review the resulting diff and behavior before final handoff.
- Fix review findings and failed verification when the fix is within scope.
- Rerun verification until it passes or a concrete blocker remains.
- Mark checklist items complete only after their verification passes.
- Move or recommend moving the plan to completed only after final verification
  and map updates.
- Record progress, decisions, blockers, workflow exceptions, and verification
  failures in durable docs.
- Refresh generated indexes when source layout, docs indexes, or package layout
  changes.
- Keep late-discovered ambiguity visible instead of silently choosing.
- Choose and record an execution strategy before implementation.
- Use Codex `/goal` when available and useful for evidence-based continuation
  loops.
- Derive any Codex `/goal` objective from the selected active ExecPlan and
  runtime work queue, never from raw user intent alone.
- Use subagents only when the selected plan contains independent, low-conflict,
  verifiable work or bounded review/investigation tasks.
- Keep the primary `/run` agent responsible for final integration, review,
  verification, and handoff even when goals or subagents are used.

## 3. Non-goals

- Do not create the initial repository map; use `/map-init`.
- Do not generate a new spec; use `/to-spec` when behavior is unclear.
- Do not generate a new plan from scratch; use `/to-plan`.
- Do not execute arbitrary shell commands outside the selected plan.
- Do not expand scope beyond the referenced specs and plan just to make nearby
  code nicer.
- Do not run destructive migrations, production writes, or external live checks
  without explicit user approval.
- Do not mark a plan or checklist item complete when required verification is
  absent, skipped, failing, or blocked.
- Do not hide failures behind "best effort" summaries; record exact failed
  commands and the next action.
- Do not require Codex `/goal`; `/run` must remain portable to runtimes that
  do not expose goal-tracking features.
- Do not accept `/to-done` chat context, raw user intent, or a pre-plan brief
  as the executable runtime goal contract.
- Do not let Codex `/goal` replace the active ExecPlan, progress log, review,
  verification, or blocker records.
- Do not spawn subagents for ambiguous, high-risk, destructive, external-live,
  secret-bearing, or tightly coupled work.
- Do not let subagents expand the selected plan's scope, bypass approval
  boundaries, or mark checklist items complete.
- Do not delegate final diff review, final verification, progress-log updates,
  records, generated-index refreshes, or final completion claims.

## 4. User stories

### 4.1 Execute a plan to completion

As a user with an active plan, I can run `/run` and have jkit implement every
pending checklist item that is ready, verify the result, update maps, and
report any remaining blockers.

Acceptance criteria:

- The command reads `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`, and
  `docs/PLANS.md`.
- If exactly one active plan exists, the command uses it.
- If multiple active plans exist, the command asks which plan to run unless the
  user supplied a plan slug or path.
- The command reads the selected plan completely.
- The command reads specs and docs referenced by the plan.
- The command executes all unchecked checklist items whose dependencies are
  complete.
- The plan's progress log records what changed, what passed, and what remains.

### 4.2 Review and repair before handoff

As a user, I want `/run` to review its own changes and fix issues before
claiming the work is done.

Acceptance criteria:

- The command inspects the resulting diff or changed files.
- The command checks whether the implementation still matches the spec and
  plan.
- In-scope review findings are fixed before final verification.
- Out-of-scope findings are recorded as follow-up or open questions.
- Final handoff does not claim completion until review findings and verification
  are resolved or recorded as blockers.

### 4.3 Run verification until pass or blocker

As a user, I want `/run` to rely on the strongest available verification, not
just file existence or optimistic summaries.

Acceptance criteria:

- The command runs the strongest local deterministic checks named by the plan,
  referenced specs, and `agent-map.yaml`.
- If checks fail, the command fixes in-scope issues and reruns the checks.
- The command repeats the fix-and-rerun loop while it can make meaningful
  progress.
- If verification remains failing or cannot be run, the command records the
  exact command, failure summary, suspected cause, and next step.
- A checklist item or plan is not marked complete unless the relevant checks
  passed.

### 4.4 Handle failed verification

As a future agent, I want failed checks preserved so work can continue without
forensic guessing.

Acceptance criteria:

- Failed commands are reported exactly.
- Failed verification is recorded under
  `docs/records/verification-failures/` when it affects future agents.
- The failure record includes date, exact command, short failure summary,
  suspected cause, and next step.
- The active plan records the blocker and next suggested action.
- Completed checklist items stay complete only when their own verification
  passed.
- Unverified checklist items remain unchecked.

### 4.5 Handle late ambiguity

As a user, I want `/run` to stop when the plan did not cover an important
decision.

Acceptance criteria:

- The command identifies decisions not covered by the spec or plan.
- It resolves with repository evidence when possible.
- It asks the user when the decision changes behavior, security, data,
  external dependencies, compatibility, public workflow, or irreversible
  operations.
- It records unresolved items as `[NEEDS_INVESTIGATION]`.

### 4.6 Keep maps fresh

As a future agent, I want `/run` to leave the repository easier to continue
than it found it.

Acceptance criteria:

- Behavior changes update specs or design docs when needed.
- Repeated workflow lessons are promoted to playbooks or records.
- Generated indexes are refreshed when source layout or docs indexes change.
- `agent-map.yaml` update rules are consulted before final handoff.
- Active plans reflect completed checklist items, blockers, decisions, and
  verification results.

### 4.7 Choose goal tracking and subagents deliberately

As a user running a complex plan, I want `/run` to decide whether Codex
`/goal` or subagents would improve execution without making the run less
verifiable.

Acceptance criteria:

- Before editing, the command classifies the selected run's execution strategy.
- The command considers Codex `/goal` separately from subagent delegation.
- Codex `/goal` is used only when the runtime supports it and the plan has a
  clear objective, evidence-based done condition, adaptive validation loop,
  explicit boundaries, and safe bounded autonomy.
- When Codex `/goal` is selected, the command derives a runtime objective from
  the selected active ExecPlan, not from raw `/to-done` intent.
- Subagents are used only for bounded, independent, low-conflict work with clear
  acceptance and verification signals.
- Subagents may be used for review, investigation, or isolated implementation,
  but the primary `/run` agent reviews and integrates the result.
- The active plan progress log records the chosen strategy and the reason.
- If goals or subagents were considered but not used, the progress log records
  the short reason when it matters for future continuation.

## 5. Command behavior

User-facing command:

```text
/run
```

Plugin skill folder:

```text
skills/run/
```

Plugin command wrapper:

```text
commands/run.md
```

Optional forms:

```text
/run
/run <plan-slug>
/run <plan-file>
/run --item <checklist item text or number>
```

Default behavior:

- `/run` executes all pending checklist items in the selected active plan.
- `/run <plan-slug>` or `/run <plan-file>` executes all pending checklist items
  in that plan.
- `/run --item ...` executes only the selected checklist item when the user
  explicitly asks for a narrow run.

## 6. Required phases

### 6.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/WORKFLOW.md`.
- Read `docs/PLANS.md`.
- Read `docs/specs/index.md` when present.
- Inspect `git status --short`.
- Preserve unrelated dirty worktree changes.

### 6.2 Resolve plan

- Search `docs/exec-plans/active/*.md`.
- If the user provided a plan file or slug, use that plan.
- If one active plan exists, use it.
- If multiple active plans exist, ask the user to choose unless recent context
  clearly identifies one.
- If no active plan exists, stop and suggest `/to-plan`.

### 6.3 Read plan and specs

- Read the selected plan completely.
- Read referenced specs and docs from the plan header, Context, Design,
  Checklist, Verification, and Decisions sections.
- Identify pending checklist items and dependencies.
- Identify verification commands and acceptance criteria.
- Stop if the plan has no verifiable outcome.

### 6.4 Decide execution strategy

Before editing, decide and record the execution strategy.

Execution strategy has two independent facets. Goal tracking also records the
caller preference because `/to-done` expresses a stronger "pursue verified
completion" intent than a direct `/run` invocation:

```text
goal tracking preference: auto | prefer Codex /goal | force Codex /goal | none
goal tracking result: none | Codex /goal
delegation: none | subagent review/investigation | subagent isolated implementation
```

Defaults:

```text
direct /run goal tracking preference: auto
/to-done handoff goal tracking preference: prefer Codex /goal
delegation: none
```

Use Codex `/goal` when the preference is `force Codex /goal` or `prefer Codex
/goal`, and all eligibility checks pass. For `auto`, use Codex `/goal` only
when the plan clearly benefits from an evidence-based continuation loop.

Eligibility checks:

- the current runtime supports Codex `/goal`
- the selected plan has one clear objective
- the done condition can be checked against concrete evidence
- the plan has an adaptive validation loop where the next action may depend on
  observed failures, metrics, test output, artifacts, logs, or code evidence
- constraints, non-goals, boundaries, allowed tools or files, and stop
  conditions are explicit
- Codex has safe bounded autonomy to continue making scoped progress without
  asking the user to steer every step
- goal tracking will not replace the active ExecPlan progress log

Do not use Codex `/goal` when:

- the runtime does not support it
- the run is a one-off focused edit that does not need a continuation loop
- the plan is ambiguous or missing an evidence surface
- a key product, safety, data, compatibility, or public workflow decision still
  needs the user
- the work is destructive, external-live, secret-bearing, or migration-heavy
  without explicit approval and boundaries
- the objective is an open-ended backlog rather than a finish line
- goal state would become the only durable record of progress

Use subagents for review or investigation when:

- independent files, docs, tests, or code areas need parallel inspection
- a bounded second-pass review would reduce risk before final verification
- the subagent can return findings without modifying files

Use subagents for isolated implementation only when:

- the plan or obvious checklist structure contains independent items
- file ownership is low-conflict
- acceptance criteria and focused verification are clear
- each subagent can receive a bounded prompt with explicit scope and non-goals
- the primary `/run` agent can review and integrate the result before marking
  checklist items complete

Do not use subagents when:

- the work is safety-sensitive, destructive, external-live, migration-heavy, or
  secret-bearing
- multiple agents would edit the same files or tightly coupled behavior
- the spec or plan has unresolved ambiguity that changes behavior, safety,
  data, compatibility, or irreversible operations
- verification is unclear or cannot be run by the primary `/run` agent
- delegation would obscure accountability for the final diff

Record in the active plan progress log before or during execution:

- selected goal-tracking preference and result
- goal-tracking caller preference
- selected delegation mode
- reason for the strategy
- runtime goal contract summary when Codex `/goal` is selected
- subagent scopes, if any
- how subagent output will be reviewed and verified
- fallback reason when a useful runtime capability is unavailable

When goal tracking is `Codex /goal`, create the runtime objective from this
shape:

```text
Objective:
Drive active ExecPlan <path-or-slug> to verified completion.

Source of truth:
- Spec: <referenced spec paths>
- Plan: <active plan path>

Scope:
- Complete the selected ready unchecked checklist items.
- Stay within the active plan and referenced specs.

Non-goals:
- Do not expand behavior beyond the plan.
- Do not touch unrelated worktree changes.

Done when:
- Focused verification passes for completed checklist items.
- The diff and behavior are reviewed against the plan and specs.
- In-scope review findings are fixed.
- Required final verification passes.
- The active plan records strategy, checklist status, verification, and blockers.

Stop if:
- A missing decision affects behavior, safety, data, compatibility, public
  workflow, irreversible operations, or verification.
- Verification cannot pass after meaningful in-scope fixes.
```

Do not include speculative requirements or unresolved chat-only decisions in the
runtime objective. Record unresolved facts in the active plan instead.

### 6.5 Execute pending checklist items

- Execute all unchecked checklist items in dependency order by default.
- Keep changes scoped to the selected plan and referenced specs.
- Prefer existing project patterns.
- Do not refactor unrelated code.
- Do not introduce new commands or dependencies unless the plan requires them.
- Stop for late-discovered ambiguity that affects behavior, safety, data,
  external integrations, compatibility, public workflow, or irreversible
  operations.
- Mark each checklist item complete only after its focused verification passes.
- If subagents are used, give each subagent a bounded task tied to one checklist
  item, review task, or investigation question.
- Integrate subagent outputs one at a time.
- Re-read modified files before relying on subagent changes.
- Treat subagent findings as inputs, not completion proof.
- The primary `/run` agent marks checklist items complete only after reviewing
  the result and running relevant focused verification.

### 6.6 Review and repair

- Inspect the diff and touched files.
- Check the implementation against the plan, referenced specs, and acceptance
  criteria.
- Fix in-scope review findings.
- Record out-of-scope findings as open questions, tech debt, or follow-up plan
  items.
- Do not proceed to final handoff while known in-scope review findings remain.
- If subagents contributed findings or changes, explicitly review whether each
  output stayed within scope, avoided conflicting edits, and has verification
  coverage.

### 6.7 Verify

Run verification in this order:

1. Focused checks named by the completed checklist items.
2. Automated tests named by the plan, referenced specs, or project metadata.
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

If verification fails:

- Fix in-scope failures.
- Rerun the failed command and any broader checks that could be affected.
- Continue while making meaningful progress.
- If blocked, record the exact command, failure summary, suspected cause, and
  next step.

Do not run external live checks unless explicitly approved.

### 6.8 Update maps

Always update the active plan:

- execution strategy selected for this run
- Codex `/goal` usage, if any
- subagent scopes and outcomes, if any
- checklist statuses
- progress log
- decisions
- verification results
- review findings
- blockers, if any

The progress log entry for each run must include:

- selected execution strategy, caller preference, and reason
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

When relevant, update:

- specs
- architecture docs
- design docs
- playbooks
- records
- generated indexes
- quality score

If work happened outside the expected flow, add a record under
`docs/records/workflow-exceptions/`.

### 6.9 Handoff

Final response must include:

- plan executed
- execution strategy used
- Codex `/goal` or subagent usage, if any
- checklist items completed
- files changed
- review result
- verification commands and results
- map updates made
- remaining checklist items or blockers

## 7. Completion protocol

Before final response, `/run` must answer:

```text
Did implementation stay within the selected plan and referenced specs?
Was the execution strategy chosen and recorded before or during execution?
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

## 8. Acceptance criteria

- `skills/run/SKILL.md` exists.
- `commands/run.md` exists.
- `bin/jkit.js` installs `map-init` and `run`.
- README lists `/run` as shipped.
- `/run` defaults to executing all pending checklist items in the selected
  active plan.
- `/run --item` allows an explicit narrow execution.
- `/run` chooses and records an execution strategy before implementation.
- `/run` treats Codex `/goal` as an optional runtime goal-tracking capability,
  not as a portable requirement.
- `/run` derives any Codex `/goal` objective from the active ExecPlan,
  referenced specs, selected work queue, verification, and stop conditions.
- `/run` may use subagents only for bounded, independent, verifiable work or
  review/investigation.
- `/run` keeps the primary agent accountable for final integration, review,
  verification, maps, and handoff when subagents are used.
- The run skill includes review-and-repair behavior.
- The run skill requires verification checks to pass before claiming
  completion.
- `agent-map.yaml` includes run-related update rules or commands.
- Running `node bin/jkit.js status` lists `run`.
- `npm pack --dry-run` includes `commands/run.md` and `skills/run/SKILL.md`.
- `./scripts/agent-map-check` passes.
