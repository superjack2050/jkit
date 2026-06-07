# Architecture

Status: Draft

jkit is a small Claude Code and Codex plugin package centered on agent-map
skills and thin command wrappers.

## Current Shape

```text
bin/jkit.js
  -> runtime install/status helpers
skills/
  -> reusable workflow instructions
commands/
  -> thin plugin command wrappers
.claude-plugin
  -> Claude Code plugin metadata
.codex-plugin
  -> Codex plugin metadata
docs
  -> repository agent map and long-running state
scripts
  -> map checks and generated indexes
```

## Responsibilities

`bin/jkit.js` installs or reports local runtime state. Claude Code fallback
installation symlinks skills into `~/.claude/skills`; Codex installation
registers a local marketplace entry, links the package under `~/plugins/jkit`,
and runs the Codex plugin add flow.

`skills/jkit` is the root help and routing entry.

`skills/map-init`, `skills/explore`, `skills/grill-me`, `skills/clarify`,
`skills/to-spec`, `skills/to-plan`, `skills/to-done`, and `skills/run`
contain the reusable workflow instructions.

`commands/*.md` give plugin users thin command entry points while keeping
workflow logic in the matching skill.

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
