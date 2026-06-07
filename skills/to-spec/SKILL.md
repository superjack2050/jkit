---
name: to-spec
version: 0.1.0
description: |
  Convert explicit user input or a no-input current-context request into a
  durable repository spec. Use when the user asks for /to-spec, to spec, write
  a spec, update a spec, clarify behavior before planning, or turn intent into
  docs/specs content.

  This is not an implementation or planning command. It reads the repository
  agent map, creates or updates one spec under the configured specs directory,
  preserves ambiguity as [ASSUMED] or [NEEDS_INVESTIGATION], updates maps, and
  leaves /to-plan as the usual next step.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - TaskCreate
  - TaskUpdate
  - TaskList
---

# To Spec - Turn Intent Into A Reviewable Spec

`/to-spec` is the spec-writing stage in the jkit v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

The job is to make desired behavior explicit enough for `/to-plan` to create a
checklist later. Do not implement code, create an ExecPlan by default, or hide
product decisions in chat history.

## Core Rules

1. **One spec by default.** Create or update exactly one relevant spec unless
   the user explicitly asks for broader spec work.
2. **Two input modes.** Use no-input mode or input mode based on whether
   explicit input was supplied.
3. **Read the map first.** Use `AGENTS.md`, `agent-map.yaml`,
   `docs/WORKFLOW.md`, and `docs/specs/index.md` before writing.
4. **Reuse before creating.** Search existing specs and update the matching one
   when the request belongs there.
5. **No invented facts.** Record low-risk guesses as `[ASSUMED]` and important
   unknowns as `[NEEDS_INVESTIGATION]`.
6. **Ask only for consequential ambiguity.** Ask when a missing decision changes
   behavior, safety, data, compatibility, external services, distribution, or
   verification.
7. **No implementation drift.** Do not write code, package changes, migrations,
   command wrappers, or active implementation plans unless explicitly requested
   or required by repository rules.
8. **Update maps before handoff.** Keep indexes, open questions, generated
   context, and final status aligned.

## Supported Forms

```text
/to-spec
/to-spec <input>
/to-spec --update <spec-slug>
/to-spec --accept <spec-slug>
```

Input modes:

- **No-input mode:** no explicit input is supplied; infer the requested behavior
  primarily from current session context.
- **Input mode:** explicit input is supplied in the command or surrounding
  message; use that input as the primary request.

Explicit input wins over conflicting inferred context. Ground the request in
repository evidence during intake.

First-class flows:

- `/to-spec <input>`: create a new spec or update one clear existing match from
  input mode.
- `/to-spec`: create or update one spec from no-input mode when the current
  session request is clear.
- `/to-spec --update <spec-slug>`: update only the named spec.
- `/to-spec --accept <spec-slug>`: mark accepted only after explicit user
  confirmation and after checking that open questions do not block planning.

Ask one concise question before writing when no-input mode has multiple
plausible interpretations or no observable behavior request.

## Phase 0 - Orient

Run and read:

```bash
pwd
git status --short
```

Read, when present:

```text
AGENTS.md
agent-map.yaml
docs/WORKFLOW.md
docs/specs/index.md
docs/records/open-questions.md
```

If the repository has no agent map, stop and suggest `/map-init`.

If the worktree is dirty, proceed carefully. Do not overwrite unrelated user
changes. If the target spec or map files are already modified, read them before
editing and preserve the user's changes.

## Phase 1 - Resolve Specs Directory

Use `agent-map.yaml` `docs.specs` when present. Otherwise fall back to:

```text
docs/specs
```

Create the specs directory only when the repository already has an agent map.
Do not move or rename existing specs unless the user explicitly asks.

If `docs/specs/index.md` is missing, create it when writing the first spec:

```md
# Specs

Specs define command behavior and user-visible workflow contracts.
```

## Phase 2 - Resolve Input Mode

Use input mode when the user supplied explicit input in the command or
surrounding message. Use no-input mode when no explicit input was supplied.

In no-input mode:

- current session context is the primary signal

In input mode:

- explicit user input is the primary signal
- current session context may clarify the request when it does not conflict
  with the explicit input

Read repository evidence during intake. Explicit input wins over conflicting
inferred context.

## Phase 3 - Intake Request

Extract these facts from explicit input when present, current session context,
repo/project base, and existing docs:

- goal
- target users, maintainers, or agents
- current behavior
- desired behavior
- constraints
- non-goals
- acceptance criteria
- verification signals
- affected docs, skills, commands, package metadata, runtime surfaces, or data

Inference rules:

- In input mode, prefer explicit user input over inferred context or
  repo-derived inference.
- In no-input mode, use current session context as the primary signal.
- Use repo/project base to fill low-risk, implementation-independent details.
- Tag inferred low-risk facts as `[ASSUMED]` unless directly evidenced.
- Ask or tag `[NEEDS_INVESTIGATION]` for uncertainty that changes behavior,
  safety, data, compatibility, distribution, acceptance, or verification.
- Do not infer behavior that changes public workflow, data, security,
  compatibility, or acceptance criteria.

If neither input mode provides enough intent to define one observable behavior,
ask one concise question before writing. Prefer:

```text
What behavior should this spec define, and who is it for?
```

Do not block on details that can safely wait for `/to-plan` or `/run`; record
them as `[ASSUMED]` or `[NEEDS_INVESTIGATION]`.

## Phase 4 - Match Existing Specs

Search the specs directory before creating a new file:

```bash
find docs/specs -maxdepth 1 -type f -name '*.md' | sort
```

Use the configured specs directory if it is not `docs/specs`.

Selection rules:

- If `--update <spec-slug>` was provided, update that spec only.
- If the user provided a spec path, update that spec only.
- If one existing spec clearly covers the request, update it.
- If multiple specs plausibly match, ask which one to update.
- If no spec applies, create a new slug from the requested behavior.

Avoid duplicate specs for the same behavior. If the request conflicts with an
accepted spec, ask before changing the accepted behavior.

## Phase 5 - Resolve Ambiguity

Ask before writing when a missing decision affects:

- user-visible behavior
- command names, public interfaces, or workflow contracts
- security, secrets, permissions, or sensitive paths
- data model, data loss, migrations, or persistence
- package distribution, install behavior, or compatibility
- external services, network calls, production systems, or live checks
- acceptance criteria or verification gates

Record instead of asking when a decision can safely be deferred:

```text
[ASSUMED] <assumption and why it is low risk>
[NEEDS_INVESTIGATION] <missing evidence and how to resolve it>
```

Use `[ASSUMED]` for low-risk, reversible choices supported by available
evidence. Use `[NEEDS_INVESTIGATION]` for facts another agent must not silently
guess.

## Phase 6 - Write Or Update The Spec

New specs should use this shape:

```md
# Spec: <name>

> Status: draft
> Product: <project or component>
> Scope: <short scope>

## 1. Summary

## 2. Background

## 3. Goals

## 4. Non-goals

## 5. User stories

## 6. Command or behavior contract

## 7. Required phases

## 8. Safety, data, and compatibility

## 9. Verification

## 10. Acceptance criteria

## 11. Open questions
```

For non-command product behavior, rename section 6 to `Behavior contract`.

Status rules:

```text
draft
accepted
superseded
archived
```

- New specs default to `draft`.
- `accepted` requires explicit user confirmation or an existing project
  approval convention.
- `superseded` requires a pointer to the replacement spec.
- `archived` means the behavior is no longer planned but the history is useful.

When updating an existing spec:

- Preserve unrelated existing content.
- Keep accepted behavior unless the user explicitly changes it.
- Add or revise acceptance criteria when the requested behavior changes.
- Add open questions instead of pretending uncertain behavior is decided.

## Phase 7 - Update Maps

Always update:

- `docs/specs/index.md` when a spec is created, renamed, or substantially
  changed

When relevant, update:

- `docs/records/open-questions.md`
- `docs/WORKFLOW.md`
- `agent-map.yaml`
- `docs/generated/repo-map.md`

Run `./scripts/agent-map-generate` when source layout or docs indexes changed
and the script exists.

Do not create an ExecPlan by default. If the user explicitly asks for planning
or repository rules require an active implementation plan for new command
behavior, create or suggest the plan only after the spec exists.

## Phase 8 - Verify

For docs-only spec changes, run:

```bash
./scripts/agent-map-check
./scripts/agent-map-generate
```

If command, skill, installer, package, or plugin files changed, also run the
relevant package checks from `agent-map.yaml`, commonly:

```bash
node bin/jkit.js status
npm pack --dry-run
```

If a verification command fails:

1. Record the exact command and a short summary.
2. Add a record under `docs/records/verification-failures/` when the failure
   affects future agents.
3. Do not claim the spec work is complete without naming the blocker.

Do not run destructive commands, production writes, or external live checks.

## Phase 9 - Handoff

The `/to-spec` handoff means:

```text
spec is ready for planning
```

Final response must be short, structured, and recoverable:

Artifact:

- spec created or updated
- spec status
- map updates made

Readiness:

- assumptions recorded
- unresolved questions
- verification commands and results
- whether anything blocks `/to-plan`

Next command:

- next recommended command, usually `/to-plan <spec-slug>`

## Stop Conditions

Stop before editing when:

- no agent map exists
- user intent is too thin to define observable behavior
- multiple existing specs plausibly match and no user selection was provided
- the requested change contradicts an accepted spec without explicit user
  confirmation
- the user is asking for implementation rather than spec writing
- the work would require destructive or external-live action

When stopping, explain the blocker briefly and suggest the smallest next action.
