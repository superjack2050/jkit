---
description: Turn a reviewable spec into an executable active ExecPlan.
---

Use the `to-plan` skill workflow from `skills/to-plan/SKILL.md`.

Create or update one active ExecPlan from one source spec:

- Read the repository agent map first.
- Resolve the spec from the configured specs directory.
- Validate that the spec has goals, non-goals, acceptance criteria,
  verification signals, and no blocking open questions.
- Reuse an existing active plan for the same spec when one exists.
- Write the required ExecPlan shape with `## Checklist` as the `/run`
  execution queue.
- Preserve completed checklist items and progress logs when updating a plan.
- Define the Verification Loop, rollback path, decisions, and handoff notes.
- Update open questions, generated indexes, and maps when relevant.
- Do not implement code or run the plan's full Verification Loop.

If the spec is not plannable, stop and suggest `/clarify <spec-slug>`.

Handoff with:

- Artifact: source spec, active plan, and map updates.
- Readiness: plannability, checklist shape, Verification Loop, and blockers.
- Next command: usually `/run <plan-slug>`.
