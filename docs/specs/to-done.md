# Spec: to-done

> Status: draft
> Product: jkit v2
> Scope: adaptive orchestration from intent to verified done

## 1. Summary

`/to-done` is adaptive orchestration from intent to verified done. It can
handle clear small work directly, and it can also handle complex work by
dynamically routing through the required jkit stages before execution.

The command is allowed to continue only after the current stage has enough
context. It must not hide ambiguity inside a "done" shortcut. When the request
is rough, under-tested, underspecified, or not yet planned, `/to-done` must
explicitly enter the appropriate workflow mode: `/explore`, `/grill-me`,
`/to-spec`, `/clarify`, `/to-plan`, or `/run`.

It is an orchestration command in the jkit v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
                  \---------------------- /to-done ---------------------->/
```

`/to-done` does not skip requirements exploration, decision review,
clarification, specs, plans, or `/run`. It chooses the shortest safe path based
on current readiness:

```text
clear small work     = minimal /to-spec -> minimal /to-plan -> /run
clear complex work   = full /to-spec -> full /to-plan -> /run
rough direction      = /explore -> /grill-me? -> /to-spec -> /to-plan -> /run
selected but untested = /grill-me -> /to-spec -> /to-plan -> /run
ambiguous spec       = /clarify -> /to-plan -> /run
active plan ready    = /run
```

The command may use conversation context to start, but it must not rely on chat
history to finish. Before implementation begins, the request must exist as a
spec and an active ExecPlan sized to the work. Done means reviewed, repaired,
verified, recorded, and moved to completed when appropriate.

`/to-done` does not create a Codex `/goal` objective from raw user intent. It
materializes durable workflow artifacts: an intent brief, a behavior spec, and
an active ExecPlan. `/run` later derives the executable runtime goal contract
from the selected active ExecPlan when goal tracking is useful.

After `/to-done` has produced or selected a verifiable active ExecPlan, its
handoff to `/run` should prefer Codex `/goal` tracking by default. `/run` still
owns the objective text and must decline goal tracking when the plan is not
eligible for an evidence-based continuation loop.

## 2. Background

jkit v2 has separate commands for making work durable:

- `/to-spec` turns unclear or new behavior into a reviewable spec.
- `/to-plan` turns a plannable spec into an active ExecPlan.
- `/run` executes the active plan through a Goal-Driven Execution loop and
  chooses its execution strategy, including optional Codex `/goal` and
  subagent use when appropriate.

That deliberate separation is useful, but users often express the desired
outcome as "finish this" rather than choosing the exact workflow command.
`/to-done` provides the adaptive entry point for that intent. It can take the
shortest safe path when the work is already clear, and it can expand into the
full workflow when the work is complex or missing context.

The key distinction is:

- complexity is allowed when it is made explicit in specs, plans, and
  verification
- unresolved ambiguity is not allowed to pass into implementation

Contract ownership:

- Intent brief: `/to-done` restates user intent, readiness, boundaries, and
  verification signals before durable writing.
- Behavior contract: `/to-spec` owns the spec.
- Durable execution contract: `/to-plan` owns the active ExecPlan.
- Runtime goal contract: `/run` owns the selected work queue, execution
  strategy, verification loop, stop conditions, and any Codex `/goal`
  objective.

## 3. Goals

- Accept an intent from current conversation context, a brief, a spec, or a
  plan.
- Decide the current readiness stage before choosing the next workflow command.
- Dynamically route to `/explore`, `/grill-me`, `/to-spec`, `/clarify`,
  `/to-plan`, or `/run` when needed.
- Materialize a spec before planning. Use a minimal spec for clear small work
  and a full spec for complex work.
- Materialize an active ExecPlan before implementation. Use a minimal plan for
  clear small work and a full plan for complex work.
- Delegate execution semantics and execution-strategy selection to `/run`
  rather than inventing a second execution loop.
- Leave executable runtime goal contract creation to `/run`, including any
  Codex `/goal` objective.
- Prefer Codex `/goal` tracking after `/to-done` reaches a verifiable active
  ExecPlan, while preserving `/run` as the owner of the objective and
  eligibility decision.
- Review, repair, and verify before claiming done.
- Record progress, verification, failures, and map updates durably.
- Move completed plans to `docs/exec-plans/completed/` after final
  verification when repository convention allows it.
- Stop at the correct stage when the request cannot be safely advanced.
- Leave no important requirement only in chat history.

## 4. Non-goals

- Do not replace `/to-spec`, `/to-plan`, or `/run`.
- Do not bypass specs, plans, review, verification, records, or generated index
  updates.
- Do not force unclear, risky, or unresolved multi-option work into
  implementation.
- Do not treat complex work as ineligible only because it is complex.
- Do not create product requirements from vague intent.
- Do not run destructive commands, production writes, migrations, or external
  live checks without explicit approval.
- Do not silently choose among significant design alternatives.
- Do not silently switch workflow mode; announce the stage transition and why.
- Do not mark work done when verification is missing, skipped, failing, or
  blocked.
- Do not execute an existing active plan differently from `/run`.
- Do not pass raw user intent or a pre-plan brief directly to Codex `/goal`.
- Do not choose the final goal-tracking result, delegation, or work-queue scope
  inside `/to-done`; those are `/run` execution-strategy decisions.
- Do not force Codex `/goal` when `/run` finds no clear objective,
  evidence-based done condition, adaptive validation loop, explicit
  boundaries, or safe bounded autonomy.

## 5. User stories

### 5.1 Complete a clear request from session context

As a user who already discussed the requirement and solution with the agent, I
can run `/to-done` and have the agent convert that shared context into durable
artifacts and finish the work.

Acceptance criteria:

- The command extracts goal, scope, non-goals, acceptance criteria, and
  verification from the current session.
- The extracted session context is treated as an intent brief for spec and plan
  materialization, not as a Codex `/goal` objective.
- The command asks one concise question when it cannot safely restate the work.
- The command writes a minimal spec before creating a plan.
- The command writes a minimal active ExecPlan before implementation.
- The command runs the `/run` Goal-Driven Execution loop.
- The final response links the spec, plan, verification results, and remaining
  blockers, if any.

### 5.2 Complete complex work through the full path

As a user with a complex but valid request, I can run `/to-done <intent>` and
have the agent expand into the full jkit workflow instead of rejecting the work
only because it is complex.

Acceptance criteria:

- The command identifies that the work is complex and announces that it will
  use a full spec and full ExecPlan rather than minimal artifacts.
- The command does not begin implementation until the complex behavior is
  represented in a durable spec and active ExecPlan.
- The command may ask or route through prerequisite stages when complexity
  exposes unresolved requirements, design alternatives, or verification gaps.
- The final artifacts preserve enough context for a future agent to continue
  without chat history.

### 5.3 Dynamically route when context is missing

As a user, I want `/to-done` to choose the next necessary workflow stage when
the request is not ready for implementation.

Acceptance criteria:

- If the need or solution direction is rough, the command enters `/explore`.
- If a direction is selected but key requirement or solution decisions are not
  settled, the command enters `/grill-me`.
- If behavior is clear enough for durable writing but no spec exists, the
  command enters `/to-spec`.
- If behavior is unclear, the command enters `/to-spec` or asks the minimum
  necessary question before doing so.
- If the spec has blocking open questions, the command stops and suggests
  `/clarify <spec-slug>`.
- If the implementation strategy has unresolved choices, the command stops and
  suggests or enters `/to-plan <spec-slug>`.
- If an active plan already exists for the same work, the command uses or
  suggests `/run <plan-slug>` instead of creating a duplicate plan.
- Each stage transition is announced with a short reason.
- If verification fails, the command records the exact failure and does not
  claim done.

### 5.4 Preserve the regular done contract

As a future agent, I want `/to-done` work to be as recoverable as normal
spec-plan-run work.

Acceptance criteria:

- The spec is listed in `docs/specs/index.md`.
- Minimal specs are used only for clear small work; complex work receives a
  full spec sized to the behavior.
- The ExecPlan contains Goal, Context, Non-goals, Design, Checklist,
  Verification, Decisions, Progress Log, and Rollback.
- Minimal ExecPlans are used only for clear small work; complex work receives a
  full plan sized to the blast radius and verification needs.
- The plan progress log records execution strategy when `/run` executes,
  checklist status, verification commands and results, failures or exceptions,
  doc-update decisions, generated-index status, and new open questions.
- Generated indexes are refreshed when relevant.
- Verification failures are recorded under
  `docs/records/verification-failures/` when they affect future agents.

## 6. Command behavior

User-facing command:

```text
/to-done
```

Plugin skill folder:

```text
skills/to-done/
```

Plugin command wrapper:

```text
commands/to-done.md
```

Supported forms:

```text
/to-done
/to-done <intent-or-brief>
/to-done <spec-slug>
/to-done <plan-slug>
```

Default behavior:

- With no argument, use current session context as the input intent and run the
  readiness gate.
- With an intent or brief, use the supplied text as the primary intent and run
  the readiness gate.
- With a spec slug, validate that the spec is plannable, create or update a
  matching active plan, then run it.
- With a plan slug, delegate to `/run <plan-slug>`.
- If multiple specs or plans plausibly match, ask which one to use.
- If a prerequisite stage is needed, announce the stage transition and follow
  that stage's contract before continuing.

## 7. Readiness gate

`/to-done` must determine the current readiness stage before writing
implementation code.

Stage routing:

- No agent map: stop and suggest `/map-init`.
- Rough need or unselected solution direction: enter `/explore`.
- Selected direction with unresolved key decision branches: enter `/grill-me`.
- Clear behavior with no durable spec: enter `/to-spec`.
- Existing spec with planning-blocking ambiguity: enter `/clarify <spec-slug>`.
- Plannable spec with no active plan: enter `/to-plan <spec-slug>`.
- Active plan ready for execution: enter `/run <plan-slug>`.
- Clear small request with no existing artifacts: create minimal spec, minimal
  active plan, then enter `/run`.
- Clear complex request with no existing artifacts: create full spec, full
  active plan, then enter `/run`.

Before implementation begins, the work must satisfy all of these:

- the requirement, solution direction, boundaries, acceptance criteria, and
  verification are represented in durable artifacts
- consequential design alternatives have been resolved or explicitly deferred
- implementation can follow existing project patterns
- no security, secret, permission, or sensitive-path ambiguity exists
- no data loss, migration, persistence, or destructive operation is required
- no production write or external live check is required without approval
- local verification is available or a clearly approved manual check exists
- no blocking `[NEEDS_INVESTIGATION]` item affects behavior, safety,
  compatibility, distribution, acceptance, or verification

If any condition fails, `/to-done` must route to or stop at the correct
workflow stage instead of forcing implementation.

Complexity is not a failure. Complexity affects artifact size, plan depth,
verification breadth, and whether more context-gathering stages are required.

## 8. Required phases

### 8.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/WORKFLOW.md`.
- Read `docs/PLANS.md`.
- Read `docs/specs/index.md` when present.
- Inspect `git status --short`.
- Preserve unrelated dirty worktree changes.
- If no agent map exists, stop and suggest `/map-init`.

### 8.2 Restate the intent

From the current session, intent, brief, spec, or plan, restate:

- goal
- current behavior
- desired behavior
- non-goals
- implementation direction
- acceptance criteria
- verification checks
- affected files, docs, skills, commands, package metadata, or runtime surfaces

Also classify:

- rough need
- selected but untested direction
- spec-ready behavior
- ambiguous existing spec
- plan-ready spec
- active-plan-ready work
- clear small request
- clear complex request

If the agent cannot restate the intent confidently, ask one concise question or
enter `/explore`.

### 8.3 Apply the readiness gate

- Check the criteria in section 7.
- Record low-risk assumptions as `[ASSUMED]`.
- Record unresolved important facts as `[NEEDS_INVESTIGATION]`.
- Stop before writing implementation code when any blocking question remains.
- Prefer the explicit prerequisite workflow stage when in doubt.

### 8.4 Enter the required prerequisite stage

When the readiness gate identifies a missing stage, enter that stage's behavior
instead of continuing inside `/to-done` as a black box:

- `/explore`: explore the need and solution directions, then return with ready
  input for `/grill-me` or `/to-spec`.
- `/grill-me`: review the selected requirement and solution direction,
  then return with ready input for `/to-spec`.
- `/to-spec`: create or update the durable behavior spec.
- `/clarify`: resolve blocking ambiguity in one existing spec before planning.
- `/to-plan`: create or update the active ExecPlan.
- `/run`: execute the active plan through the Goal-Driven Execution loop,
  including `/run`'s execution strategy decision.

Each transition must be visible to the user:

```text
This can continue through /to-done, but the selected direction still has
unresolved key decision branches. I am entering /grill-me to fill that context
before writing the spec.
```

### 8.5 Materialize or reuse the spec

- Search `docs/specs/` or the configured specs directory.
- Reuse an existing matching spec when one clearly covers the work.
- Create a minimal spec for clear small work when no matching spec exists.
- Create a full spec for complex work when no matching spec exists.
- Update `docs/specs/index.md`.
- Do not mark the spec accepted unless the user explicitly accepts it or the
  repository has an approval convention.

Every spec must include:

- summary
- goals
- non-goals
- behavior contract
- verification
- acceptance criteria
- assumptions and open questions

### 8.6 Materialize or reuse the plan

- Search `docs/exec-plans/active/` for a plan that references the spec.
- Reuse and update exactly one active plan when a clear match exists.
- Create a minimal active ExecPlan for clear small work when no match exists.
- Create a full active ExecPlan for complex work when no match exists.
- Do not duplicate active plans for the same work.
- Preserve completed checklist items when updating.

Every plan must follow `docs/PLANS.md` and include:

- Goal
- Context
- Non-goals
- Design
- Checklist
- Verification
- Decisions
- Progress Log
- Rollback

### 8.7 Execute through `/run`

After the active plan exists and is ready, use `/run` semantics:

- request `/run` to prefer Codex `/goal` tracking for `/to-done` handoffs when
  the active plan is eligible
- let `/run` decide and record the final execution strategy before
  implementation
- let `/run` derive the executable runtime goal contract from the active
  ExecPlan, selected work queue, verification, and stop conditions
- treat Codex `/goal` and subagents as `/run` runtime choices, not
  `/to-done` shortcuts
- execute ready pending checklist items
- review the diff and behavior against the spec and plan
- fix in-scope review findings
- run the strongest available Verification Loop
- rerun failed checks after in-scope fixes
- record exact blockers when verification cannot pass
- mark checklist items complete only after focused verification passes

`/to-done` must not maintain a divergent execution loop.

`/to-done` may hand `/run` the selected plan or readiness path, but it must not
precompute the Codex `/goal` objective. If goal tracking is selected, `/run`
creates the objective from the active ExecPlan so the durable plan remains the
source of truth.

Goal tracking is eligible only when the active ExecPlan has one objective, an
evidence-based done condition, an adaptive validation loop, explicit
boundaries, and safe bounded autonomy. If any of those are missing, `/run`
records why goal tracking was skipped and continues with normal plan execution
or stops at the blocker.

### 8.8 Update maps and records

Always update:

- active plan checklist statuses
- active plan Progress Log
- verification results
- decisions
- execution strategy selected by `/run`, if execution occurred
- blockers, if any

When relevant, update:

- specs
- architecture or design docs
- workflow docs
- playbooks
- open questions
- verification failure records
- generated indexes
- package or plugin metadata
- quality score

If the plan completes and verification passes, move it to completed when the
repository convention allows it.

### 8.9 Handoff

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

## 9. Safety, data, and compatibility

- Conversation context can justify starting the command, but durable artifacts
  must carry the result.
- Complex work is allowed only when complexity is represented in the spec,
  plan, verification loop, and progress log.
- Do not use `/to-done` for irreversible operations without explicit approval.
- Do not use `/to-done` for work with unresolved security, data, compatibility,
  package distribution, or public workflow decisions.
- Do not use `/to-done` to bypass `/grill-me` when a selected direction still
  has consequential untested assumptions.
- Do not use `/to-done` to bypass `/clarify` when an existing spec has
  planning-blocking ambiguity.
- Do not hide skipped verification behind a successful summary.
- Do not move a plan to completed unless required verification passed or the
  blocker is explicitly recorded and the plan remains incomplete.
- Preserve unrelated dirty worktree changes.

## 10. Verification

Planning/spec verification for this command:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

Implementation verification after shipping `/to-done` must include:

```bash
test -f commands/to-done.md
test -f skills/to-done/SKILL.md
rg -n "to-done" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js claude-code status
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood verification should cover:

- `/to-done` from clear current-session context
- `/to-done <brief>` for a clear small request
- `/to-done <intent>` for a clear complex request that requires full spec and
  full plan artifacts
- routing to `/explore` for rough or unselected direction
- routing to `/grill-me` for a selected but untested direction
- routing to `/to-spec` for behavior that needs durable specification
- routing to `/clarify` for an existing spec with planning-blocking ambiguity
- routing to `/to-plan` for unresolved implementation strategy
- delegation to `/run` for an existing active plan
- failed verification recording without claiming done

## 11. Acceptance criteria

- `docs/specs/to-done.md` exists.
- `docs/specs/index.md` lists `to-done.md`.
- `skills/to-done/SKILL.md` exists when implemented.
- `commands/to-done.md` exists when implemented.
- `bin/jkit.js` installs `map-init`, `to-spec`, `to-plan`, `to-done`, and
  `run` when implemented.
- README lists `/to-done` as a shipped command when implemented.
- `agent-map.yaml` includes `/to-done` once implemented.
- `/to-done` accepts clear current-session context.
- `/to-done <brief>` accepts clear small requests.
- `/to-done <intent>` accepts clear complex requests and creates full
  artifacts when needed.
- `/to-done` determines the readiness stage before implementation.
- `/to-done` routes to `/explore`, `/grill-me`, `/to-spec`, `/clarify`,
  `/to-plan`, or `/run` when that stage is required.
- `/to-done` writes or reuses a spec before planning.
- `/to-done` writes or reuses an ExecPlan before implementation.
- `/to-done` uses minimal artifacts only for clear small work.
- `/to-done` uses full artifacts for complex work.
- `/to-done` delegates execution to `/run` semantics.
- `/to-done` does not create Codex `/goal` objectives or decide the final
  goal-tracking result.
- `/run` derives any executable runtime goal contract after resolving the
  active ExecPlan and work queue.
- `/to-done` handoffs ask `/run` to prefer Codex `/goal` tracking when the
  active ExecPlan is eligible.
- `/to-done` refuses unresolved ambiguity, risky work, or unverifiable work.
- `/to-done` records verification failures exactly and does not claim done when
  checks fail.
- Completed `/to-done` work has durable spec, plan, progress log,
  verification, and map updates.
- `./scripts/agent-map-check` passes.
- `npm pack --dry-run` includes `commands/to-done.md` and
  `skills/to-done/SKILL.md` after implementation.

## 12. Assumptions and open questions

- [ASSUMED] `/to-done` should be a distinct command rather than expanding
  `/run`, because `/run` should remain scoped to executing existing plans.
- [ASSUMED] `/to-done` is the correct user-facing command for "finish this"
  intent, while the internal path still uses the specialized workflow commands.
- [ASSUMED] A brief can be simple or complex, but implementation may start only
  after the readiness gate has durable requirements, plan, and verification
  context.
- [ASSUMED] Minimal specs and plans may be short, but they must preserve all
  fields needed for future agents to continue without chat history.
- [ASSUMED] Full specs and plans are required when complexity affects behavior,
  architecture, compatibility, distribution, safety, or verification.
- [ASSUMED] Codex `/goal` receives a runtime objective derived by `/run` from
  the active ExecPlan, not the original `/to-done` intent brief.
- [ASSUMED] `/to-done` expresses a stronger user intent to pursue verified
  completion than direct `/run`, so its `/run` handoff should prefer goal
  tracking when evidence-loop eligibility is satisfied.
- [ASSUMED] An explicit preview mode can be specified separately later.
