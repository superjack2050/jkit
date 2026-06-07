# Quality Score

This file tracks agent-readiness and known quality gaps.

## Current Score

Overall: 8 / 10

## Strengths

- Repository has a short `AGENTS.md` entry map.
- `/map-init`, `/explore`, `/grill-me`, `/clarify`, `/to-spec`, `/to-plan`,
  `/to-done`, and `/run` are shipped v2 skills.
- `/explore` has a command skill, wrapper, map-aware lightweight exploration
  rules, and `/to-spec` handoff requirements.
- `/grill-me` has a command skill, wrapper, targeted project-base evidence
  rules, one-question-at-a-time pressure testing, and `/to-spec` handoff
  requirements.
- `/clarify` has a command skill, wrapper, targeted project-base evidence
  rules, at-most-five planning-blocking questions, spec-update behavior, and
  `/to-plan` handoff requirements.
- `/to-spec` has been locally dogfooded for new-spec, existing-spec update, and
  missing-brief behavior.
- `/to-plan` has a command skill, wrapper, active-plan reuse rules, and
  blocking-question behavior.
- `/to-done` has a command skill, wrapper, eligibility gate, fallback rules,
  and durable-artifact requirements.
- Codex plugin support is represented by `.codex-plugin/plugin.json` and shares
  the existing `skills/` bundle.
- Runtime install support is explicit: Claude Code uses plugin marketplace, and
  Codex uses `npm install -g @nobodyjack/jkit` plus `jkit codex install`.
- Specs and ExecPlans now live under `docs/`.
- Lightweight map check and generated repo map scripts exist.

## Gaps

- `/map-init` has not yet been dogfooded in real Claude Code sessions.
- `/map-repair` is specified but not implemented.
- No fixture-based eval harness exists yet.

## Last Verification

On 2026-06-07, release cleanup and npm publication checks passed:

- `node -c bin/jkit.js`
- `node bin/jkit.js status`
- `./scripts/agent-map-check`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- package leak scan confirmed `docs/exec-plans/`, `docs/records/`,
  `docs/specs/`, `/map-repair`, and `.swp` files were excluded from the npm
  tarball
- `npm view @nobodyjack/jkit version` returned `0.9.1` after publication

On 2026-06-06, these checks passed:

- `./scripts/agent-map-check`
- `./scripts/agent-map-generate`
- JSON metadata parse for `package.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json`
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `npm pack --dry-run`
- stale wording scans for old checklist terminology and `/to-spec` not-shipped
  text

On 2026-06-06, `/to-plan` implementation checks also passed:

- file existence checks for `commands/to-plan.md` and
  `skills/to-plan/SKILL.md`
- `rg -n "to-plan" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json`
- JSON metadata parse for `package.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json`
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`

On 2026-06-06, `/to-done` implementation checks also passed:

- file existence checks for `commands/to-done.md` and
  `skills/to-done/SKILL.md`
- `rg -n "to-done" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json`
- JSON metadata parse for `package.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json`
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`

On 2026-06-06, Codex plugin support checks also passed:

- `./scripts/codex-plugin-check`
- JSON metadata parse for `package.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, and `.codex-plugin/plugin.json`
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`

On 2026-06-06, runtime install UX checks also passed:

- `node -c bin/jkit.js`
- `node bin/jkit.js --help`
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- temporary-`HOME` `node bin/jkit.js codex install/status/uninstall`
- removed-command checks for `jkit install`, `jkit uninstall`, `jkit doctor`,
  and `jkit claude status`
- JSON metadata parse for package/plugin metadata
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`

On 2026-06-06, `/explore` implementation checks also passed:

- file existence checks for `commands/explore.md` and
  `skills/explore/SKILL.md`
- `rg -n "explore" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json`
- absent-alias checks for `/shape` and save mode in shipped `/explore`
  surfaces
- JSON metadata parse for package/plugin metadata
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`

On 2026-06-06, `/grill-me` implementation checks also passed:

- file existence checks for `commands/grill-me.md` and
  `skills/grill-me/SKILL.md`
- `rg -n "grill-me" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json`
- shipped-command checks confirming then-unshipped commands were not listed in
  public command surfaces
- JSON metadata parse for package/plugin metadata
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`

On 2026-06-06, `/clarify` implementation checks also passed:

- file existence checks for `commands/clarify.md` and
  `skills/clarify/SKILL.md`
- `rg -n "clarify" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json`
- shipped-command checks confirming public command surfaces matched the shipped
  command set
- JSON metadata parse for package/plugin metadata
- `node -c bin/jkit.js`
- `node bin/jkit.js status`
- `node bin/jkit.js claude-code status`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- `./scripts/agent-map-generate`
- `./scripts/agent-map-check`
