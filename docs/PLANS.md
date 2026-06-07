# ExecPlans

Use an ExecPlan for complex features, broad refactors, migrations, or work that
may span multiple agent sessions.

## Location

- Active plans: `docs/exec-plans/active/`
- Completed plans: `docs/exec-plans/completed/`
- Debt tracker: `docs/exec-plans/tech-debt-tracker.md`

## Required Shape

```md
# Plan: <name>

## Goal
What user-visible, operational, or harness outcome this plan delivers.

## Context
- Files and docs to read first.
- Existing behavior and constraints.

## Non-goals
What this plan intentionally does not change.

## Design
Architecture, interfaces, rollout shape, and tradeoffs.

## Checklist
- [ ] Small, verifiable step.

## Verification
Commands, smoke checks, fixtures, dashboards, or manual checks.

## Decisions
- YYYY-MM-DD: Decision and reason.

## Progress Log
- YYYY-MM-DD: What changed, what passed, what remains.

## Rollback
How to revert or disable the change.
```

## Agent Protocol

- Keep the plan updated as work proceeds.
- Keep the checklist current as items pass verification or become blocked.
- Do not rely on chat history for durable state.
- Record exact failed commands and summaries.
- Move completed plans only after verification and doc updates.
