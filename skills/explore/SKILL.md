---
name: explore
version: 0.1.0
description: |
  Turn a rough idea or current-session context into a recommended direction
  and ready input for /to-spec. Use when the user asks for /explore, explore
  an idea, discuss a rough requirement, compare possible solution directions,
  or decide whether an idea is ready for /to-spec.

  This is not a spec-writing, planning, or implementation command. It reads
  the repository agent map when present, gathers only enough context to compare
  options, recommends a direction, and hands off concise /to-spec input.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - AskUserQuestion
---

# Explore - Turn A Rough Idea Into A Direction

`/explore` is the lightweight pre-spec stage in the jkit v2 workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

The job is to discuss the need, explore solution directions, recommend one
default direction, and produce ready input for `/to-spec`. Do not write specs,
create ExecPlans, implement code, or turn exploration into a long interrogation.

## Core Rules

1. **Lightweight by default.** Ask only enough to compare options and recommend
   a direction.
2. **Direction, not artifact.** Do not edit files or create durable artifacts by
   default; `/to-spec` owns durable specs.
3. **Use two input modes.** Use explicit input when supplied; otherwise infer
   the rough idea from current session context.
4. **Map-aware when relevant.** Read repository map context when present so the
   recommendation does not contradict local workflow rules.
5. **Ask sparingly.** Ask at most three high-leverage questions before
   producing the first useful option set.
6. **Compare options.** Present two to four approaches when alternatives exist.
7. **Recommend a default.** Choose one direction and explain why.
8. **Hand off cleanly.** End with ready `/to-spec` input.

## Supported Forms

```text
/explore
/explore <rough-idea>
```

First-class flows:

- `/explore <rough-idea>`: use explicit input as the primary idea.
- `/explore`: use current session context when one rough idea is clear.

If no clear idea exists, ask:

```text
What rough idea should we explore, and what outcome would make it worth doing?
```

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
```

If the repository has no agent map and the request is repository-specific,
suggest `/map-init` before relying on local workflow assumptions. You may still
explore product-neutral ideas without a map.

If the worktree is dirty, do not edit files. Use the dirty state only as context
when it is relevant to the idea.

## Phase 1 - Resolve Input

Use input mode when the user supplied a rough idea in the command or surrounding
message. Use no-input mode when no explicit input was supplied.

In input mode:

- explicit input is the primary idea
- current session context may clarify the idea when it does not conflict

In no-input mode:

- current session context is the primary signal
- ask one concise question if multiple ideas are plausible

Resolve:

- rough idea
- target user, maintainer, or agent
- problem or opportunity
- desired outcome
- known constraints
- success signal
- risks or sensitive boundaries

## Phase 2 - Gather Just Enough Context

Use repository evidence before asking when the answer is easy to find locally.
Prefer targeted reads and searches over broad source exploration.

Useful context surfaces:

```text
AGENTS.md
agent-map.yaml
docs/WORKFLOW.md
docs/specs/
docs/records/open-questions.md
ARCHITECTURE.md
README.md
package metadata or command wrappers when the idea touches distribution
```

Do not block on implementation details that belong in `/to-plan`. Do not inspect
secrets, credentials, private local config, or unrelated source areas.

## Phase 3 - Decide Whether Exploration Is The Right Tool

Continue with `/explore` when:

- the user has a rough idea
- the solution direction is not yet selected
- two or more approaches could plausibly work
- the user wants tradeoffs before writing a spec

Recommend another command when clearer:

- clear, bounded, low-risk work: `/to-done`
- selected direction still needs decision-tree pressure testing: `/grill-me`
- existing spec is not plannable: `/clarify <spec-slug>`
- idea is already spec-ready: `/to-spec`

Do not force `/to-spec` if important decision branches are still unresolved.

## Phase 4 - Explore Options

When alternatives exist, present two to four approaches. For each approach,
include:

```text
short name
what it optimizes for
main tradeoff
when to choose it
```

If only one direction is reasonable, say so and explain why.

Keep the options focused on requirement and workflow direction. Avoid
implementation planning unless an implementation fact changes the requirement,
safety, compatibility, acceptance, or verification.

## Phase 5 - Recommend A Direction

Select one default direction based on:

- fit with the stated outcome
- simplicity
- compatibility with existing jkit workflow
- reversibility
- ease of turning into a reviewable spec

Record unresolved important facts as open questions in the handoff. Tag
low-risk inferred details as `[ASSUMED]` when they appear in the `/to-spec`
input.

## Phase 6 - Handoff

Final response should use this shape:

```md
Recommended direction:

Why:

Alternatives considered:

Risks:

Open questions:

Next /to-spec input:
```

The `Next /to-spec input` should be concise enough to use as:

```text
/to-spec "<generated input>"
```

If the selected direction still has too many unresolved decision branches,
recommend `/grill-me` instead of forcing `/to-spec`.

If the work is about an existing spec with unresolved gaps, recommend
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
  and verification uncertainty as risks or open questions.

## Stop Conditions

Stop and ask one concise question when:

- no rough idea is identifiable
- multiple current-session ideas are plausible
- a missing decision changes safety, data, external services, compatibility, or
  irreversible behavior

Stop and recommend another command when:

- the idea is already clear and bounded enough for `/to-done`
- the selected direction needs deep pressure testing by `/grill-me`
- an existing spec needs post-spec clarification by `/clarify`
- the idea is already ready for `/to-spec`

## Verification For Implementation

When changing this skill or shipping `/explore`, run:

```bash
test -f skills/explore/SKILL.md
test -f commands/explore.md
node bin/jkit.js status
node bin/jkit.js claude-code status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood manually:

- `/explore "rough idea"` produces the required handoff fields.
- `/explore` with no clear idea asks the expected concise question.
