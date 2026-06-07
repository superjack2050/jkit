# Spec: grill-me

> Status: draft
> Product: jkit v2
> Scope: pressure-test selected requirements and solution directions before `/to-spec`

## 1. Summary

`/grill-me` is an optional pre-spec command that pressure-tests a selected
requirement and solution direction, one question at a time, until the key
decision branches are clear enough for `/to-spec`.

It usually follows `/explore`:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /to-plan -> /run -> /map-repair
```

`/grill-me` should follow the spirit of the referenced grilling workflow:
interview the user about the requirement and solution direction, walk the
decision tree one branch at a time, provide a recommended answer for each
question, and answer from the project base before asking the user when local
evidence is available.

## 2. Background

jkit now has `/explore` specified as the lightweight stage for needs discussion,
solution exploration, option comparison, and recommended direction selection.
Some selected directions still need sharper pressure before they are safe to
turn into a durable spec. `/grill-me` owns that pressure-testing step.

The command is not a free-form brainstorm. It starts from an already selected
requirement or solution direction, often produced by `/explore`, and probes the
branches that would otherwise become hidden assumptions in `/to-spec`.

The command must stay grounded in the current repository. jkit's agent maps,
workflow docs, specs, architecture docs, plans, records, code, and tests are
the local project base. If a question can be answered by inspecting those
surfaces, `/grill-me` should inspect them instead of asking the user.

## 3. Goals

- Pressure-test a selected requirement and solution direction before
  `/to-spec`.
- Usually continue from `/explore`, while also supporting direct user input.
- Combine user conversation with targeted project-base evidence.
- Ask one question at a time.
- Provide a recommended answer with every question.
- Resolve decision branches that affect scope, behavior, safety, data,
  compatibility, acceptance criteria, verification, or workflow contracts.
- Avoid asking questions that project evidence can answer.
- Produce concise ready input for `/to-spec`.
- Keep resolved decisions, remaining open questions, risky assumptions, and
  evidence visible in the final handoff.

## 4. Non-goals

- Do not explore broad solution spaces from scratch; use `/explore`.
- Do not create or update `docs/specs/`; use `/to-spec`.
- Do not update an existing spec's clarification record; use `/clarify` when
  that command is specified and implemented.
- Do not create an ExecPlan; use `/to-plan`.
- Do not implement code, package changes, command wrappers, tests, or runtime
  behavior.
- Do not perform technical implementation planning unless an implementation
  detail changes requirement boundaries, safety, compatibility, acceptance, or
  verification.
- Do not ask endless questions after the decision tree is spec-ready.

## 5. User stories

### 5.1 Continue from `/explore`

As a user who selected a direction through `/explore`, I can run `/grill-me`
and have the agent pressure-test that direction before writing a spec.

Acceptance criteria:

- The command uses the current session's selected direction as the primary
  input when no explicit input is supplied.
- The command identifies the requirement and solution direction being tested.
- The command does not re-open broad alternatives already rejected by
  `/explore` unless new project evidence makes the selected direction risky.
- The command asks only questions that materially improve the `/to-spec`
  handoff.
- The final output contains ready input for `/to-spec`.

### 5.2 Grill an explicit requirement or solution direction

As a user with an existing requirement or solution idea, I can run
`/grill-me <input>` without first running `/explore`.

Acceptance criteria:

- The command uses explicit input as the primary requirement or direction.
- The command restates the requirement and solution direction before probing.
- The command asks one concise question if the input lacks enough substance to
  identify what is being grilled.
- The command does not invent missing project facts.
- The command records unresolved important facts as open questions in the
  handoff.

### 5.3 Ground questions in the project base

As a maintainer, I want `/grill-me` to ask fewer, sharper questions because it
uses local project facts first.

Acceptance criteria:

- The command reads `AGENTS.md`, `agent-map.yaml`, and relevant workflow docs
  when present.
- The command reads relevant specs, plans, architecture docs, records, code, or
  tests when they can answer a pending question.
- The command uses targeted searches instead of broad, unfocused repository
  scans.
- The command names the project evidence behind a question when evidence
  affects the recommendation.
- The command does not ask the user to answer facts that the repository already
  proves.
- When project evidence conflicts with user input, the command surfaces the
  conflict and asks which source should define the future behavior.

### 5.4 Ask one question at a time

As a user, I want the command to pressure-test the idea without dumping a long
questionnaire.

Acceptance criteria:

- The command asks only one question per turn.
- Each question includes the recommended answer.
- Each question explains why the decision matters.
- Each question includes meaningful alternatives or tradeoffs when they exist.
- If the user accepts the recommended answer, the command records it as a
  resolved decision.
- If the user chooses a different answer, the command follows the resulting
  decision branch before moving on.
- The command stops when remaining uncertainty can safely be captured by
  `/to-spec` as non-blocking assumptions or open questions.

### 5.5 Hand off to `/to-spec`

As a future agent, I want the output of `/grill-me` to be recoverable enough to
write a durable spec without chat archaeology.

Acceptance criteria:

- The final output contains `Requirement and direction`.
- The final output contains `Decisions resolved`.
- The final output contains `Recommended answers accepted`.
- The final output contains `Project evidence used`.
- The final output contains `Risky assumptions`.
- The final output contains `Remaining open questions`.
- The final output contains `Next /to-spec input`.
- The `Next /to-spec input` is concise enough to use as `/to-spec <input>`.

## 6. Command behavior

User-facing command:

```text
/grill-me
```

Plugin skill folder:

```text
skills/grill-me/
```

Plugin command wrapper:

```text
commands/grill-me.md
```

Supported forms:

```text
/grill-me
/grill-me <requirement-or-solution-direction>
```

Default behavior:

- If explicit input is supplied, use it as the selected requirement or solution
  direction.
- If no explicit input is supplied, use the current session's selected
  direction, usually from `/explore`.
- If no selected direction exists, ask one concise question instead of starting
  broad exploration:

```text
What requirement and solution direction should I pressure-test?
```

- Build a decision tree for the selected requirement and direction.
- Use targeted project-base evidence before asking the user.
- Ask one question at a time.
- Include a recommended answer with every question.
- Continue until the important decision branches are resolved, safely
  deferred, or explicitly recorded as open questions.
- Produce ready input for `/to-spec`.

## 7. Required phases

### 7.1 Orient

- Read `AGENTS.md` when present.
- Read `agent-map.yaml` when present.
- Read `docs/WORKFLOW.md` when present.
- Read `ARCHITECTURE.md` when relevant.
- Read relevant existing specs, plans, records, or design docs when the selected
  direction touches them.
- If no agent map exists and the request is repository-specific, suggest
  `/map-init`.

### 7.2 Resolve the selected direction

Resolve:

- requirement
- target user, maintainer, or agent
- solution direction
- desired outcome
- apparent non-goals
- known constraints

If the input is too broad or no solution direction exists, recommend
`/explore` instead of forcing `/grill-me`.

### 7.3 Scan the project base

Use targeted local evidence to answer or sharpen questions:

- docs and workflow rules
- existing specs and acceptance criteria
- active or completed plans
- architecture and design docs
- open questions and workflow exceptions
- related code paths
- tests, scripts, package metadata, or command wrappers

Use `rg` or equivalent targeted search first. Do not conduct broad codebase
exploration unless the selected direction requires it.

### 7.4 Build the decision tree

Identify decision branches that could affect:

- scope
- actors and user stories
- current behavior versus desired behavior
- command names or public workflow contracts
- default behavior and fallback behavior
- edge cases and failure handling
- safety, secrets, permissions, or sensitive paths
- data, persistence, migrations, or destructive operations
- compatibility and distribution
- acceptance criteria
- verification signals

Prioritize questions by impact on whether `/to-spec` can write a useful
behavior contract.

### 7.5 Ask and resolve one branch at a time

For each question:

- state the project evidence, when relevant
- explain why the decision matters
- ask exactly one question
- provide the recommended answer
- name alternatives and tradeoffs when useful
- wait for the user's response
- record the decision, assumption, or open question before moving to the next
  branch

If a branch can be resolved by additional targeted project-base inspection, do
that inspection instead of asking the user.

### 7.6 Stop condition

Stop asking when:

- the requirement and solution direction are clear enough for `/to-spec`
- remaining uncertainty can be safely tagged as `[ASSUMED]`
- remaining uncertainty can be recorded as `[NEEDS_INVESTIGATION]` without
  blocking spec writing
- the user asks to stop
- a blocking contradiction requires a user decision before continuing

Do not continue questioning merely because more details could be discovered.

### 7.7 Handoff

End with this shape:

```md
Requirement and direction:

Decisions resolved:

Recommended answers accepted:

Project evidence used:

Risky assumptions:

Remaining open questions:

Next /to-spec input:
```

If the conversation reveals that the user still needs broad option exploration,
recommend `/explore`.

If the conversation is about an existing spec with unresolved gaps, recommend
`/clarify` or `/to-spec --update <spec-slug>` depending on whether the work is
post-spec clarification or a broader behavior change.

## 8. Safety, data, and compatibility

- Do not run destructive commands.
- Do not perform production writes, migrations, external live checks, or package
  changes.
- Do not inspect secrets, tokens, credentials, or private local config.
- Treat security, data loss, compatibility, external services, distribution,
  and verification uncertainty as high-priority decision branches.
- Surface conflicts between project evidence and user input instead of silently
  resolving them.

## 9. Verification

For the spec-only slice:

```bash
./scripts/agent-map-check
./scripts/agent-map-generate
```

When `/grill-me` is implemented later, verification should include:

- `test -f skills/grill-me/SKILL.md`
- `test -f commands/grill-me.md`
- `node bin/jkit.js status`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- Dogfood `/grill-me <direction>` and verify the command asks one question at a
  time with a recommended answer.
- Dogfood `/grill-me` after `/explore` session context and verify it continues
  from the selected direction.
- Dogfood a repository-grounded question and verify the command inspects local
  evidence before asking the user.

## 10. Acceptance criteria

- `docs/specs/grill-me.md` exists.
- `docs/specs/index.md` lists `grill-me.md`.
- The spec defines `/grill-me` as a pre-spec pressure-testing command for
  selected requirements and solution directions.
- The spec says `/grill-me` usually continues from `/explore`.
- The spec requires targeted project-base evidence before user questions when
  local evidence can answer or sharpen the branch.
- The spec requires one question at a time and a recommended answer with every
  question.
- The spec keeps `/grill-me` distinct from `/explore`, `/to-spec`,
  `/to-plan`, `/run`, and `/clarify`.
- The spec requires final output with decisions, accepted recommendations,
  project evidence, risky assumptions, remaining open questions, and next
  `/to-spec` input.
- Map checks pass, or exact blockers are recorded.

## 11. Open questions

- [ASSUMED] The first implementation does not edit files by default because
  `/grill-me` is a pre-spec pressure-testing conversation.
- [ASSUMED] The first implementation uses `/grill-me` as the only command name
  because the user asked to preserve the referenced command as closely as
  practical.
- [ASSUMED] The first implementation does not support an explicit maximum
  question count; it stops based on spec-readiness, user stop request, or a
  blocking contradiction.
