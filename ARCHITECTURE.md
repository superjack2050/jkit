# Architecture

Status: Draft

jkit is a small Claude Code plugin and local installer centered on agent-map
skills: `/map-init` and `/run`.

## Current Shape

```text
bin/jkit.js
  -> skills/map-init
  -> skills/run
commands/map-init.md
  -> skills/map-init/SKILL.md
commands/run.md
  -> skills/run/SKILL.md
.claude-plugin
  -> Claude plugin metadata
docs
  -> repository agent map and long-running state
scripts
  -> map checks and generated indexes
```

## Responsibilities

`bin/jkit.js` installs jkit skills by symlinking them into
`~/.claude/skills`.

`skills/map-init` contains the workflow, artifact guide, and templates for
initializing repository agent maps.

`skills/run` contains the workflow for executing one active ExecPlan milestone,
verifying it, and updating maps.

`commands/map-init.md` and `commands/run.md` give plugin users explicit command
entry points.

`docs` is the durable knowledge base for specs, plans, records, playbooks, and
generated context.

`scripts` contains deterministic local checks for the repository harness.

## Dependency Rules

- Keep command wrappers thin; workflow logic belongs in skills.
- Keep reusable project knowledge in `docs`, not in chat history.
- Keep generated indexes rebuildable through scripts.
- Preserve the map-init principle: no fake project facts and no silent defaults.

## Removed Legacy Surface

The old `before-build` and `build` skills were removed during the map-init
reset. Reintroduce planning/execution commands only through new specs and
ExecPlans.
