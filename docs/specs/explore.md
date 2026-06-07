# Spec: explore

> Status: draft
> Product: jkit v2
> Scope: requirements discussion and solution exploration before `/to-spec`

## 1. Summary

`/explore` is an optional pre-spec command that turns a rough idea into a
recommended direction and ready input for `/to-spec`.

It fits into the jkit v2 workflow before spec writing:

```text
/map-init -> /explore -> /to-spec -> /to-plan -> /run -> /map-repair
```

`/explore` is deliberately lightweight. It helps the user discuss the need,
compare possible directions, surface risks, and select a default direction. It
does not write a spec, create an ExecPlan, implement code, or conduct a long
branch-by-branch interrogation.

## 2. Background

jkit already has durable stages for spec writing, planning, execution, and map
repair. The missing front-end stage is a small demand-discovery and option
exploration command for requests that are too rough for `/to-spec` but do not
need the heavier pressure-testing expected from `/grill-me`.

The command is inspired by the lightweight part of brainstorming workflows: ask
only the questions that improve direction selection, explore a few viable
approaches, recommend one, and hand the user a clear next command.

## 3. Goals

- Add a simple pre-spec exploration stage to jkit.
- Help users turn rough ideas into a recommended direction.
- Discuss the need, target user or maintainer, problem, constraints, and success
  signal before writing a spec.
- Explore two to four plausible approaches when the solution is not obvious.
- Name tradeoffs, risks, and unresolved questions without pretending they are
  decided.
- Produce a concise `/to-spec` input that can be copied into the next workflow
  step.
- Keep the command fast enough for ordinary feature and workflow requests.
- Recommend `/grill-me` or `/clarify` only when another command is a better
  fit.

## 4. Non-goals

- Do not create or update `docs/specs/`; use `/to-spec`.
- Do not create an ExecPlan; use `/to-plan`.
- Do not implement code, package changes, command wrappers, tests, or runtime
  behavior.
- Do not replace `/to-done` for clear, bounded work.
- Do not perform exhaustive questioning; `/grill-me` should own deep
  branch-by-branch pressure testing of selected requirements and solution
  directions.
- Do not resolve gaps in an already-created spec; `/clarify` should own
  post-spec clarification before `/to-plan`.
- Do not ship aliases such as `/shape` in the first implementation.
- Do not add a save mode in the first implementation.

## 5. User stories

### 5.1 Explore a rough idea

As a user with a rough idea, I can run `/explore <idea>` and get a clear
recommended direction before creating a spec.

Acceptance criteria:

- The command restates the rough idea in concrete terms.
- The command identifies the likely user, maintainer, or agent affected.
- The command asks no questions when the idea is already sufficient to compare
  approaches.
- The command asks at most three high-leverage questions before producing an
  option set when missing context would materially change the recommendation.
- The command proposes two to four plausible approaches when alternatives
  exist.
- The command recommends one direction and explains why.
- The command ends with ready input for `/to-spec`.

### 5.2 Explore from current session context

As a user who has already discussed an idea, I can run `/explore` without
repeating the idea and get a direction based on the current session.

Acceptance criteria:

- The command uses current session context as the primary signal.
- The command asks one concise question when the current session contains
  multiple plausible ideas.
- The command does not invent missing product facts.
- The command tags low-risk inferred facts as `[ASSUMED]` when they appear in
  the handoff.
- The command records unresolved important facts as open questions in the
  handoff instead of silently choosing them.

### 5.3 Keep exploration lightweight

As a maintainer, I want `/explore` to improve direction selection without
becoming another planning or spec command.

Acceptance criteria:

- The command does not edit files by default.
- The command does not create durable artifacts unless the user explicitly asks
  to save the exploration.
- The command does not run verification commands.
- The command does not perform implementation planning beyond naming broad
  affected surfaces when useful for option comparison.
- The command recommends `/to-spec` once the direction is selected.
- The command recommends `/grill-me` when the selected direction still needs
  deep decision-tree pressure testing.
- The command recommends `/clarify` only for an existing spec that is not yet
  plannable.

### 5.4 Hand off to `/to-spec`

As a future agent, I want exploration output to be easy to turn into a durable
spec.

Acceptance criteria:

- The final output contains `Recommended direction`.
- The final output contains `Why`.
- The final output contains `Alternatives considered`.
- The final output contains `Risks`.
- The final output contains `Open questions`.
- The final output contains `Next /to-spec input`.
- The `Next /to-spec input` is concise enough to use as `/to-spec <input>`.

## 6. Command behavior

User-facing command:

```text
/explore
```

Plugin skill folder:

```text
skills/explore/
```

Plugin command wrapper:

```text
commands/explore.md
```

Supported forms:

```text
/explore
/explore <rough-idea>
```

Default behavior:

- If explicit input is supplied, use it as the primary idea.
- If no explicit input is supplied, use current session context.
- Read repository map context when present to avoid contradicting local
  workflow rules.
- Ask at most three high-leverage questions before producing the first useful
  option set.
- Prefer repository evidence over asking the user when the answer can be found
  locally.
- Compare two to four approaches when more than one plausible direction exists.
- Recommend one direction.
- Produce ready input for `/to-spec`.

## 7. Required phases

### 7.1 Orient

- Read `AGENTS.md` when present.
- Read `agent-map.yaml` when present.
- Read `docs/WORKFLOW.md` when present.
- If no agent map exists, suggest `/map-init` before repository-specific
  exploration.
- Do not inspect broad source areas unless the exploration depends on current
  repository behavior.

### 7.2 Resolve input

- Use explicit command input when present.
- Otherwise infer the idea from current session context.
- If no clear idea exists, ask one concise question:

```text
What rough idea should we explore, and what outcome would make it worth doing?
```

### 7.3 Gather just enough context

Extract or ask for:

- user, maintainer, or agent affected
- problem or opportunity
- current behavior or current workflow
- desired outcome
- known constraints
- success signal
- risks or sensitive boundaries

Do not block on implementation details that belong in `/to-plan`.

### 7.4 Explore options

When alternatives exist, present two to four approaches. For each approach,
include:

- short name
- what it optimizes for
- main tradeoff
- when to choose it

If only one direction is reasonable, say so and explain why.

### 7.5 Recommend a direction

Select one default direction based on:

- fit with the user's stated outcome
- simplicity
- compatibility with existing jkit workflow
- reversibility
- ease of turning into a reviewable spec

Record unresolved important facts as open questions.

### 7.6 Handoff

End with this shape:

```md
Recommended direction:

Why:

Alternatives considered:

Risks:

Open questions:

Next /to-spec input:
```

If the idea is already clear, the next command is usually:

```text
/to-spec "<generated input>"
```

If the selected direction still has too many unresolved decision branches,
recommend `/grill-me` instead of forcing `/to-spec`.

## 8. Safety, data, and compatibility

- Do not run destructive commands.
- Do not perform production writes, migrations, external live checks, or package
  changes.
- Do not inspect secrets, tokens, credentials, or private local config.
- Treat security, data loss, compatibility, external services, distribution,
  and verification uncertainty as risks or open questions.
- Preserve user agency: recommendations are defaults, not hidden decisions.

## 9. Verification

For the spec-only slice:

```bash
./scripts/agent-map-check
./scripts/agent-map-generate
```

When `/explore` is implemented later, verification should include:

- `test -f skills/explore/SKILL.md`
- `test -f commands/explore.md`
- `node bin/jkit.js status`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- Dogfood `/explore "rough idea"` and verify the final output includes the
  required handoff fields.
- Dogfood `/explore` with no clear current idea and verify it asks the expected
  concise question.

## 10. Acceptance criteria

- `docs/specs/explore.md` exists.
- `docs/specs/index.md` lists `explore.md`.
- The spec defines `/explore` as a lightweight pre-spec command.
- The spec keeps `/explore` distinct from `/grill-me`, `/to-spec`, `/to-plan`,
  `/to-done`, and `/clarify`.
- The spec requires final output with recommended direction, alternatives,
  risks, open questions, and next `/to-spec` input.
- Map checks pass, or exact blockers are recorded.

## 11. Open questions

- [ASSUMED] The first implementation supports only `/explore` and
  `/explore <rough-idea>` because the user selected `/explore` as the command
  name and asked to keep the command simple.
- [ASSUMED] The first implementation remains chat-output-only because durable
  spec creation belongs to `/to-spec`.
