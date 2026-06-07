# Plan: jkit v2 explore

> Status: completed
> Spec: `docs/specs/explore.md`
> Scope: implement `/explore` as the lightweight pre-spec exploration command

## Goal

Ship `/explore` as the jkit v2 pre-spec command that turns rough ideas into a
recommended direction and ready input for `/to-spec`.

Success means users can invoke `/explore` or `/explore <rough-idea>` through
the plugin command wrapper or local skill fallback, receive a lightweight
requirements discussion and solution exploration flow, and see `/explore`
represented consistently across installer, plugin metadata, docs, maps, and
generated indexes.

## Context

- Source behavior: `docs/specs/explore.md`.
- Adjacent specs: `docs/specs/grill-me.md`, `docs/specs/clarify.md`,
  `docs/specs/to-spec.md`, `docs/specs/to-plan.md`, and
  `docs/specs/run.md`.
- Existing shipped command patterns:
  - `skills/to-spec/SKILL.md`
  - `skills/to-plan/SKILL.md`
  - `skills/to-done/SKILL.md`
  - `commands/to-spec.md`
  - `commands/to-plan.md`
  - `commands/to-done.md`
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

The worktree already contains many v2 reset changes. Preserve unrelated
changes and keep edits scoped to the `/explore` implementation.

## Non-goals

- Do not implement `/grill-me` or `/clarify`.
- Do not add `/shape` or other aliases.
- Do not add a save mode or write exploration notes by default.
- Do not create specs from `/explore`; `/to-spec` remains the durable spec
  writer.
- Do not create ExecPlans from `/explore`; `/to-plan` remains the planning
  command.
- Do not run destructive commands, production writes, external live checks, or
  network-dependent verification.

## Design

Implement `/explore` using the existing command pattern:

- `skills/explore/SKILL.md` contains the full workflow instructions:
  orientation, input resolution, light context gathering, option exploration,
  recommendation, safety rules, and handoff.
- `commands/explore.md` is a thin plugin command wrapper that delegates to the
  skill and names the final handoff shape.
- `bin/jkit.js` includes `explore` in `SKILL_NAMES` once the skill exists.
- README, AGENTS, workflow docs, metadata, and map config list `/explore` as a
  shipped command only after the skill and wrapper exist.

The first version is chat-output-only. It may read project map context and
targeted local evidence, but it does not edit files by default and does not run
verification commands as part of normal command behavior.

## Checklist

- [x] Create `skills/explore/SKILL.md` with metadata, supported forms, core
  rules, phases, stop conditions, safety boundaries, verification expectations,
  and final handoff requirements.
- [x] Create `commands/explore.md` as the plugin command wrapper.
- [x] Add `explore` to `bin/jkit.js` skill installation and status handling.
- [x] Update package and plugin metadata so `/explore` is represented in the
  shipped command set.
- [x] Update `README.md` and `README.en.md` command tables and workflow
  diagrams.
- [x] Update `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`,
  `docs/QUALITY_SCORE.md`, and `docs/records/open-questions.md`.
- [x] Refresh generated indexes.
- [x] Run focused assertions that `/explore` appears in expected shipped
  surfaces and that the old aliases/save-mode are absent.
- [x] Run installer, plugin, package, map, and distribution verification.
- [x] Review the diff against `docs/specs/explore.md`; fix in-scope issues.
- [x] Update this plan's Progress Log with implementation, review, and
  verification results.

## Verification

```bash
test -f skills/explore/SKILL.md
test -f commands/explore.md
rg -n "explore" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json
! rg -n "/shape|save mode|save-mode" skills/explore commands/explore.md README.md README.en.md AGENTS.md agent-map.yaml docs/WORKFLOW.md
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Manual/dogfood checks:

- Inspect `skills/explore/SKILL.md` against `docs/specs/explore.md`.
- Confirm the skill asks one concise question when no idea exists.
- Confirm the handoff shape includes `Recommended direction`, `Why`,
  `Alternatives considered`, `Risks`, `Open questions`, and
  `Next /to-spec input`.

## Decisions

- 2026-06-06: `/explore` is the selected command name; `/shape` remains out of
  scope for the first implementation.
- 2026-06-06: The first implementation is chat-output-only because durable
  artifacts belong to `/to-spec`.
- 2026-06-06: `/explore` may recommend `/grill-me` or `/clarify`, but does
  not implement those commands.

## Progress Log

- 2026-06-06: Created this active plan from `docs/specs/explore.md`. No
  implementation files have been changed yet.
- 2026-06-06: Implemented `skills/explore/SKILL.md` and
  `commands/explore.md`, wired `explore` into `bin/jkit.js`, bumped package and
  plugin metadata to `0.7.0`, updated README/AGENTS/workflow/map/quality
  surfaces, and updated `docs/records/open-questions.md` consensus.
- 2026-06-06: Verification passed for `/explore` implementation:
  `test -f skills/explore/SKILL.md && test -f commands/explore.md`,
  `rg -n "explore" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json`,
  `! rg -n "/shape|save mode|save-mode" skills/explore commands/explore.md README.md README.en.md AGENTS.md agent-map.yaml docs/WORKFLOW.md`,
  JSON metadata parse for package/plugin manifests, `node bin/jkit.js status`,
  `node bin/jkit.js claude-code status`, `./scripts/codex-plugin-check`,
  `npm pack --dry-run`, `node -c bin/jkit.js`,
  `./scripts/agent-map-generate`, and `./scripts/agent-map-check`.
  Package dry run confirmed `commands/explore.md` and
  `skills/explore/SKILL.md` are included in `@nobodyjack/jkit@0.7.0`.
- 2026-06-06: Reviewed `skills/explore/SKILL.md`,
  `commands/explore.md`, shipped metadata, README/AGENTS/workflow updates, and
  generated indexes against `docs/specs/explore.md`. No in-scope review issues
  remained.
- 2026-06-06: Moved this plan to completed and reran final post-move checks:
  `./scripts/agent-map-generate`, `./scripts/agent-map-check`, and
  `npm pack --dry-run` passed. The package dry run confirmed
  `docs/exec-plans/completed/jkit-v2-explore.md`, `commands/explore.md`, and
  `skills/explore/SKILL.md` are included in `@nobodyjack/jkit@0.7.0`.

## Rollback

Remove `skills/explore/`, `commands/explore.md`, the `explore` installer entry,
README/AGENTS/workflow/map mentions that present `/explore` as shipped, package
and plugin metadata updates, generated-index changes, and this completed plan.
Preserve `docs/specs/explore.md` unless the user abandons the command spec too.
