# Spec: clarify

> Status: draft
> Product: jkit v2
> Scope: resolve blocking ambiguity in an existing spec before `/to-plan`

## 1. Summary

`/clarify` is an optional post-spec, pre-plan command that resolves blocking
ambiguity in one existing spec and updates that spec so `/to-plan` can proceed.

It fits into the jkit v2 workflow after spec writing:

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run -> /map-repair
```

`/clarify` is requirements QA for an existing spec. It does not discover broad
directions, review a selected direction from scratch, write a new spec,
create an ExecPlan, or implement code. Its job is to make an existing spec
plannable by resolving the questions that would otherwise block `/to-plan`.

## 2. Background

jkit now has pre-spec commands for requirements exploration and pressure
testing. `/explore` turns a rough idea into a recommended direction.
`/grill-me` reviews a selected requirement and solution direction before
`/to-spec`.

After `/to-spec`, a draft spec may still contain blocking ambiguity:
`[NEEDS_INVESTIGATION]` items, unclear acceptance criteria, missing verification
signals, unresolved compatibility questions, or behavior boundaries that would
force `/to-plan` to invent decisions. `/clarify` owns this spec-aftercare step.

The command should use the project base before asking the user. If the
repository map, existing docs, specs, architecture, code, tests, or package
metadata can answer a clarification question, `/clarify` should use that
evidence and update the spec instead of asking the user to restate known facts.

## 3. Goals

- Resolve blocking ambiguity in one existing spec.
- Make the selected spec plannable for `/to-plan`.
- Use project-base evidence before asking the user.
- Identify at most five high-impact clarification questions per pass.
- Ask or resolve only questions that affect scope, behavior, safety, data,
  compatibility, external services, acceptance criteria, verification, or
  workflow contracts.
- Update the spec directly after clarifications are resolved.
- Remove, rewrite, or downgrade resolved `[NEEDS_INVESTIGATION]` items.
- Preserve unresolved blocking questions clearly.
- Update `docs/records/open-questions.md` when project-level questions remain.
- Leave a clear handoff to `/to-plan <spec-slug>` when the spec is plannable.

## 4. Non-goals

- Do not explore rough ideas; use `/explore`.
- Do not review an unwritten requirement and solution direction; use
  `/grill-me`.
- Do not create a new spec; use `/to-spec`.
- Do not create an ExecPlan; use `/to-plan`.
- Do not implement code, command wrappers, package changes, migrations, or
  tests.
- Do not mark a draft spec accepted unless the user explicitly accepts it and
  the repository has an approval convention.
- Do not silently change accepted spec behavior; ask before changing accepted
  behavior.
- Do not resolve new unrelated behavior requests; route them to `/to-spec` or
  `/to-spec --update <spec-slug>`.

## 5. User stories

### 5.1 Clarify a named spec

As a user with a draft spec, I can run `/clarify <spec-slug>` and have the
agent resolve ambiguity that blocks planning.

Acceptance criteria:

- The command resolves the named spec from the configured specs directory.
- The command reads the spec completely before editing.
- The command identifies blocking ambiguity that would prevent `/to-plan`.
- The command uses project evidence to answer or sharpen questions before
  asking the user.
- The command updates the selected spec after clarifications are resolved.
- The final response says whether the spec is ready for `/to-plan`.

### 5.2 Clarify the obvious current spec

As a user already working on one obvious spec, I can run `/clarify` without an
argument.

Acceptance criteria:

- The command uses the current session context and recent spec changes to find
  one obvious target spec.
- If multiple specs are plausible, the command asks which spec to clarify.
- If no existing spec is available, the command stops and suggests `/to-spec`.
- The command does not create a new spec from loose intent.

### 5.3 Ask only planning-blocking questions

As a maintainer, I want `/clarify` to focus on the questions that make a spec
plannable.

Acceptance criteria:

- The command ranks blocking questions by impact.
- The command presents at most five high-impact clarification questions per
  pass.
- Each question includes why it blocks planning.
- Each question includes project evidence when relevant.
- Each question includes a recommended answer when one is supported by evidence
  or low-risk workflow convention.
- The command does not ask about details that belong in `/to-plan` or `/run`.

### 5.4 Update the spec after answers

As a future `/to-plan` agent, I want clarifications to live in the spec instead
of chat history.

Acceptance criteria:

- The command writes resolved answers into the appropriate spec sections.
- The command adds or updates a `## Clarifications` section when it is useful
  to preserve dated answers.
- The command updates acceptance criteria when clarification changes the
  delivery contract.
- The command updates verification signals when clarification changes how done
  will be checked.
- Resolved `[NEEDS_INVESTIGATION]` items are removed, rewritten as decisions,
  or downgraded to `[ASSUMED]` when safe.
- Remaining blocking questions stay visible in `Open questions` or
  `docs/records/open-questions.md`.

### 5.5 Preserve accepted behavior

As a maintainer, I want `/clarify` to avoid accidentally rewriting approved
requirements.

Acceptance criteria:

- The command detects the selected spec status.
- If the spec is accepted and a clarification would change behavior, the
  command asks for explicit confirmation before editing.
- If the clarification only adds non-conflicting detail, the command may update
  the accepted spec while recording the clarification.
- If the user requests a conflicting behavior change, the command stops and
  suggests `/to-spec --update <spec-slug>`.

## 6. Command behavior

User-facing command:

```text
/clarify
```

Plugin skill folder:

```text
skills/clarify/
```

Plugin command wrapper:

```text
commands/clarify.md
```

Supported forms:

```text
/clarify
/clarify <spec-slug>
/clarify <spec-file>
```

Default behavior:

- Resolve exactly one existing spec.
- Analyze the spec for planning-blocking ambiguity.
- Use targeted project-base evidence before asking the user.
- Ask or resolve at most five high-impact clarification questions per pass.
- Update the spec with resolved clarifications.
- Update project open questions when unresolved project-level facts remain.
- Report whether the spec is ready for `/to-plan`.

## 7. Required phases

### 7.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/WORKFLOW.md`.
- Read `docs/specs/index.md` when present.
- Inspect `git status --short`.
- If no agent map exists, stop and suggest `/map-init`.
- Preserve unrelated dirty worktree changes.

### 7.2 Resolve the target spec

- If the user provided a spec file, use that file.
- If the user provided a spec slug, resolve it in the configured specs
  directory.
- If no argument was provided, use the one obvious current-session or recently
  changed spec.
- If multiple specs plausibly match, ask which spec to clarify.
- If no spec exists for the request, stop and suggest `/to-spec`.

### 7.3 Read the spec and classify gaps

Read the selected spec completely. Identify:

- status
- scope
- goals
- non-goals
- behavior or command contract
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

Only `blocking` gaps are first-class clarification targets.

### 7.4 Gather project evidence

Use targeted local evidence before asking the user:

- repository map and workflow docs
- existing specs and related acceptance criteria
- active or completed plans
- architecture and design docs
- records and workflow exceptions
- related code paths
- tests, scripts, package metadata, command wrappers, or plugin metadata

Prefer `rg` or equivalent targeted searches. Do not perform broad source
exploration unless the selected spec requires it.

### 7.5 Ask or resolve clarification questions

Prepare at most five high-impact questions. For each question include:

```md
Question:
Why it blocks planning:
Project evidence:
Recommended answer:
Alternatives:
```

Rules:

- If evidence gives a clear answer, record the answer and update the spec
  without asking.
- If evidence supports a low-risk default, recommend it and ask for user
  confirmation only when the default changes behavior or acceptance.
- If evidence conflicts with user intent or accepted behavior, ask before
  editing.
- Do not ask about implementation details that `/to-plan` can decide safely.

### 7.6 Update the spec

Write resolved clarifications into the smallest appropriate sections:

- summary or background when the problem statement was unclear
- goals or non-goals when scope changed
- behavior or command contract when user-visible behavior changed
- required phases when command flow changed
- safety, data, and compatibility when risk boundaries changed
- verification when done checks changed
- acceptance criteria when success conditions changed
- open questions when ambiguity remains

Add or update a `## Clarifications` section when dated user answers or evidence
need to remain visible as decision history.

### 7.7 Recheck plannability

After editing, re-read the affected sections and determine whether the spec is
plannable:

- clear scope
- clear goals and non-goals
- clear behavior contract
- acceptance criteria
- verification signals
- no blocking open questions for delivery shape

If the spec is plannable, hand off to `/to-plan <spec-slug>`.

If blockers remain, record them exactly and do not claim the spec is ready.

## 8. Safety, data, and compatibility

- Do not run destructive commands.
- Do not perform production writes, migrations, external live checks, or package
  changes.
- Do not inspect secrets, tokens, credentials, or private local config.
- Treat security, data loss, compatibility, external services, distribution,
  and verification uncertainty as high-priority clarification targets.
- Preserve accepted behavior unless explicitly changed by the user.
- Preserve unrelated user changes in dirty worktrees.

## 9. Verification

For the spec-only slice:

```bash
./scripts/agent-map-check
./scripts/agent-map-generate
```

When `/clarify` is implemented, verification should include:

- `test -f skills/clarify/SKILL.md`
- `test -f commands/clarify.md`
- `node bin/jkit.js status`
- `./scripts/codex-plugin-check`
- `npm pack --dry-run`
- Dogfood `/clarify <spec-slug>` against a spec with a blocking
  `[NEEDS_INVESTIGATION]` item and verify the spec is updated.
- Dogfood `/clarify` with multiple plausible specs and verify it asks which
  spec to clarify.
- Dogfood a spec that is already plannable and verify the command reports a
  `/to-plan` handoff without unnecessary edits.

## 10. Acceptance criteria

- `docs/specs/clarify.md` exists.
- `docs/specs/index.md` lists `clarify.md`.
- The spec defines `/clarify` as a post-spec, pre-plan command.
- The spec requires `/clarify` to operate on exactly one existing spec.
- The spec requires project-base evidence before user questions when local
  evidence can answer or sharpen a clarification.
- The spec requires at most five high-impact clarification questions per pass.
- The spec requires resolved clarifications to be written into the selected
  spec.
- The spec keeps `/clarify` distinct from `/explore`, `/grill-me`,
  `/to-spec`, `/to-plan`, and `/run`.
- The spec requires a final readiness statement for `/to-plan`.
- Map checks pass, or exact blockers are recorded.

## 11. Open questions

- [ASSUMED] The first implementation modifies only the selected spec and
  `docs/records/open-questions.md` when needed, because `/clarify` is not a
  planning or implementation command.
- [ASSUMED] The first implementation uses `/clarify` as the only command name
  because it matches the post-spec clarification stage and keeps naming aligned
  with the referenced spec-kit workflow.
- [ASSUMED] Five high-impact questions per pass is enough for the first
  implementation because deeper decision review belongs to `/grill-me`.
