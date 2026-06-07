---
description: Turn explicit input or current context into a reviewable spec.
---

Use the `to-spec` skill workflow from `skills/to-spec/SKILL.md`.

Create or update one spec under the configured specs directory:

- Read the repository agent map first.
- Use one of two input modes:
  - No-input mode: no explicit input is supplied; infer the behavior request
    primarily from current session context.
  - Input mode: explicit input is supplied; use it as the primary request.
- Ground the spec in the repository map and docs during intake.
- Reuse an existing related spec when appropriate.
- Ask only when missing information changes behavior, safety, data,
  compatibility, distribution, verification, or public workflow.
- Record assumptions as `[ASSUMED]` and important unresolved facts as
  `[NEEDS_INVESTIGATION]`.
- Update `docs/specs/index.md`, open questions, and generated indexes when
  relevant.
- Do not implement code or create an ExecPlan by default.

Handoff with:

- Artifact: spec path, status, and map updates.
- Readiness: assumptions, unresolved questions, verification, and whether
  anything blocks planning.
- Next command: usually `/to-plan <spec-slug>`.
