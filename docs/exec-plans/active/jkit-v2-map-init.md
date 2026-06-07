# Plan: jkit v2 architecture and map-init

> Status: in-progress
> Spec: `docs/specs/map-init.md`
> Scope: jkit v2 architecture, map-init, and run execution loop

## Goal

Rework jkit from a two-skill ambiguity-gate plugin into a reusable agent-map
toolkit, starting with `/map-init`.

The first shipped slice should let a user run `/map-init` in an empty,
brownfield, or partially documented repository and receive an agent-readable
map scaffold: `AGENTS.md`, `agent-map.yaml`, `docs/`, records, generated-index
placeholders, and verification guidance.

## Context

Current jkit shape:

- `skills/map-init/SKILL.md`: initializes repository agent maps.
- `skills/to-spec/SKILL.md`: creates or updates reviewable specs from explicit
  input or current context.
- `skills/to-plan/SKILL.md`: converts reviewable specs into executable active
  ExecPlans.
- `skills/to-done/SKILL.md`: fast-paths clear, bounded work through minimal
  spec, minimal active plan, `/run`, and verified completion.
- `skills/run/SKILL.md`: drives an active ExecPlan Goal-Driven Execution loop
  to verified completion and updates maps.
- `commands/map-init.md`, `commands/to-spec.md`, `commands/to-plan.md`,
  `commands/to-done.md`, and `commands/run.md`: plugin command wrappers.
- `bin/jkit.js`: installs listed skills into `~/.claude/skills`.
- `.claude-plugin/plugin.json`: Claude plugin manifest.
- `.codex-plugin/plugin.json`: Codex plugin manifest.
- `README.md`: public product story and usage instructions.
- `docs/specs/map-init.md`, `docs/specs/to-spec.md`, and `docs/specs/run.md`:
  command specs.

Target workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
                  \-> /to-done ->/
```

`/map-init` is the foundation. `/to-spec` is the spec-writing command.
`/to-plan` is the planning command. `/to-done` is the fast-path orchestration
command for clear bounded work. `/run` relies on the repository map, consumes
active ExecPlans, executes ready pending work, reviews and fixes the result,
and updates maps after required verification.

## Non-goals

- `/to-spec` is now implemented through the completed
  `docs/exec-plans/completed/jkit-v2-to-spec.md` plan.
- `/to-plan` is implemented through the separate
  `docs/exec-plans/completed/jkit-v2-to-plan.md` plan.
- `/to-done` is implemented through the separate
  `docs/exec-plans/completed/jkit-v2-to-done.md` plan.
- Do not implement `/map-repair` yet in this plan.
- Do not create a separate runtime service, database, or server.
- Do not make jkit depend on network access.
- Do not require users to adopt one programming language or project framework.
- Do not overwrite existing repository docs without asking or preserving them.

## Architecture

### Layer 1: Installer and plugin metadata

Files:

```text
bin/jkit.js
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
.codex-plugin/plugin.json
package.json
```

Responsibilities:

- Install all jkit skills.
- Report install status.
- Keep plugin/package descriptions aligned with the new agent-map workflow.
- Keep only shipped v2 skills installable.

Implementation direction:

- Add shipped v2 skills to `SKILL_NAMES`.
- Update package/plugin descriptions to describe jkit as an agent-map toolkit.
- Bump versions only in the implementation slice, not during planning.

### Layer 2: Command skills

Target skill folders:

```text
skills/map-init/
skills/run/
skills/to-spec/
skills/to-plan/
skills/map-repair/
```

Responsibilities:

- Each command owns one workflow stage.
- Each skill should be self-contained enough to run in a target repository.
- Shared concepts should be concise and repeated only when necessary.

Implemented first slice:

```text
skills/map-init/SKILL.md
skills/map-init/templates/
skills/map-init/references/
```

`/map-init` should be mostly workflow instructions plus small templates. If
template rendering becomes repetitive or fragile, add a deterministic Node
script under `skills/map-init/scripts/`.

Second slice:

```text
skills/run/SKILL.md
commands/run.md
```

`/run` should be a workflow skill rather than a renderer. It reads the active
plan, executes ready pending checklist items as a Goal-Driven Execution loop,
reviews and fixes the result, verifies it with required checks, and updates the
maps.

### Layer 3: Agent-map artifacts created in target repos

Default scaffold:

```text
AGENTS.md
ARCHITECTURE.md
agent-map.yaml
docs/
  README.md
  AGENT_WORKING_PRINCIPLES.md
  WORKFLOW.md
  ENGINEERING.md
  SECURITY.md
  RELIABILITY.md
  PLANS.md
  QUALITY_SCORE.md
  specs/
    index.md
  design-docs/
    index.md
    adr/
  playbooks/
    README.md
  exec-plans/
    active/
    completed/
    tech-debt-tracker.md
  records/
    open-questions.md
    workflow-exceptions/
    verification-failures/
    incidents/
  generated/
  references/
scripts/
  agent-map-generate
  agent-map-check
```

Design note:

- Prefer `docs/specs/` for the public reusable toolkit because it works for
  libraries, CLIs, infra projects, and product applications.
- Allow projects to rename this to `docs/product-specs/` in `agent-map.yaml`
  when product-specific language fits better.

### Layer 4: Learning and repair loop

The initialized maps should make later commands behave like this:

```text
execute active plan work
review, repair, and verify
record progress and verification
record failures and workflow exceptions
promote repeated friction into playbooks
promote high-value failures into checks or evals
update generated indexes
```

`/run` will own the normal update path. `/map-repair` will own manual recovery
when work happened outside the workflow or an agent failed to update maps.

### `/run` phases

1. **Orient**
   Read `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`, and `docs/PLANS.md`.
   Inspect git status.

2. **Resolve plan**
   Use an explicit plan arg when provided. Otherwise read
   `docs/exec-plans/active/*.md`; use the only plan or ask when multiple exist.

3. **Resolve goal and work queue**
   Read the plan and referenced specs. Select all ready pending checklist items by
   default. Stop if dependencies are incomplete or the plan is unverifiable.

4. **Execute**
   Implement the ready pending checklist items in scope. Stop for late ambiguity
   that changes behavior, security, data, external integrations, or
   irreversible operations.

5. **Review and verify**
   Review the diff, fix in-scope findings, run focused checks, relevant
   `agent-map.yaml` update-rule checks, and map checks when maps changed. Rerun
   verification until it passes or a blocker is recorded.

6. **Update maps**
   Update the active plan's checklist, progress log, decisions, verification
   result, and blockers. Record verification failures under `docs/records/`.
   Refresh generated indexes when layout or docs indexes changed.

7. **Handoff**
   Summarize plan, completed checklist items, review result, files changed,
   verification, map updates, and remaining work.

## Design

### `/map-init` phases

1. **Self-check**
   Detect explicit invocation, current repository root, dirty git state, and
   whether existing map docs are tracked, untracked, or absent.

2. **Scan**
   Read package metadata and obvious project files:

   ```text
   package.json, pyproject.toml, go.mod, Cargo.toml, pom.xml, build.gradle,
   README*, AGENTS.md, CLAUDE.md, docs/**, .github/**, Makefile
   ```

   Do not deep-read huge trees. Use file lists and targeted reads.

3. **Classify mode**

   ```text
   empty-project
   brownfield
   augment
   ```

4. **Choose scaffold level**

   Default to `standard`. Support `minimal` and `full` when the user asks or
   the project clearly warrants it.

5. **Ambiguity ledger**
   Record setup decisions as:

   ```text
   consensus
   [ASSUMED]
   [NEEDS_INVESTIGATION]
   none identified
   ```

6. **Write scaffold**
   Create only missing files/directories by default. If a file already exists,
   summarize the conflict and ask before replacing.

7. **Seed commands**
   Create `agent-map.yaml` and scripts only when useful. If required verification
   commands cannot be identified, write `TBD` and add an open question.

8. **Verify map**
   Run lightweight checks that do not depend on the project stack:

   ```text
   test -f AGENTS.md
   test -f agent-map.yaml
   test -f docs/WORKFLOW.md
   test -f docs/records/open-questions.md
   ```

9. **Handoff**
   Summarize created files, assumptions, open questions, and the next command:
   usually `/to-spec`.

### Template policy

Templates must be short and agent-readable. They should contain project-specific
placeholders only when `/map-init` cannot infer the value.

Required placeholder style:

```text
TBD: <specific missing fact>
[ASSUMED] <assumption and why it is low risk>
[NEEDS_INVESTIGATION] <missing evidence and how to resolve it>
```

### Existing docs policy

`/map-init` must not erase existing guidance. For existing files:

- If compatible, link to them from `AGENTS.md` or `docs/README.md`.
- If incomplete, append a small missing-section note only after confirmation.
- If conflicting, record the conflict in `docs/records/open-questions.md`.

## Checklist

- [x] Draft `/map-init` spec in `docs/specs/map-init.md`.
- [x] Create `skills/map-init/SKILL.md` with trigger rules, phases, safety
  rules, and scaffold-level definitions.
- [x] Add map template resources under `skills/map-init/templates/`.
- [x] Add a concise reference for agent-map artifact responsibilities under
  `skills/map-init/references/`.
- [x] Decide whether first implementation writes files manually via the skill
  or uses a deterministic Node renderer script.
- [x] Update installer and plugin metadata to include `map-init`.
- [x] Update `README.md` with the v2 command table.
- [x] Remove legacy `/before-build` and `/build` after the map-init reset.
- [x] Add `/run` spec in `docs/specs/run.md`.
- [x] Create `skills/run/SKILL.md` with active-plan execution rules.
- [x] Add `commands/run.md` wrapper.
- [x] Update installer and plugin metadata to include `run`.
- [x] Update README, AGENTS, workflow, and map config for `/run`.
- [ ] Dogfood `/map-init` against three fixture repos:
  empty repo, small Node repo, and repo with existing `AGENTS.md`.
- [ ] Dogfood `/run` against this active plan.
- [ ] Record dogfood findings and update the skill/templates.

## Verification

Planning verification:

```text
test -f docs/specs/map-init.md
test -f docs/exec-plans/active/jkit-v2-map-init.md
```

Implementation verification after the first slice:

```text
node bin/jkit.js status
node bin/jkit.js claude-code status
```

Manual/dogfood verification:

```text
# empty repo
mkdir -p /tmp/jkit-empty && cd /tmp/jkit-empty && git init
/map-init

# brownfield repo
mkdir -p /tmp/jkit-node && cd /tmp/jkit-node && npm init -y
/map-init

# augment repo
mkdir -p /tmp/jkit-augment && cd /tmp/jkit-augment && git init
printf '# Agents\n' > AGENTS.md
/map-init
```

Expected dogfood result:

- Empty repo contains placeholders, not fake architecture claims.
- Brownfield repo detects stack signals and tags unverified commands.
- Augment repo asks before replacing existing docs.
- All outputs include assumptions/open questions where relevant.

## Decisions

- 2026-06-06: Start with Claude Code plugin support because jkit currently
  ships Claude skills and installer paths.
- 2026-06-06: Added Codex plugin support through `.codex-plugin/plugin.json`
  while preserving the Claude Code plugin metadata and installer path.
- 2026-06-06: Remove legacy `/before-build` and `/build`; rebuild around
  repository-level agent maps first.
- 2026-06-06: Require `agent-map.yaml` in all scaffold levels so future
  commands have a machine-readable contract.
- 2026-06-06: Prefer `docs/specs/` for generic public use; allow projects to
  map this to `docs/product-specs/` in `agent-map.yaml`.
- 2026-06-06: Use `/map-repair` as the recovery command name for now.
- 2026-06-06: Use `/run`, not `/exec`, for the execution command because it
  advances a planned workflow checklist and updates maps; it is not a generic
  shell executor.
- 2026-06-06: Correct `/run` from a one-item helper to the Goal-Driven
  Execution loop: execute ready pending plan work, review and repair, rerun
  verification, and update maps until the plan goal is achieved or a
  concrete blocker is recorded.
- 2026-06-06: Use `Checklist` as the ExecPlan section name for executable
  plan items. `Goal` remains the plan-level delivery objective; `Checklist`
  is the concrete queue consumed by `/run`.
- 2026-06-06: First `/map-init` slice uses skill instructions plus templates,
  not a Node renderer. This keeps the scaffold adaptable while the workflow is
  still being dogfooded.
- 2026-06-06: Add a lightweight `commands/map-init.md` wrapper so plugin users
  have an explicit `/jkit:map-init` entry point.

## Progress Log

- 2026-06-06: Created `docs/specs/map-init.md`.
- 2026-06-06: Created this architecture and implementation plan.
- 2026-06-06: Added `skills/map-init/SKILL.md`, artifact guide, templates,
  command wrapper, installer wiring, plugin/package metadata updates, and README
  v2 usage notes.
- 2026-06-06: Verified JSON metadata parsing, `node bin/jkit.js status`,
  `node bin/jkit.js claude-code status`, and `npm pack --dry-run`.
  The package dry run includes `commands/map-init.md` and `skills/map-init/**`.
- 2026-06-06: Removed legacy jkit v1 content (`before-build`, `build`,
  `commands/upgrade.md`, `principles.md`, and `intro-video/`) and executed the
  `/map-init` scaffold on this repository. Moved the map-init spec and this plan
  under `docs/`.
- 2026-06-06: Ran `./scripts/agent-map-check`,
  `./scripts/agent-map-generate`, JSON metadata parsing,
  `node bin/jkit.js status`, and `npm pack --dry-run`; all passed. The package
  dry run now includes only `map-init` skill/command plus the repository maps.
- 2026-06-06: Added `docs/specs/run.md` and linked it from the map-init spec and
  spec index.
- 2026-06-06: Added `skills/run/SKILL.md`, `commands/run.md`, installer wiring,
  metadata/README/docs updates, and map checks for `/run`. Bumped package and
  plugin version to `0.2.0`.
- 2026-06-06: Verified `/run` slice with `./scripts/agent-map-check`,
  `./scripts/agent-map-generate`, JSON metadata parsing,
  `node bin/jkit.js status`, `node bin/jkit.js claude-code status`,
  and `npm pack --dry-run`. The package dry run includes `commands/run.md` and
  `skills/run/SKILL.md`.
- 2026-06-06: Revised `/run` spec, skill, command wrapper, README, workflow,
  engineering rules, reliability docs, map-init workflow template, package and
  plugin descriptions, and active-plan references so `/run` is a closed
  Goal-Driven Execution loop rather than a default one-item executor.
- 2026-06-06: Verified the `/run` Goal-Driven Execution correction with JSON
  metadata parsing, `./scripts/agent-map-check`,
  `./scripts/agent-map-generate`, `node bin/jkit.js status`, stale one-item
  wording scan, and `npm pack --dry-run`. The package dry run includes
  `commands/run.md` and `skills/run/SKILL.md`.
- 2026-06-06: Renamed old ExecPlan checklist-section wording and `/run`
  terminology to
  `Checklist` / checklist items across plan docs, active plans, run spec, run
  skill, command wrapper, map-init templates, and related workflow docs.
  Verified with `./scripts/agent-map-generate`, JSON metadata parsing,
  `./scripts/agent-map-check`, `node bin/jkit.js status`, stale old-term
  wording scan, and `npm pack --dry-run`.

## Risks

- The scaffold could feel too heavy for small projects.
  Mitigation: keep `minimal` mode real and make `standard` concise.
- The skill could overwrite user docs.
  Mitigation: default to augment, ask before replacement, record conflicts.
- Generated scripts could be fake or unverified.
  Mitigation: write `TBD` instead of invented commands; verify only lightweight
  map existence checks in the first slice.
- The v2 vocabulary could drift across specs, skills, and maps.
  Mitigation: keep `docs/specs/`, `skills/`, and README synchronized through
  `/run` map updates.

## Rollback

Rollback:

- Remove `skills/map-init/`.
- Remove `skills/run/`.
- Remove `map-init` and `run` from `bin/jkit.js`.
- Revert README and plugin metadata changes.
- Keep or archive `docs/specs/map-init.md`, `docs/specs/run.md`, and this plan
  as design history.
