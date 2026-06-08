# Plan: jkit v2 runtime update check

## Goal

Ship non-blocking version update notices for common jkit workflow commands by
centralizing npm latest-version checks in the `jkit` CLI and calling that check
from workflow skill orientation.

## Context

- Read `AGENTS.md` for repository routing and done criteria.
- Read `docs/specs/runtime-update-check.md` for the behavior contract.
- Read `bin/jkit.js` for CLI dispatch, runtime status, and package metadata
  helpers.
- Read `skills/*/SKILL.md` for Phase 0 orientation patterns.
- Read `README.md`, `README.en.md`, and `docs/WORKFLOW.md` for user-facing
  command descriptions.
- npm latest is `@nobodyjack/jkit@0.9.3`; local package is also `0.9.3`, so
  this new behavior should ship as `0.9.4`.

## Non-goals

- Do not auto-update jkit.
- Do not block workflow commands when update checks fail.
- Do not add runtime dependencies.
- Do not implement a full plugin marketplace updater.

## Design

Add CLI commands:

```bash
jkit version
jkit update-check
jkit update-check --quiet
jkit update-check --json
jkit update-check --no-cache
```

`update-check` compares local package version with npm latest using a
best-effort 24-hour cache at `~/.cache/jkit/update-check.json`. It should exit
0 for registry/network/cache failures and stay silent in `--quiet` mode unless
an update is available.

Add this non-blocking call to jkit skills during Phase 0 or equivalent:

```bash
jkit update-check --quiet 2>/dev/null || true
```

## Checklist

- [x] Add `jkit version` CLI command.
- [x] Add `jkit update-check` CLI command with `--quiet`, `--json`, and
  `--no-cache`.
- [x] Add best-effort 24-hour cache under `~/.cache/jkit/`.
- [x] Add non-blocking update-check calls to all jkit workflow skills.
- [x] Update README, README.en, and workflow docs.
- [x] Bump package and plugin metadata to `0.9.4`.
- [x] Refresh generated repo map.
- [x] Run CLI, JSON, quiet, package, plugin, and map verification.
- [x] Review diff and update this plan's progress.
- [x] Move this plan to completed after verification passes.

## Verification

```bash
node -c bin/jkit.js
node bin/jkit.js version
node bin/jkit.js update-check --json --no-cache
node bin/jkit.js update-check --quiet --no-cache
rg -n "jkit update-check --quiet 2>/dev/null \\|\\| true" skills/*/SKILL.md
node -e "JSON.parse(require('fs').readFileSync('package.json')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json')); console.log('json ok')"
./scripts/agent-map-check
./scripts/codex-plugin-check
npm pack --dry-run --json
git diff --check
```

## Decisions

- 2026-06-08: Update notices belong in workflow command orientation because
  users normally invoke `/explore`, `/to-spec`, `/to-plan`, `/to-done`, and
  `/run`, not `jkit status`.
- 2026-06-08: The CLI owns npm/network/cache behavior; skills only call the
  CLI non-blockingly.
- 2026-06-08: This behavior ships as `0.9.4` because `0.9.3` is already
  published on npm.

## Progress Log

- 2026-06-08: Created spec and active plan for runtime update checks.
- 2026-06-08: Implemented `jkit version` and `jkit update-check` with
  `--quiet`, `--json`, `--no-cache`, best-effort npm lookup, and a 24-hour
  cache under `~/.cache/jkit/update-check.json`.
- 2026-06-08: Added non-blocking
  `jkit update-check --quiet 2>/dev/null || true` calls to all jkit skills:
  `jkit`, `map-init`, `explore`, `grill-me`, `clarify`, `to-spec`,
  `to-plan`, `to-done`, and `run`.
- 2026-06-08: Updated README, English README, workflow docs, specs index,
  quality score, open-question consensus, AGENTS common commands, and
  package/plugin metadata. Bumped package and plugin versions to `0.9.4`.
- 2026-06-08: Verification passed: `node -c bin/jkit.js`;
  `node bin/jkit.js version`; `node bin/jkit.js update-check --json --no-cache`;
  `node bin/jkit.js update-check --quiet --no-cache`;
  static scan confirming every jkit skill calls
  `jkit update-check --quiet 2>/dev/null || true`;
  JSON metadata parse; `node bin/jkit.js codex install`;
  `node bin/jkit.js status`; `./scripts/agent-map-check`;
  `./scripts/codex-plugin-check`; and `npm pack --dry-run --json`.

## Rollback

Remove `docs/specs/runtime-update-check.md`, remove this plan, revert
`bin/jkit.js`, skill Phase 0 additions, docs, generated indexes, and version
bumps.
