# Design Docs

Design docs hold durable context that future agents should read before changing
architecture, interfaces, data semantics, or product interaction behavior.

## ADRs

Use `adr/` for long-lived architecture, workflow, and distribution decisions.

## Evidence-Based Areas

Create these areas only when project evidence or user intent makes them useful:

- `api-contracts/`: stable APIs, SDKs, routes, RPC, GraphQL, webhooks, clients,
  OpenAPI, or compatibility-sensitive integrations.
- `data-models/`: schemas, migrations, ORM models, persistence, domain models,
  field semantics, or storage compatibility.
- `prototypes/`: frontend/product UI exploration, design systems, Storybook,
  HTML prototypes, or interaction design artifacts.

Each area should include a `README.md` with purpose, current state, update
rules, and open questions. Do not create empty directories as placeholders.

## Current Areas

- `adr/`: long-lived architecture and workflow decisions.
