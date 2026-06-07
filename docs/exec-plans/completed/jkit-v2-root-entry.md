# jkit V2 Root Entry

## Goal

Add a lightweight jkit root entry that helps users discover the workflow,
choose the next command, and diagnose install/load issues without becoming a
new workflow stage.

## Checklist

- [x] Add `skills/jkit/SKILL.md`.
- [x] Add `commands/jkit.md`.
- [x] Wire `jkit` into installer skill lists and package docs.
- [x] Update README, AGENTS, and agent-map references.
- [x] Record the npm 0.9.2 OTP interruption and version mismatch.
- [x] Regenerate agent indexes.
- [x] Run verification.

## Verification

```bash
node -c bin/jkit.js
node bin/jkit.js --help
node bin/jkit.js status
./scripts/codex-plugin-check
./scripts/agent-map-check
npm pack --dry-run --json
```

## Progress Log

- 2026-06-07: Started after deciding that `jkit` should be the root help and
  routing entry, backed by a portable skill and a thin command wrapper.
- 2026-06-07: Added `skills/jkit/SKILL.md`, `commands/jkit.md`, installer
  wiring, README/AGENTS/agent-map/spec updates, version bump to `0.9.3`, and
  the OTP/version-mismatch record. Regenerated `docs/generated/repo-map.md`.
  Verification passed:
  `node -c bin/jkit.js`, `node bin/jkit.js --help`,
  `node bin/jkit.js status`, `./scripts/codex-plugin-check`,
  `./scripts/agent-map-check`, and `npm pack --dry-run --json`.
