# jkit

*Built on [four principles](./principles.md).*

**Karpathy called it: the #1 AI coding failure mode is the model
silently picking the wrong path at an ambiguous decision point.** You
lose hours to rework when you find out.

jkit puts an ambiguity gate into every feature. Writing a new module?
Library choice with no codebase precedent? External API whose shape
you haven't verified? The skill stops, surfaces the fork, and either
asks you, checks with a tool, or tags it. **No more *"I assumed you
wanted…"***

Not a blunt "confirm everything" script. Every unknown takes one of
three shapes — nothing else is allowed:

- **Consensus** — you explicitly agreed
- **`[ASSUMED]`** — flagged and visible; safe with minor rework risk
- **`[NEEDS_INVESTIGATION]`** — blocked until evidence arrives

The cost: ~10 minutes of aligning before any code gets written.
The payoff: the rework you'd have found hours later never shows up.

> "The models make wrong assumptions on your behalf and just run along
> with them without checking. They don't manage their confusion, don't
> seek clarifications, don't surface inconsistencies, don't present
> tradeoffs, don't push back when they should."
> — **Andrej Karpathy** ([January 2026](https://x.com/karpathy/status/2015883857489522876))

## Not another spec tool

Plenty of tools produce spec documents. The value here isn't writing a
spec — it's that every step fights the same quiet enemy:

> "LLM code will usually look fantastic: good variable names, convincing
> comments, clear type annotations and a logical structure. This can lull
> you into a false sense of security."
> — **Simon Willison** ([March 2025](https://simonwillison.net/2025/Mar/2/hallucinations-in-code/))

That's why:

- Clarification actively suggests options instead of waiting for you to think them up
- Sections like "Assumptions" and "Silent Defaults" can't be empty — they say *"none identified"* if nothing applies. A missing section means the check got skipped.
- Checkpoints are real pauses, not click-throughs
- The skill asks tools first, you second, flags last

The deal: ~10 minutes of aligning up front. The payoff: the rework you'd
have found hours later never shows up.

---

## What's inside

| Skill | Command | What it does |
|-------|---------|--------------|
| before-build | `/jkit:before-build` | Clarify → spec → design → tasks → ambiguity ledger, into `plan-<slug>.md` |
| build | `/jkit:build <slug>` | Execute the locked plan's tasks with verification |
| upgrade | `/jkit:upgrade` | Pull the latest from GitHub |

> Installed via symlink? The commands drop the `jkit:` prefix —
> `/before-build`, `/build`. `/jkit:upgrade` is plugin-only.

---

## A quick walk-through

You say:

> "I want a weekly report for admins that summarizes sales per category.
> Not sure what time window yet."

jkit batches the unclear pieces (time window, which categories, what
"summarize" means) into one question. You answer, and out comes
`plan-weekly-report.md` containing:

- **Spec** — what you're building, data model, acceptance criteria
- **Design** — chose `node-cron` + a PostgreSQL view, with 2 alternatives considered
- **Ambiguity Ledger** —
  - `[ASSUMED]` email delivery via your existing Resend account
  - `[DEFAULT]` reports stored in S3 with 30-day TTL *(alternatives: local FS / no-persist)*
  - `[NEEDS_INVESTIGATION]` exact "admin" role name in your auth schema — resolved during Task 2

At the checkpoint you say "actually, keep reports forever, we need an
audit trail." The plan updates, tasks generate, and
`/jkit:build weekly-report` runs them.

If something breaks later, you can open the ledger and know exactly
which assumption to revisit.

---

## Install

### Option A — Claude Code plugin (recommended)

Two commands, **each on its own turn** (pasting both at once makes the
first consume the second as its argument):

```
/plugin marketplace add superjack2050/jkit
```

```
/plugin install jkit@jkit
```

**Update:** `/jkit:upgrade`

jkit quietly checks for newer versions at the start of each run. If one
exists you get three options: *update now / skip for this run / don't
ask again*. The last writes `~/.claude/jkit-skip-update-check` — delete
that file to re-enable.

### Option B — git clone + symlink

```bash
git clone https://github.com/superjack2050/jkit ~/code/jkit
node ~/code/jkit/bin/jkit.js install
```

**Update:** `cd ~/code/jkit && git pull` (symlinks follow automatically)

### Option C — npm (coming soon)

`npx @scope/jkit` — the installer's wired up in the repo, just not
published yet.

---

## Using it

```
/jkit:before-build
```

jkit walks with you through:

1. **Clarify** — batched questions fill in just what's missing
2. **Evidence** — external unknowns (DOM shapes, APIs, regulations) get resolved via tools → you → tagged as a last resort
3. **Draft** — spec and design
4. **Checkpoint** — you read the ambiguity ledger and push back on anything
5. **Tasks** — generated only once you lock the plan

Then:

```
/jkit:build <feature-slug>
```

Each task runs, verifies, and if it hits a decision the plan didn't
cover, it pauses and surfaces it rather than guessing.

---

## What the plan looks like

One `plan-<slug>.md` per feature:

```
# Plan: [Feature Name]
> Status: draft | locked | in-progress | complete

PART 1 — SPEC              (WHAT)           §1–10
PART 2 — DESIGN            (HOW: strategy)  §11–14
PART 3 — TASKS             (HOW: execution)
PART 4 — AMBIGUITY LEDGER
  §A Assumptions       — every [ASSUMED]
  §U Unknowns          — every [NEEDS_INVESTIGATION]
  §D Silent Defaults   — every HOW decision not dictated by the spec
```

**PART 4 is the one you read at the checkpoint.** It's where every
unspoken thing got named — and it's the cheapest moment to say "wait,
not that."

---

## Multi-feature projects

One `plan-<slug>.md` per feature. When you come back with a change, jkit
figures out how much to redo — from "fix a typo in place" to "this
looks like a new feature, let's start a new plan" — and never rolls
your change in silently.

---

## Uninstall

```
/plugin uninstall jkit          # plugin
node bin/jkit.js uninstall      # symlink / bundled installer
rm ~/.claude/skills/before-build ~/.claude/skills/build    # manual
```

Re-enable update checks (if you'd opted out):

```bash
rm ~/.claude/jkit-skip-update-check
```

---

## Contributing

```bash
git clone https://github.com/superjack2050/jkit ~/code/jkit
cd ~/code/jkit
node bin/jkit.js install
# Edit skills/*/SKILL.md, open a new Claude Code session — changes are live.
```

Pull requests welcome. Everything outside `.claude-plugin/*.json` is
prose that shapes the skill — changes there need no build step.

---

## License

MIT — see [LICENSE](./LICENSE).
