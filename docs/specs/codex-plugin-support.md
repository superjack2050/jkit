# Spec: codex-plugin-support

> Status: draft
> Product: jkit v2
> Scope: support Codex plugin consumption alongside Claude Code plugin support

## 1. Summary

jkit should be consumable as a Codex plugin while preserving the existing
Claude Code plugin support.

The Codex plugin surface must use the real local Codex plugin contract:
`.codex-plugin/plugin.json` at the plugin root, with the existing `skills/`
directory exposed through the manifest.

## 2. Goals

- Add a Codex plugin manifest for the current jkit skill bundle.
- Keep the existing Claude Code plugin metadata and command wrappers working.
- Include the Codex plugin manifest in npm packaging.
- Update docs, maps, and records so jkit is no longer described as Claude-only.
- Validate the Codex plugin manifest with the local Codex plugin validator.

## 3. Non-goals

- Do not add Codex MCP servers, apps, hooks, or marketplace entries in this
  slice.
- Do not change command behavior or skill semantics.
- Do not remove Claude Code plugin support.
- Do not publish to npm or a plugin marketplace.
- Do not change the npm package name placeholder in this slice.

## 4. Behavior contract

- The repository root contains `.codex-plugin/plugin.json`.
- The Codex manifest points to `./skills/`.
- The Codex manifest contains valid name, version, description, author, license,
  keywords, and interface metadata.
- Existing Claude Code plugin metadata remains in `.claude-plugin/`.
- `package.json` includes `.codex-plugin/` in the published files list.
- Documentation describes jkit as supporting Claude Code and Codex plugin
  consumption.

## 5. Verification

```bash
./scripts/codex-plugin-check
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js claude-code status
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

## 6. Acceptance criteria

- `.codex-plugin/plugin.json` exists and passes local Codex plugin validation.
- `npm pack --dry-run` includes `.codex-plugin/plugin.json`.
- Existing Claude Code metadata still parses.
- README, AGENTS, `agent-map.yaml`, open questions, and generated indexes are
  aligned with Codex plugin support.
- No new Codex marketplace, app, MCP, hook, or publish workflow is introduced.

## 7. Assumptions and open questions

- [ASSUMED] The first Codex support slice only needs the root plugin manifest
  because current jkit skills already live under `skills/`.
- [ASSUMED] Runtime-specific Codex registration is specified separately in
  `runtime-install.md`.
