# Engineering Rules

## Project Style

- jkit is a Node-based Claude Code and Codex plugin skill package.
- Skill workflows live under `skills/<name>/SKILL.md`.
- Plugin command wrappers live under `commands/`.
- The runtime installer lives in `bin/jkit.js`.

## Rules

- Keep command wrappers thin.
- Keep reusable workflow knowledge in skills and docs.
- Keep installer behavior deterministic and local.
- Do not mutate Claude Code or Codex runtime config from npm postinstall.
- Do not add runtime dependencies unless a spec explains why.
- `/run` drives one active ExecPlan as a Goal-Driven Execution loop by default:
  execute ready pending checklist items, review, fix, run verification, and
  update maps before handoff.
- Verify package contents with `npm pack --dry-run` after package layout
  changes.

## Legacy Boundary

The old `before-build` and `build` skills have been removed. Future planning
and execution commands should be built as separate v2 commands with specs.
