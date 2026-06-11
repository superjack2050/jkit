# Agent Map Artifact Guide

Use this guide when `/map-init` creates or augments repository map files.

## Core artifacts

`AGENTS.md`

- Short entry point for coding agents.
- Routes to deeper docs.
- Includes first-read docs, project shape, common commands, task routing, hard
  rules, and done criteria.
- Must not become a full manual.

`agent-map.yaml`

- Machine-readable contract for future commands.
- Records project mode, stack signals, docs locations, verification commands,
  update rules, sensitive paths, and open questions.
- Unknown values stay blank or become explicit open questions.

`ARCHITECTURE.md`

- System and dependency map.
- Empty projects should say `Status: Draft` and avoid fake architecture claims.
- Brownfield projects should describe discovered directories and unresolved
  boundaries.

`docs/README.md`

- Documentation index.
- Explains where specs, plans, playbooks, records, references, and generated
  indexes live.

`docs/WORKFLOW.md`

- Default operating loop.
- Must state that `/run` updates maps after each execution.
- Must state how to record work that happened outside the normal workflow and
  refresh affected maps.
- Must include: "Agent maps are living harnesses. Convert repeated friction
  into clearer docs, stricter checks, safer workflows, and reusable skills."

`docs/PLANS.md`

- ExecPlan protocol.
- Plans live in `docs/exec-plans/active/` and move to `completed/` only after
  verification and doc updates.

`docs/records/`

- Raw material for learning.
- `open-questions.md`: missing facts, assumptions, and next evidence to gather.
- `workflow-exceptions/`: work that skipped the normal flow.
- `verification-failures/`: failed commands, summaries, and follow-up.
- `incidents/`: production or user-impacting incidents when relevant.

`docs/generated/`

- Rebuildable indexes.
- Not a source of truth.
- Must identify the generation script.

`docs/design-docs/`

- Durable design context for architecture decisions, interfaces, data models,
  and prototypes.
- `index.md` is the router for design artifacts and creation rules.
- `adr/README.md` is part of the standard scaffold for long-lived architecture
  and workflow decisions.
- `api-contracts/`, `data-models/`, and `prototypes/` are evidence-based
  additions. Create them only when project files, existing docs, or user intent
  show they are useful.
- Evidence-based design subdirectories should include a `README.md`; do not
  create empty placeholder directories.

## Scaffold sizing

Use `minimal` for tiny repos, prototypes, or empty projects where the user wants
low ceremony.

Use `standard` by default for libraries, CLIs, apps, and services.

Use `full` when the repo is production-sensitive, multi-agent, multi-service, or
explicitly needs evals/smoke/observability harnesses.

## Naming

Use `docs/specs/` for generic projects. If the repo is clearly product-led and
already uses `product-specs`, preserve that name and record it in
`agent-map.yaml`.

For manual recovery after map drift or skipped workflow, record the exception,
update affected maps, and rerun map checks.
