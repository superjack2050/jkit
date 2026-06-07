---
description: Fast-path clear, bounded work to verified done.
---

Use the `to-done` skill workflow from `skills/to-done/SKILL.md`.

Fast-path only when the request is already clear from the current session or is
simple enough to explain in one or two sentences:

- Read the repository agent map first.
- Apply the `/to-done` eligibility gate.
- Write or reuse a minimal spec before planning.
- Write or reuse a minimal active ExecPlan before implementation.
- Delegate execution semantics to `/run`; do not create a separate execution
  loop.
- Review, repair, verify, update maps, and record failures before claiming
  done.
- Move the plan to completed only when required verification passes.

Fallbacks:

- unclear behavior: suggest `/to-spec`
- blocking spec questions: suggest `/clarify <spec-slug>`
- unresolved implementation strategy: suggest `/to-plan <spec-slug>`
- existing active plan: delegate to `/run <plan-slug>`

Do not use this fast path for broad, risky, destructive, production-facing,
external-live, or unverifiable work.
