# Spec: map-repair

> Status: draft
> Product: jkit v2
> Scope: repair existing repository agent maps from project-base facts

## 1. Summary

`/map-repair` is the jkit v2 recovery command for an existing repository agent
map. It compares the map harness against facts available in the project base,
repairs stale or missing map content when evidence is clear, records unknowns
instead of inventing them, refreshes generated indexes, and verifies the map
before handoff.

It sits at the end of the current v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run -> /map-repair
                                               \-> /to-done ->/
```

`/map-repair` is not a feature implementation command, not a planning command,
not a broad documentation consultation command, and not a substitute for
`/run`. Its job is to make repository maps trustworthy again when durable
agent context drifted from the actual project.

## 2. Background

jkit v2 treats agent maps as living project infrastructure:

- `/map-init` creates the initial harness.
- `/explore`, `/grill-me`, `/to-spec`, and `/clarify` make requirements
  discoverable and durable.
- `/to-plan`, `/to-done`, and `/run` turn specs into verified work and update
  durable records.
- `/map-repair` recovers the harness when map updates were skipped, partial, or
  contradicted by repository facts.

The command's source of truth is the project base: local files, docs, specs,
plans, records, scripts, package metadata, command wrappers, skill folders,
plugin metadata, generated indexes, and deterministic local verification.

When a fact cannot be proven locally, `/map-repair` must preserve or record the
uncertainty. It should not reconstruct product truth from stale chat context or
guess missing architecture, workflow, package, or verification facts.

## 3. Goals

- Repair an existing agent map from project-base facts.
- Detect stale, missing, contradictory, or incomplete map content.
- Keep command lists, skill folders, command wrappers, installer skill lists,
  package metadata, plugin metadata, workflow docs, specs, plans, records, and
  generated indexes coherent.
- Record unresolved project facts in `docs/records/open-questions.md`.
- Record workflow exceptions when evidence shows work happened outside the
  normal jkit flow.
- Record verification failures when a repair cannot be verified.
- Refresh generated indexes when source layout, docs indexes, command layout,
  package layout, or map files changed.
- Run relevant local deterministic verification after repairs.
- Preserve unrelated source files, docs, specs, plans, records, and user
  changes.
- Leave a concise handoff with repaired files, evidence used, verification
  results, generated-index status, workflow exceptions, open questions, and
  blockers.

## 4. Non-goals

- Do not initialize a missing map; use `/map-init`.
- Do not implement product features, command behavior, tests, migrations, or
  package functionality.
- Do not create new specs or ExecPlans for behavior changes; use `/to-spec`
  and `/to-plan`.
- Do not execute active plans; use `/run`.
- Do not replace `/clarify` for resolving planning-blocking ambiguity in a
  specific spec.
- Do not add dry-run/report mode in the first version.
- Do not infer missing product, architecture, workflow, security,
  compatibility, package, or verification facts from vibes.
- Do not delete existing guidance unless project evidence proves it is
  obsolete and the replacement is clear.
- Do not run destructive commands, production writes, migrations, external live
  checks, or network-dependent checks by default.

## 5. User stories

### 5.1 Repair stale maps after repository changes

As a user whose repository changed outside the jkit workflow, I can run
`/map-repair` and have the map harness updated to match the current project
base.

Acceptance criteria:

- The command reads the existing map before editing.
- The command gathers evidence from local files, docs, metadata, scripts, and
  records.
- The command updates stale map entries only when supported by evidence.
- The command records unproven facts as open questions instead of guessing.
- The final response lists repaired files and verification results.

### 5.2 Recover after an incomplete agent run

As a future agent, I want `/map-repair` to recover map state when prior work
changed files but did not update records, generated indexes, workflow docs, or
progress logs.

Acceptance criteria:

- The command inspects `git status --short`.
- The command inspects relevant diffs before changing already-dirty map files.
- The command refreshes generated indexes when needed.
- The command records workflow exceptions when evidence shows work bypassed the
  normal flow.
- The command does not mark an active plan complete unless the plan and
  durable verification records prove completion.

### 5.3 Preserve unknowns

As a maintainer, I want `/map-repair` to avoid false confidence when project
facts are incomplete.

Acceptance criteria:

- Missing facts are recorded under `[NEEDS_INVESTIGATION]`.
- Low-risk inferred facts are tagged `[ASSUMED]` only when reversible and
  grounded in evidence.
- Conflicting evidence is reported rather than silently resolved when the
  correct answer affects workflow, safety, package distribution,
  compatibility, data, external services, or verification.

### 5.4 Keep command surfaces coherent

As a user, I want implemented commands to be represented consistently across
the repository.

Acceptance criteria:

- `commands/*.md`, `skills/*/SKILL.md`, `bin/jkit.js`, `README.md`,
  `README.en.md`, `AGENTS.md`, `agent-map.yaml`, package metadata, plugin
  metadata, workflow docs, specs, and generated indexes agree about shipped
  commands.
- Removed commands are not presented as shipped.
- Specified-but-unimplemented commands are clearly marked as not shipped.
- Specified-but-unimplemented commands are clearly marked as not shipped.

### 5.5 Repair verification records

As a future agent, I want verification state to be recoverable from durable
records.

Acceptance criteria:

- Failed verification that affects future agents is recorded under
  `docs/records/verification-failures/`.
- Successful verification is recorded in the relevant plan progress log or
  repair handoff when the repair touches active work.
- Verification commands are copied exactly enough for a future agent to rerun
  them.
- Generated-index refreshes are recorded when performed.

## 6. Command behavior

User-facing command:

```text
/map-repair
```

Plugin skill folder:

```text
skills/map-repair/
```

Plugin command wrapper:

```text
commands/map-repair.md
```

Supported forms for the first implementation:

```text
/map-repair
```

Default behavior:

- Repair the existing agent map from local project-base facts.
- Prefer small, evidence-backed map edits.
- Record unknowns rather than inventing missing facts.
- Refresh generated indexes when source layout, docs indexes, or map surfaces
  changed.
- Run relevant local verification after repair.
- Report remaining blockers instead of claiming a clean repair when evidence or
  verification is missing.

## 7. Required phases

### 7.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/README.md`, `docs/WORKFLOW.md`, and `docs/PLANS.md` when present.
- Read `docs/specs/index.md` when present.
- Read `docs/records/open-questions.md` when present.
- Inspect `git status --short`.
- If no agent map exists, stop and suggest `/map-init`.
- Preserve unrelated dirty worktree changes.

### 7.2 Gather project-base facts

Collect evidence from local project surfaces:

- repository tree and source layout
- package metadata and plugin metadata
- command wrappers and skill folders
- installer/runtime skill lists
- existing specs, plans, docs, records, and generated indexes
- configured commands and update rules in `agent-map.yaml`
- deterministic local verification commands
- git status and relevant diffs

Prefer `rg`, targeted reads, and existing project scripts. Do not run external
live checks unless the project map explicitly requires them and the user
approves.

### 7.3 Compare maps against facts

Check for:

- command names listed in one place but missing elsewhere
- skill folders without command wrappers, or wrappers without skill folders
- installer skill lists that omit implemented skills
- package or plugin metadata that disagrees with repository layout
- stale references to removed commands or old workflows
- generated indexes that no longer reflect source or docs layout
- active plans whose progress logs disagree with durable verification evidence
- missing workflow exception records when evidence shows work bypassed the
  normal flow
- missing open questions for unresolved project facts

### 7.4 Classify findings

For each finding, classify it as:

```text
repairable
unknown
out-of-scope
blocked
```

- `repairable`: local project evidence proves the map update.
- `unknown`: evidence is incomplete or contradictory; record an open question.
- `out-of-scope`: the issue requires product work, implementation, planning,
  or external action.
- `blocked`: the repair needs a user decision, destructive action, or evidence
  that is not available locally.

### 7.5 Apply repairs

Allowed repairs include:

- update `AGENTS.md` routing, project shape, command lists, and done criteria
- update `agent-map.yaml` paths, commands, update rules, and sensitive paths
- update `README.md` and `README.en.md` command tables and workflow summaries
- update docs indexes and workflow docs when they disagree with project facts
- update records for open questions, verification failures, or workflow
  exceptions
- refresh generated indexes
- adjust active plan progress logs only when durable evidence proves the status

Do not modify source code or command implementation files unless the requested
repair is specifically about map metadata embedded in those files.

### 7.6 Verify

Run verification in this order when available and relevant:

1. Focused checks for edited map files.
2. `./scripts/agent-map-generate` when layout, docs indexes, or map files
   changed.
3. `./scripts/agent-map-check`.
4. JSON parse checks when package or plugin metadata changed.
5. `node -c bin/jkit.js` when installer/runtime code changed.
6. `node bin/jkit.js status` when skills, commands, installer config, or
   package-facing command lists changed.
7. `./scripts/codex-plugin-check` when Codex plugin metadata changed.
8. `npm pack --dry-run` when package, plugin, command, skill, docs, or
   distribution surfaces changed.
9. Additional local deterministic checks named by `agent-map.yaml`.

Failed verification must be recorded under
`docs/records/verification-failures/` when it affects future agents.

### 7.7 Handoff

Final response must include:

- repaired map files
- evidence used
- verification commands and results
- workflow exceptions recorded
- open questions added or resolved
- whether generated indexes were refreshed
- remaining blockers

## 8. Safety and compatibility

- Never record secrets, tokens, credentials, or private local config in maps.
- Never delete existing guidance merely because it is old; prove the
  replacement or preserve the uncertainty.
- Keep repairs portable across small projects, CLIs, libraries, infra
  projects, and product apps.
- Treat generated indexes as rebuildable outputs, not source of truth.
- Avoid network calls and external systems by default.
- Preserve unrelated user changes in dirty worktrees.

## 9. Verification

When `/map-repair` changes only docs and maps:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

When repair touches command, skill, installer, package, or plugin surfaces:

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node -c bin/jkit.js
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
```

When `/map-repair` itself is implemented later, verification should include:

- `test -f skills/map-repair/SKILL.md`
- `test -f commands/map-repair.md`
- `rg -n "map-repair" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json`
- dogfood no-map stop behavior in a controlled temporary fixture
- dogfood stale-map repair in a controlled temporary fixture
- dogfood unknown preservation by confirming unresolved facts are recorded
  rather than invented
- dogfood generated-index refresh after a controlled map or docs-layout change

## 10. Acceptance criteria

- `docs/specs/map-repair.md` exists.
- `docs/specs/index.md` lists `map-repair.md`.
- The spec defines `/map-repair` as an existing-map repair command.
- The spec uses the current v2 workflow including `/explore`, `/grill-me`,
  `/clarify`, `/to-spec`, `/to-plan`, `/to-done`, `/run`, and `/map-repair`.
- The spec requires project-base evidence before map edits.
- The spec requires unresolved facts to be recorded instead of invented.
- The spec requires no-map behavior to stop and suggest `/map-init`.
- The spec defines repairable, unknown, out-of-scope, and blocked finding
  classes.
- The spec defines allowed repair surfaces and source-code boundaries.
- The spec requires generated-index refresh when needed.
- The spec requires verification commands and results to be recorded.
- Future implementation creates `skills/map-repair/SKILL.md`.
- Future implementation creates `commands/map-repair.md`.
- Future implementation adds `map-repair` to installer, package, plugin, docs,
  and generated-map surfaces only after the skill and wrapper exist.

## 11. Open questions

- [ASSUMED] The first implementation has only default repair behavior and no
  dry-run/report mode, because the current priority is a conservative recovery
  command.
- [ASSUMED] `/map-repair` may update active ExecPlan progress logs only when
  durable local evidence proves the status; otherwise it should record a
  workflow exception or open question.
