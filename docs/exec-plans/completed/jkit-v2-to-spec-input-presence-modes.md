# ExecPlan: to-spec input presence modes

> Status: completed
> Created: 2026-06-06
> Spec: docs/specs/to-spec.md

## Goal

Update `/to-spec` so its supported input model is exactly two modes based on
whether explicit user input is supplied:

1. No-input mode
2. Input mode

Both modes must use current session context and repo/project base as evidence.
Repo/project base is supporting evidence, not a standalone input mode.

## Scope

In scope:

- Update the canonical `/to-spec` spec.
- Update the runtime `to-spec` skill.
- Update the plugin command wrapper.
- Refresh generated indexes and package checks.

Out of scope:

- Change `/to-plan`, `/to-done`, or `/run` behavior.
- Add new command flags.
- Change installer package structure.

## Design

`/to-spec` resolves input mode by input presence:

- No-input mode: no explicit input is supplied. Current session context is the
  primary signal. Repo/project base provides supporting evidence, boundaries,
  vocabulary, and low-risk details.
- Input mode: explicit input is supplied in the command or surrounding message.
  Explicit user input is the primary signal. Current session context and
  repo/project base provide supporting evidence.

In both modes, explicit input wins over conflicting inferred context when it is
present. Inferred low-risk facts remain tagged `[ASSUMED]`; consequential
uncertainty remains asked or tagged `[NEEDS_INVESTIGATION]`.

## Checklist

- [x] Update `docs/specs/to-spec.md`.
- [x] Update `skills/to-spec/SKILL.md`.
- [x] Update `commands/to-spec.md`.
- [x] Run focused stale-wording checks.
- [x] Refresh generated indexes.
- [x] Run required verification commands.
- [x] Record verification, failures, and docs-update decisions.
- [x] Move this ExecPlan to completed.

## Progress Log

- 2026-06-06: Captured the corrected requirement from the session: the two
  modes are no-input mode and input mode. Both combine current session context
  with repo/project base evidence.
- 2026-06-06: Updated the canonical spec, runtime skill, and command wrapper to
  use the input-presence model.
- 2026-06-06: Updated README and the active map-init plan summary so current
  command descriptions match the input-presence model.
- 2026-06-06: Refreshed generated indexes and completed verification.

## Milestone Status

- Current milestone: input model correction
- Status: implementation and verification complete; ready to archive

## Verification

Completed:

- `rg -n "No-input mode|Input mode|explicit input|current session context|repo/project base|supporting evidence|Explicit input wins|\[ASSUMED\]|\[NEEDS_INVESTIGATION\]" docs/specs/to-spec.md skills/to-spec/SKILL.md commands/to-spec.md docs/exec-plans/active/jkit-v2-to-spec-input-presence-modes.md README.md docs/exec-plans/active/jkit-v2-map-init.md` - passed; new model present.
- `rg -n "Explicit brief|Context \+ project base|explicit brief mode|context \+ project base mode|<brief>" docs/specs/to-spec.md skills/to-spec/SKILL.md commands/to-spec.md docs/exec-plans/active/jkit-v2-to-spec-input-presence-modes.md README.md docs/exec-plans/active/jkit-v2-map-init.md` - passed; no current-target stale wording.
- `rg -n "to-spec.*brief|brief.*to-spec" README.md docs/specs/to-spec.md skills/to-spec/SKILL.md commands/to-spec.md docs/exec-plans/active` - passed; no current active/user-facing stale wording.
- `./scripts/agent-map-generate` - passed; generated `docs/generated/repo-map.md`.
- `./scripts/agent-map-check` - passed.
- `node bin/jkit.js status` - passed; reported shipped skills as not installed in `~/.claude/skills`.
- `node bin/jkit.js install --silent-if-not-global` - passed.
- `npm pack --dry-run` - passed; tarball includes `commands/to-spec.md` and `skills/to-spec/SKILL.md`.

## Failures Or Exceptions

- None.

## Docs And Generated Indexes

- Spec update needed: yes, completed in `docs/specs/to-spec.md`.
- Architecture/design docs update needed: no.
- Playbook update needed: no.
- Generated indexes refresh needed: yes, completed.
- New open question: no.
