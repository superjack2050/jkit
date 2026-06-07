# Spec: to-spec

> Status: draft
> Product: jkit v2
> Scope: convert unclear or new behavior requests into reviewable specs

## 1. Summary

`/to-spec` turns either a no-input request inferred from current session
context, or an explicit input request supplied by the user, into a durable spec
under the repository's configured specs directory.

It is the spec-writing stage in the jkit v2 workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
```

`/to-spec` is not an implementation command and not a planning command. Its job
is to make behavior explicit enough that `/to-plan` can create a checklist and
`/run` can execute it later.

## 2. Background

jkit v2 is organized around repository agent maps. `/map-init` creates the map,
`/run` drives active ExecPlans through a Goal-Driven Execution loop, and future
commands should keep work moving through durable specs, plans, verification
records, and generated indexes.

The current workflow already requires new command behavior to be captured under
`docs/specs/` before implementation. `/to-spec` formalizes that step so agents
do not invent requirements, skip ambiguity, or bury acceptance criteria in chat
history.

## 3. Goals

- Convert user intent into a reviewable behavior contract.
- Support exactly two input modes: no-input mode and input mode.
- Create or update exactly one relevant spec by default.
- Reuse an existing related spec when the requested behavior already has one.
- Ask only for decisions that affect behavior, safety, data, compatibility,
  external dependencies, distribution, or acceptance criteria.
- Record low-risk assumptions as `[ASSUMED]`.
- Record unresolved important facts as `[NEEDS_INVESTIGATION]`.
- Keep implementation design and checklist items out of the spec unless they are
  necessary to define observable behavior.
- Update the specs index and relevant records before handoff.
- Leave a clear next step, usually `/to-plan <spec-slug>`.

## 4. Non-goals

- Do not initialize repository maps; use `/map-init`.
- Do not create an ExecPlan by default; use `/to-plan` for implementation
  planning unless the user explicitly asks or repository rules require an
  active implementation plan.
- Do not implement code, commands, package changes, migrations, or tests.
- Do not execute arbitrary shell commands beyond orientation and map checks.
- Do not silently overwrite existing specs.
- Do not mark a spec accepted unless the user explicitly accepts it.
- Do not invent product facts, architecture, commands, verification, or user
  requirements that are not visible in the repo or conversation.
- Do not run destructive commands, production writes, or external live checks.

## 5. User stories

### 5.1 Create a new spec from explicit input

As a user with a new feature or command idea, I can run `/to-spec <input>` with
a short explicit input and get a durable draft spec.

Acceptance criteria:

- The command reads the repository map before writing.
- The command uses explicit input as the primary signal.
- Current session context may clarify the request when it does not conflict
  with the explicit input.
- Explicit input wins over conflicting inferred context.
- The command creates `docs/specs/<slug>.md` or the configured equivalent.
- The spec contains summary, goals, non-goals, behavior, verification, open
  questions, and acceptance criteria.
- Unconfirmed but low-risk choices are tagged `[ASSUMED]`.
- Important missing facts are tagged `[NEEDS_INVESTIGATION]`.
- The final response names the spec file and suggests `/to-plan <spec-slug>`.

### 5.2 Update an existing spec

As a user changing behavior that already has a spec, I can ask `/to-spec` to
update the existing spec instead of creating a duplicate.

Acceptance criteria:

- The command searches the configured specs directory for related specs.
- If one clear match exists, the command updates it.
- If multiple plausible matches exist, the command asks which spec to update.
- Existing accepted behavior is preserved unless the user requests a change.
- The update records changed assumptions, open questions, or acceptance
  criteria when relevant.

### 5.3 Clarify ambiguous behavior

As a user with an incomplete idea, I want the command to ask only questions that
matter instead of blocking on every unknown.

Acceptance criteria:

- The command asks concise questions for decisions that change user-visible
  behavior, safety, data, compatibility, external services, distribution, or
  verification.
- The command does not ask about details that can safely be resolved during
  planning or implementation.
- The command records unresolved important facts as `[NEEDS_INVESTIGATION]`.
- The command can produce a draft spec with open questions when the user has
  not fully decided.

### 5.4 Infer from no-input context

As a user who has already discussed the requirement in the current session, I
can run `/to-spec` without repeating the request and have the command infer the
requested spec from current session context.

Acceptance criteria:

- The command uses current session context as the primary signal.
- The command uses repo/project base to ground vocabulary and boundaries.
- The command asks one concise question when multiple interpretations are
  plausible.
- Inferred low-risk details are tagged `[ASSUMED]` unless directly evidenced.
- Consequential uncertainty is asked or tagged `[NEEDS_INVESTIGATION]`.
- The command does not infer behavior that changes public workflow, data,
  security, compatibility, or acceptance criteria.

### 5.5 Preserve the map learning loop

As a future agent, I want specs created by `/to-spec` to make the repository
easier to continue from after chat history is lost.

Acceptance criteria:

- `docs/specs/index.md` is updated when a spec is created or renamed.
- `docs/records/open-questions.md` is updated when unresolved project-level
  questions are discovered.
- Generated indexes are refreshed when the source layout or docs index changes.
- The final response includes the created or updated spec, recorded unknowns,
  and next command.

## 6. Command behavior

User-facing command:

```text
/to-spec
```

Plugin skill folder:

```text
skills/to-spec/
```

Plugin command wrapper:

```text
commands/to-spec.md
```

Optional forms:

```text
/to-spec
/to-spec <input>
/to-spec --update <spec-slug>
/to-spec --accept <spec-slug>
```

Input modes:

```text
1. No-input mode
2. Input mode
```

Default behavior:

- No-input mode: when no explicit input is supplied, infer the requested
  behavior primarily from current session context.
- Input mode: when explicit input is supplied in the command or surrounding
  message, use that input as the primary request.
- Explicit input wins over conflicting inferred context.
- In both modes, search for a matching existing spec before creating a new one.
- Read repo/project base during intake to ground vocabulary, identify existing
  specs, and avoid inventing facts.
- If one clear matching spec exists, update that spec.
- If no matching spec exists, create a new draft spec.
- If no-input mode cannot infer one clear behavior request, ask one concise
  question before writing.
- With `--update`, update only the named spec.
- With `--accept`, mark the named spec accepted only after confirming that open
  questions do not block planning.

## 7. Required phases

### 7.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/WORKFLOW.md`.
- Read `docs/specs/index.md` when present.
- Inspect `git status --short`.
- If no agent map exists, stop and suggest `/map-init`.

### 7.2 Resolve specs location

- Use `agent-map.yaml` `docs.specs` when configured.
- Fall back to `docs/specs/`.
- Create the directory only when the repository already has an agent map.
- Do not move existing specs unless the user explicitly asks.

### 7.3 Resolve input mode

- Use no-input mode when no explicit input is supplied.
- Use input mode when explicit input is supplied in the command or surrounding
  message.
- In no-input mode, current session context is the primary signal.
- In input mode, explicit user input is the primary signal.
- Explicit input wins over conflicting inferred context.
- Read repository evidence during intake.

### 7.4 Intake the request

Collect or infer:

- goal
- target users or agents
- current behavior
- desired behavior
- constraints
- non-goals
- acceptance criteria
- verification signals
- affected docs, skills, commands, package metadata, or runtime surfaces

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
ask one concise question before writing.

### 7.5 Match existing specs

- Search the specs directory for related spec names and summaries.
- If exactly one spec clearly covers the request, update it.
- If multiple specs could apply, ask which one to update.
- If no spec applies, create a new slug from the requested behavior.
- Avoid duplicate specs for the same behavior.

### 7.6 Resolve ambiguity

Ask before writing when a missing decision affects:

- user-visible behavior
- command names or public interfaces
- security, secrets, or permissions
- data model, data loss, migrations, or persistence
- package distribution or install behavior
- external services, network calls, or production systems
- compatibility with existing workflow contracts
- acceptance criteria or verification gates

Do not ask when the question can safely be deferred to `/to-plan` or `/run`.
Record those items as assumptions or open questions instead.

### 7.7 Write the spec

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

### 7.8 Update maps

Always update:

- `docs/specs/index.md` when a spec is created, renamed, or substantially
  changed.

When relevant, update:

- `docs/records/open-questions.md`
- `docs/WORKFLOW.md`
- `agent-map.yaml`
- generated indexes

Do not create an ExecPlan unless the user explicitly asks for planning or the
repository rules require an active implementation plan for new command behavior.
When an ExecPlan is needed, create it only after the spec exists.

### 7.9 Handoff

The `/to-spec` handoff means:

```text
spec is ready for planning
```

Final response must be short, structured, and recoverable:

Artifact:

- spec created or updated
- status
- map updates made

Readiness:

- assumptions recorded
- unresolved questions
- verification commands and results
- whether anything blocks `/to-plan`

Next command:

- next recommended command, usually `/to-plan <spec-slug>`

## 8. Status model

Supported spec statuses:

```text
draft
accepted
superseded
archived
```

Rules:

- New specs default to `draft`.
- `accepted` requires explicit user confirmation or an existing project
  approval convention.
- `superseded` requires a pointer to the replacement spec.
- `archived` means the behavior is no longer planned but the history is useful.

## 9. Safety and compatibility

- Never record secrets, tokens, credentials, or private local config in specs.
- Prefer local deterministic verification over network or production checks.
- If external live validation is needed, describe it as a requirement but do not
  run it.
- Keep specs portable across small projects, CLIs, libraries, infra projects,
  and product apps.
- Preserve existing repository vocabulary when it is already documented.
- Keep old `before-build` and `build` behavior out of jkit unless a new spec and
  plan explicitly reintroduce specific behavior.

## 10. Verification

When `/to-spec` changes only docs:

```text
./scripts/agent-map-check
./scripts/agent-map-generate
```

When `/to-spec` command, skill, installer, or package files change:

```text
node bin/jkit.js status
npm pack --dry-run
```

Verification must be recorded in the final response. Failed verification should
be recorded under `docs/records/verification-failures/` when it affects future
agents.

## 11. Acceptance criteria

- `docs/specs/to-spec.md` exists.
- `skills/to-spec/SKILL.md` exists when the command is implemented.
- `commands/to-spec.md` exists when the command is implemented.
- `bin/jkit.js` installs `to-spec` when the skill ships.
- README lists `/to-spec` as shipped only after the skill and command wrapper
  exist.
- The command creates or updates one spec by default.
- New specs default to `draft`.
- Ambiguity is handled through concise questions, `[ASSUMED]`, or
  `[NEEDS_INVESTIGATION]`.
- Existing specs are reused instead of duplicated.
- `docs/specs/index.md` is updated for new or changed specs.
- Generated indexes are refreshed when docs layout changes.
- `./scripts/agent-map-check` passes.
- `npm pack --dry-run` includes `commands/to-spec.md` and
  `skills/to-spec/SKILL.md` after implementation.

## 12. Open questions

- Should `/to-spec --accept` ship in the first implementation, or should
  acceptance remain a manual spec edit until the workflow is dogfooded?
- Should `/to-spec` create an active implementation plan automatically for new
  command behavior, or should that remain strictly `/to-plan` territory?
- Should specs support a lightweight front matter field for replacement links
  when a spec becomes `superseded`?
