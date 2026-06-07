---
name: clarify
version: 0.1.0
description: |
  Resolve blocking ambiguity in one existing spec before /to-plan. Use when the
  user asks for /clarify, clarify a spec, resolve spec questions, make this
  spec plannable, or continue after /to-spec when planning would otherwise need
  to invent decisions.

  This is not broad exploration, pre-spec pressure testing, spec creation,
  planning, or implementation. It reads the repository agent map, resolves
  exactly one existing spec, uses targeted project-base evidence before asking
  the user, asks or resolves at most five high-impact clarification questions
  per pass, updates the selected spec, and hands off readiness for /to-plan.
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

# Clarify - Make One Existing Spec Plannable

`/clarify` is the post-spec, pre-plan requirements QA stage in the jkit v2
workflow:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
```

The job is to resolve blocking ambiguity in exactly one existing spec, update
that spec with the resolved decisions, and say whether it is ready for
`/to-plan`. Do not discover broad directions, pressure-test an unwritten
requirement, create a new spec, create an ExecPlan, implement code, or hide
clarifications in chat history.

## Core Rules

1. **One existing spec.** Resolve and work on exactly one existing spec.
2. **Planning blockers only.** Focus on ambiguity that would force `/to-plan`
   to invent decisions.
3. **Project base first.** Use targeted local evidence before asking the user
   when the repository can answer or sharpen a question.
4. **At most five questions.** Ask or resolve no more than five high-impact
   clarification questions per pass.
5. **Explain why each question blocks.** Every user-facing question must state
   why it blocks planning, relevant project evidence, a recommended answer, and
   alternatives.
6. **Write the answer back.** Resolved clarifications belong in the selected
   spec, not only in chat.
7. **Preserve accepted behavior.** Do not silently change accepted spec
   behavior.
8. **Hand off clearly.** End by saying whether the spec is ready for
   `/to-plan <spec-slug>`.

## Supported Forms

```text
/clarify
/clarify <spec-slug>
/clarify <spec-file>
```

First-class flows:

- `/clarify <spec-slug>`: resolve the spec from the configured specs directory.
- `/clarify <spec-file>`: use the explicit spec file.
- `/clarify`: use the current session context or one obvious recently changed
  spec.

If no existing spec can be resolved, stop and suggest `/to-spec`.

If multiple specs plausibly match, ask which spec to clarify before editing.

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
changes. If the selected spec or records are already modified, read them before
editing and preserve the user's changes.

## Phase 1 - Resolve The Target Spec

Use `agent-map.yaml` `docs.specs` when present. Otherwise fall back to:

```text
docs/specs
```

Selection rules:

- If the user provided a spec file, use that file.
- If the user provided a spec slug, match it in the configured specs directory.
- If no argument was supplied, use one obvious current-session or recently
  changed spec.
- If multiple specs plausibly match, ask which one to clarify.
- If no spec exists for the request, stop and suggest `/to-spec`.

Do not create a spec. Do not rename or move specs unless the user explicitly
asks.

## Phase 2 - Read The Spec And Classify Gaps

Read the selected spec completely. Extract:

- status
- scope
- goals
- non-goals
- behavior or command contract
- required phases
- safety, data, compatibility, and distribution constraints
- acceptance criteria
- verification signals
- assumptions
- `[NEEDS_INVESTIGATION]` items
- open questions

Classify each gap as:

```text
blocking
non-blocking
planning detail
implementation detail
out-of-scope behavior change
```

Only `blocking` gaps are first-class clarification targets. A gap is blocking
when it affects scope, user-visible behavior, command names, workflow
contracts, security, secrets, permissions, data, migrations, external services,
compatibility, acceptance criteria, or required verification.

Do not ask about details that `/to-plan` can decide safely.

## Phase 3 - Gather Project Evidence

Use targeted local evidence before asking the user:

```text
repository map and workflow docs
existing specs and related acceptance criteria
active or completed plans
architecture and design docs
records, workflow exceptions, and verification failures
related code paths
tests, scripts, package metadata, command wrappers, or plugin metadata
```

Prefer `rg` and targeted reads. Do not perform broad source exploration unless
the selected spec requires it. Do not ask the user to answer facts the
repository already proves.

When project evidence conflicts with user intent or accepted behavior, surface
the conflict and ask before editing.

## Phase 4 - Ask Or Resolve Clarification Questions

Prepare at most five high-impact blocking questions for this pass. For each
question use this shape:

```md
Question:
Why it blocks planning:
Project evidence:
Recommended answer:
Alternatives:
```

Rules:

- If evidence gives a clear answer, record the answer and update the spec
  without asking, subject to the accepted-behavior rules below.
- If evidence supports a low-risk default, recommend it. Ask for confirmation
  only when the default changes behavior, acceptance, safety, data,
  compatibility, or public workflow.
- If evidence conflicts with user intent or accepted behavior, ask before
  editing.
- If more than five blocking questions exist, ask or resolve the top five and
  leave the rest visible as remaining blockers.
- Ask one concise user question when an answer is required before any safe edit
  can be made.

## Phase 5 - Update The Spec

Write resolved clarifications into the smallest appropriate sections:

- summary or background when the problem statement was unclear
- goals or non-goals when scope changed
- behavior or command contract when user-visible behavior changed
- required phases when command flow changed
- safety, data, and compatibility when risk boundaries changed
- verification when done checks changed
- acceptance criteria when success conditions changed
- open questions when ambiguity remains

Add or update a `## Clarifications` section when dated user answers or
evidence-backed decisions need to remain visible as decision history.

Resolved `[NEEDS_INVESTIGATION]` items should be removed, rewritten as
decisions, or downgraded to `[ASSUMED]` only when the remaining risk is low and
the rationale is explicit.

Update `docs/records/open-questions.md` when unresolved project-level facts
remain. Do not update unrelated docs or create implementation artifacts during
normal clarification.

## Phase 6 - Preserve Accepted Behavior

Detect the selected spec status.

If the spec is accepted and a clarification would change behavior, ask for
explicit confirmation before editing. If the clarification only adds
non-conflicting detail, update the accepted spec and record the clarification.

If the user requests a conflicting behavior change, stop and suggest:

```text
/to-spec --update <spec-slug>
```

## Phase 7 - Recheck Plannability

After editing, re-read the affected sections and determine whether the spec is
plannable:

- clear scope
- clear goals and non-goals
- clear behavior contract
- acceptance criteria
- verification signals
- no blocking open questions for delivery shape

If the spec is plannable, hand off to:

```text
/to-plan <spec-slug>
```

If blockers remain, record them exactly and do not claim the spec is ready.

## Phase 8 - Update Maps And Verify

Update when clarification changes are applied:

- the selected spec

When relevant, update:

- `docs/records/open-questions.md`
- `docs/specs/index.md` if index drift is discovered
- `docs/generated/repo-map.md` by running `./scripts/agent-map-generate` when
  source layout or docs indexes changed

For docs-only clarification changes, run:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

If command, skill, installer, package, or plugin files changed as part of
shipping `/clarify`, also run the relevant package checks from `agent-map.yaml`,
commonly:

```bash
node bin/jkit.js status
./scripts/codex-plugin-check
npm pack --dry-run
```

If verification fails, record the exact command and summary. Add a record under
`docs/records/verification-failures/` when the failure affects future agents.

## Handoff

Final response should use this shape:

```md
Spec clarified:

Clarifications applied:

Project evidence used:

Remaining blockers:

Readiness:

Next command:
```

If ready, `Next command` should usually be:

```text
/to-plan <spec-slug>
```

If not ready, name the smallest next clarification needed.

## Safety

- Do not run destructive commands.
- Do not perform production writes, migrations, external live checks, or
  network-dependent checks.
- Do not inspect secrets, tokens, credentials, or private local config.
- Do not implement code, command wrappers, package changes, migrations, or
  tests during normal spec clarification.
- Preserve accepted behavior unless explicitly changed by the user.
- Preserve unrelated user changes in dirty worktrees.

## Stop Conditions

Stop and ask one concise question when:

- no single target spec is identifiable
- project evidence conflicts with user intent
- an accepted spec would need a behavior change
- a missing decision changes safety, data, external services, compatibility,
  public workflow, acceptance, or required verification

Stop and recommend another command when:

- the user has only a rough idea or broad option space: `/explore`
- the user has a selected pre-spec direction that still needs pressure testing:
  `/grill-me`
- no spec exists for the behavior: `/to-spec`
- the spec is plannable and ready for execution planning: `/to-plan <spec-slug>`
- the user asks to implement: `/to-plan <spec-slug>` first, then `/run`

## Skill Maintenance

When changing this skill or shipping `/clarify`, run:

```bash
test -f skills/clarify/SKILL.md
test -f commands/clarify.md
rg -n "clarify" README.md README.en.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin .codex-plugin package.json
node bin/jkit.js status
./scripts/codex-plugin-check
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Manual checks:

- `/clarify <spec-slug>` against a spec with a blocking
  `[NEEDS_INVESTIGATION]` item updates the selected spec.
- `/clarify` with multiple plausible specs asks which spec to clarify.
- `/clarify <spec-slug>` against an already plannable spec reports a
  `/to-plan` handoff without unnecessary edits.
