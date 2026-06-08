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
2. Run `jkit update-check --quiet 2>/dev/null || true` during command
   orientation when available. Treat it as a non-blocking notice only.
3. Use `/explore` when the request is a rough requirement or needs solution
   direction comparison before spec writing.
4. Use `/grill-me` when a selected requirement or solution direction needs
   one-question-at-a-time pressure testing before spec writing.
5. Use `/to-spec` or update a spec under `docs/specs/` for new command
   behavior.
6. Use `/clarify` when an existing spec has blocking ambiguity that would force
   `/to-plan` to invent decisions.
7. Use `/to-plan` to create or update an ExecPlan under
   `docs/exec-plans/active/` for complex work.
8. Use `/run` to drive the active plan's Goal-Driven Execution loop.
9. Let `/run` execute ready pending checklist items, review the diff, fix
   in-scope issues, and rerun verification until it passes or records a
   blocker.
10. Update progress, verification, records, and generated indexes.
11. Use an explicit narrow run only when the user asks for a specific checklist
   item.
12. Record workflow exceptions when work happened outside this flow.

## Adaptive To Done

Use `/to-done` when the user wants the current intent carried all the way to
verified done. `/to-done` is adaptive orchestration from intent to verified
done: it first decides which workflow stage is currently needed, then enters
that stage visibly and with a reason.

Possible routes:

```text
rough need -> /explore
selected but untested direction -> /grill-me
behavior not durable -> /to-spec
ambiguous existing spec -> /clarify
spec ready for planning -> /to-plan
active plan ready -> /run
clear small work -> minimal spec -> minimal active ExecPlan -> /run
clear complex work -> full spec -> full active ExecPlan -> /run
```

Complexity is allowed when it is represented in durable artifacts and
verification. Unresolved ambiguity is not allowed to pass into implementation.

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
