# Documentation Map

This directory is the canonical knowledge base for agents and humans working on
jkit. Keep `AGENTS.md` short and put durable context here.

## Start Here

- Default workflow: `WORKFLOW.md`
- Plans and long-running work: `PLANS.md`
- Agent working principles: `AGENT_WORKING_PRINCIPLES.md`
- Engineering rules: `ENGINEERING.md`
- Security: `SECURITY.md`
- Reliability: `RELIABILITY.md`

## Knowledge Areas

- Specs: `specs/`
- Design docs and ADRs: `design-docs/`
- Repeatable workflows: `playbooks/`
- Active and completed plans: `exec-plans/`
- Records and exceptions: `records/`
- Generated indexes: `generated/`
- References: `references/`

## Maintenance Rules

- Update specs when command behavior changes.
- Update design docs when architecture changes.
- Update playbooks when a workflow repeats.
- Record failed verification under `records/verification-failures/`.
- Refresh generated indexes when source layout changes.
