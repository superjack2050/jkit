# Agent Working Principles

These principles apply to agents working on jkit.

## Think Before Coding

- Surface ambiguity before choosing a path.
- Ask when a decision changes behavior, security, distribution, or user-facing
  workflow.
- Use `[ASSUMED]` and `[NEEDS_INVESTIGATION]` when evidence is incomplete.

## Simplicity First

- Implement the smallest slice that satisfies the spec.
- Avoid speculative commands, templates, and abstractions.
- Keep skill instructions concise and reusable.

## Surgical Changes

- Touch only files needed for the request.
- Preserve existing maps and docs unless the task explicitly changes them.
- Do not reintroduce legacy behavior without a spec and plan.

## Goal-Driven Execution

- Define success criteria before implementation.
- Execute the plan's ready work as a closed loop: implement, review, fix, and
  rerun verification.
- Use focused verification while progressing, then run the strongest real
  project checks available before claiming completion.
- Record failures and blockers in docs when they affect future agents.
