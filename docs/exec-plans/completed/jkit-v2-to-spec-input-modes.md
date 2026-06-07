# Plan: jkit v2 to-spec input modes

## Goal

Update `/to-spec` so its supported input model is exactly two modes:
explicit brief, and context mode using current session context plus
repo/project base evidence.

## Context

- Source behavior lives in `docs/specs/to-spec.md`.
- Runtime instructions live in `skills/to-spec/SKILL.md`.
- Command wrapper lives in `commands/to-spec.md`.
- The current conversation clarified that repo/project base is not a third
  input mode; it is supporting evidence used by context mode.

## Non-goals

- Do not change `/to-plan`, `/run`, or `/to-done` semantics.
- Do not add new commands.
- Do not change installer or package metadata.

## Design

Represent `/to-spec` input modes as:

```text
1. Explicit brief
2. Context + project base
```

Explicit brief wins when supplied. Context mode is used when no brief is
supplied; it infers the requested behavior from current session context and
repo/project base evidence. Inferred facts must be marked `[ASSUMED]` unless
directly evidenced. Consequential uncertainty must be asked or marked
`[NEEDS_INVESTIGATION]`.

## Checklist

- [x] Update `docs/specs/to-spec.md` command behavior and intake phases.
- [x] Update `skills/to-spec/SKILL.md` supported forms and intake phases.
- [x] Update `commands/to-spec.md` wrapper.
- [x] Run focused wording checks.
- [x] Run generated-index and map verification.
- [x] Run package verification because a shipped skill/command wrapper changed.
- [x] Review the diff and move this plan to completed when verified.

## Verification

```bash
rg -n "Explicit brief|Context \\+ project base|Input modes|repo/project base|\\[ASSUMED\\]|\\[NEEDS_INVESTIGATION\\]" docs/specs/to-spec.md skills/to-spec/SKILL.md commands/to-spec.md
./scripts/agent-map-generate
./scripts/agent-map-check
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
```

## Decisions

- 2026-06-06: `/to-spec` has two input modes, not three. Repo/project base is
  supporting evidence for both modes, especially context mode.
- 2026-06-06: Context mode may infer behavior only from current session context
  plus repo/project base evidence, and must mark assumptions or blockers.

## Progress Log

- 2026-06-06: Created this fast-path plan from current-session context via
  `/to-done`. Implementation and verification remain pending.
- 2026-06-06: Updated `/to-spec` to define exactly two input modes: explicit
  brief, and context + project base. Updated the runtime skill and command
  wrapper to say repo/project base is supporting evidence, not a third input
  mode, and to require `[ASSUMED]` or `[NEEDS_INVESTIGATION]` for inferred
  facts and consequential uncertainty.
- 2026-06-06: Verification passed:
  `rg -n "Explicit brief|Context \\+ project base|Input modes|repo/project base|\\[ASSUMED\\]|\\[NEEDS_INVESTIGATION\\]" docs/specs/to-spec.md skills/to-spec/SKILL.md commands/to-spec.md`,
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`,
  `node bin/jkit.js status`, `node bin/jkit.js install --silent-if-not-global`,
  and `npm pack --dry-run`. No verification failures or workflow exceptions
  were recorded. No package metadata, architecture/design docs, playbooks, or
  new open questions were needed.

## Rollback

Restore the prior `/to-spec` supported forms and intake wording in
`docs/specs/to-spec.md`, `skills/to-spec/SKILL.md`, and `commands/to-spec.md`,
then delete this plan.
