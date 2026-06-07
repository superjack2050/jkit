---
description: Explore a rough idea and produce ready input for /to-spec.
---

Use the `explore` skill workflow from `skills/explore/SKILL.md`.

Turn a rough idea or current-session context into a recommended direction:

- Read the repository agent map when relevant.
- Use explicit input when supplied; otherwise infer from current session
  context.
- Ask at most three high-leverage questions before producing an option set.
- Compare two to four approaches when alternatives exist.
- Recommend one direction and explain why.
- Do not write specs, create ExecPlans, edit files, implement code, or run
  verification as part of normal exploration.
- Recommend `/grill-me`, `/clarify`, `/to-spec`, `/to-spec --update`, or
  `/to-done` when a different command is a better fit.

Handoff with:

- Recommended direction
- Why
- Alternatives considered
- Risks
- Open questions
- Next `/to-spec` input
