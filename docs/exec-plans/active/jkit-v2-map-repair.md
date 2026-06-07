# Plan: jkit v2 map-repair

> Status: active
> Spec: `docs/specs/map-repair.md`
> Scope: implement `/map-repair` as the agent-map recovery command

## Goal

Ship `/map-repair` as the jkit v2 recovery command that repairs existing
repository agent maps from project base facts, records unknowns instead of
inventing them, refreshes generated indexes when needed, and verifies the map
harness before handoff.

## Context

- Read `AGENTS.md` first for repository routing and done criteria.
- Read `agent-map.yaml` for configured specs, plans, records, commands, and
  update rules.
- Read `docs/WORKFLOW.md` for the standard jkit flow.
- Read `docs/PLANS.md` for required ExecPlan shape.
- Read `docs/specs/map-repair.md` for the command behavior contract.
- Read `docs/specs/map-init.md` and `docs/specs/run.md` for adjacent command
  boundaries.
- Current shipped commands are `/map-init`, `/explore`, `/grill-me`,
  `/clarify`, `/to-spec`, `/to-plan`, `/to-done`, and `/run`; `/map-repair`
  is specified but not implemented.
- Preserve the existing dirty worktree. Many v2 reset files are untracked or
  modified; do not revert unrelated changes.

## Non-goals

- Do not broaden `/map-repair` into feature implementation, planning, or normal
  active-plan execution.
- Do not add a dry-run/report mode in the first implementation.
- Do not make `/map-repair` initialize a missing map; it should suggest
  `/map-init`.
- Do not update active ExecPlan completion state unless durable verification
  evidence proves the status.
- Do not change Codex or Claude plugin distribution surfaces unless the
  `/map-repair` implementation requires matching metadata updates.

## Design

`/map-repair` should follow the existing shipped command pattern:

- `docs/specs/map-repair.md` is the source behavior contract.
- `skills/map-repair/SKILL.md` contains the repair workflow: orient, gather
  project base facts, compare maps against facts, classify findings, apply
  evidence-backed repairs, verify, and hand off.
- `commands/map-repair.md` delegates to the skill and summarizes the
  user-facing contract.
- `bin/jkit.js` must include `map-repair` in the installed skill list once the
  command ships.
- README, AGENTS, `agent-map.yaml`, package metadata, Claude plugin metadata,
  quality score, records, and generated indexes must reflect the shipped
  command after implementation.

The skill should be conservative. It may edit map surfaces such as `AGENTS.md`,
`agent-map.yaml`, docs indexes, workflow docs, records, generated indexes, and
plan progress logs only when local project evidence supports the repair. It
must record `[ASSUMED]` and `[NEEDS_INVESTIGATION]` instead of making
unsupported claims.

First-version behavior is the default repair flow only. A future dry-run mode
can be specified later if needed.

## Checklist

Spec and plan foundation:

- [x] Draft `docs/specs/map-repair.md`.
- [x] Add `map-repair.md` to `docs/specs/index.md`.
- [x] Resolve the previous project-level question so `/map-repair` is the next
  recovery command shape, not dogfooding automation.
- [x] Refresh generated indexes for the spec phase.
- [x] Run spec-phase map and package verification.
- [x] Create this active ExecPlan from `docs/specs/map-repair.md`.
- [x] Refresh generated indexes for the plan phase.
- [x] Run planning map, installer, and package verification.

Skill and wrapper implementation:

- [ ] Create `skills/map-repair/SKILL.md` with metadata, supported form,
  allowed tools, core rules, stop conditions, required phases, verification
  loop, and final handoff requirements.
- [ ] Encode the project-base-facts boundary: local repo evidence first,
  unknowns recorded, no speculative product or architecture facts.
- [ ] Encode finding classification as `repairable`, `unknown`,
  `out-of-scope`, or `blocked`.
- [ ] Encode allowed repair surfaces and explicitly block unrelated source,
  product, or command implementation changes.
- [ ] Create `commands/map-repair.md` as the plugin command wrapper.

Distribution surfaces:

- [ ] Add `map-repair` to `bin/jkit.js` skill installation/status handling.
- [ ] Update `.claude-plugin/plugin.json` and
  `.claude-plugin/marketplace.json` for the shipped command set.
- [ ] Update `package.json` version or metadata if this release ships
  `/map-repair`.
- [ ] Confirm `npm pack --dry-run` includes `commands/map-repair.md` and
  `skills/map-repair/SKILL.md`.

Docs and maps:

- [ ] Update `README.md` so `/map-repair` is listed as shipped only after the
  skill and wrapper exist.
- [ ] Update `AGENTS.md` project shape and task routing when `/map-repair`
  ships.
- [ ] Update `docs/WORKFLOW.md` to describe `/map-repair` as the recovery path
  for maps that drifted from project facts.
- [ ] Update `agent-map.yaml` to include `map_repair` only after implementation
  exists.
- [ ] Update `docs/records/open-questions.md` consensus when `/map-repair`
  ships.
- [ ] Update `docs/QUALITY_SCORE.md` from "specified but not implemented" to
  the verified implementation state.
- [ ] Refresh generated indexes after implementation.

Dogfood and verification:

- [ ] Dogfood the no-map stop path in a controlled temporary fixture.
- [ ] Dogfood stale map repair against a controlled local map fixture or a
  narrow real repository-map inconsistency.
- [ ] Dogfood unknown preservation by confirming unresolved facts are recorded
  rather than invented.
- [ ] Dogfood generated-index refresh when map or docs layout changes.
- [ ] Run focused assertions that `map-repair` appears in the expected skill,
  command, installer, docs, metadata, and generated-map surfaces.
- [ ] Run package, map, installer, and distribution verification.
- [ ] Review the diff against `docs/specs/map-repair.md`,
  `docs/specs/map-init.md`, `docs/specs/run.md`, and `docs/WORKFLOW.md`; fix
  in-scope issues before handoff.
- [ ] Update this plan's Progress Log with checklist status, verification
  commands/results, failures or exceptions, doc-update decisions,
  generated-index status, and new open questions.

## Verification

Planning verification:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
npm pack --dry-run
```

Implementation verification after skill and command wrapper changes:

```bash
test -f commands/map-repair.md
test -f skills/map-repair/SKILL.md
rg -n "map-repair" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node -c bin/jkit.js
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood verification:

- Use a controlled temporary repository without an agent map and confirm the
  skill stops and suggests `/map-init`.
- Use a controlled map inconsistency and confirm the skill repairs only
  evidence-backed map fields.
- Use a missing or conflicting fact and confirm it is recorded as
  `[NEEDS_INVESTIGATION]` or `[ASSUMED]`.
- Confirm generated indexes refresh when map or docs layout changes.
- Confirm failed verification is recorded and not reported as repaired.

## Decisions

- 2026-06-06: `/map-repair` is the next recovery command shape; dogfooding
  automation is not needed for this slice.
- 2026-06-06: The first implementation will ship the default repair flow only;
  dry-run/report mode remains future work unless a new spec changes that.
- 2026-06-06: `/map-repair` may update active plan progress logs only when
  durable local evidence proves the status; otherwise it should record a
  workflow exception or open question.
- 2026-06-06: The source of truth for repairs is the project base, not chat
  context or speculative product assumptions.
- 2026-06-06: `docs/specs/map-repair.md` is plannable. Its open questions are
  non-blocking because this plan chooses conservative first-version defaults.

## Progress Log

- 2026-06-06: Drafted `docs/specs/map-repair.md`, added it to the specs index,
  resolved the prior project-level `/map-repair` versus dogfooding automation
  question, updated quality score to "specified but not implemented", refreshed
  generated indexes, and ran spec-phase verification:
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`,
  `node bin/jkit.js status`, and `npm pack --dry-run` all passed.
- 2026-06-06: Created this active ExecPlan from `docs/specs/map-repair.md`.
  The plan covers skill and wrapper implementation, distribution surfaces,
  docs/maps, dogfood fixtures, verification, diff review, progress logging,
  and rollback. No implementation has started.
- 2026-06-06: Planning verification passed after plan creation:
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`,
  `node bin/jkit.js status`, and `npm pack --dry-run`. `npm pack --dry-run`
  confirmed `docs/exec-plans/active/jkit-v2-map-repair.md` and
  `docs/specs/map-repair.md` are included in the package. No verification
  failures or workflow exceptions were recorded; generated indexes were
  refreshed.
- 2026-06-06: Refreshed `docs/specs/map-repair.md` to match the current
  shipped command set, including `/explore`, `/grill-me`, and `/clarify`.
  Updated this plan's context and implementation verification notes to match
  the refreshed spec.

## Rollback

Before implementation starts, remove this active plan to abandon planning.

After implementation starts, remove `skills/map-repair/`,
`commands/map-repair.md`, the `map-repair` installer entry, README/AGENTS/map
mentions that present it as shipped, package/plugin metadata updates, and any
generated-index changes. Preserve `docs/specs/map-repair.md` unless the user
explicitly abandons the command spec too.
