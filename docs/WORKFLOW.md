# Workflow

This is the default workflow for humans and agents working on jkit.

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

## Default Flow

1. Read `AGENTS.md`, `agent-map.yaml`, and the relevant docs.
2. Use `/explore` when the request is a rough requirement or needs solution
   direction comparison before spec writing.
3. Use `/grill-me` when a selected requirement or solution direction needs
   one-question-at-a-time pressure testing before spec writing.
4. Use `/to-spec` or update a spec under `docs/specs/` for new command
   behavior.
5. Use `/clarify` when an existing spec has blocking ambiguity that would force
   `/to-plan` to invent decisions.
6. Use `/to-plan` to create or update an ExecPlan under
   `docs/exec-plans/active/` for complex work.
7. Use `/run` to drive the active plan's Goal-Driven Execution loop.
8. Let `/run` execute ready pending checklist items, review the diff, fix
   in-scope issues, and rerun verification until it passes or records a
   blocker.
9. Update progress, verification, records, and generated indexes.
10. Use an explicit narrow run only when the user asks for a specific checklist
   item.
11. Record workflow exceptions when work happened outside this flow.

## Fast Path

Use `/to-done` only when the requirement and solution are already clear from
the current session, or when the user supplied a one/two sentence brief that
defines both the change and the completion signal.

`/to-done` still writes durable artifacts:

```text
minimal spec -> minimal active ExecPlan -> /run Goal-Driven Execution loop
```

If the direction is unclear, use `/explore`. If a selected direction still has
unresolved decision branches, use `/grill-me`. If behavior is unclear, use
`/to-spec`. If an existing spec has planning-blocking ambiguity, use
`/clarify`. If implementation strategy is unresolved, use `/to-plan`. If an
active plan already exists, use `/run`.

## Verification Ladder

1. Focused check for the touched area.
2. `node bin/jkit.js status` for installer changes.
3. `npm pack --dry-run` for package/plugin distribution changes.
4. `./scripts/agent-map-check` for map scaffold checks.
5. `./scripts/agent-map-generate` when source layout changed.

## Definition of Done

- The requested behavior or scaffold exists.
- Specs, plans, docs, and records were updated when needed.
- The diff was reviewed and in-scope issues were fixed.
- Required verification passed, or exact blockers were recorded.
- Repeated lessons were promoted to playbooks or records.
