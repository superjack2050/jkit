---
name: grill-me
version: 0.1.0
description: |
  Pressure-test a selected requirement and solution direction before /to-spec.
  Use when the user asks for /grill-me, grill me, challenge this direction,
  pressure-test this requirement, or continue from /explore to make the
  decision tree clear enough for a spec.

  This is not brainstorming, spec-writing, planning, or implementation. It uses
  targeted project-base evidence before asking the user, asks one question at a
  time, provides a recommended answer with each question, and hands off ready
  /to-spec input.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - AskUserQuestion
---

# Grill Me - Pressure-Test A Selected Direction

`/grill-me` is the pre-spec pressure-testing stage in the jkit v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

The job is to pressure-test a selected requirement and solution direction, one
decision branch at a time, until it is clear enough for `/to-spec`. Do not
explore broad solution spaces from scratch, write specs, create ExecPlans,
implement code, or ask endless questions after the direction is spec-ready.

## Core Rules

1. **Selected direction required.** Start from an explicit input or a current
   session direction, usually from `/explore`.
2. **Project base first.** Use targeted local evidence before asking the user
   when the repository can answer or sharpen a branch.
3. **One question at a time.** Ask exactly one question per turn.
4. **Recommend an answer.** Every question must include a recommended answer and
   why it is the default.
5. **Pressure-test requirements and solution direction.** Focus on scope,
   behavior, users, constraints, edge cases, safety, compatibility, acceptance,
   and verification.
6. **Avoid technical planning drift.** Implementation details matter only when
   they change requirement boundaries, safety, compatibility, acceptance, or
   verification.
7. **Record the branch.** Track resolved decisions, accepted recommendations,
   project evidence, risky assumptions, and remaining open questions.
8. **Hand off cleanly.** End with ready `/to-spec` input.

## Supported Forms

```text
/grill-me
/grill-me <requirement-or-solution-direction>
```

First-class flows:

- `/grill-me <requirement-or-solution-direction>`: use explicit input as the
  selected direction.
- `/grill-me`: use the current session's selected direction when one is clear.

If no selected direction exists, ask:

```text
What requirement and solution direction should I pressure-test?
```

If the user only has a rough idea or broad option space, recommend `/explore`
instead of forcing `/grill-me`.

## Phase 0 - Orient

Run and read when available:

```bash
jkit update-check --quiet 2>/dev/null || true
pwd
git status --short
```

Read, when present and relevant:

```text
AGENTS.md
agent-map.yaml
docs/WORKFLOW.md
docs/specs/index.md
docs/records/open-questions.md
ARCHITECTURE.md
```

If the repository has no agent map and the request is repository-specific,
suggest `/map-init` before relying on local workflow assumptions.

If the worktree is dirty, do not edit files. Use the dirty state only as context
when it is relevant to the direction.

## Phase 1 - Resolve The Selected Direction

Use explicit input when supplied. Otherwise infer the selected direction from
current session context.

Resolve:

- requirement
- target user, maintainer, or agent
- solution direction
- desired outcome
- apparent non-goals
- known constraints

Stop and ask one concise question if the input lacks enough substance to know
what is being grilled.

Recommend `/explore` when:

- the solution direction is not selected
- broad alternatives still need comparison
- the user is still asking "what should we do?"

## Phase 2 - Scan The Project Base

Use targeted local evidence to answer or sharpen questions:

```text
docs and workflow rules
existing specs and acceptance criteria
active or completed plans
architecture and design docs
open questions and workflow exceptions
related code paths
tests, scripts, package metadata, command wrappers, or plugin metadata
```

Prefer `rg` and targeted reads. Do not perform broad source exploration unless
the selected direction requires it. Do not ask the user to answer facts the
repository already proves.

When project evidence conflicts with user input, surface the conflict and ask
which source should define the future behavior.

## Phase 3 - Build The Decision Tree

Identify branches that could affect:

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

Prioritize by impact on whether `/to-spec` can write a useful behavior
contract.

## Phase 4 - Ask And Resolve One Branch At A Time

For each question:

```md
Project evidence:
Why this matters:
Question:
Recommended answer:
Alternatives:
```

Rules:

- Ask exactly one question per turn.
- Include meaningful alternatives or tradeoffs when they exist.
- If the user accepts the recommended answer, record it as a resolved decision.
- If the user chooses a different answer, follow the resulting branch before
  moving on.
- If a branch can be resolved by additional targeted project-base inspection,
  inspect instead of asking.
- Do not ask about implementation details that `/to-plan` can decide safely.

## Phase 5 - Stop Condition

Stop asking when:

- the requirement and solution direction are clear enough for `/to-spec`
- remaining uncertainty can be safely tagged as `[ASSUMED]`
- remaining uncertainty can be recorded as `[NEEDS_INVESTIGATION]` without
  blocking spec writing
- the user asks to stop
- a blocking contradiction requires a user decision before continuing

Do not continue questioning merely because more details could be discovered.

## Phase 6 - Handoff

Final response should use this shape:

```md
Requirement and direction:

Decisions resolved:

Recommended answers accepted:

Project evidence used:

Risky assumptions:

Remaining open questions:

Next /to-spec input:
```

The `Next /to-spec input` should be concise enough to use as:

```text
/to-spec "<generated input>"
```

If the conversation reveals that the user still needs broad option exploration,
recommend `/explore`.

If the conversation is about an existing spec with unresolved gaps, recommend
`/clarify <spec-slug>`.

## Safety

- Do not edit files by default.
- Do not create specs, plans, tests, command wrappers, package changes, or
  runtime behavior.
- Do not run destructive commands.
- Do not perform production writes, migrations, external live checks, or
  network-dependent checks.
- Do not inspect secrets, tokens, credentials, or private local config.
- Treat security, data loss, compatibility, external services, distribution,
  and verification uncertainty as high-priority decision branches.

## Stop Conditions

Stop and ask one concise question when:

- no selected direction is identifiable
- project evidence conflicts with user intent
- a missing decision changes safety, data, external services, compatibility,
  public workflow, or irreversible behavior

Stop and recommend another command when:

- the user still needs broad option exploration by `/explore`
- an existing spec needs post-spec clarification by `/clarify`
- the direction is already ready for `/to-spec`

## Verification For Implementation

When changing this skill or shipping `/grill-me`, run:

```bash
test -f skills/grill-me/SKILL.md
test -f commands/grill-me.md
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood manually:

- `/grill-me <direction>` asks one question with a recommended answer.
- `/grill-me` after `/explore` continues from the selected direction.
- A repository-grounded branch inspects local evidence before asking the user.
