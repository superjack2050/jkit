# Agent Map

This file is the short entry point for coding agents. Treat it as a map, not as
the full manual. Load deeper context only when the task needs it.

## First Read

- Documentation index: `docs/README.md`
- Default workflow: `docs/WORKFLOW.md`
- Plans and long-running work: `docs/PLANS.md`
- System architecture: `ARCHITECTURE.md`
- Agent map configuration: `agent-map.yaml`

## Project Shape

- [ASSUMED] Project shape is recorded from discovered files.
- Source: TBD
- Tests: TBD
- Docs: `docs/`

## Common Commands

- Generate agent indexes: `./scripts/agent-map-generate` or TBD
- Check agent maps: `./scripts/agent-map-check` or TBD
- Verify project: TBD

## Task Routing

- New behavior or feature: create/update a spec under `docs/specs/`, then use
  `/to-plan`.
- Complex or multi-step work: create/update an ExecPlan under
  `docs/exec-plans/active/`.
- Work already happened outside the workflow: record it under
  `docs/records/workflow-exceptions/` and update affected maps.
- Verification failure: record exact command and summary under
  `docs/records/verification-failures/`.

## Hard Rules

- Do not invent missing project facts; record open questions instead.
- Do not overwrite human-authored docs without confirmation.
- Do not commit secrets, tokens, credentials, or private local config.
- Update maps when behavior, architecture, commands, data shape, or workflow
  expectations change.

## Done Criteria

- Relevant specs, plans, and docs were updated.
- Verification was run, or exact blockers were recorded.
- New repeated workflow guidance was promoted into `docs/playbooks/`.
- Generated indexes were refreshed when source layout changed.
