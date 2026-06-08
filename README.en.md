# jkit

> Language: [中文](README.md) | English

jkit is an agent-map-driven development toolkit for building reusable, verifiable, and recoverable harnesses for coding agents, built on repository-level agent maps and composable commands.

Inspired by OpenAI's [Harness Engineering](https://openai.com/zh-Hans-CN/index/harness-engineering/), jkit treats the repository as a readable, executable, and verifiable system of record for coding agents instead of relying on one-off chat context.

## Get Started

### Install

#### Claude Code

##### Install with Claude Code

Copy this into Claude Code:

```text
Install the jkit Claude Code plugin.

Please run or guide me through:

/plugin marketplace add superjack2050/jkit
/plugin install jkit@jkit
/reload-plugins

After installation, verify that the jkit commands are available.
```

If Claude Code asks you to confirm the plugin source, choose
`superjack2050/jkit` and `jkit@jkit`.

##### Manual install

Run these in your terminal:

```bash
npm install -g @nobodyjack/jkit
jkit claude-code install
jkit claude-code status
```

#### Codex

##### Install with Codex

Copy this into Codex:

```text
Install the jkit Codex plugin.

Please run this in the terminal:

npm install -g @nobodyjack/jkit
jkit codex install
jkit codex status

After installation, restart or refresh Codex, open a new session, and verify
that the jkit skills are available.
```

##### Manual install

Run these in your terminal:

```bash
npm install -g @nobodyjack/jkit
jkit codex install
jkit codex status
```

### Initialize an agent map

Run `/map-init` in a repository to create or update its repository-level agent map.

An agent map gives coding agents the project entry points, workflow rules,
records, plans, generated indexes, and verification commands they need to work
from repository state instead of chat history alone.

## Workflow

The current shipped workflow is:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
                                               \-> /to-done ->/
```

### Explore requirements and shape direction

Use `/explore` when the request is still rough. It helps discuss the need,
compare solution directions, identify risks, and produce a recommended
direction plus ready input for `/to-spec`.

Use `/grill-me` when the direction has been selected but key decisions still
need to be questioned. It clarifies scope, boundaries, acceptance, and
verification signals, then produces ready input for `/to-spec`.

### Write and clarify specs

Use `/to-spec` to turn explicit input, current session context, or project-base
facts into one reviewable spec under `docs/specs/`.

Use `/clarify` when an existing spec has ambiguity that would block planning.
It resolves the blocker with project evidence when possible and writes the
clarification back into the spec.

### Plan the work

Use `/to-plan` to convert one plannable spec into an active ExecPlan with a
checklist, verification loop, decisions, progress log, and rollback notes.

### Execute and verify

Use `/run` to execute an active plan's ready work, review the diff, fix
in-scope issues, run verification, update records, and move the plan forward
until the goal is complete or a blocker is recorded.

### Adaptive path to done

Use `/to-done` to move from the current intent to verified done. It first
detects which context is missing, then dynamically enters `/explore`,
`/grill-me`, `/to-spec`, `/clarify`, `/to-plan`, or `/run` as needed. Clear
small work uses minimal durable artifacts; complex work uses a full spec, full
plan, and broader verification.

## Commands

| Command | Description |
|---|---|
| `/jkit` or `$jkit` | Show jkit workflow help, list available commands, and route to the next step |
| `/map-init` | Initialize the repository-level agent map with agent-readable project entry points, workflows, records, and verification rules |
| `/explore` | Discuss a rough requirement, compare solution directions, and produce ready input for `/to-spec`; inspired by [`obra/superpowers`](https://github.com/obra/superpowers) `brainstorming` |
| `/grill-me` | Question a selected requirement and solution direction one step at a time, clarify key decisions, and produce ready input for `/to-spec`; inspired by [`mattpocock/skills`](https://github.com/mattpocock/skills) `/grill-me` |
| `/clarify` | Resolve planning-blocking ambiguity in one existing spec and write the clarifications back before `/to-plan`; inspired by [`github/spec-kit`](https://github.com/github/spec-kit) `/speckit.clarify` |
| `/to-spec` | Create or update one reviewable spec from explicit input, current session context, or the repo/project base |
| `/to-plan` | Convert a reviewable spec into an active ExecPlan with a Checklist and Verification Loop |
| `/to-done` | Adaptive orchestration from intent to verified done; dynamically routes through `/explore`, `/grill-me`, `/clarify`, `/to-spec`, `/to-plan`, or `/run` as needed |
| `/run` | Execute an active ExecPlan goal loop to verified completion, review and fix issues, verify, and update maps |

## Agent Maps

An agent map is the repository-level operating context for coding agents. It
turns a repository into a navigable, verifiable, and recoverable workspace.

A good agent map answers six questions:

- Where should an agent start?
- What workflow should the agent follow?
- Where do requirements, specs, plans, and records live?
- Which commands and checks are available?
- What facts are known, assumed, or still unresolved?
- How should future agents resume or repair work?

In jkit, an agent map is made of coordinated layers:

- Entry layer: `AGENTS.md`, `agent-map.yaml`
  A short entry point, project shape, routing rules, and machine-readable
  configuration.
- Workflow layer: `docs/WORKFLOW.md`, `docs/PLANS.md`
  The default flow from requirements to specs, plans, runs, and records, plus
  the required ExecPlan shape.
- Working-principles layer: `docs/AGENT_WORKING_PRINCIPLES.md`
  Collaboration principles, boundaries, and preferences for agents working in
  the repository.
- Architecture and engineering layer: `ARCHITECTURE.md`,
  `docs/ENGINEERING.md`, `docs/RELIABILITY.md`, `docs/SECURITY.md`
  System architecture, engineering rules, reliability expectations, and
  security boundaries.
- Requirements and planning layer: `docs/specs/`, `docs/exec-plans/`
  Reviewable behavior specs, active plans, completed plans, and technical debt
  tracking.
- Durable records layer: `docs/records/`
  Open questions, workflow exceptions, verification failures, and context that
  must not be lost.
- Generated navigation layer: `docs/generated/`
  Generated indexes that help agents understand the repository without loading
  everything into one file.
- Verification layer: `scripts/agent-map-check`,
  `scripts/agent-map-generate`, project checks
  Runnable checks and generators that keep the map fresh and verifiable.
- Command layer: `skills/`, `commands/`
  The `jkit` help entry plus composable workflows such as `/explore`, `/grill-me`, `/clarify`,
  `/to-spec`, `/to-plan`, `/to-done`, and `/run`.

The goal is to make the repository itself the system of record for
coding-agent work: requirements, decisions, plans, progress, verification, and
recovery all live in versioned project files.

## License

MIT, see `LICENSE`.
