# Plan: jkit v2 remove legacy install compatibility

## Goal

Remove historical CLI compatibility entry points from the runtime installer so
the public install surface is explicit and unambiguous.

## Context

- Source spec: `docs/specs/runtime-install.md`.
- The desired user-facing install shape is:
  - Claude Code through Claude Code plugin commands.
  - Codex through `npm install -g @nobodyjack/jkit` plus
    `jkit codex install`.
- The previous runtime-install slice kept compatibility aliases such as
  `jkit install`, `jkit uninstall`, `jkit doctor`, `jkit claude`, and
  `--silent-if-not-global`.
- The user explicitly asked to remove historical compatibility.

## Non-goals

- Do not remove the explicit Claude Code local fallback namespace
  `jkit claude-code ...`.
- Do not change skill behavior.
- Do not change plugin metadata.
- Do not publish to npm.

## Design

Keep only these CLI commands:

```text
jkit codex install|uninstall|status
jkit claude-code install|uninstall|status
jkit status
jkit help
jkit --help
```

Remove root-level install/uninstall aliases, `remove`, `doctor`, short
`claude`, implicit runtime default actions, and the old
`--silent-if-not-global` postinstall guard.

## Checklist

- [x] Update `docs/specs/runtime-install.md`.
- [x] Create this active ExecPlan.
- [x] Remove legacy aliases and implicit actions from `bin/jkit.js`.
- [x] Update current docs and active plans that still cite removed commands.
- [x] Refresh generated indexes.
- [x] Verify current commands work and removed commands fail.
- [x] Review diff and fix in-scope issues.
- [x] Move plan to completed with verification notes.

## Verification

```bash
node -c bin/jkit.js
node bin/jkit.js --help
node bin/jkit.js status
node bin/jkit.js claude-code status
tmp_home="$(mktemp -d)" && HOME="$tmp_home" node bin/jkit.js codex install && HOME="$tmp_home" node bin/jkit.js codex status && HOME="$tmp_home" node bin/jkit.js codex uninstall
node bin/jkit.js install >/tmp/jkit-legacy-install.out 2>&1 && exit 1 || true
node bin/jkit.js uninstall >/tmp/jkit-legacy-uninstall.out 2>&1 && exit 1 || true
node bin/jkit.js doctor >/tmp/jkit-legacy-doctor.out 2>&1 && exit 1 || true
node bin/jkit.js claude status >/tmp/jkit-legacy-claude.out 2>&1 && exit 1 || true
node bin/jkit.js codex >/tmp/jkit-missing-codex-action.out 2>&1 && exit 1 || true
node bin/jkit.js claude-code >/tmp/jkit-missing-claude-action.out 2>&1 && exit 1 || true
node bin/jkit.js claude-code install --silent-if-not-global >/tmp/jkit-legacy-flag.out 2>&1 && exit 1 || true
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

## Progress Log

- 2026-06-06: Created the plan after the user confirmed all historical
  compatibility should be removed.
- 2026-06-06: Removed root-level `jkit install`, `jkit uninstall`, `remove`,
  `doctor`, short `claude`, implicit runtime default actions, and the old
  `--silent-if-not-global` flag handling from `bin/jkit.js`.
- 2026-06-06: Updated the runtime-install spec plus current active plans,
  quality notes, and related specs so current verification uses
  `jkit claude-code status` instead of removed legacy install aliases.
- 2026-06-06: Verification passed:
  `node -c bin/jkit.js`;
  `node bin/jkit.js --help`;
  `node bin/jkit.js status`;
  `node bin/jkit.js claude-code status`;
  temporary-`HOME` `node bin/jkit.js codex install/status/uninstall`;
  removed-command checks for `install`, `uninstall`, `doctor`,
  `claude status`, missing `codex` action, missing `claude-code` action, and
  `claude-code install --silent-if-not-global`;
  JSON metadata parse;
  `./scripts/codex-plugin-check`;
  `npm pack --dry-run`; and
  `./scripts/agent-map-generate`. No verification failures or workflow
  exceptions were recorded.

## Rollback

Reintroduce the removed aliases in `bin/jkit.js`, restore the previous
runtime-install spec language, refresh generated indexes, and rerun package and
map verification.
