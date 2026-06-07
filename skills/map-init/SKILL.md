---
name: map-init
version: 0.1.0
description: |
  Initialize an agent-readable repository map and harness. Use when the user
  asks for /map-init, map init, agent maps, AGENTS.md setup, project docs
  scaffold, repository harness setup, or wants to prepare an empty, brownfield,
  or partially documented project for long-running AI coding agents.

  Creates or augments AGENTS.md, agent-map.yaml, docs workflow files, specs,
  plans, playbooks, records, generated-index placeholders, and lightweight map
  checks. Preserves existing docs by default and records uncertain decisions as
  consensus, [ASSUMED], or [NEEDS_INVESTIGATION].
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
---

# Map Init - Repository Harness Scaffold

Initialize a project-level agent map. The output is not a feature spec and not
an implementation plan. It is the durable repository harness that later commands
use:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

`/map-init` creates the place where intent, architecture, workflow, plans,
verification, failures, and reusable lessons live.

## Core Rules

1. **Map, not manual.** `AGENTS.md` must stay short and route to deeper docs.
2. **Preserve first.** Never overwrite existing human-authored docs without
   asking. Create missing files and link existing ones by default.
3. **No silent defaults.** Every uncertain setup decision becomes consensus,
   `[ASSUMED]`, or `[NEEDS_INVESTIGATION]`.
4. **No fake commands.** If a test/build/check command is not verified or
   obvious from project metadata, write `TBD` and record an open question.
5. **No product invention.** For empty projects, create placeholders and open
   questions; do not pretend to know the product or architecture.
6. **Seed learning.** Include records and workflow language that convert future
   friction into playbooks, checks, evals, and better maps.

## Resource Files

- `references/artifact-guide.md`: responsibilities for each generated artifact.
- `templates/`: concise starting templates for map files.

Load `references/artifact-guide.md` before writing or modifying the scaffold.
Use templates as shape references, adapting them to discovered project facts.

## Phase 0 - Self-check

Run these checks from the user's current project directory:

```bash
pwd
git rev-parse --show-toplevel 2>/dev/null || true
git status --short 2>/dev/null || true
find . -maxdepth 2 -type f | sort | sed -n '1,200p'
```

If the user explicitly asked for a scaffold level, record it:

```text
minimal | standard | full
```

Default to `standard`.

If there is a dirty worktree, proceed carefully. Do not touch unrelated user
changes. If existing map files are modified, read them before deciding how to
augment.

## Phase 1 - Scan

Read only targeted files. Prefer file lists and package metadata over deep
source reading.

Check for:

```text
AGENTS.md
CLAUDE.md
README*
docs/**
package.json
pyproject.toml
go.mod
Cargo.toml
pom.xml
build.gradle
Makefile
.github/**
.cursor/**
```

Infer:

- project name
- stack signals
- entrypoints
- source directories
- existing docs
- existing verification commands
- sensitive config paths
- generated-artifact paths
- whether the repo already has agent guidance

Use these mode rules:

```text
empty-project: no meaningful source tree, package metadata, or project docs
brownfield: code exists, but agent maps are absent or very thin
augment: AGENTS.md, CLAUDE.md, docs/, .cursor/rules, or similar guidance exists
```

## Phase 2 - Summarize and choose level

Before writing, tell the user in a short message:

- detected mode
- scaffold level
- files/directories likely to be created
- existing files that will be preserved
- any conflicts that need confirmation

Ask only if a real choice changes existing docs, project conventions, security,
or scaffold size. Otherwise make conservative assumptions and record them.

## Phase 3 - Ambiguity ledger

Maintain a short setup ledger while generating files:

```text
Consensus
- ...

[ASSUMED]
- ...

[NEEDS_INVESTIGATION]
- ...
```

If a section has no entries, write `none identified`.

Typical assumptions:

- detected stack from package metadata
- default verification command from package scripts
- docs root path
- sensitive paths
- generated indexes that are placeholders until a script exists

Typical investigation items:

- no verified test command
- no CI config
- unclear deployment or production risk
- existing docs conflict with package metadata

## Phase 4 - Create scaffold

Create directories first. Use the selected scaffold level.

Minimal:

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

Standard adds:

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
docs/exec-plans/tech-debt-tracker.md
docs/records/workflow-exceptions/
docs/records/verification-failures/
docs/generated/
docs/references/
scripts/agent-map-generate
scripts/agent-map-check
```

Full adds, when useful:

```text
docs/evals/
scripts/agent-map-verify
scripts/agent-map-eval
scripts/agent-map-smoke
```

For existing files:

- If compatible, leave them and link from new indexes.
- If missing key sections, ask before appending.
- If conflicting, record the conflict in `docs/records/open-questions.md`.

## Phase 5 - Template guidance

Use these template files as starting shapes:

```text
templates/AGENTS.md
templates/ARCHITECTURE.md
templates/agent-map.yaml
templates/docs-README.md
templates/WORKFLOW.md
templates/PLANS.md
templates/open-questions.md
```

For other standard docs, create concise project-specific stubs with these
sections:

```text
# <Title>

## Purpose
## Current State
## Rules
## Open Questions
```

Keep stubs honest. Use `TBD`, `[ASSUMED]`, and `[NEEDS_INVESTIGATION]` rather
than filling gaps with guesses.

## Phase 6 - Seed scripts

Create scripts only when they help and do not pretend to be stack-aware.

`scripts/agent-map-generate` first version may generate placeholder indexes:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docs/generated
{
  echo "# Repository Map"
  echo
  echo "_Generated by scripts/agent-map-generate._"
  echo
  find . -maxdepth 3 -type f \
    ! -path './.git/*' \
    ! -path './node_modules/*' \
    ! -path './vendor/*' \
    | sort
} > docs/generated/repo-map.md
```

`scripts/agent-map-check` first version should run deterministic map checks:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test -f AGENTS.md
test -f agent-map.yaml
test -f docs/README.md
test -f docs/WORKFLOW.md
test -f docs/PLANS.md
test -f docs/records/open-questions.md
echo "agent map scaffold is present"
```

If adding scripts, make them executable:

```bash
chmod +x scripts/agent-map-generate scripts/agent-map-check
```

## Phase 7 - Verify

Run lightweight verification:

```bash
test -f AGENTS.md
test -f agent-map.yaml
test -f docs/WORKFLOW.md
test -f docs/records/open-questions.md
```

If scripts were created:

```bash
./scripts/agent-map-check
./scripts/agent-map-generate
```

Do not run project tests unless the command is verified and cheap.

## Phase 8 - Handoff

Final response must include:

- detected mode and scaffold level
- created files and preserved existing files
- assumptions and open questions
- verification run and result
- next recommended command, usually `/to-spec`

If anything failed, include exact command and short failure summary.
