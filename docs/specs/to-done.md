# Spec: to-done

> Status: draft
> Product: jkit v2
> Scope: fast-path orchestration from clear intent to verified done

## 1. Summary

`/to-done` is the fast path for clear, bounded work. It takes a request that is
already understood from the current session or simple enough to explain in one
or two sentences, materializes the required durable artifacts, and drives the
work to verified completion.

It is an orchestration command in the jkit v2 workflow:

```text
/map-init -> /to-spec -> /to-plan -> /run -> /map-repair
                  \-> /to-done ->/
```

`/to-done` does not skip `/to-spec`, `/to-plan`, or `/run`. It automates the
normal path when the work is eligible:

```text
/to-done = minimal /to-spec -> minimal /to-plan -> /run
```

The command may use conversation context to start, but it must not rely on chat
history to finish. Before implementation begins, the request must exist as a
minimal spec and a minimal active ExecPlan. Done means reviewed, repaired,
verified, recorded, and moved to completed when appropriate.

## 2. Background

jkit v2 has separate commands for making work durable:

- `/to-spec` turns unclear or new behavior into a reviewable spec.
- `/to-plan` turns a plannable spec into an active ExecPlan.
- `/run` executes the active plan through a Goal-Driven Execution loop.

That deliberate separation is useful for complex or ambiguous work, but it can
feel heavy when the user and agent already clarified the need in the current
session or when the request is plainly small. `/to-done` provides a safe fast
path for those cases while preserving the same artifacts and verification
contract.

## 3. Goals

- Accept clear work from current conversation context or a one/two sentence
  brief.
- Decide whether the work is eligible for fast-path orchestration.
- Materialize a minimal spec before planning.
- Materialize a minimal active ExecPlan before implementation.
- Delegate execution semantics to `/run` rather than inventing a second
  execution loop.
- Review, repair, and verify before claiming done.
- Record progress, verification, failures, and map updates durably.
- Move completed plans to `docs/exec-plans/completed/` after final
  verification when repository convention allows it.
- Stop at the correct stage when the request is not eligible.
- Leave no important requirement only in chat history.

## 4. Non-goals

- Do not replace `/to-spec`, `/to-plan`, or `/run`.
- Do not bypass specs, plans, review, verification, records, or generated index
  updates.
- Do not handle unclear, broad, risky, or multi-option work.
- Do not create product requirements from vague intent.
- Do not run destructive commands, production writes, migrations, or external
  live checks without explicit approval.
- Do not silently choose among significant design alternatives.
- Do not mark work done when verification is missing, skipped, failing, or
  blocked.
- Do not execute an existing active plan differently from `/run`.

## 5. User stories

### 5.1 Complete a clear request from session context

As a user who already discussed the requirement and solution with the agent, I
can run `/to-done` and have the agent convert that shared context into durable
artifacts and finish the work.

Acceptance criteria:

- The command extracts goal, scope, non-goals, acceptance criteria, and
  verification from the current session.
- The command asks one concise question when it cannot safely restate the work.
- The command writes a minimal spec before creating a plan.
- The command writes a minimal active ExecPlan before implementation.
- The command runs the `/run` Goal-Driven Execution loop.
- The final response links the spec, plan, verification results, and remaining
  blockers, if any.

### 5.2 Complete a simple brief

As a user with a small clear request, I can run `/to-done <brief>` without first
manually invoking `/to-spec` and `/to-plan`.

Acceptance criteria:

- The brief is accepted only when it is simple enough to define observable
  behavior in one or two sentences.
- The command rejects briefs that lack a completion condition or verification
  signal.
- The created spec and plan are intentionally small but still complete enough
  for `/run`.
- The command does not ask for details that can safely be assumed and recorded.

### 5.3 Stop when work is not eligible

As a user, I want `/to-done` to fall back to the slower workflow when the work
needs real clarification or planning.

Acceptance criteria:

- If behavior is unclear, the command stops and suggests `/to-spec`.
- If the spec has blocking open questions, the command stops and suggests
  `/to-spec --update <spec-slug>`.
- If the implementation strategy has unresolved choices, the command stops and
  suggests `/to-plan <spec-slug>`.
- If an active plan already exists for the same work, the command uses or
  suggests `/run <plan-slug>` instead of creating a duplicate plan.
- If verification fails, the command records the exact failure and does not
  claim done.

### 5.4 Preserve the regular done contract

As a future agent, I want `/to-done` work to be as recoverable as normal
spec-plan-run work.

Acceptance criteria:

- The minimal spec is listed in `docs/specs/index.md`.
- The ExecPlan contains Goal, Context, Non-goals, Design, Checklist,
  Verification, Decisions, Progress Log, and Rollback.
- The plan progress log records checklist status, verification commands and
  results, failures or exceptions, doc-update decisions, generated-index status,
  and new open questions.
- Generated indexes are refreshed when relevant.
- Verification failures are recorded under
  `docs/records/verification-failures/` when they affect future agents.

## 6. Command behavior

User-facing command:

```text
/to-done
```

Plugin skill folder:

```text
skills/to-done/
```

Plugin command wrapper:

```text
commands/to-done.md
```

Supported forms:

```text
/to-done
/to-done <brief>
/to-done <spec-slug>
/to-done <plan-slug>
```

Default behavior:

- With no argument, use current session context only when the requirement,
  implementation direction, boundaries, acceptance criteria, and verification
  are already clear.
- With a brief, use the brief only when it is small and explicit enough to
  become a minimal spec without consequential questions.
- With a spec slug, validate that the spec is plannable, create or update a
  minimal active plan, then run it.
- With a plan slug, delegate to `/run <plan-slug>`.
- If multiple specs or plans plausibly match, ask which one to use.

## 7. Eligibility gate

`/to-done` may proceed only when one of these is true:

- The current session has already established the requirement, solution
  direction, boundaries, acceptance criteria, and verification.
- The user supplied a one/two sentence brief that clearly says what to change
  and how completion will be judged.

The work must also satisfy all of these:

- scope is small enough for one short ExecPlan
- implementation can follow existing project patterns
- no major design alternative needs selection
- no security, secret, permission, or sensitive-path ambiguity exists
- no data loss, migration, persistence, or destructive operation is required
- no production write or external live check is required without approval
- local verification is available or a clearly approved manual check exists
- no blocking `[NEEDS_INVESTIGATION]` item affects behavior, safety,
  compatibility, distribution, acceptance, or verification

If any condition fails, `/to-done` must stop at the correct slower stage instead
of forcing a fast path.

## 8. Required phases

### 8.1 Orient

- Read `AGENTS.md`.
- Read `agent-map.yaml`.
- Read `docs/WORKFLOW.md`.
- Read `docs/PLANS.md`.
- Read `docs/specs/index.md` when present.
- Inspect `git status --short`.
- Preserve unrelated dirty worktree changes.
- If no agent map exists, stop and suggest `/map-init`.

### 8.2 Restate the work

From the current session or brief, restate:

- goal
- current behavior
- desired behavior
- non-goals
- implementation direction
- acceptance criteria
- verification checks
- affected files, docs, skills, commands, package metadata, or runtime surfaces

If the agent cannot restate these confidently, ask one concise question or stop
and suggest `/to-spec`.

### 8.3 Apply the eligibility gate

- Check the criteria in section 7.
- Record low-risk assumptions as `[ASSUMED]`.
- Record unresolved important facts as `[NEEDS_INVESTIGATION]`.
- Stop before writing implementation code when any blocking question remains.
- Prefer the slower explicit workflow when in doubt.

### 8.4 Materialize or reuse the spec

- Search `docs/specs/` or the configured specs directory.
- Reuse an existing matching spec when one clearly covers the work.
- Create a minimal spec when no matching spec exists.
- Update `docs/specs/index.md`.
- Do not mark the spec accepted unless the user explicitly accepts it or the
  repository has an approval convention.

The minimal spec must still include:

- summary
- goals
- non-goals
- behavior contract
- verification
- acceptance criteria
- assumptions and open questions

### 8.5 Materialize or reuse the plan

- Search `docs/exec-plans/active/` for a plan that references the spec.
- Reuse and update exactly one active plan when a clear match exists.
- Create a minimal active ExecPlan when no match exists.
- Do not duplicate active plans for the same work.
- Preserve completed checklist items when updating.

The minimal plan must follow `docs/PLANS.md` and include:

- Goal
- Context
- Non-goals
- Design
- Checklist
- Verification
- Decisions
- Progress Log
- Rollback

### 8.6 Execute through `/run`

After the minimal active plan exists, use `/run` semantics:

- execute ready pending checklist items
- review the diff and behavior against the spec and plan
- fix in-scope review findings
- run the strongest available Verification Loop
- rerun failed checks after in-scope fixes
- record exact blockers when verification cannot pass
- mark checklist items complete only after focused verification passes

`/to-done` must not maintain a divergent execution loop.

### 8.7 Update maps and records

Always update:

- active plan checklist statuses
- active plan Progress Log
- verification results
- decisions
- blockers, if any

When relevant, update:

- specs
- architecture or design docs
- workflow docs
- playbooks
- open questions
- verification failure records
- generated indexes
- package or plugin metadata
- quality score

If the plan completes and verification passes, move it to completed when the
repository convention allows it.

### 8.8 Handoff

Final response must include:

- whether fast path eligibility passed
- spec created or reused
- plan created, reused, or completed
- checklist items completed
- review result
- verification commands and results
- map updates made
- records created, if any
- remaining blockers or open questions

## 9. Safety, data, and compatibility

- Conversation context can justify starting the command, but durable artifacts
  must carry the result.
- Do not use `/to-done` for irreversible operations without explicit approval.
- Do not use `/to-done` for work with unresolved security, data, compatibility,
  package distribution, or public workflow decisions.
- Do not hide skipped verification behind a successful summary.
- Do not move a plan to completed unless required verification passed or the
  blocker is explicitly recorded and the plan remains incomplete.
- Preserve unrelated dirty worktree changes.

## 10. Verification

Planning/spec verification for this command:

```bash
./scripts/agent-map-generate
./scripts/agent-map-check
```

Implementation verification after shipping `/to-done` must include:

```bash
test -f commands/to-done.md
test -f skills/to-done/SKILL.md
rg -n "to-done" README.md AGENTS.md agent-map.yaml bin/jkit.js commands skills docs .claude-plugin package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('json ok')"
node bin/jkit.js status
node bin/jkit.js claude-code status
npm pack --dry-run
./scripts/agent-map-generate
./scripts/agent-map-check
```

Dogfood verification should cover:

- `/to-done` from current-session context
- `/to-done <brief>` for a one/two sentence request
- fallback to `/to-spec` for unclear behavior
- fallback to `/to-plan` for unresolved implementation strategy
- delegation to `/run` for an existing active plan
- failed verification recording without claiming done

## 11. Acceptance criteria

- `docs/specs/to-done.md` exists.
- `docs/specs/index.md` lists `to-done.md`.
- `skills/to-done/SKILL.md` exists when implemented.
- `commands/to-done.md` exists when implemented.
- `bin/jkit.js` installs `map-init`, `to-spec`, `to-plan`, `to-done`, and
  `run` when implemented.
- README lists `/to-done` as a shipped command when implemented.
- `agent-map.yaml` includes `/to-done` once implemented.
- `/to-done` accepts clear current-session context.
- `/to-done <brief>` accepts simple one/two sentence requests.
- `/to-done` writes or reuses a minimal spec before planning.
- `/to-done` writes or reuses a minimal ExecPlan before implementation.
- `/to-done` delegates execution to `/run` semantics.
- `/to-done` refuses unclear, risky, broad, or unverifiable work.
- `/to-done` records verification failures exactly and does not claim done when
  checks fail.
- Completed `/to-done` work has durable spec, plan, progress log,
  verification, and map updates.
- `./scripts/agent-map-check` passes.
- `npm pack --dry-run` includes `commands/to-done.md` and
  `skills/to-done/SKILL.md` after implementation.

## 12. Assumptions and open questions

- [ASSUMED] `/to-done` should be a distinct command rather than expanding
  `/run`, because `/run` should remain scoped to executing existing plans.
- [ASSUMED] A one/two sentence brief is eligible only when it includes both the
  desired change and a completion signal.
- [ASSUMED] Minimal specs and plans may be short, but they must preserve all
  fields needed for future agents to continue without chat history.
- [ASSUMED] The first `/to-done` implementation writes minimal specs and plans
  to normal durable locations every time; an explicit preview mode can be
  specified separately later.
