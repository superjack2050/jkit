---
description: Adaptively orchestrate intent to verified done.
---

Use the `to-done` skill workflow from `skills/to-done/SKILL.md`.

Drive an intent to verified done by choosing the shortest safe jkit path:

- Read the repository agent map first.
- Apply the `/to-done` readiness gate.
- Route visibly through `/explore`, `/grill-me`, `/to-spec`, `/clarify`,
  `/to-plan`, or `/run` when that stage is required.
- Convert user intent into durable workflow artifacts: an intent brief, a
  behavior spec, and an active ExecPlan.
- Use minimal specs and plans only for clear small work.
- Use full specs and plans for complex work.
- Delegate execution semantics to `/run`; do not create a separate execution
  loop.
- When entering `/run`, ask `/run` to prefer Codex `/goal` tracking for
  eligible `/to-done` handoffs.
- Let `/run` choose and record the final execution strategy, derive the
  executable runtime goal contract, and decide optional Codex `/goal` or
  subagent use.
- Review, repair, verify, update maps, and record failures before claiming
  done.
- Move the plan to completed only when required verification passes.

Readiness routing:

- rough need or unselected direction: enter `/explore`
- selected but untested direction: enter `/grill-me`
- behavior ready but not durable: enter `/to-spec`
- blocking spec questions: enter `/clarify <spec-slug>`
- plan-ready spec: enter `/to-plan <spec-slug>`
- existing active plan: enter `/run <plan-slug>`

Do not use `/to-done` to hide ambiguity, skip durable artifacts, bypass
verification, silently choose among consequential alternatives, or create a
Codex `/goal` objective from raw user intent.
