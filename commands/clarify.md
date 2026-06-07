---
description: Resolve blocking ambiguity in an existing spec before /to-plan.
---

Use the `clarify` skill workflow from `skills/clarify/SKILL.md`.

Clarify one existing spec:

- Resolve exactly one existing spec from explicit input, a spec file, or the
  current session context.
- Read the repository agent map and the selected spec before editing.
- Classify ambiguity as blocking, non-blocking, planning detail,
  implementation detail, or out-of-scope behavior change.
- Use targeted project-base evidence before asking the user.
- Ask or resolve at most five high-impact planning-blocking questions per pass.
- Include why each question blocks planning, project evidence, a recommended
  answer, and alternatives.
- Update the selected spec with resolved clarifications.
- Update project open questions when unresolved project-level blockers remain.
- Preserve accepted behavior unless the user explicitly confirms a change.
- Do not create new specs, create ExecPlans, implement code, or broaden into
  `/explore` or `/grill-me`.

Handoff with:

- Spec clarified
- Clarifications applied
- Project evidence used
- Remaining blockers
- Readiness
- Next command: usually `/to-plan <spec-slug>`
