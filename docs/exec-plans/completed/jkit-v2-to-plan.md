# Plan: jkit v2 to-plan

## Goal

Ship `/to-plan` as the jkit v2 planning command that turns a reviewable spec
into an active ExecPlan with a scoped design, dependency-ordered Checklist,
Verification Loop, progress log, and rollback path that `/run` can execute.

## Context

- Read `AGENTS.md` first for repository routing and done criteria.
- Read `agent-map.yaml` for configured specs, plans, records, commands, and
  update rules.
- Read `docs/WORKFLOW.md` for the standard task flow.
- Read `docs/PLANS.md` for the required ExecPlan shape.
- Read `docs/specs/to-plan.md` for the command behavior contract.
- Read `docs/specs/to-spec.md` and `docs/specs/run.md` for adjacent command
  boundaries.
- Existing shipped commands before this plan were `/map-init`, `/to-spec`, and
  `/run`.
- New command behavior starts in `docs/specs/`, then an active ExecPlan, then
  implementation through `/run`.
- Preserve the existing dirty worktree. Many v2 reset files are untracked or
  modified; do not revert unrelated changes.

## Non-goals

- Do not change `/to-spec` semantics except for documentation references needed
  to point at `/to-plan`.
- Do not change `/run` execution semantics unless the `/to-plan` spec exposes a
  direct mismatch.
- Do not implement `/map-repair`.
- Do not add Codex-compatible skill distribution until that open question is
  resolved.

## Design

`/to-plan` should mirror the existing plugin command pattern and be implemented
as a Claude Code skill plus a lightweight command wrapper:

- `docs/specs/to-plan.md` is the source behavior contract.
- `skills/to-plan/SKILL.md` contains the agent workflow for resolving a spec,
  validating plannability, creating or updating an active ExecPlan, and
  updating maps.
- `commands/to-plan.md` is the wrapper that invokes the skill.
- `bin/jkit.js` must include `to-plan` in the installed skill list.
- README, package metadata, plugin metadata, and generated indexes must include
  the new command once implemented.

The command should preserve the boundary between artifacts:

- spec: what behavior should exist and how acceptance is judged
- plan: how implementation will be delivered and verified
- run: implementation, review, repair, verification, and progress updates

The skill should be operational, not just descriptive. It should tell the agent
which files to read, how to resolve specs and active plans, how to decide
whether a spec is plannable, how to avoid duplicate active plans, how to write
the required ExecPlan shape, when to update records, and what to report in the
handoff.

The wrapper should stay small and delegate to the skill, matching
`commands/to-spec.md` and `commands/run.md`.

## Checklist

Spec and plan foundation:

- [x] Draft `docs/specs/to-plan.md`.
- [x] Add `to-plan.md` to `docs/specs/index.md`.
- [x] Record the initial `/to-plan` specified-before-implementation state.
- [x] Refresh generated indexes for the spec/plan phase.
- [x] Run planning map verification.

Skill and wrapper implementation:

- [x] Create `skills/to-plan/SKILL.md` with metadata, supported forms, core
  rules, required phases, plan template, plannability checks, update-map rules,
  and final handoff requirements.
- [x] Ensure the skill refuses to plan specs with blocking
  `[NEEDS_INVESTIGATION]` items and records the blocker instead of inventing
  behavior.
- [x] Ensure the skill creates or updates exactly one active plan by default
  and preserves completed checklist items when updating an existing plan.
- [x] Create `commands/to-plan.md` as the plugin command wrapper that delegates
  to the skill and summarizes the artifact expectations.

Distribution surfaces:

- [x] Add `to-plan` to `bin/jkit.js` skill installation/status handling.
- [x] Update `.claude-plugin/plugin.json` and
  `.claude-plugin/marketplace.json` so packaged plugin metadata names the new
  command or current shipped command set correctly.
- [x] Update `package.json` version or metadata if this release should publish
  `/to-plan` as a shipped command.
- [x] Confirm `npm pack --dry-run` includes `commands/to-plan.md` and
  `skills/to-plan/SKILL.md`.

Docs and maps:

- [x] Update `README.md` to list `/to-plan` in the v2 workflow and shipped
  commands.
- [x] Update `AGENTS.md` only if the short agent map needs to route planning
  work differently.
- [x] Update `docs/WORKFLOW.md` only if `/to-plan` changes the standard flow
  wording.
- [x] Update `agent-map.yaml` to include a `to_plan` command entry and any
  relevant update rules once the command is implemented.
- [x] Update `docs/records/open-questions.md` consensus when `/to-plan` is
  implemented.

Dogfood and verification:

- [x] Dogfood the `/to-plan` workflow by updating this plan while active from
  `docs/specs/to-plan.md` without creating a duplicate active plan.
- [x] Dogfood the blocking-question path with a temporary or controlled spec
  fixture, then remove the fixture or record why it remains.
- [x] Refresh generated indexes after implementation.
- [x] Run focused assertions that `to-plan` appears in the expected skill,
  command, installer, docs, metadata, and generated-map surfaces.
- [x] Run package, map, installer, and distribution verification.
- [x] Review the diff against `docs/specs/to-plan.md`,
  `docs/specs/to-spec.md`, `docs/specs/run.md`, and `docs/PLANS.md`; fix
  in-scope issues before handoff.
- [x] Update this plan's Progress Log with completed checklist items,
  verification commands/results, failures or exceptions, doc-update decisions,
  generated-index status, and new open questions.

## Verification

Planning/spec verification:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

Implementation verification after skill and command wrapper changes:

```bash
test -f commands/to-plan.md
test -f skills/to-plan/SKILL.md
rg -n "to-plan" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood verification:

- Use `/to-plan` behavior to create or update one active ExecPlan from a spec.
- Confirm the produced plan uses `## Checklist`.
- Confirm the produced plan contains a Verification Loop that `/run` can
  execute without chat history.
- Confirm a blocking `[NEEDS_INVESTIGATION]` prevents plan creation.
- Confirm the dogfood flow updates the existing active plan instead of creating
  a duplicate for `docs/specs/to-plan.md`.

## Decisions

- 2026-06-06: `/to-plan` plans from a plannable spec; it does not write product
  requirements or implement code.
- 2026-06-06: ExecPlans use `## Checklist` because `/run` consumes checklist
  items as the execution queue.
- 2026-06-06: A plannable draft spec is enough for `/to-plan`; explicit spec
  acceptance is optional unless the user or repository requires it.
- 2026-06-06: One spec maps to one active plan by default; broad specs should be
  split before planning.
- 2026-06-06: The `/to-plan` implementation plan can move to completed only
  after the skill, wrapper, dogfood, map updates, and verification pass.

## Progress Log

- 2026-06-06: Drafted `docs/specs/to-plan.md`, updated the specs index, and
  recorded the initial specified-before-implementation state. Remaining work
  was skill/wrapper implementation, distribution updates, dogfood,
  verification, and final review.
- 2026-06-06: Ran `./scripts/agent-map-generate` and
  `./scripts/agent-map-check`; generated repo map refreshed and map check
  passed. Package/distribution verification remains pending until the command
  skill and wrapper are implemented.
- 2026-06-06: Expanded the active ExecPlan into a `/run`-ready checklist with
  separate skill, wrapper, distribution, docs/maps, dogfood, verification, and
  review items.
- 2026-06-06: Implemented `skills/to-plan/SKILL.md` and
  `commands/to-plan.md`; updated `bin/jkit.js`, README, AGENTS, workflow docs,
  `agent-map.yaml`, open-question records, package metadata, and Claude plugin
  metadata for shipped `/to-plan` behavior. Bumped package/plugin version to
  `0.4.0`.
- 2026-06-06: Dogfooded plan reuse by updating this plan while active from
  `docs/specs/to-plan.md` without creating a duplicate active plan. Dogfooded
  the blocking-question path against `docs/specs/map-init-dry-run.md`; its
  unresolved output-format and `--apply` handoff questions block planning, so
  no dry-run ExecPlan was created.
- 2026-06-06: Verification passed:
  `test -f commands/to-plan.md && test -f skills/to-plan/SKILL.md`;
  `rg -n "to-plan" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json`;
  JSON metadata parse for `package.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json`; `./scripts/agent-map-generate`;
  `node bin/jkit.js status`; `node bin/jkit.js install --silent-if-not-global`;
  `npm pack --dry-run`; and `./scripts/agent-map-check`. No verification
  failures or workflow exceptions were recorded. Specs did not need behavior
  updates; architecture/design docs and playbooks did not need updates;
  generated indexes were refreshed; no new open questions appeared.
- 2026-06-06: Moved this plan from active to completed after all checklist
  items passed. Refreshed `docs/generated/repo-map.md`, reran
  `./scripts/agent-map-check`, reran stale `/to-plan` not-implemented wording
  scan, and reran `npm pack --dry-run`; all passed. The only remaining
  `/to-plan` non-implementation wording is historical context in the completed
  `/to-spec` plan.

## Rollback

Remove `docs/specs/to-plan.md`, remove its entry from `docs/specs/index.md`,
remove the `/to-plan` consensus note from `docs/records/open-questions.md`, and
delete this completed plan. If implementation has started, also remove
`skills/to-plan/`, `commands/to-plan.md`, installer entries, metadata updates,
and generated index changes.
