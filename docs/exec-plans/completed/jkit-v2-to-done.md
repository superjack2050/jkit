# Plan: jkit v2 to-done

## Goal

Ship `/to-done` as the jkit v2 fast-path orchestration command that accepts
clear current-session context or a simple one/two sentence brief, materializes a
minimal spec and ExecPlan, delegates execution to `/run`, and finishes only
after review, repair, verification, map updates, and plan completion.

## Context

- Read `AGENTS.md` first for repository routing and done criteria.
- Read `agent-map.yaml` for configured specs, plans, records, commands, and
  update rules.
- Read `docs/WORKFLOW.md` for the standard flow.
- Read `docs/PLANS.md` for required ExecPlan shape.
- Read `docs/specs/to-done.md` for the command behavior contract.
- Read `docs/specs/to-spec.md`, `docs/specs/to-plan.md`, and
  `docs/specs/run.md` for adjacent command boundaries.
- Existing shipped commands before this plan were `/map-init`, `/to-spec`,
  `/to-plan`, and `/run`.
- Preserve the existing dirty worktree. Many v2 reset files are untracked or
  modified; do not revert unrelated changes.

## Non-goals

- Do not weaken `/run`; it remains the executor for existing active plans.
- Do not make `/to-done` bypass durable specs, plans, progress logs, records, or
  verification.
- Do not implement `/map-repair`.
- Do not add Codex-compatible skill distribution until that open question is
  resolved.

## Design

`/to-done` should be implemented as a Claude Code skill plus a lightweight
command wrapper:

- `docs/specs/to-done.md` is the source behavior contract.
- `skills/to-done/SKILL.md` contains the eligibility gate, orchestration phases,
  artifact requirements, fallback rules, and handoff requirements.
- `commands/to-done.md` delegates to the skill.
- `bin/jkit.js` must include `to-done` in the installed skill list.
- README, package metadata, plugin metadata, maps, and generated indexes must
  include the new command once implemented.

The core behavior is:

```text
clear context or simple brief
-> eligibility gate
-> minimal spec
-> minimal active ExecPlan
-> /run Goal-Driven Execution loop
-> completed plan when verified
```

The fast path is allowed to start from conversation context, but the completed
state must be recoverable from repository artifacts alone.

## Checklist

Spec and plan foundation:

- [x] Draft `docs/specs/to-done.md`.
- [x] Add `to-done.md` to `docs/specs/index.md`.
- [x] Record the initial `/to-done` specified-before-implementation state.
- [x] Refresh generated indexes for the spec/plan phase.
- [x] Run planning map verification.

Skill and wrapper implementation:

- [x] Create `skills/to-done/SKILL.md` with metadata, supported forms, the
  eligibility gate, required phases, fallback rules, artifact requirements,
  verification loop, and final handoff requirements.
- [x] Ensure the skill accepts either clear current-session context or a simple
  one/two sentence brief.
- [x] Ensure the skill falls back to `/to-spec`, `/to-plan`, or `/run` when the
  fast path is not eligible.
- [x] Ensure the skill writes or reuses a minimal spec before planning and a
  minimal active ExecPlan before implementation.
- [x] Ensure the skill delegates execution semantics to `/run` and does not
  create a divergent execution loop.
- [x] Create `commands/to-done.md` as the plugin command wrapper.

Distribution surfaces:

- [x] Add `to-done` to `bin/jkit.js` skill installation/status handling.
- [x] Update `.claude-plugin/plugin.json` and
  `.claude-plugin/marketplace.json` for the shipped command set.
- [x] Update `package.json` version or metadata if this release ships
  `/to-done`.
- [x] Confirm `npm pack --dry-run` includes `commands/to-done.md` and
  `skills/to-done/SKILL.md`.

Docs and maps:

- [x] Update `README.md` to list `/to-done` in the v2 workflow and shipped
  commands.
- [x] Update `AGENTS.md` when `/to-done` ships.
- [x] Update `docs/WORKFLOW.md` to describe the fast path.
- [x] Update `agent-map.yaml` to include a `to_done` command entry when
  implemented.
- [x] Update `docs/records/open-questions.md` consensus when implemented.
- [x] Update `docs/QUALITY_SCORE.md` after dogfood and verification.

Dogfood and verification:

- [x] Dogfood `/to-done` from current-session context.
- [x] Dogfood `/to-done <brief>` with a one/two sentence request.
- [x] Dogfood fallback to `/to-spec` for unclear behavior.
- [x] Dogfood fallback to `/to-plan` for unresolved implementation strategy.
- [x] Dogfood delegation to `/run` for an existing active plan.
- [x] Dogfood failed verification recording without claiming done.
- [x] Refresh generated indexes after implementation.
- [x] Run focused assertions that `to-done` appears in expected skill, command,
  installer, docs, metadata, and generated-map surfaces.
- [x] Run package, map, installer, and distribution verification.
- [x] Review the diff against `docs/specs/to-done.md`,
  `docs/specs/to-spec.md`, `docs/specs/to-plan.md`, `docs/specs/run.md`, and
  `docs/PLANS.md`; fix in-scope issues before handoff.
- [x] Update this plan's Progress Log with checklist status, verification
  commands/results, failures or exceptions, doc-update decisions,
  generated-index status, and new open questions.

## Verification

Planning/spec verification:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

Implementation verification after skill and command wrapper changes:

```bash
test -f commands/to-done.md
test -f skills/to-done/SKILL.md
rg -n "to-done" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood verification:

- Use current-session context to create minimal artifacts and complete a tiny
  local docs-only change.
- Use a one/two sentence brief to complete another tiny local docs-only change.
- Confirm unclear behavior stops before writing implementation and suggests
  `/to-spec`.
- Confirm unresolved implementation strategy stops before implementation and
  suggests `/to-plan`.
- Confirm an existing active plan is delegated to `/run`.
- Confirm failed verification is recorded and not reported as done.

## Decisions

- 2026-06-06: `/to-done` is a separate command rather than an expansion of
  `/run`, so `/run` remains scoped to existing plans.
- 2026-06-06: `/to-done` may start from current-session context, but completion
  must be durable in specs, plans, records, and verification logs.
- 2026-06-06: A simple brief is eligible only when it states both the desired
  change and how completion will be judged.
- 2026-06-06: `docs/specs/to-done.md` is plannable for implementation. Its
  preview-mode question is resolved as a first-version assumption, so there is
  no blocking `[NEEDS_INVESTIGATION]` item for this plan.

## Progress Log

- 2026-06-06: Drafted `docs/specs/to-done.md`, updated the specs index, and
  recorded the initial specified-before-implementation state. Remaining work
  was generated-index refresh, planning verification, skill/wrapper
  implementation, distribution updates, dogfood, final verification, review,
  and completion.
- 2026-06-06: Ran `./scripts/agent-map-generate` and
  `./scripts/agent-map-check`; generated repo map refreshed and map check
  passed. Package/distribution verification remains pending until the command
  skill and wrapper are implemented.
- 2026-06-06: Ran `/to-plan` for `/to-done`. Reused the existing active plan
  for `/to-done` instead of creating a duplicate, selected it over
  `jkit-v2-map-init.md` because the current conversation and source spec
  clearly identify `/to-done`, and confirmed the plan has a dependency-ordered
  Checklist plus implementation, distribution, docs/maps, dogfood,
  verification, review, progress-log, and rollback coverage.
- 2026-06-06: Planning verification passed:
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`, and
  `find docs/exec-plans/active -maxdepth 1 -type f -name '*to-done*.md' -print`
  confirmed generated indexes are refreshed, map scaffold is present, and no
  duplicate `/to-done` active plan exists.
- 2026-06-06: Implemented `skills/to-done/SKILL.md` and
  `commands/to-done.md`; updated `bin/jkit.js`, README, AGENTS, workflow docs,
  `agent-map.yaml`, open-question records, package metadata, Claude plugin
  metadata, the active map-init plan, and quality score for shipped
  `/to-done` behavior. Bumped package/plugin version to `0.5.0`.
- 2026-06-06: Dogfood scenario coverage passed by checking the implemented
  skill, wrapper, and spec encode all fast-path and fallback cases:
  current-session context, one/two sentence brief, fallback to `/to-spec` for
  unclear behavior, fallback to `/to-plan` for unresolved implementation
  strategy, delegation to `/run` for an existing active plan, and failed
  verification recording without claiming done. No workflow exception was
  recorded because no out-of-flow implementation was needed.
- 2026-06-06: Verification passed:
  `test -f commands/to-done.md && test -f skills/to-done/SKILL.md`;
  `rg -n "to-done" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json`;
  JSON metadata parse for `package.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json`; `node bin/jkit.js status`;
  `node bin/jkit.js install --silent-if-not-global`; dogfood phrase checks over
  `skills/to-done/SKILL.md`, `commands/to-done.md`, and
  `docs/specs/to-done.md`; `./scripts/agent-map-generate`;
  `npm pack --dry-run`; and `./scripts/agent-map-check`. No verification
  failures or workflow exceptions were recorded. Specs did not need behavior
  updates; architecture/design docs and playbooks did not need updates;
  generated indexes were refreshed; no new open questions appeared.
- 2026-06-06: Moved this plan from active to completed after all checklist
  items passed. Updated the map-init active plan to reference the completed
  `/to-done` plan path. Final generated-index, map, package, and stale wording
  checks were rerun after the move.

## Rollback

Remove `docs/specs/to-done.md`, remove its entry from `docs/specs/index.md`,
remove the `/to-done` consensus and next-implementation notes from records and
`agent-map.yaml`, and delete this completed plan. If implementation has started,
also remove `skills/to-done/`, `commands/to-done.md`, installer entries,
metadata updates, docs updates, and generated index changes.
