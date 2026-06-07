# Plan: jkit v2 runtime install UX

## Goal

Make the public installation experience runtime-specific and truthful: Chinese
README by default with English switch, Claude Code through plugin marketplace,
and Codex through npm plus explicit `jkit codex` registration commands.

## Context

- Source spec: `docs/specs/runtime-install.md`.
- Current README is English-only.
- Current npm package name is still `@YOUR_NPM_SCOPE/jkit`.
- Current `bin/jkit.js` only supports the legacy Claude Code skill symlink
  installer.
- Claude Code should be plugin-first; npm should not mutate Claude Code during
  Codex installs.
- Codex support already has `.codex-plugin/plugin.json` and local validator
  coverage.

## Non-goals

- Do not publish to npm.
- Do not add marketplace listings beyond existing local metadata.
- Do not change jkit skill behavior.
- Do not implement `/map-repair`.

## Design

Update `bin/jkit.js` to support runtime namespaces:

```text
jkit codex install|uninstall|status
jkit claude-code install|uninstall|status
jkit status
```

Keep legacy commands as aliases:

```text
jkit install
jkit uninstall
jkit doctor
```

Remove the package postinstall hook so `npm install -g @nobodyjack/jkit`
installs the package only. Runtime setup is explicit.

Rewrite `README.md` in Chinese and add `README.en.md` with matching English
content. Group installation by runtime and provide two paths under each:
install with the AI agent and manual install.

## Checklist

- [x] Create spec for runtime install UX.
- [x] Create this active ExecPlan.
- [x] Update package name and remove postinstall runtime side effect.
- [x] Implement runtime-aware CLI install/status commands.
- [x] Rewrite `README.md` in Chinese.
- [x] Add `README.en.md`.
- [x] Update map/docs metadata that describes installer behavior.
- [x] Refresh generated indexes.
- [x] Run verification.
- [x] Review diff and fix in-scope issues.
- [x] Move plan to completed with progress and verification notes.

## Verification

```bash
node -c bin/jkit.js
node bin/jkit.js --help
node bin/jkit.js status
tmp_home="$(mktemp -d)" && HOME="$tmp_home" node bin/jkit.js codex install && HOME="$tmp_home" node bin/jkit.js codex status && HOME="$tmp_home" node bin/jkit.js codex uninstall
node bin/jkit.js install --silent-if-not-global
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

## Progress Log

- 2026-06-06: Created the spec and active plan after deciding the public README
  should default to Chinese, link to English, group install by runtime, and use
  Claude Code plugin install plus Codex npm registration.
- 2026-06-06: Rewrote `README.md` in Chinese, added `README.en.md`, changed the
  npm package name to `@nobodyjack/jkit`, removed the package postinstall
  side effect, and included `README.en.md` in package files.
- 2026-06-06: Updated `bin/jkit.js` with runtime namespaces:
  `jkit codex install|uninstall|status` and
  `jkit claude-code install|uninstall|status`, while preserving legacy
  `jkit install`, `jkit uninstall`, and `jkit status`.
- 2026-06-06: Updated AGENTS, agent map config, open questions, reliability,
  engineering, quality notes, spec index, and generated repo map for the new
  install model.
- 2026-06-06: Review found two in-scope issues and both were fixed: the spec
  used separate temporary `HOME` directories for Codex install/status examples,
  and `jkit claude-code` without an action defaulted to install instead of
  status.
- 2026-06-06: Verification passed:
  `node -c bin/jkit.js`;
  `node bin/jkit.js --help`;
  `node bin/jkit.js status`;
  `node bin/jkit.js claude-code`;
  temporary-`HOME` `node bin/jkit.js codex install/status/uninstall`;
  `node bin/jkit.js install --silent-if-not-global`;
  JSON parse for package/plugin metadata;
  `./scripts/codex-plugin-check`;
  `npm pack --dry-run`;
  `./scripts/agent-map-generate`; and
  `./scripts/agent-map-check`. No verification failures or workflow exceptions
  were recorded.

## Rollback

Revert `README.md`, remove `README.en.md`, restore package name/postinstall,
restore the previous `bin/jkit.js` single-runtime installer behavior, update
maps back to the prior installer description, and refresh generated indexes.
