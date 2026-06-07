# Reliability

Reliability for jkit means agents can understand and verify the repository
harness without guessing.

## Current Surfaces

- `node bin/jkit.js status` reports Claude Code local symlink state and Codex
  local plugin registration state.
- `node bin/jkit.js codex status` reports Codex manifest, symlink, and
  marketplace entry state.
- `npm pack --dry-run` reports package contents.
- `./scripts/agent-map-check` checks the map scaffold.
- `./scripts/agent-map-generate` rebuilds `docs/generated/repo-map.md`.
- `/run` is expected to execute active plan work, review and repair the result,
  update ExecPlan progress, and pass required verification before handoff.

## Desired Surfaces

- Dogfood `/map-init` against empty, brownfield, and augment fixture repos.
- Dogfood `/run` against this repository's active plan.
- Add deterministic fixture checks once `/map-init` behavior stabilizes.
- Promote repeated dogfood failures into playbooks or evals.
