---
description: Execute an active ExecPlan goal loop to verified completion.
---

Use the `run` skill workflow from `skills/run/SKILL.md`.

Drive the selected active plan as a Goal-Driven Execution loop:

- Read `AGENTS.md`, `agent-map.yaml`, `docs/WORKFLOW.md`, and `docs/PLANS.md`.
- Resolve the active plan from `docs/exec-plans/active/`.
- Read the referenced specs and plan context.
- Decide and record the execution strategy: single-agent by default, optional
  Codex `/goal`, optional bounded subagent review/investigation, or optional
  isolated subagent implementation.
- Execute all ready pending checklist items by default.
- Review the resulting diff and behavior against the spec and plan.
- Fix in-scope review findings and failed checks.
- Rerun verification until it passes or a concrete blocker is recorded.
- Update checklist statuses, progress log, decisions, records, generated
  indexes, and verification status before final response.
- Record whether specs, architecture/design docs, playbooks, generated indexes,
  and open questions needed updates.

If no active plan exists, stop and suggest `/to-plan`.

If the user explicitly asks for a narrow run, execute only that selected
checklist item and record that the run was intentionally scoped.
