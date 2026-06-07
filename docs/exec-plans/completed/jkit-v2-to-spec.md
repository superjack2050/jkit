# Plan: jkit v2 to-spec

> Status: complete
> Spec: `docs/specs/to-spec.md`
> Scope: `/to-spec` spec-writing command

## Goal

Ship `/to-spec` as the spec-writing stage in the jkit v2 workflow.

The command should convert a user brief, feature idea, workflow change, or
unclear behavior request into a durable spec under the repository's configured
specs directory. It should preserve ambiguity explicitly, update the map, and
leave a clear next step for `/to-plan`.

Success means a user can install jkit, invoke `/to-spec`, and get a useful
draft spec or spec update without the command inventing product facts,
duplicating existing specs, or starting implementation work.

## Context

Read these first:

- `AGENTS.md`
- `agent-map.yaml`
- `docs/WORKFLOW.md`
- `docs/PLANS.md`
- `docs/specs/to-spec.md`
- `docs/specs/index.md`
- `docs/records/open-questions.md`
- `skills/map-init/SKILL.md`
- `skills/run/SKILL.md`
- `commands/map-init.md`
- `commands/run.md`
- `bin/jkit.js`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `package.json`
- `README.md`

Current jkit shape:

- `docs/specs/to-spec.md`: command behavior contract.
- `skills/map-init/SKILL.md`: initializes repository agent maps.
- `skills/run/SKILL.md`: drives an active ExecPlan Goal-Driven Execution loop
  to verified completion and updates maps.
- `commands/map-init.md` and `commands/run.md`: thin plugin command wrappers.
- `bin/jkit.js`: installs shipped skills into `~/.claude/skills`.
- `scripts/agent-map-check`: verifies required map and shipped command files.
- `scripts/agent-map-generate`: refreshes the generated repository map.

Target workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
```

Existing constraints:

- Command wrappers stay thin.
- Skill workflows live under `skills/<name>/SKILL.md`.
- New command behavior is specified before implementation.
- `/to-spec` creates or updates specs; it does not implement code.
- `/to-spec` must not create implementation checklist items by default; that is
  `/to-plan`.
- Do not reintroduce legacy `before-build` or `build` behavior.
- Do not add runtime dependencies.

## Non-goals

- Do not implement `/to-plan`.
- Do not implement `/map-repair`.
- Do not change `/map-init` behavior except for documentation references if
  needed.
- Do not change `/run` behavior in this plan except for documentation
  references if needed.
- Do not add scripts or runtime code unless a later checklist item proves the
  skill workflow is too repetitive to express as instructions.
- Do not mark a spec as accepted automatically.
- Do not perform real package publishing or marketplace release work.

## Design

### User-facing behavior

`/to-spec` supports these forms:

```text
/to-spec
/to-spec <brief>
/to-spec <spec-slug>
/to-spec --update <spec-slug>
/to-spec --accept <spec-slug>
```

First implementation should fully support:

- `/to-spec <brief>`
- `/to-spec --update <spec-slug>`

First implementation may document `/to-spec`, `/to-spec <spec-slug>`, and
`/to-spec --accept <spec-slug>` as supported forms only if the skill includes
clear instructions for them. If dogfood shows `--accept` needs more policy, keep
it in the spec as future behavior and do not advertise it as shipped in README.

### Skill workflow

Create:

```text
skills/to-spec/SKILL.md
```

The skill should be self-contained and concise, using the style of
`skills/run/SKILL.md`:

1. Orient.
   Read `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`,
   `docs/specs/index.md`, and inspect `git status --short`.
2. Resolve specs directory.
   Use `agent-map.yaml` `docs.specs`; fall back to `docs/specs`.
3. Intake.
   Extract goal, current behavior, desired behavior, constraints, non-goals,
   acceptance criteria, verification, and affected surfaces from the brief.
4. Match existing specs.
   Search existing specs before creating a new one.
5. Resolve ambiguity.
   Ask only when a missing fact changes behavior, safety, data, compatibility,
   external services, distribution, or verification.
6. Write or update one spec.
   Use the template shape from `docs/specs/to-spec.md`.
7. Update maps.
   Update `docs/specs/index.md`, open questions, and generated indexes when
   relevant.
8. Handoff.
   Report spec path, assumptions, unresolved questions, verification, and next
   command.

The skill should include stop conditions:

- no agent map exists
- user intent is too thin to define observable behavior
- multiple existing specs plausibly match and no user selection was provided
- requested spec change would contradict an accepted spec without explicit user
  confirmation
- requested action is implementation, not spec writing

### Command wrapper

Create:

```text
commands/to-spec.md
```

The wrapper should:

- include a short `description`
- tell Claude Code to use `skills/to-spec/SKILL.md`
- state that the command creates or updates one spec
- state that it does not create an ExecPlan or implement code
- mention `/to-plan` as the next step

It should not duplicate the full skill workflow.

### Installer and package metadata

Update:

```text
bin/jkit.js
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
package.json
README.md
scripts/agent-map-check
docs/generated/repo-map.md
```

Expected changes:

- Add `to-spec` to `SKILL_NAMES`.
- Add `to-spec` keyword where command keywords are listed.
- Update plugin/package descriptions to include spec-writing only after the
  skill and command wrapper exist.
- Update README command table so `/jkit:to-spec` is listed as shipped.
- Update workflow text so implemented commands are distinguished from target
  future commands.
- Update map check so it verifies `skills/to-spec/SKILL.md` and
  `commands/to-spec.md`.
- Refresh generated repo map after adding new files.

### Dogfood strategy

Dogfood should happen in this repository first, using local files instead of
external services.

Use three cases:

1. New spec from brief.
   Example: `/to-spec "add a dry-run mode to map-init"`.
   Expected: creates a draft spec, updates `docs/specs/index.md`, and suggests
   `/to-plan`.
2. Existing spec update.
   Example: `/to-spec --update run "clarify how verification failures are recorded"`.
   Expected: updates `docs/specs/run.md` instead of creating a duplicate.
3. Ambiguous brief.
   Example: `/to-spec`.
   Expected: asks one concise intent question before writing.

If dogfood creates temporary specs, either keep them only when useful or delete
them and record the behavior observed in this plan's progress log.

## Checklist

- [x] Draft `/to-spec` spec in `docs/specs/to-spec.md`.
- [x] Create active implementation plan in
  `docs/exec-plans/active/jkit-v2-to-spec.md`.
- [x] Create `skills/to-spec/SKILL.md` with the full workflow, stop
  conditions, ambiguity rules, map update rules, and final response contract.
- [x] Add `commands/to-spec.md` as a thin wrapper around the skill.
- [x] Wire `to-spec` into installer, plugin metadata, package keywords, README,
  `scripts/agent-map-check`, and generated indexes.
- [x] Dogfood the new-spec case and record the result.
- [x] Dogfood the existing-spec update case and record the result.
- [x] Dogfood the ambiguous-brief case and record the result.
- [x] Run final package and map verification, update docs/records as needed,
  and decide whether the plan can move to completed.

Each `/run` invocation should execute all ready pending checklist items in the
selected active plan by default. Use an explicit narrow run only when the user
asks for a specific checklist item.

## Verification

Focused checks by checklist item:

```text
# After skill or command wrapper changes
test -f skills/to-spec/SKILL.md
test -f commands/to-spec.md

# After installer or metadata changes
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json', 'utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json', 'utf8'))"
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run

# After docs, maps, or source layout changes
./scripts/agent-map-check
./scripts/agent-map-generate
```

Final verification before completion:

```text
./scripts/agent-map-check
./scripts/agent-map-generate
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json', 'utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json', 'utf8'))"
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
```

Manual dogfood verification:

```text
/to-spec "add a dry-run mode to map-init"
/to-spec --update run "clarify how verification failures are recorded"
/to-spec
```

Record exact failed commands and summaries under
`docs/records/verification-failures/` if failures affect future agents.

## Decisions

- 2026-06-06: `/to-spec` will create or update one spec by default and leave
  implementation planning to `/to-plan`.
- 2026-06-06: New specs default to `Status: draft`; accepting a spec requires
  explicit user confirmation or a documented project convention.
- 2026-06-06: Existing spec matching is part of the command contract to avoid
  duplicate behavior specs.
- 2026-06-06: First implementation should be skill instructions plus a thin
  command wrapper, not a renderer script.
- 2026-06-06: Dogfood should cover new spec, existing spec update, and missing
  brief behavior before the command is considered complete.
- 2026-06-06: Ship `/to-spec` as part of package/plugin version `0.3.0`
  because it adds a new command wrapper and installable skill.

## Progress Log

- 2026-06-06: Created `docs/specs/to-spec.md`, added it to the specs index,
  updated open questions, refreshed `docs/generated/repo-map.md`, and created
  this active implementation plan. `./scripts/agent-map-check` passed.
- 2026-06-06: Expanded this plan into a `/run`-ready checklist with design,
  dogfood cases, verification commands, decisions, and rollback guidance. The
  command remains specified but not yet implemented.
- 2026-06-06: Created `skills/to-spec/SKILL.md` with orientation, specs
  directory resolution, intake, existing-spec matching, ambiguity handling,
  spec writing, map updates, verification, handoff, and stop conditions.
  Verified with `test -f skills/to-spec/SKILL.md`,
  `./scripts/agent-map-check`, `./scripts/agent-map-generate`,
  `node bin/jkit.js status`, and `npm pack --dry-run`. The package dry run
  includes `skills/to-spec/SKILL.md`; installer status still lists only
  `map-init` and `run` because `to-spec` wiring is a later checklist item.
- 2026-06-06: Added `commands/to-spec.md`, wired `to-spec` into
  `bin/jkit.js`, package and plugin metadata, README, AGENTS, `agent-map.yaml`,
  `scripts/agent-map-check`, quality/open-question docs, and specs index.
  Bumped package and plugin version to `0.3.0`.
- 2026-06-06: Dogfooded new-spec creation with
  `/to-spec "add a dry-run mode to map-init"` by creating
  `docs/specs/map-init-dry-run.md` and updating `docs/specs/index.md`.
- 2026-06-06: Dogfooded existing-spec update with
  `/to-spec --update run "clarify how verification failures are recorded"` by
  updating `docs/specs/run.md` rather than creating a duplicate spec.
- 2026-06-06: Dogfooded the missing-brief path for `/to-spec`; per
  `skills/to-spec/SKILL.md`, the command should ask
  "What behavior should this spec define, and who is it for?" before writing,
  so no file was created for that case.
- 2026-06-06: Completed final review and verification for `/to-spec`.
  Verification passed with `./scripts/agent-map-generate`, JSON metadata
  parsing, `./scripts/agent-map-check`, `node bin/jkit.js status`,
  `node bin/jkit.js install --silent-if-not-global`, stale wording scans, and
  `npm pack --dry-run`. Moved this plan to `docs/exec-plans/completed/`.

## Rollback

To roll back the spec-only phase:

- Remove `docs/specs/to-spec.md`.
- Remove this plan.
- Remove `to-spec` from `docs/specs/index.md`.
- Remove `/to-spec` references from `docs/records/open-questions.md`.
- Regenerate `docs/generated/repo-map.md`.

To roll back after implementation:

- Remove `skills/to-spec/`.
- Remove `commands/to-spec.md`.
- Remove `to-spec` from `bin/jkit.js`.
- Revert plugin metadata, package keywords, README, map checks, and generated
  indexes.
- Keep `docs/specs/to-spec.md` and this plan as design history unless the
  command direction itself is abandoned.
