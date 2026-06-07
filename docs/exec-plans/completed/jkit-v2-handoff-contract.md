# Plan: jkit v2 handoff contract

## Goal

Make `/to-spec` and `/to-plan` handoffs explicit, short, structured, and
recoverable so either stage can safely end a session and the next agent can
continue without chat history.

## Context

- Source behavior exists in `docs/specs/to-spec.md` and
  `docs/specs/to-plan.md`.
- Runtime instructions live in `skills/to-spec/SKILL.md` and
  `skills/to-plan/SKILL.md`.
- Command wrappers live in `commands/to-spec.md` and `commands/to-plan.md`.
- The current conversation agreed both stages should have handoffs:
  `/to-spec` hands off a behavior contract ready for planning, and `/to-plan`
  hands off an execution entry ready for `/run`.

## Non-goals

- Do not change `/run` execution semantics.
- Do not implement a new command.
- Do not change package metadata or installer surfaces.

## Design

Use one shared shape for both command handoffs:

```text
Artifact
Readiness
Next command
```

`/to-spec` reports the spec artifact, whether it is ready for `/to-plan`, and
the next planning command. `/to-plan` reports the plan artifact, whether it is
ready for `/run`, and the next execution command.

## Checklist

- [x] Update `docs/specs/to-spec.md` handoff contract.
- [x] Update `docs/specs/to-plan.md` handoff contract.
- [x] Update `skills/to-spec/SKILL.md` handoff instructions.
- [x] Update `skills/to-plan/SKILL.md` handoff instructions.
- [x] Update `commands/to-spec.md` and `commands/to-plan.md` wrappers.
- [x] Run map verification and refresh generated indexes if needed.
- [x] Review the diff and move this plan to completed when verified.

## Verification

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
rg -n "Artifact|Readiness|Next command" docs/specs/to-spec.md docs/specs/to-plan.md skills/to-spec/SKILL.md skills/to-plan/SKILL.md commands/to-spec.md commands/to-plan.md
```

## Decisions

- 2026-06-06: `/to-spec` and `/to-plan` both require handoffs because either
  can be a valid session boundary.
- 2026-06-06: Handoffs use `Artifact`, `Readiness`, and `Next command` so they
  stay short and recoverable.

## Progress Log

- 2026-06-06: Created this fast-path plan from current-session context via
  `/to-done`. Implementation and verification remain pending.
- 2026-06-06: Implemented the shared handoff shape in specs, skills, and
  wrappers. `/to-spec` now hands off `spec is ready for planning`; `/to-plan`
  now hands off `plan is ready for execution`; both use `Artifact`,
  `Readiness`, and `Next command`.
- 2026-06-06: Verification passed:
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`,
  `rg -n "Artifact|Readiness|Next command" docs/specs/to-spec.md docs/specs/to-plan.md skills/to-spec/SKILL.md skills/to-plan/SKILL.md commands/to-spec.md commands/to-plan.md`,
  `node bin/jkit.js status`, `node bin/jkit.js install --silent-if-not-global`,
  and `npm pack --dry-run`. No verification failures or workflow exceptions
  were recorded.
- 2026-06-06: Moved this plan from active to completed, refreshed generated
  indexes, and reran map verification.

## Rollback

Restore the prior handoff bullet lists in `docs/specs/to-spec.md`,
`docs/specs/to-plan.md`, `skills/to-spec/SKILL.md`, `skills/to-plan/SKILL.md`,
`commands/to-spec.md`, and `commands/to-plan.md`, then delete this plan.
