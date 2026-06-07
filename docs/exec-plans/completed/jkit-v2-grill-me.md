# Plan: jkit v2 grill-me

> Status: completed
> Spec: `docs/specs/grill-me.md`
> Scope: implement `/grill-me` as the pre-spec pressure-testing command

## Goal

Ship `/grill-me` as the jkit v2 pre-spec command that pressure-tests a selected
requirement and solution direction, one question at a time, using targeted
project-base evidence before asking the user, and then produces ready input for
`/to-spec`.

Success means users can invoke `/grill-me` or
`/grill-me <requirement-or-solution-direction>` through the plugin command
wrapper or local skill fallback, and see `/grill-me` represented consistently
across installer, plugin metadata, docs, maps, and generated indexes.

## Context

- Source behavior: `docs/specs/grill-me.md`.
- Adjacent specs: `docs/specs/explore.md`, `docs/specs/clarify.md`,
  `docs/specs/to-spec.md`, `docs/specs/to-plan.md`, and
  `docs/specs/run.md`.
- Existing shipped command patterns:
  - `skills/explore/SKILL.md`
  - `commands/explore.md`
  - `skills/to-spec/SKILL.md`
  - `commands/to-spec.md`
- Installer and metadata surfaces:
  - `bin/jkit.js`
  - `.claude-plugin/plugin.json`
  - `.claude-plugin/marketplace.json`
  - `.codex-plugin/plugin.json`
  - `package.json`
- Public docs and maps:
  - `README.md`
  - `README.en.md`
  - `AGENTS.md`
  - `agent-map.yaml`
  - `docs/WORKFLOW.md`
  - `docs/QUALITY_SCORE.md`
  - `docs/records/open-questions.md`
  - `docs/generated/repo-map.md`

The worktree contains broad uncommitted v2 reset changes. Preserve unrelated
changes and keep edits scoped to the `/grill-me` implementation plus adjacent
route wording needed to avoid recommending unshipped commands as available.

## Non-goals

- Do not implement `/clarify`.
- Do not create or update specs from `/grill-me`; `/to-spec` remains the
  durable spec writer.
- Do not create ExecPlans from `/grill-me`; `/to-plan` remains the planning
  command.
- Do not add an explicit maximum question count.
- Do not add aliases.
- Do not run destructive commands, production writes, external live checks, or
  network-dependent verification.

## Design

Implement `/grill-me` using the existing command pattern:

- `skills/grill-me/SKILL.md` contains the full workflow instructions:
  orientation, selected-direction resolution, targeted project-base scan,
  decision-tree construction, one-question-at-a-time pressure testing, stop
  conditions, safety rules, and handoff.
- `commands/grill-me.md` is a thin plugin command wrapper that delegates to the
  skill and names the final handoff shape.
- `bin/jkit.js` includes `grill-me` in `SKILL_NAMES` once the skill exists.
- README, AGENTS, workflow docs, metadata, and map config list `/grill-me` as a
  shipped command only after the skill and wrapper exist.

The first version is a pre-spec pressure-testing conversation. It may inspect
targeted project-base evidence, but it does not edit files by default.

## Checklist

- [x] Create `skills/grill-me/SKILL.md` with metadata, supported forms, core
  rules, phases, stop conditions, safety boundaries, verification expectations,
  and final handoff requirements.
- [x] Create `commands/grill-me.md` as the plugin command wrapper.
- [x] Add `grill-me` to `bin/jkit.js` skill installation and status handling.
- [x] Update package and plugin metadata so `/grill-me` is represented in the
  shipped command set.
- [x] Update `README.md` and `README.en.md` command tables and workflow
  diagrams.
- [x] Update `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`,
  `docs/QUALITY_SCORE.md`, and `docs/records/open-questions.md`.
- [x] Refresh generated indexes.
- [x] Run focused assertions that `/grill-me` appears in expected shipped
  surfaces and that `/clarify` is not presented as a shipped command.
- [x] Run installer, plugin, package, map, and distribution verification.
- [x] Review the diff against `docs/specs/grill-me.md`; fix in-scope issues.
- [x] Update this plan's Progress Log with implementation, review, and
  verification results.

## Verification

```bash
test -f skills/grill-me/SKILL.md
test -f commands/grill-me.md
rg -n "grill-me" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json
! rg -n "/clarify" README.md README.en.md AGENTS.md agent-map.yaml docs/WORKFLOW.md package.json .claude-plugin .codex-plugin
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Manual/dogfood checks:

- Inspect `skills/grill-me/SKILL.md` against `docs/specs/grill-me.md`.
- Confirm the skill asks exactly one question per turn and includes a
  recommended answer.
- Confirm the skill uses targeted project-base evidence before asking when
  local evidence can answer or sharpen the branch.
- Confirm the handoff shape includes `Requirement and direction`,
  `Decisions resolved`, `Recommended answers accepted`,
  `Project evidence used`, `Risky assumptions`, `Remaining open questions`,
  and `Next /to-spec input`.

## Decisions

- 2026-06-06: `/grill-me` preserves the referenced command name.
- 2026-06-06: The first implementation is chat-output-only by default because
  durable artifacts belong to `/to-spec`.
- 2026-06-06: `/clarify` remains specified but unimplemented during this plan;
  shipped docs should not list it as an available command.

## Progress Log

- 2026-06-06: Created this active plan from `docs/specs/grill-me.md`. No
  implementation files have been changed yet.
- 2026-06-06: Implemented `skills/grill-me/SKILL.md` and
  `commands/grill-me.md`, wired `grill-me` into `bin/jkit.js`, bumped package
  and plugin metadata to `0.8.0`, updated README/AGENTS/workflow/map/quality
  surfaces, and updated `docs/records/open-questions.md` consensus.
- 2026-06-06: Tightened shipped `/explore` route wording so it recommends
  `/to-spec --update <spec-slug>` unless `/clarify` is available in the target
  runtime. This avoids presenting specified-but-unimplemented `/clarify` as a
  shipped command.
- 2026-06-06: Verification passed for `/grill-me` implementation:
  `test -f skills/grill-me/SKILL.md && test -f commands/grill-me.md`,
  `rg -n "grill-me" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json`,
  `! rg -n "/clarify" README.md README.en.md AGENTS.md agent-map.yaml docs/WORKFLOW.md package.json .claude-plugin .codex-plugin`,
  JSON metadata parse for package/plugin manifests, `node -c bin/jkit.js`,
  `node bin/jkit.js status`, `node bin/jkit.js claude-code status`,
  `./scripts/codex-plugin-check`, `npm pack --dry-run`,
  `./scripts/agent-map-generate`, and `./scripts/agent-map-check`.
  Package dry run confirmed `commands/grill-me.md` and
  `skills/grill-me/SKILL.md` are included in `@nobodyjack/jkit@0.8.0`.
- 2026-06-06: Reviewed `skills/grill-me/SKILL.md`,
  `commands/grill-me.md`, shipped metadata, README/AGENTS/workflow updates, and
  generated indexes against `docs/specs/grill-me.md`. No in-scope review issues
  remained.
- 2026-06-06: Moved this plan to completed and reran final post-move checks:
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`, and
  `npm pack --dry-run` passed. The package dry run confirmed
  `docs/exec-plans/completed/jkit-v2-grill-me.md`, `commands/grill-me.md`, and
  `skills/grill-me/SKILL.md` are included in `@nobodyjack/jkit@0.8.0`.

## Rollback

Remove `skills/grill-me/`, `commands/grill-me.md`, the `grill-me` installer
entry, README/AGENTS/workflow/map mentions that present `/grill-me` as shipped,
package and plugin metadata updates, generated-index changes, and this
completed plan. Preserve `docs/specs/grill-me.md` unless the user abandons the
command spec too.
