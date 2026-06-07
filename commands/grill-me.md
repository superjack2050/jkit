---
description: Pressure-test a selected requirement before /to-spec.
---

Use the `grill-me` skill workflow from `skills/grill-me/SKILL.md`.

Pressure-test one selected requirement and solution direction:

- Continue from the current `/explore` direction when no explicit input is
  supplied.
- Use explicit input as the selected direction when supplied.
- Read the repository agent map and targeted project evidence when relevant.
- Ask exactly one question per turn.
- Include a recommended answer with every question.
- Resolve decision branches that affect scope, behavior, safety, data,
  compatibility, acceptance criteria, verification, or workflow contracts.
- Do not explore broad option spaces, write specs, create ExecPlans, edit
  files, implement code, or run verification as part of normal grilling.
- Recommend `/explore`, `/clarify`, `/to-spec`, or `/to-spec --update` when a
  different command is a better fit.

Handoff with:

- Requirement and direction
- Decisions resolved
- Recommended answers accepted
- Project evidence used
- Risky assumptions
- Remaining open questions
- Next `/to-spec` input
