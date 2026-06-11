# Plan: jkit v2 clarify

> Status: completed
> Spec: `docs/specs/clarify.md`
> Scope: implement `/clarify` as the post-spec, pre-plan clarification command

## Goal

Ship `/clarify` as the jkit v2 post-spec, pre-plan command that resolves
blocking ambiguity in exactly one existing spec, updates that spec with
resolved clarifications, and reports whether it is ready for `/to-plan`.

Success means users can invoke `/clarify`, `/clarify <spec-slug>`, or
`/clarify <spec-file>` through the plugin command wrapper or local skill
fallback, and see `/clarify` represented consistently across installer, plugin
metadata, docs, maps, generated indexes, and package output.

## Context

- Source behavior: `docs/specs/clarify.md`.
- Adjacent specs:
  - `docs/specs/explore.md`
  - `docs/specs/grill-me.md`
  - `docs/specs/to-spec.md`
  - `docs/specs/to-plan.md`
  - `docs/specs/run.md`
- Existing shipped command patterns:
  - `skills/explore/SKILL.md`
  - `skills/grill-me/SKILL.md`
  - `skills/to-spec/SKILL.md`
  - `skills/to-plan/SKILL.md`
  - `commands/explore.md`
  - `commands/grill-me.md`
  - `commands/to-spec.md`
  - `commands/to-plan.md`
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
changes and keep edits scoped to `/clarify` implementation plus adjacent route
wording that should change only once `/clarify` is shipped.

## Non-goals

- Do not turn `/clarify` into broad idea exploration; `/explore` owns that.
- Do not turn `/clarify` into pre-spec decision review; `/grill-me` owns that.
- Do not create new specs from loose intent; `/to-spec` owns new specs.
- Do not create ExecPlans; `/to-plan` owns planning.
- Do not implement product code, migrations, tests for product behavior, or
  unrelated package changes.
- Do not mark draft specs accepted unless explicit user confirmation and the
  repository approval convention allow it.
- Do not silently change accepted behavior.

## Design

Implement `/clarify` using the existing command pattern:

- `skills/clarify/SKILL.md` contains the full workflow instructions:
  orientation, target spec resolution, gap classification, targeted
  project-base evidence gathering, at-most-five high-impact clarification
  questions per pass, spec update rules, plannability recheck, safety rules,
  and final handoff requirements.
- `commands/clarify.md` is a thin plugin command wrapper that delegates to the
  skill and summarizes the final readiness handoff.
- `bin/jkit.js` includes `clarify` in `SKILL_NAMES` once the skill exists.
- README, AGENTS, workflow docs, metadata, and map config list `/clarify` as a
  shipped command only after the skill and wrapper exist.

Unlike `/explore` and `/grill-me`, `/clarify` is allowed to edit files by
default, but only:

- the selected spec
- `docs/records/open-questions.md` when unresolved project-level facts remain
- generated indexes when docs or map indexes change

The implementation should preserve unrelated dirty worktree changes and avoid
creating plans or implementation artifacts during normal `/clarify` use.

## Checklist

- [x] Create `skills/clarify/SKILL.md` with metadata, supported forms, core
  rules, target-spec resolution, gap classification, evidence gathering, spec
  update rules, stop conditions, safety boundaries, verification expectations,
  and final handoff requirements.
- [x] Create `commands/clarify.md` as the plugin command wrapper.
- [x] Add `clarify` to `bin/jkit.js` skill installation and status handling.
- [x] Update package and plugin metadata so `/clarify` is represented in the
  shipped command set.
- [x] Update `README.md` and `README.en.md` command tables and workflow
  diagrams.
- [x] Update `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`,
  `docs/QUALITY_SCORE.md`, and `docs/records/open-questions.md`.
- [x] Update shipped `/explore` and `/grill-me` runtime wording so `/clarify`
  is treated as available once implemented.
- [x] Refresh generated indexes.
- [x] Run focused assertions that `/clarify` appears in expected shipped
  surfaces.
- [x] Run installer, plugin, package, map, and distribution verification.
- [x] Review the diff against `docs/specs/clarify.md`; fix in-scope issues.
- [x] Update this plan's Progress Log with implementation, review, and
  verification results.

## Verification

```bash
test -f skills/clarify/SKILL.md
test -f commands/clarify.md
rg -n "clarify" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node -c bin/jkit.js
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Manual/dogfood checks:

- Inspect `skills/clarify/SKILL.md` against `docs/specs/clarify.md`.
- Dogfood `/clarify <spec-slug>` against a controlled spec with a blocking
  `[NEEDS_INVESTIGATION]` item and verify the selected spec is updated.
- Dogfood `/clarify` when multiple plausible specs exist and verify it asks
  which spec to clarify.
- Dogfood a spec that is already plannable and verify the command reports a
  `/to-plan` handoff without unnecessary edits.
- Confirm accepted spec behavior is not changed without explicit user
  confirmation.

## Decisions

- 2026-06-06: `/clarify` is plannable from `docs/specs/clarify.md`; its
  assumptions are non-blocking first-version defaults.
- 2026-06-06: `/clarify` is the first requirements-discovery command in this
  slice that edits files by default, but only the selected spec and relevant
  project open-question records.
- 2026-06-06: Public docs should present `/clarify` as shipped only after
  `skills/clarify/SKILL.md`, `commands/clarify.md`, and installer wiring exist.

## Progress Log

- 2026-06-06: Created this active plan from `docs/specs/clarify.md`. No
  implementation files have been changed yet.
- 2026-06-06: Refreshed generated indexes and verified the plan-only update
  with `./scripts/agent-map-generate`, `./scripts/agent-map-check`, and
  `npm pack --dry-run`. `/clarify` remains unimplemented and ready for a later
  `/run` pass.
- 2026-06-06: Implemented `/clarify` as `skills/clarify/SKILL.md` and
  `commands/clarify.md`; added `clarify` to installer skill status handling,
  package/plugin metadata, README command surfaces, AGENTS routing,
  `agent-map.yaml`, workflow docs, quality score, open-question records, and
  adjacent command routing in `/explore`, `/grill-me`, `/to-plan`, and
  `/to-done`.
- 2026-06-06: Reviewed `skills/clarify/SKILL.md` against
  `docs/specs/clarify.md`. In-scope finding fixed: avoid requiring an edit when
  a spec is already plannable; `/clarify` should update the selected spec only
  when clarification changes are applied.
- 2026-06-06: Verification passed: file existence checks for
  `skills/clarify/SKILL.md` and `commands/clarify.md`; `rg -n "clarify"
  README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills
  docs .claude-plugin .codex-plugin package.json`; package/plugin JSON parse;
  `node -c bin/jkit.js`; `node bin/jkit.js status`; `node bin/jkit.js
  claude-code status`; `./scripts/codex-plugin-check`; `npm pack --dry-run`;
  `./scripts/agent-map-generate`; and `./scripts/agent-map-check`.
- 2026-06-06: Manual plugin-runtime dogfood was not run because this repository
  has command wrappers and skills but no local slash-command runner. Static
  inspection and package verification confirmed the shipped artifacts are
  present and aligned.

## Rollback

Remove `skills/clarify/`, `commands/clarify.md`, the `clarify` installer entry,
README/AGENTS/workflow/map mentions that present `/clarify` as shipped, package
and plugin metadata updates, generated-index changes, and this active plan.
Preserve `docs/specs/clarify.md` unless the user abandons the command spec too.
