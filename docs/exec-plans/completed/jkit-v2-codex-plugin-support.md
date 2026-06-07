# Plan: jkit v2 Codex plugin support

## Goal

Make jkit consumable as a Codex plugin by adding a valid
`.codex-plugin/plugin.json` manifest for the existing skill bundle, updating
distribution metadata, and verifying both Codex and Claude plugin surfaces.

## Context

- Source spec: `docs/specs/codex-plugin-support.md`.
- Existing Claude Code plugin metadata lives under `.claude-plugin/`.
- Existing skill workflows live under `skills/<name>/SKILL.md`.
- The local Codex plugin contract requires `.codex-plugin/plugin.json`.
- The local Codex validator is wrapped by `./scripts/codex-plugin-check`.
- Current package metadata uses a placeholder npm scope; this plan bumps the
  package and plugin metadata from `0.5.0` to `0.6.0`.

## Non-goals

- Do not add Codex marketplace entries.
- Do not add Codex apps, MCP servers, hooks, or assets.
- Do not change skill behavior.
- Do not remove Claude Code plugin support.
- Do not publish to npm.
- Do not change the npm package name placeholder.

## Design

Add `.codex-plugin/plugin.json` at repo root with:

- `name: "jkit"`
- version aligned to the next package/plugin release
- `skills: "./skills/"`
- author, license, keywords, and interface metadata accepted by the local
  Codex plugin validator through `./scripts/codex-plugin-check`

Update package and map surfaces so the Codex manifest is packaged and the
project is described as a Claude Code and Codex plugin bundle. Keep
`bin/jkit.js` as the Claude Code local skill installer; Codex plugin support is
through the manifest, not through the Claude installer.

## Checklist

- [x] Create minimal spec `docs/specs/codex-plugin-support.md`.
- [x] Create this active ExecPlan.
- [x] Add `.codex-plugin/plugin.json`.
- [x] Update `package.json` files list, version, description, and keywords.
- [x] Update `.claude-plugin` versions for release alignment.
- [x] Update README, AGENTS, agent-map, open questions, and quality docs.
- [x] Add `scripts/codex-plugin-check` as a reproducible Codex validator wrapper.
- [x] Refresh generated indexes.
- [x] Validate the Codex plugin manifest.
- [x] Run JSON, installer, package, and map verification.
- [x] Review changed files against the spec and fix in-scope issues.
- [x] Record final progress and move this plan to completed.

## Verification

```bash
./scripts/codex-plugin-check
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js install --silent-if-not-global
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

## Decisions

- 2026-06-06: Support Codex plugin consumption with a root
  `.codex-plugin/plugin.json` manifest that points to the existing `skills/`
  directory.
- 2026-06-06: Do not create Codex marketplace entries in this slice; the user
  asked for plugin support, not marketplace distribution.
- 2026-06-06: Keep the Claude Code installer behavior unchanged.

## Progress Log

- 2026-06-06: Created the minimal spec and active ExecPlan from the user's
  `/to-done` request to support Codex plugin consumption.
- 2026-06-06: Added `.codex-plugin/plugin.json`, included `.codex-plugin/` in
  package files, bumped package and plugin metadata to `0.6.0`, and updated
  README, AGENTS, `agent-map.yaml`, open questions, quality docs, engineering
  and security docs, and relevant specs to describe Codex support.
- 2026-06-06: Added `scripts/codex-plugin-check` because the local Codex
  validator depends on PyYAML, which was absent from the default Python. The
  wrapper uses an existing Python with PyYAML or creates a temporary venv under
  `/tmp`.
- 2026-06-06: Verification passed:
  `./scripts/codex-plugin-check`;
  JSON parse for `package.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, and `.codex-plugin/plugin.json`;
  `node bin/jkit.js status`;
  `node bin/jkit.js install --silent-if-not-global`;
  `npm pack --dry-run`;
  `./scripts/agent-map-generate`; and `./scripts/agent-map-check`. The package
  dry run includes `.codex-plugin/plugin.json` and `scripts/codex-plugin-check`.
  No verification failures or workflow exceptions were recorded.

## Rollback

Remove `.codex-plugin/plugin.json`, remove `.codex-plugin/` from
`package.json` files, revert docs/maps/records that describe Codex support, and
refresh generated indexes.
