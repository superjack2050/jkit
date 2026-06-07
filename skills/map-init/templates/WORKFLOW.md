# Workflow

This is the default workflow for humans and AI agents working in this
repository.

## Operating Model

- Humans set intent, constraints, priorities, and approval boundaries.
- Agents read the map, plan coherent goals, implement, review, fix, verify, and
  update durable docs.
- `AGENTS.md` is the fast entry point.
- Specs live under `docs/specs/`.
- ExecPlans live under `docs/exec-plans/`.
- Records under `docs/records/` capture open questions, workflow exceptions,
  and verification failures.

Agent maps are living harnesses. Convert repeated friction into clearer docs,
stricter checks, safer workflows, and reusable skills.

## Standard Task Brief

```md
Goal:
Context:
Constraints:
Done when:
```

If one field is missing, make a conservative assumption and record it in the
plan, open questions, or final response. Ask only when the choice changes
product behavior, security, data retention, compatibility, or irreversible
operations.

## Default Flow

1. Read `AGENTS.md`, `agent-map.yaml`, and the relevant docs.
2. Use `/to-spec` for unclear or new behavior.
3. Use `/to-plan` to turn an accepted spec into a checklist.
4. Use `/run` to drive the active plan's Goal-Driven Execution loop.
5. Let `/run` execute ready pending checklist items, review the diff, fix
   in-scope issues, and rerun verification until it passes or records a
   blocker.
6. When work happened outside the workflow or maps drifted, record the
   exception, update affected docs/maps, and rerun map checks.

## Verification Ladder

1. Focused check for the touched area.
2. Project verification command from `agent-map.yaml`, if verified.
3. Agent map check: `./scripts/agent-map-check`, if present.
4. Generated context refresh: `./scripts/agent-map-generate`, if present.
5. Manual or external checks only when explicitly approved.

## Definition of Done

- The requested behavior or scaffold exists.
- Specs/plans/docs were updated when needed.
- The diff was reviewed and in-scope issues were fixed.
- Real verification passed, or exact blockers were recorded.
- New repeated lessons were promoted to playbooks or records.
