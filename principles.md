# Principles

Four rules that govern jkit's workflow — and apply to every line of code
outside it too.

Adapted from
[andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
(MIT), itself distilled from
[Karpathy's January 2026 post](https://x.com/karpathy/status/2015883857489522876)
on LLM coding failure modes.

jkit's `before-build` and `build` skills are **one workflow-shaped
implementation** of these principles. The principles themselves apply
whether or not you're running the workflow — to bug fixes, one-line
tweaks, and everything `before-build` deliberately doesn't trigger on.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't silently pick one.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

> `before-build` is this principle turned into a workflow: the ambiguity
> ledger forces every unclear thing into Consensus, `[ASSUMED]`, or
> `[NEEDS_INVESTIGATION]`.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

The test: would a senior engineer call this overcomplicated? If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/vars/functions that *your* changes orphaned. Don't
  remove pre-existing dead code unless asked.

The test: every changed line traces directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → write tests for invalid inputs, then make them pass
- "Fix the bug" → write a test that reproduces it, then make it pass
- "Refactor X" → ensure tests pass before and after

For multi-step work, state the plan as `Step → verify: check`.

> `build` is this principle turned into a workflow: PART 3 tasks run
> sequentially, each with its own verification, rather than as one
> uncheckpointed push.

---

**Tradeoff:** these guidelines bias toward caution over speed. For
trivial edits, use judgment.

**License:** MIT (inherits from andrej-karpathy-skills).
