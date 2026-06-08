# Plan: jkit v2 run execution strategy

## Goal

Update `/run` so the shipped skill follows the `docs/specs/run.md` execution
strategy contract: before implementation it decides whether to use Codex
`/goal` and whether to use subagents, then records that strategy while keeping
the primary `/run` agent responsible for final review, verification, maps, and
handoff.

## Context

- Source spec: `docs/specs/run.md`.
- Current implementation surface:
  - `skills/run/SKILL.md`
  - `commands/run.md`
  - docs/maps that describe `/run` behavior
- The spec now treats Codex `/goal` as an optional runtime capability, not a
  portable requirement.
- The spec now treats subagents as an optional delegation strategy for bounded,
  independent, low-conflict, verifiable work.
- The primary `/run` agent must remain accountable for final integration,
  review, verification, progress log updates, records, generated indexes, and
  completion claims.

## Non-goals

- Do not add new CLI commands.
- Do not implement a runtime-specific Codex `/goal` API.
- Do not require subagents or make them the default.
- Do not change `/to-plan`, `/to-spec`, or `/to-done` behavior beyond any
  needed references to `/run`.
- Do not change package metadata unless verification reveals stale distribution
  metadata.

## Design

Add an execution strategy decision point to `skills/run/SKILL.md` between
active-plan resolution and work-queue execution.

The strategy has two independent facets:

```text
goal tracking: none | Codex /goal
delegation: none | subagent review/investigation | subagent isolated implementation
```

Default for this implementation and for most small plans:

```text
goal tracking: none
delegation: none
```

The skill should document:

- when Codex `/goal` is appropriate
- when Codex `/goal` must not be used
- when subagents can be used for review/investigation
- when subagents can be used for isolated implementation
- when subagents must not be used
- how the selected strategy is recorded in the active plan progress log
- how the primary `/run` agent reviews and verifies subagent outputs

Update the run command wrapper only if its concise checklist would otherwise
misrepresent the new required phase.

## Checklist

- [x] Update `skills/run/SKILL.md` to include the execution strategy gate.
- [x] Update `skills/run/SKILL.md` phase numbering, task tracking, map updates,
  completion protocol, and final response requirements for strategy recording.
- [x] Update `commands/run.md` if needed so wrapper guidance names execution
  strategy selection.
- [x] Update related docs/maps only if they become stale after the skill
  change.
- [x] Refresh generated indexes.
- [x] Review the diff against `docs/specs/run.md` and fix in-scope issues.
- [x] Run verification and record results.
- [x] Move this plan to completed after verification passes.

## Verification

```bash
rg -n "/goal|subagent|execution strategy|strategy" docs/specs/run.md skills/run/SKILL.md commands/run.md
node bin/jkit.js status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

## Decisions

- 2026-06-08: Codex `/goal` and subagent delegation are independent
  execution-strategy facets.
- 2026-06-08: Default execution remains single-agent because `/run` must stay
  portable and predictable.
- 2026-06-08: The primary `/run` agent, not a subagent or Codex goal state,
  owns final review, verification, map updates, and completion claims.
- 2026-06-08: This plan itself will run single-agent with no Codex `/goal` and
  no subagents because the work is a small, tightly coupled skill/docs update.

## Progress Log

- 2026-06-08: Created this active ExecPlan from `docs/specs/run.md` after the
  user requested `/to-plan` and `/run` for Codex `/goal` and subagent strategy
  support.
- 2026-06-08: Execution strategy selected for this run:
  `goal tracking: none`; `delegation: none`. Reason: this is a small,
  tightly-coupled skill/docs update with clear local verification, so Codex
  `/goal` would add runtime-specific state without improving durability, and
  subagents would add coordination risk without useful parallelism.
- 2026-06-08: Updated `skills/run/SKILL.md` with a new execution strategy
  phase, strategy-aware task tracking, subagent output review rules, progress
  log requirements, completion protocol checks, and final response fields.
  Updated `commands/run.md` to name strategy selection in the wrapper. No
  broader docs/maps needed behavior changes beyond generated index refresh.
- 2026-06-08: Review found one in-scope issue: `docs/specs/run.md` completion
  protocol still checked the progress log for checklist/verification fields
  without naming execution strategy. Updated the spec and skill to match.
- 2026-06-08: Verification passed:
  `rg -n "/goal|subagent|execution strategy|strategy" docs/specs/run.md skills/run/SKILL.md commands/run.md`;
  phase/progress-log scans over `docs/specs/run.md` and `skills/run/SKILL.md`;
  `git diff --check`;
  `node bin/jkit.js status` (passed with an existing local Codex symlink
  warning that points to the global npm install);
  `./scripts/codex-plugin-check`;
  `npm pack --dry-run`;
  `./scripts/agent-map-generate`; and
  `./scripts/agent-map-check`.
- 2026-06-08: Final status: all checklist items are complete. Spec updates were
  needed and made in `docs/specs/run.md`. Architecture/design docs and
  playbooks did not need updates. Generated indexes were refreshed after plan
  creation and after moving this plan to completed. No verification failures,
  workflow exceptions, or new open questions were recorded.

## Rollback

Revert the `skills/run/SKILL.md` and `commands/run.md` execution-strategy
changes, revert any related docs/map updates, refresh generated indexes, and
rerun the verification commands.
