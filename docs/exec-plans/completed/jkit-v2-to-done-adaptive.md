# Plan: jkit v2 to-done adaptive orchestration

## Goal

Update `/to-done` from a clear-small-work fast path into adaptive
orchestration from intent to verified done. It should dynamically route through
`/explore`, `/grill-me`, `/to-spec`, `/clarify`, `/to-plan`, or `/run` when
those stages are required.

The shipped behavior should allow complex work, but only after complexity is
made durable in specs, plans, verification loops, and progress records.

## Context

- Read `AGENTS.md` for repository routing and done criteria.
- Read `agent-map.yaml` for configured specs, plans, records, commands, and
  update rules.
- Read `docs/WORKFLOW.md` for the default workflow and current `/to-done`
  wording.
- Read `docs/PLANS.md` for required ExecPlan shape.
- Read `docs/specs/to-done.md` for the updated adaptive behavior contract.
- Read `skills/to-done/SKILL.md` for the previously implemented fast-path
  rules and the new adaptive implementation target.
- Read `commands/to-done.md` for the wrapper contract.
- Read `docs/specs/explore.md`, `docs/specs/grill-me.md`,
  `docs/specs/clarify.md`, `docs/specs/to-spec.md`, `docs/specs/to-plan.md`,
  and `docs/specs/run.md` for stage boundaries.
- The current worktree already contains the updated `docs/specs/to-done.md`
  spec. Preserve that change and do not revert unrelated user work.

## Non-goals

- Do not make `/to-done` a black-box super-command that hides workflow stages.
- Do not weaken `/explore`, `/grill-me`, `/clarify`, `/to-spec`, `/to-plan`,
  or `/run`.
- Do not bypass durable specs, active ExecPlans, review, verification, records,
  or generated indexes.
- Do not implement `/map-repair`.
- Do not add new runtime dependencies unless a later spec explicitly requires
  them.
- Do not claim complex work is complete without full artifacts and verification.

## Design

Canonical definition:

```text
/to-done is adaptive orchestration from intent to verified done.
```

This should be implemented as a readiness-gated orchestrator.

The top-level flow:

```text
intent
-> orient with agent map and current repo state
-> restate intent
-> classify readiness
-> enter required stage, visibly and with a reason
-> create or reuse spec
-> create or reuse active ExecPlan
-> execute through /run semantics
-> update records and maps
```

Readiness classification should identify:

- no agent map
- rough need or unselected solution direction
- selected but untested direction
- spec-ready behavior
- ambiguous existing spec
- plan-ready spec
- active-plan-ready work
- clear small request
- clear complex request

The skill should route rather than merely suggest when it can safely continue
inside the same agent workflow. It should still stop when the next stage needs
explicit user input, approval, or a decision that cannot be inferred from
project evidence.

Artifact sizing:

- clear small work uses a minimal spec and minimal active ExecPlan
- clear complex work uses a full spec and full active ExecPlan
- rough, untested, or ambiguous work first goes through the missing context
  stage before spec/plan/run

The wrapper should remain thin and continue delegating to the skill.

## Checklist

Spec and plan foundation:

- [x] Update `docs/specs/to-done.md` from fast path to adaptive orchestration.
- [x] Create this active ExecPlan.
- [x] Refresh generated indexes after plan creation.
- [x] Run planning map verification.

Skill behavior:

- [x] Update `skills/to-done/SKILL.md` description, title, core rules, and
  supported forms around the canonical definition:
  `adaptive orchestration from intent to verified done`.
- [x] Replace the eligibility gate with a readiness gate.
- [x] Add explicit routing behavior for `/explore`, `/grill-me`, `/to-spec`,
  `/clarify`, `/to-plan`, and `/run`.
- [x] Require visible stage-transition messages with short reasons.
- [x] Allow complex work when full spec, full plan, and verification coverage
  are required.
- [x] Keep minimal spec and minimal plan only for clear small work.
- [x] Preserve `/run` semantics as the only execution loop.
- [x] Update handoff requirements to report readiness path and stage
  transitions.

Wrapper, docs, and maps:

- [x] Update `commands/to-done.md` wording if needed.
- [x] Update `README.md` and `README.en.md` so `/to-done` is not described only
  as a clear-small-task fast path.
- [x] Update `docs/WORKFLOW.md` to describe adaptive `/to-done` orchestration.
- [x] Update `docs/QUALITY_SCORE.md` when implementation and verification pass.
- [x] Update `docs/records/open-questions.md` consensus if command semantics
  change materially.
- [x] Refresh `docs/generated/repo-map.md`.

Distribution:

- [x] Decide whether this behavior change should bump `package.json`,
  `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and
  `.codex-plugin/plugin.json`.
- [x] If this ships in a package release, bump the version consistently.
- [x] Confirm `npm pack --dry-run` includes the updated skill and command
  wrapper.

Dogfood and verification:

- [x] Check static coverage for clear small work.
- [x] Check static coverage for clear complex work.
- [x] Check static coverage for routing to `/explore`.
- [x] Check static coverage for routing to `/grill-me`.
- [x] Check static coverage for routing to `/to-spec`.
- [x] Check static coverage for routing to `/clarify`.
- [x] Check static coverage for routing to `/to-plan`.
- [x] Check static coverage for delegation to `/run`.
- [x] Run focused package and map verification.
- [x] Review the diff against the updated spec and adjacent command specs.
- [x] Update this plan's Progress Log with verification results and remaining
  blockers.

## Verification

Planning verification:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

Implementation verification:

```bash
test -f commands/to-done.md
test -f skills/to-done/SKILL.md
rg -n "adaptive orchestration from intent to verified done|readiness gate|clear complex|/grill-me|/clarify|stage transition" docs/specs/to-done.md skills/to-done/SKILL.md commands/to-done.md README.md README.en.md docs/WORKFLOW.md
node -c bin/jkit.js
node bin/jkit.js status
./scripts/codex-plugin-check
./scripts/agent-map-check
npm pack --dry-run --json
```

Dogfood coverage should confirm:

- clear small request creates minimal durable artifacts
- clear complex request creates full durable artifacts
- rough direction routes to `/explore`
- selected but untested direction routes to `/grill-me`
- existing ambiguous spec routes to `/clarify`
- plan-ready spec routes to `/to-plan`
- active plan delegates to `/run`
- failed verification is recorded and not reported as done

## Decisions

- 2026-06-08: Complexity is allowed in `/to-done`; unresolved ambiguity is not.
- 2026-06-08: `/to-done` should visibly enter prerequisite stages instead of
  silently acting as a black-box workflow.
- 2026-06-08: Minimal artifacts are reserved for clear small work. Complex work
  requires full artifacts sized to behavior, blast radius, and verification.

## Progress Log

- 2026-06-08: Updated `docs/specs/to-done.md` to define adaptive
  orchestration, readiness routing, complex-work support, stage-transition
  visibility, and minimal-versus-full artifact sizing.
- 2026-06-08: Created this active ExecPlan from the updated spec. Remaining
  work is skill implementation, wrapper/doc/map updates, optional version bump,
  static dogfood coverage, verification, and diff review.
- 2026-06-08: Ran `./scripts/agent-map-generate` and
  `./scripts/agent-map-check`; generated repo map now includes this active
  plan, and the map scaffold check passed.
- 2026-06-08: Aligned the plan with the canonical definition:
  `/to-done is adaptive orchestration from intent to verified done.`
- 2026-06-08: Updated `skills/to-done/SKILL.md`,
  `commands/to-done.md`, README, workflow docs, package/plugin descriptions,
  quality score, and open-question consensus for adaptive orchestration.
- 2026-06-08: Checked npm registry; latest is still `@nobodyjack/jkit@0.9.2`
  and `0.9.3` is unpublished, so this behavior change remains part of the
  local `0.9.3` release candidate rather than bumping to `0.9.4`.
- 2026-06-08: Static dogfood coverage passed for clear small work, clear
  complex work, `/explore`, `/grill-me`, `/to-spec`, `/clarify`, `/to-plan`,
  `/run`, and failed-verification handling. Two initial static coverage
  commands were rerun with single-quoted patterns after shell backtick
  expansion; reruns passed.
- 2026-06-08: Verification passed: `test -f commands/to-done.md`;
  `test -f skills/to-done/SKILL.md`; static coverage scan for adaptive
  orchestration, readiness gate, clear complex routing, `/grill-me`,
  `/clarify`, and stage transitions; `node -e` JSON metadata parse;
  `node -c bin/jkit.js`; `node bin/jkit.js status`;
  `./scripts/codex-plugin-check`; `./scripts/agent-map-check`;
  `npm pack --dry-run --json`; and `git diff --check`. Package dry run
  included the updated `commands/to-done.md` and `skills/to-done/SKILL.md`.
  No verification failures or workflow exceptions remain.
- 2026-06-08: Moved this plan from active to completed, regenerated
  `docs/generated/repo-map.md`, and reran final checks:
  `./scripts/agent-map-check`, `node -c bin/jkit.js`,
  `node bin/jkit.js status`, `./scripts/codex-plugin-check`,
  `npm pack --dry-run --json`, and `git diff --check`; all passed.

## Rollback

Revert this plan and restore `docs/specs/to-done.md` to the prior fast-path
contract. If implementation has begun, also revert `skills/to-done/SKILL.md`,
`commands/to-done.md`, README, workflow docs, generated indexes, metadata,
version bumps, and any quality or record updates made for adaptive
orchestration.
