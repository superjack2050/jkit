# Spec: map-init

> Status: draft
> Product: jkit v2
> Scope: first command in the agent-map workflow

## 1. Summary

`/map-init` initializes an agent-readable repository harness for a project.
It turns an empty, under-documented, or partially documented repository into a
workspace where coding agents can orient themselves, plan work, verify changes,
record failures, and improve the project maps over time.

This is the first command in the proposed jkit v2 workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
```

The command does not implement product features. It creates the durable
project map that later commands depend on.

`/run` is specified separately in `docs/specs/run.md`. It consumes active
ExecPlans and writes execution facts back into the maps.

## 2. Background

jkit is being rebuilt as an agent-map toolkit. The legacy `before-build` and
`build` skills were removed so the project can start from repository-level maps
instead of feature-plan files at the repository root.

The new workflow is map first: create a durable repository harness, then layer
spec, plan, execution, and repair commands on top of it. That harness gives each
project a place for `AGENTS.md`, workflow docs, generated indexes, verification
gates, failure records, and long-running task state.

`/map-init` is the first command because every later command needs the
repository to act as a record system for agents.

## 3. Goals

- Create a compact `AGENTS.md` that acts as a map, not a manual.
- Create a `docs/` knowledge base with stable, purpose-specific documents.
- Create a long-running task structure that survives chat history loss.
- Create places for specs, plans, playbooks, generated indexes, references,
  incidents, verification failures, and workflow exceptions.
- Create or recommend mechanical commands for map generation, map checking,
  and project verification.
- Support empty projects, existing codebases, and repos that already have some
  agent documentation.
- Preserve jkit's core principle: no silent defaults. Any uncertain project
  structure, command, or convention must be confirmed, tagged, or left as an
  explicit open question.
- Make future `/run` executions automatically update the maps with progress,
  verification, exceptions, and reusable lessons.

## 4. Non-goals

- Do not implement `/to-spec`, `/to-plan`, `/run`, or `/map-repair` in this
  command.
- Do not force a large documentation system onto tiny projects.
- Do not infer business requirements that are not visible in the repository or
  conversation.
- Do not create project-specific product specs unless the user supplied product
  intent.
- Do not overwrite existing documentation without preserving or reconciling it.
- Do not run destructive commands, production writes, or external live checks.
- Do not make generated indexes the source of truth; they must be rebuildable.

## 5. User stories

### 5.1 Empty project

As a user starting from an empty repository, I can run `/map-init` and get a
minimal agent-map scaffold so future agents know where specs, plans, records,
and verification commands belong.

Acceptance criteria:

- The command detects that no meaningful source code or project docs exist.
- It creates a small scaffold with placeholders rather than pretending to know
  the architecture.
- It records open questions about product goal, stack, verification, and risk.
- It suggests `/to-spec` as the next step.

### 5.2 Existing codebase without agent maps

As a user with a brownfield codebase, I can run `/map-init` and get an
agent-readable map based on discovered files, package metadata, test commands,
and existing docs.

Acceptance criteria:

- The command scans the repository structure before writing docs.
- It identifies language, package manager, likely entrypoints, test commands,
  source directories, generated artifacts, and risk surfaces when possible.
- It creates docs that say what is known, what is assumed, and what needs
  investigation.
- It avoids rewriting unrelated existing docs.

### 5.3 Existing agent maps

As a user with an existing `AGENTS.md` or `docs/` structure, I can run
`/map-init` to augment the maps without erasing local conventions.

Acceptance criteria:

- The command detects existing map files.
- It summarizes what exists and what is missing.
- It asks before replacing important documents.
- It can create only missing directories and documents.

### 5.4 Public reusable workflow

As a jkit maintainer, I can install this command in different repositories and
get a consistent map shape that still adapts to project size and stack.

Acceptance criteria:

- The command is not tied to Go, Node, Python, Claude, Codex, or one repo.
- It produces portable Markdown and simple scripts.
- It can run without network access.
- It records stack-specific assumptions instead of hard-coding them.

## 6. Command behavior

### 6.1 Invocation

User-facing command:

```text
/map-init
```

Plugin skill folder:

```text
skills/map-init/
```

Optional future aliases:

```text
/jkit:map-init
/map-init --minimal
/map-init --standard
/map-init --full
```

### 6.2 Modes

`/map-init` chooses one of three modes after scanning:

```text
empty-project
brownfield
augment
```

Mode selection:

- `empty-project`: no meaningful source tree, package metadata, or project docs.
- `brownfield`: code exists, but agent maps are absent or very thin.
- `augment`: `AGENTS.md`, `CLAUDE.md`, `docs/`, `.cursor/rules`, `.github`,
  or similar project guidance already exists.

### 6.3 Scaffold levels

The command supports three scaffold sizes:

```text
minimal
standard
full
```

Default: `standard`.

`minimal` creates only the files needed to avoid future chaos:

```text
AGENTS.md
agent-map.yaml
docs/README.md
docs/WORKFLOW.md
docs/PLANS.md
docs/exec-plans/active/
docs/exec-plans/completed/
docs/records/open-questions.md
```

`standard` adds project-quality harness docs:

```text
ARCHITECTURE.md
docs/AGENT_WORKING_PRINCIPLES.md
docs/ENGINEERING.md
docs/SECURITY.md
docs/RELIABILITY.md
docs/QUALITY_SCORE.md
docs/specs/index.md
docs/design-docs/index.md
docs/design-docs/adr/
docs/playbooks/README.md
docs/records/workflow-exceptions/
docs/records/verification-failures/
docs/generated/
docs/references/
scripts/agent-map-generate
scripts/agent-map-check
```

`full` adds eval and runtime harness surfaces when appropriate:

```text
docs/evals/
scripts/agent-map-verify
scripts/agent-map-eval
scripts/agent-map-smoke
```

If a project already has equivalent commands, jkit records them instead of
creating duplicate scripts.

## 7. Document design

### 7.1 AGENTS.md

Purpose: short entry point for coding agents.

Required sections:

- First Read
- Project Shape
- Common Commands
- Task Routing
- Hard Rules
- Done Criteria

Rules:

- Keep it short.
- Link to deeper docs instead of embedding long guidance.
- Include exact commands only when they are verified or explicitly marked TBD.

### 7.2 agent-map.yaml

Purpose: machine-readable map configuration.

Suggested shape:

```yaml
version: 1
project:
  name: ""
  mode: empty-project | brownfield | augment
  stack: []
commands:
  generate_context: ""
  check_maps: ""
  verify: ""
docs:
  root: docs
  specs: docs/product-specs
  plans: docs/exec-plans
  records: docs/records
update_rules:
  api_changed: []
  schema_changed: []
  package_layout_changed: []
  test_layout_changed: []
  user_behavior_changed: []
sensitive_paths: []
open_questions: []
```

Unknown values must be empty strings, empty arrays, or explicit open questions.
Do not invent commands.

### 7.3 docs/WORKFLOW.md

Purpose: default operating loop for humans and agents.

Required concepts:

- Humans set intent, constraints, priorities, and approval boundaries.
- Agents read the map, plan coherent goals, implement, review, fix, verify, and
  update durable docs.
- `/run` must update maps after each execution.
- `/map-repair` is for recovering when work happened outside the workflow.

### 7.4 docs/PLANS.md

Purpose: format and protocol for long-running plans.

Required plan sections:

- Goal
- Context
- Non-goals
- Design
- Checklist
- Verification
- Decisions
- Progress Log
- Rollback

### 7.5 docs/records/

Purpose: learning loop and exception ledger.

Required areas:

- `open-questions.md`
- `workflow-exceptions/`
- `verification-failures/`
- `incidents/` in full mode or production-sensitive projects

Records are not permanent product docs. They are raw material for improving
playbooks, checks, specs, and skills.

### 7.6 docs/generated/

Purpose: agent-readable indexes generated from source state.

Rules:

- Generated files must identify the script that created them.
- They must be reproducible.
- They must not contain secrets.
- They must not become the canonical source of truth.

## 8. Ambiguity rules

`/map-init` must continue jkit's ambiguity discipline.

Every uncertain setup decision must be one of:

- confirmed by user consensus
- `[ASSUMED]`
- `[NEEDS_INVESTIGATION]`

Examples:

- `[ASSUMED] npm test is the default verification command because package.json
  defines a test script.`
- `[NEEDS_INVESTIGATION] No CI config was found; verify whether checks run
  outside the repository.`
- `[ASSUMED] This is a Node CLI project because package.json declares a bin
  entry.`

The generated docs must contain "none identified" for required ambiguity
sections when nothing is found. Empty missing sections are not allowed.

## 9. Self-learning loop

The initialized map must make future improvement automatic:

```text
run work
record progress and verification
record failures and exceptions
promote repeated friction into playbooks
promote high-value failures into evals or checks
update generated indexes
improve the next run
```

`/map-init` must seed this loop, even if later commands implement most of it.

Required language in `WORKFLOW.md`:

> Agent maps are living harnesses. Convert repeated friction into clearer docs,
> stricter checks, safer workflows, and reusable skills.

## 10. Safety and permissions

- Ask before overwriting existing human-authored map files.
- Never delete existing docs during initialization.
- Never commit secrets, tokens, private keys, or local credentials.
- Mark sensitive config paths in `agent-map.yaml`.
- Prefer local deterministic checks over network or production checks.
- If a command cannot be verified, mark it TBD instead of presenting it as real.

## 11. Installer and package impact

The jkit package must install the new skill.

Expected changes after implementation:

- Add `skills/map-init/SKILL.md`.
- Add `map-init` to the installer skill list.
- Update `.claude-plugin/plugin.json` description and version.
- Update `.claude-plugin/marketplace.json` version if needed.
- Update README command table and usage flow.
- Do not reintroduce legacy `/before-build` or `/build` in the map-init slice.

## 12. Acceptance criteria

- Running `/map-init` in an empty repo creates the minimal or standard scaffold
  without fake architecture claims.
- Running `/map-init` in a brownfield repo creates a useful map based on actual
  discovered files and records unknowns explicitly.
- Running `/map-init` in a repo with existing docs augments instead of
  overwriting by default.
- Generated `AGENTS.md` is short and routes to deeper docs.
- `docs/records/open-questions.md` exists and captures unresolved decisions.
- `agent-map.yaml` exists and includes command/update-rule placeholders.
- The command supports at least `minimal` and `standard` scaffold levels.
- The command does not require network access.
- The command leaves a clear next step: usually `/to-spec`.

## 13. Open questions

- Should `agent-map.yaml` be required for all initialized repos, or optional for
  minimal mode?
- Should generated scripts be shell scripts, Node scripts, or template text that
  the agent adapts per repository?
- Should `product-specs/` be renamed to `specs/` for generic projects, or kept
  as product-oriented language?
- Should `/map-repair` be the final command name, or should jkit expose a softer
  alias such as `/map-align`?
