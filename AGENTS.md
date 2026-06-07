# Agent Map

This file is the short entry point for coding agents. Treat it as a map, not as
the full manual. Load deeper context from `docs/` only when the task needs it.

## First Read

- Documentation index: `docs/README.md`
- Default workflow: `docs/WORKFLOW.md`
- Plans and long-running work: `docs/PLANS.md`
- System architecture: `ARCHITECTURE.md`
- Agent map config: `agent-map.yaml`

## Project Shape

- `skills/map-init`: skill for initializing repository agent maps.
- `skills/explore`: skill for discussing rough requirements, comparing
  solution directions, and producing ready `/to-spec` input.
- `skills/grill-me`: skill for pressure-testing selected requirements and
  solution directions before `/to-spec`.
- `skills/clarify`: skill for resolving planning-blocking ambiguity in one
  existing spec before `/to-plan`.
- `skills/to-spec`: skill for creating or updating reviewable
  specs from briefs or unclear behavior requests.
- `skills/to-plan`: skill for converting reviewable specs into
  executable active ExecPlans.
- `skills/to-done`: skill for fast-pathing clear, bounded work
  through minimal spec, minimal plan, `/run`, and verified completion.
- `skills/run`: skill for driving one active plan's Goal-Driven Execution loop
  to verified completion.
- `commands/map-init.md`: plugin command wrapper for `/jkit:map-init`.
- `commands/explore.md`: plugin command wrapper for `/jkit:explore`.
- `commands/grill-me.md`: plugin command wrapper for `/jkit:grill-me`.
- `commands/clarify.md`: plugin command wrapper for `/jkit:clarify`.
- `commands/to-spec.md`: plugin command wrapper for `/jkit:to-spec`.
- `commands/to-plan.md`: plugin command wrapper for `/jkit:to-plan`.
- `commands/to-done.md`: plugin command wrapper for `/jkit:to-done`.
- `commands/run.md`: plugin command wrapper for `/jkit:run`.
- `bin/jkit.js`: runtime installer for Codex local plugin registration and
  Claude Code local skill symlink fallback.
- `.claude-plugin`: Claude plugin metadata.
- `.codex-plugin`: Codex plugin metadata.
- `docs`: canonical agent-readable knowledge base.
- `scripts`: lightweight agent-map checks and generated indexes.

## Common Commands

- Check runtime install state: `node bin/jkit.js status`
- Check Codex plugin registration: `node bin/jkit.js codex status`
- Check Claude Code local symlink fallback: `node bin/jkit.js claude-code status`
- Package dry run: `npm pack --dry-run`
- Validate Codex plugin: `./scripts/codex-plugin-check`
- Check agent maps: `./scripts/agent-map-check`
- Generate agent indexes: `./scripts/agent-map-generate`

## Task Routing

- New behavior or command: update `docs/specs/` first, then create/update an
  ExecPlan under `docs/exec-plans/active/`.
- Rough requirement or unselected solution direction: use `/explore` before
  writing a durable spec.
- Selected requirement or solution direction with unresolved decision branches:
  use `/grill-me` before `/to-spec`.
- Existing spec with blocking ambiguity before planning: use `/clarify` before
  `/to-plan`.
- Agent-map workflow change: update `docs/WORKFLOW.md`, `docs/PLANS.md`, and
  `agent-map.yaml` when needed.
- Repeated implementation pattern: promote it into `docs/playbooks/`.
- Work already happened outside the workflow: record it under
  `docs/records/workflow-exceptions/`.
- Verification failure: record exact command and summary under
  `docs/records/verification-failures/`.

## Hard Rules

- Keep `AGENTS.md` short; durable context belongs in `docs/`.
- Do not reintroduce old `before-build` or `build` behavior without a spec and
  plan; use `/run` for the v2 execution loop.
- Do not invent missing project facts; record open questions instead.
- Do not commit secrets, tokens, credentials, or private local config.
- Update maps when commands, package layout, skill behavior, or workflow rules
  change.

## Done Criteria

- Relevant specs, plans, docs, and records were updated.
- `/run` completed the active plan's ready work, reviewed the diff, fixed
  in-scope issues, and passed required verification, or recorded exact blockers.
- `./scripts/agent-map-check` passed.
- `./scripts/agent-map-generate` was run when source layout changed.
- `node bin/jkit.js status` and `npm pack --dry-run` were run for package or
  skill distribution changes.
