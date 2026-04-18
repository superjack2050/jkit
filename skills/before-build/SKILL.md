---
name: before-build
version: 0.0.2
description: |
  Turn fuzzy ideas into a single plan-<feature-slug>.md file with cognitive
  transparency gates (spec + design + tasks + ambiguity ledger in one place).
  Surfaces BOTH user-side ambiguity AND model-side silent defaults. Every
  ambiguity becomes one of three explicit artifacts: confirmed consensus,
  tagged assumption, or controlled unknown — nothing hidden.

  TRIGGER when the user:
  - describes a new feature, system, module, or architecture change
  - uses fuzzy language ("something like X", "roughly", "you figure it out",
    "差不多就行", "你帮我想想")
  - asks to plan, spec, design, scope, think through, or architect a feature
    (including Chinese: 规划 / 设计 / 方案 / 想清楚 / 先别急着写)
  - requests a multi-file, multi-module, or cross-layer change
  - signals "think before code" ("don't rush to implement", "plan first")

  DO NOT trigger for:
  - single-line edits, typos, variable renames, formatting
  - bug fixes with clear repro steps and expected behavior
  - mechanical tasks (adding comments, organizing imports, running tests)
  - tasks where the user already specified the full technical plan
  - explicit prototype-speed signals ("quick tweak", "just trying", "原型而已",
    "快速改一下")
  - increments to a feature whose `plan-<slug>.md` already exists — use
    PHASE 11 (Blast Radius) on that plan, don't re-run the full flow

  AMBIGUOUS cases (e.g. "add caching", "optimize this", "加个小功能"): do NOT
  auto-run the full flow. Ask ONE clarifying question first, then decide
  complexity from the answer. Bias toward lightweight unless evidence of
  complexity appears.

  Positive example: "I want to build a weekly report system for admins, not
  sure what sections yet" → trigger full flow.
  Negative example: "change the button color to blue" → do not trigger.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - Agent
  - WebFetch
  - WebSearch
---

# Before-Build — Explicit Ambiguity → Spec → Tasks

## Core Thesis

AI coding fails not from lack of capability but from **silent defaults at
ambiguity points**. The model confidently fills gaps and marches forward; the
user discovers the wrong path hours later. This skill attacks that single
failure mode — but only when the task actually warrants the overhead.

**Soul of the trigger system:** the user must feel this skill *helps*, never
*blocks*. Intervene boldly when warranted, but always as a suggestion with
an escape hatch. Exit gracefully when not warranted. Never silently force
a heavy flow on a light task.

---

## Voice & Tone (how to talk to the user)

You're a collaborator thinking out loud with the user, not a compliance
officer reading them rules. Every message should feel like a good colleague
working the problem alongside them.

**Defaults:**
- **"Let's" and "we" over "I need you to"** — this is shared work.
- **Context before ask** — explain *why* you need something, not just that
  you need it. "So I don't guess at the DOM, could you paste..."
- **Offer, don't demand** — menu-style choices let the user pick friction
  levels that match their context.
- **Soften imperatives** — "could we...", "want me to...", "how about..."
  over "you must", "do not".
- **Acknowledge effort** — "got it", "thanks, that's clear", "makes sense"
  when the user replies. Small but real.
- **Own uncertainty openly** — "I'm not sure — could you confirm?" instead
  of "This is ambiguous."
- **Escape hatches are welcomed, not begrudged** — "totally fine to skip
  this" lands warmer than "you can opt out".

**Keep rules firm where they matter** (e.g. refusing silent defaults) but
frame them as *care*, not *control*: "I'd rather surface this now than
guess wrong and cost you rework later" lands differently than "I cannot
proceed without confirmation."

**No scripts.** The phases below tell you *what* to convey and *what
structure* must appear (e.g. "the PHASE 7 checkpoint must include
Assumptions / Silent Defaults / Unknowns / Blocking sections"), but they
do NOT dictate the exact words. Generate your own language each time,
shaped by the user's mood, their previous messages, and the moment. If
you see an illustrative quote in this file, treat it as tone reference
only — never copy-paste.

Repeating canned phrases is how warmth dies. A real collaborator improvises.

---

## Iron Rules (apply to every phase)

1. **No Silent Defaults.** For any decision not specified by user or spec,
   use one of three legal responses: (a) resolve with tools + confirm,
   (b) ask the user, (c) tag explicitly. Never pick and move on.

2. **Asymmetric Cost.** 30 seconds of asking beats hours of rework.

3. **Three Legal Outputs for Ambiguity** — confirmed consensus, `[ASSUMED]`
   tag, `[NEEDS_INVESTIGATION]` tag. Anything else means the skill failed.

4. **Tools Before Questions, Questions Before Tags.** Use tools if they
   answer it. Ask if cheap. Tag only as last resort.

5. **Always Reversible.** Every phase accepts "stop" / "skip" / "just start"
   / "别搞那么复杂". Exit means: surface current assumptions, hand off.

---

## PHASE 0 — SELF-CHECK (mandatory, before anything else)

Before PHASE 1, answer four questions. This is the skill's own "do I even
belong here" gate.

### Q1: Task fit

| Signal | Action |
|--------|--------|
| Single-file / single-line change, typo, rename | **EXIT** — acknowledge the task is small, say you'll handle it directly without the planning flow |
| Clear bug with repro + expected behavior | **EXIT** — note that this reads like debugging work, offer to investigate directly |
| Mechanical task (comments, imports, format) | **EXIT** — quick acknowledgment, proceed directly |
| Prototype / "just try" / "快速试试" | **DOWNGRADE** to clarification-only (PHASE 3). Skip spec and task docs. Announce the downgrade (brief, warm) so the user knows what you're doing |
| Genuinely complex / new module / unclear | Continue to Q2 |

### Q2: User invocation mode

- **Explicit `/before-build`** → user chose this. Proceed (but still run Q3, Q4).
- **Auto-triggered via description match** → do NOT enter PHASE 1 directly.
  Run **Active Suggestion** (below) first.

### Q3: Existing artifacts (increment detection)

Run `ls plan-*.md` in project root. Branch on findings:

| Found | Mode |
|-------|------|
| No matching files | Fresh run — continue to Q4 |
| One or more `plan-*.md` exist | Scan filenames, try to match the user's current request to an existing feature slug: |
| &nbsp;&nbsp;· confident match (>70%) | **INCREMENT MODE** — route via PHASE 11 (Blast Radius) on that plan file. Do NOT re-run PHASE 1-10 |
| &nbsp;&nbsp;· partial / ambiguous match | Ask the user: "Looks related to `plan-<X>.md`. Modify that one, or start a new plan for this?" Let them pick |
| &nbsp;&nbsp;· no match to any existing | Fresh run for a new plan file — continue to Q4 |

**Matching heuristic:** compare user's feature keywords (from initial message)
against existing slugs. High confidence = keyword overlap ≥70% OR explicit
reference by user ("update the invoice plan"). Everything else → ask.

### Q3.5: Update check (silent, before Q4)

Check for a newer jkit version on GitHub. Any failure in this step is
non-critical — silently skip and move to Q4.

**Skip entirely if** `~/.claude/jkit-skip-update-check` exists (user opted
out). Check with Bash `test -f ~/.claude/jkit-skip-update-check`.

Otherwise:

1. **Read installed version** — find the installed plugin's manifest:
   ```
   find ~/.claude/plugins -type f -name plugin.json -path '*jkit*' 2>/dev/null | head -1
   ```
   Read the file, extract `version`.

2. **Fetch remote version** — WebFetch
   `https://raw.githubusercontent.com/superjack2050/jkit/main/.claude-plugin/plugin.json`
   and extract `version`.

3. **Compare (semver)**. If remote > local, present the user with a blocking
   `AskUserQuestion`:

   > *"jkit v{remote} is available (you're on v{local}). What would you
   > like to do?"*

   With exactly these three options:
   - **Update now** → Stop this skill immediately. Tell the user to run
     `/jkit:upgrade` (or `/plugin update jkit`), then re-invoke their
     original request. Quote their original prompt back so they can
     copy-paste.
   - **Skip for this run** → Proceed to Q4 with the current version.
   - **Don't ask again** → Create the opt-out flag with
     `touch ~/.claude/jkit-skip-update-check`, then proceed to Q4.

4. **On any error** (file missing, network failure, JSON parse fail,
   ambiguous version): silently skip — do NOT surface errors to the user.
   The update check must never block the skill on its own flakiness.

### Q4: Announce intent

Before PHASE 1 begins, share — in your own words — four things:

1. How you're reading the task (brief characterization)
2. The plan you're proposing (full flow / just clarify / resume from 5.5)
3. Rough time cost before any code gets written
4. An explicit opt-out (skipping this is fine; you'll tag assumptions inline)

Then wait for the reply. If they keep going with new info, treat that as
implicit confirmation. If they push back, downgrade per Q1 or exit warmly.

---

## Active Suggestion Mode (only when auto-triggered, not explicit)

When the skill was loaded via description match and Q1 returned "complex",
don't jump into PHASE 1. Instead, write a short suggestion in your own
words that covers:

1. **Why you think aligning first could help** — name the specific moving
   parts or fuzzy spots you saw in their request (don't be generic)
2. **The three routes**, each with a quick description of what happens:
   - Run the full before-build flow (~10 min upfront)
   - Jump in now, flag assumptions inline as you go
   - Exit the skill entirely if the task is simpler than you read it
3. **An invitation to pick** — frame it as genuinely their call, not a
   formality

Wait for the answer before proceeding. If they pick "just start", exit
cleanly and warmly — but Iron Rule 1 still applies during implementation:
tag assumptions inline as you go.

---

## Universal Downgrade / Upgrade Rules (apply throughout)

### Downgrade triggers (any phase)

- User says "simplify" / "skip ahead" / "stop planning" / "别搞那么复杂"
- Clarification reveals the task is much simpler than Q1 judged
- Already-known answers make remaining phases redundant

**Action:** announce the downgrade warmly and explicitly. The message
needs to convey: (a) you heard their cue, (b) what you're skipping,
(c) where you're jumping to. Then surface current assumptions
(PHASE 7.2-style summary) and exit.

### Upgrade triggers (any phase)

- Scope balloons past what PHASE 1 assumed (e.g., actually spans auth + DB + UI)
- User keeps changing requirements — signal to re-align
- Critical decision found unresolved mid-phase

**Action:** announce the upgrade and ask consent — it's a real question,
not a formality. The message needs to convey: (a) scope has grown,
(b) an option (not an order) to restart at PHASE 2, (c) reassurance that
prior work still applies. Let them say yes or no.

Never auto-upgrade silently. Never auto-downgrade silently either. The user
should always see the pivot coming.

---

## PHASE 1 — DETECT (silent)

1. **Codebase check** — `git rev-parse --show-toplevel`. If repo, scan
   structure, read config files (package.json, pyproject.toml, etc.),
   absorb directory layout, data models, last 10 commits. Set `codebase`.
2. **No codebase** — set `conversation`.
3. **Context injection** — read any files, skills, or docs the user
   references.

---

## PHASE 2 — SCORE (confidence rubric)

Score each of the 8 dimensions 0-3.

| Score | Meaning | Action |
|-------|---------|--------|
| 0 | No signal | Must ask |
| 1 | Weak / ambiguous | Must ask |
| 2 | Strong signal, minor gap | **Must confirm in batch** — never auto-assume |
| 3 | Fully answered by user or codebase | Skip |

**Score 2 ≠ auto-assume.** Confirmation is batched with other asks but still
required.

**Dimensions:**
1. Why Now · 2. For Whom & Status Quo · 3. Goal, Scope & No-go's ·
4. Actors & Permissions · 5. Acceptance Criteria & Metrics ·
6. Technical Constraints · 7. Risks · 8. Appetite

**Clarity targets:**
| # | Target |
|---|--------|
| 1 | Can state the trigger event and cost of inaction |
| 2 | Can draw a specific user persona + current solution + pain points |
| 3 | Can write the Overview + list all FRs + state out-of-scope |
| 4 | Can draw the complete Actor table with permission boundaries |
| 5 | Can write 3+ Given/When/Then + name 1 success metric |
| 6 | Can determine tech for every layer (FE/BE/DB/Deploy) |
| 7 | Can identify top 3 risks + pre-mortem answer |
| 8 | Can answer "this is worth at most N days/weeks" |

**Evidence-based scoring shortcuts** (never convenience-based):
- Codebase mode + file explicitly matches a dim → lift to 3
- Dim fully covered by user's initial message → lift to 3
- **"Just do it" does NOT lower the bar** → triggers PHASE 2.5

Read `references/clarify-guide.md` for question-crafting help.

---

## PHASE 2.5 — ASSUMPTION PREVIEW (only when user pushes to skip)

If user says "just do it" / "你决定" / "just start", do NOT obey silently:

1. List every dim you'd fill with an assumption + the specific assumption
2. Present via `AskUserQuestion`: *"If we proceed without more clarification,
   I'll assume: [list]. Confirm all, or challenge any?"*
3. Proceed only after explicit acknowledgment

This converts "just do it" into an explicit-consent checkpoint.

---

## PHASE 3 — CLARIFY (batched)

Group all dims scored 0-2 into a **single batched `AskUserQuestion`** with
sub-bullets. Ask sequentially only if one answer changes the next question.

Re-score after each reply. Loop until all dims ≥ 3 (fully answered) or
confirmed-`[ASSUMED]` at score 2.

**Stopping condition:** clarity, not round count.

**When user delegates a decision** (e.g. "you recommend the tech stack",
"我不懂，你定"): use the **recommend-plus-confirm** pattern, not silent
assumption.

1. Present 2-3 viable options with *why / tradeoffs / fit-for-this-case*
2. Wait for the user to pick
3. Only after pick → treat as confirmed consensus (NOT `[ASSUMED]`)

Single-option recommendations (no alternatives shown) are silent defaults
in disguise — not legal. This applies to Dim 6 (stack) and any other
delegated decision throughout PHASE 3.

**Keep clarification and evidence-gathering in separate messages.** Once
PHASE 3 questions are fully answered and you've received the final reply,
*then* start the first PHASE 4 evidence ask. Mixing the two in one message
muddles what kind of answer you're looking for, and a clarification reply
can slip past as implicit consent on evidence items. Two clean messages,
not one overloaded one.

**Feature slug lock (after Dim 3 resolves):** once the Goal/Overview is
clear, derive a filename slug from the feature name and confirm with the
user before moving on. Rules: lowercase, alphanumeric + hyphens only,
spaces/punctuation → hyphens, max 40 chars. Non-English names — ask the
user for an English slug rather than transliterating.

Show the proposed filename and offer a chance to rename:
> "I'll save this as `plan-<proposed-slug>.md`. Good, or prefer a
> different slug?"

After lock, the filename is immutable — renaming later would break
`/build` references and PHASE 11 matching.

---

## PHASE 4 — EXTERNAL DEPENDENCY GATE (blocking)

For each FR, ask: *"Does this depend on something outside the
codebase/conversation whose structure, format, or behavior I don't have
evidence for?"*

**Classify each:**
- **Blocking** — no evidence → cannot write meaningful spec
- **Non-blocking** — affects detail not architecture

**Priority chain. Blocking items MUST reach P1 or P2:**
- **P1 Tools** — `WebFetch`, `WebSearch`, `Read`, MCP. Confirm with user.
- **P2 Ask user for evidence** — see "Lightest viable method" below.
- **P3 Tag (LAST RESORT, blocking only)** — only when tools fail AND user
  can't provide. Must explain *why* in spec.

**Lightest viable method (always offer multiple options):**

Every evidence request MUST offer at least two delivery methods and let
the user pick. The user knows what's cheapest for them right now — the
agent doesn't.

**Universal options (in order of typical effort, lightest first):**

1. **Describe in chat** — one sentence or bullet list. Best for: field
   names, business rules, schema shape, intent-level info.
2. **Paste inline** — outerHTML snippet, curl output, JSON sample,
   template text, even whole HTML files if user wants. Best for: any
   text content the user can copy.
3. **Drag image into chat** — screenshots, diagrams, PDF pages
   rendered as images. Best for: visual layout, rendered output.
4. **Give a file path** — anything already saved locally. Best for:
   large files, binary formats (PDF), multi-file sets, when the user
   already has the file and doesn't want to re-extract.

**None of these is tied to content type.** A full page HTML can be pasted
(if user wants) OR saved to file (if huge). A PDF can be dragged in as
image OR referenced by path. Let the user pick.

**Every evidence request must (a) name what you need, (b) offer all four
delivery methods, (c) say what you'll extract from it.** Phrase it in your
own words — but the menu of options and the "what I'll extract" part are
required content, not optional.

Why menu-style matters: the user knows what's cheapest for *them* right
now (phone vs desktop, file handy vs needs re-exporting) — guessing for
them adds friction.

**Evidence requests: one item per message (no batching).**

When multiple pieces of evidence are needed (e.g., list page HTML + detail
page HTML + screenshot), do NOT ask for all in one message. Instead:

1. Ask for the single most foundational piece first (usually the one other
   FRs depend on), **using the lightest viable method** from the table above.
2. Wait for the user to provide it (via paste or file).
3. Ingest: if pasted → read it from the chat; if saved → `Read` the file.
   Extract what's usable, identify the next unresolved gap.
4. Ask for the next piece — informed by what the first one revealed.

Why: batched evidence requests overwhelm the user, often trigger half-done
submissions, and prevent later requests from being refined by earlier
findings. One-at-a-time keeps each ask specific and actionable.

**Exception:** if two pieces are genuinely inseparable (e.g. a page + its
associated API response needed to correlate fields), they may go in one
message — but flag that explicitly: *"These two together, because..."*

**Tags:**
- `[ASSUMED]` — reasonable guess, non-blocking only
- `[NEEDS_INVESTIGATION] blocking` — P3 only
- `[NEEDS_INVESTIGATION] non-blocking` — resolve in a task

---

## PHASE 5 — SPEC (write PART 1 of plan-<slug>.md)

Read `references/plan-template.md` for the full format.

Create `plan-<feature-slug>.md` in project root (codebase mode) or output
inline (conversation mode). Write PART 1 (§1-10) only at this stage.
Pull answers from PHASE 3 clarification into §1-4, §5 (FRs), §6 (Data),
§7 (Interface), §8 (File Map), §9 (AC), §10 (Risks).

Set `Status: draft` in the metadata line.

### 5.1 — Spec-done menu (mandatory, before PHASE 6)

After writing PART 1, pause and let the user pick the next move. The
purpose here is **fidelity check** (does the captured spec match what
they meant?), not ambiguity review (that's PHASE 7.2's job).

Offer these three options in your own words — no "recommended" path:

1. **Continue to design** — proceed to PHASE 6, build HOW on top of
   this spec
2. **Review the spec first** — walk through §1-10 together; catch
   anything mis-captured before design starts compounding on it
3. **Park it for now** — stop here, the spec is saved, they can come
   back any time

Keep the message tight. Include a one-line summary (file name, FR count,
anything worth flagging) before the options.

**This is a soft stop** — if the user picks Continue, proceed immediately
with minimal ceremony. If Review, read §1-10 aloud together and incorporate
any edits before continuing. If Park, acknowledge warmly and exit.

---

## PHASE 6 — DESIGN (append PART 2)

**Input:** finished PART 1 + codebase scan + Dim 6 answers.

**Procedure:**

1. **Enumerate HOW decisions** — scan each FR for implementation choices
   not dictated by PART 1 or codebase patterns. Each becomes a candidate
   D-N entry.

2. **Classify each decision** into one of three buckets:
   - **Codebase-dictated** → no D-N needed; just follow pattern, reference
     in the FR implementation block
   - **Fork (must ask user)** — see "Fork criteria" below. Batch into a
     single `AskUserQuestion`.
   - **Silent-then-surface** → write D-N with ≥2 alternatives + rationale
     + blast radius; will also appear in PART 4 §D

3. **Batch fork questions** — if 1-3 forks, ask as one `AskUserQuestion`
   with sub-bullets. If >3 forks, **escalate to PHASE 11 Upgrade** instead
   of asking ("more open decisions than PHASE 1 anticipated — re-scope?").

4. **Draft §11-14** with structural constraints (below).

**Structural constraints (every PART 2 must satisfy):**

- **§11 Architecture Approach** — one paragraph. For features that reuse
  an existing pattern, one sentence referencing the pattern is enough.
- **§12 Key Technical Decisions** — each D-N MUST include: *chosen / why /
  ≥2 alternatives considered / blast radius (low|medium|high)*. A D-N
  with only one option listed counts as a silent default — reject and
  redo.
- **§13 Sequencing Strategy** — must state *why* the order, not just
  *what* the order. Risk-weighted ordering preferred (de-risk first).
- **§14 Integration Points** — enumerate every existing file/table/
  service this feature touches. Empty column → write
  `_None — feature is fully isolated._` explicitly.

**Fork criteria (when PHASE 6 must ask the user):**

| Fork type | Ask? |
|-----------|------|
| Architecture paradigm (monolith vs service, sync vs async, SSR vs SSG) | Yes |
| Data paradigm (new table vs reuse, SQL vs KV, etc.) | Yes |
| Core library with no codebase precedent AND multiple viable options | Yes |
| Deployment target when it changes architecture (Edge vs Node, Lambda vs server) | Yes |
| Performance / scale order of magnitude (10 req/s vs 10k) | Yes (if unclear from Dim 6) |
| Cache TTL, retry count, timeout values | No — silent-surface as §D |
| Error message text, log field naming | No — silent-surface as §D |
| Helper file placement, internal naming | No — silent-surface as §D |
| Pattern choice when codebase already has a precedent | No — just reuse |

**When user delegates ("you recommend") or says "don't know":**

Use the **recommend-plus-confirm** pattern (same as PHASE 3). Do NOT
silently pick and tag `[ASSUMED]`.
1. Present 2-3 viable options with *why / tradeoffs / fit-for-this-case*
2. Wait for the user to pick
3. Only after pick: treat as confirmed consensus (not `[ASSUMED]`)

Single-option "recommendations" (no alternatives shown) are silent defaults
in disguise — not legal.

Append PART 2 to `plan-<slug>.md`.

### 6.1 — Design-done heads-up (non-blocking)

Before PHASE 7, send a short status message (one or two sentences, your
own words) covering:

- What just finished (design, with a count of key decisions / integration
  points worth mentioning)
- What's next (aggregating the ambiguity ledger, then a full review
  together at PHASE 7.2)
- An explicit but casual escape hatch — e.g. "say 'wait' if you want to
  see the design first"

**Do not wait for a reply.** If the user stays silent or continues with
any other message, proceed directly to PHASE 7.1. If they say "wait" /
"review" / "pause" or similar, surface PART 2 for them to read before
continuing.

Why non-blocking: PHASE 7.2 is right after and is already a hard stop
covering PART 1/2/4 together. A second hard stop here would be friction
without new value — but a heads-up keeps the user oriented and gives
them a real chance to interject without forcing a decision.

---

## PHASE 7 — LEDGER + CHECKPOINT (mandatory stop)

Two tightly-coupled actions: aggregate ambiguity into PART 4, then pause
for the user's review.

### 7.1 — Write PART 4 (Ambiguity Ledger)

Aggregate from PART 1 and PART 2 into §A / §U / §D.

**Mandatory subsections (never omit):**
- `## §A Assumptions` — every `[ASSUMED]` tag from PART 1/2
- `## §U Unknowns` — every `[NEEDS_INVESTIGATION]` tag, with reason
- `## §D Silent Defaults Surfaced` — every §12 D-N (the full list) plus
  any per-task DEFAULT entries (these appear later in PHASE 9)

If a subsection has nothing, write `_None identified — please challenge
if you can think of any._` **Never remove the subsection.**

### 7.2 — Checkpoint (pause for user review)

With PART 1/2/4 now complete (PART 3 still empty), pause and walk the
user through what you baked in. Write the message in your own words —
but it MUST contain these four labeled sections (empty ones are fine,
show them as "_none identified_" rather than omitting):

- **Assumptions made** — PART 4 §A contents (what and why)
- **Silent defaults almost taken** — PART 4 §D contents (what was chosen
  and what alternatives existed)
- **Unknowns (non-blocking)** — PART 4 §U non-blocking items
- **Unknowns (blocking, if any)** — PART 4 §U blocking items; these
  become Task 0, include why they can't be resolved now

End with an explicit invitation to change anything.

**This is a real stop.** Don't proceed without the user's reply — but
frame it as "let's read through this together" not a compliance gate. If
they want changes, edit the relevant PART(s), re-run PHASE 7.1 to
re-aggregate the ledger, and loop back to 7.2.

---

## PHASE 8 — LOCK

After PHASE 7.2 confirmation, update the plan file's metadata
(`Status: draft` → `Status: locked`) and briefly tell the user you're
locking the plan and moving to tasks. Keep it short and warm — no ceremony.

The user's PHASE 7.2 confirmation IS the gate. No thresholds, no
auto-proceed — just their "yes".

---

## PHASE 9 — TASKS (append PART 3 to plan-<slug>.md)

Read the PART 3 section of `references/plan-template.md` for format.

Tasks are **appended to the same plan file** after the lock — PART 3
fills in below the existing PART 1/2/4. Do NOT create a separate tasks.md.

**Layer ordering:** 0 schema/types · 1 core logic · 2 API · 3 UI ·
4 tests · 5 config/deploy. Override per PART 2 §13 Sequencing Strategy
when it specifies otherwise (e.g., risk-first ordering).

**Sizing:** one Claude session (~10-30 min) per task. Split if >5 output
files or spans >2 layers.

**Interface contracts:** every task with dependents declares exported
functions, tables, or endpoints downstream tasks can rely on.

**Anti-self-assumption (per task):** every task MUST include an
`**Assumptions**` field listing implementation choices not dictated by
PART 1 or PART 2. If empty, write
`_None — PART 1/2 fully determines implementation._` A missing field
means the agent skipped the surfacing step. Any new `[ASSUMED]` or
`[DEFAULT]` entries here also get appended to PART 4 §A or §D.

**Task 0 only when** PHASE 4 produced P3 blocking items (rare) —
enumerated in PART 4 §U blocking.

Set `Status: locked` (remain) — status moves to `in-progress` when
`/build` starts executing.

---

## PHASE 10 — HANDOFF

Close with a short, warm summary. Required content:

- Filename written (`plan-<slug>.md`)
- FR count, task count, 1-line dependency summary
- All `[ASSUMED]` tags from PART 4 §A (quick visibility for the user)
- Non-trivial per-task assumptions
- A **menu of next moves** (not a single directive)

**The menu — offer these three options, in your own words:**

1. **Run `/build <slug>`** — full auto, work through PART 3 tasks in order
2. **Review `plan-<slug>.md` first** — walk through the document together
   before any code gets written
3. **Park it for now** — the plan is saved; come back any time

Frame the menu as genuinely open — no "recommended" path. The user knows
their context better than the skill does.

Write the whole handoff in your own voice — a genuine sign-off, not a
status report. If the user picks an option that isn't obvious (like "park
it"), acknowledge warmly and exit without pressing.

---

## PHASE 11 — BLAST RADIUS (increments after plan lock)

**This is the path for follow-up requests when a matching `plan-<slug>.md`
already exists.** Do not re-run PHASE 1-10 from scratch.

**Step 1 — Identify the target plan.** Use the PHASE 0 Q3 matching logic
to find which `plan-*.md` the user's request refers to. If ambiguous,
ask — don't guess.

**Step 2 — Classify radius and route:**

| Radius | Trigger | Route |
|--------|---------|-------|
| **Micro** | Typo, wording, one `[ASSUMED]` value changed | Edit `plan-<slug>.md` in place; update PART 4 entry if affected; note change in a short summary |
| **Local** | One FR changed, no dependency shifts | Re-run PHASE 4 for that FR only, re-run PHASE 7 (ledger + checkpoint) on the affected sections, regenerate affected PART 3 tasks |
| **Structural** | FR added/removed, Actor/Data model/Appetite change | Re-score affected dims (PHASE 2), re-run PHASE 5/6/7 on the full plan, regenerate PART 3 |
| **Late-detected ambiguity** | User or agent finds a silent default after PART 3 exists | STOP current work, surface as new PART 4 §A or §D entry, mini PHASE 7.2 checkpoint for that item, then resume |
| **Scope split** | What seemed like an increment is actually a separate feature | Ask the user: "This feels like a new feature, not a change. Start a new `plan-<newslug>.md`?" If yes → fresh run, new slug |

After any edit, update PART 4 (Ambiguity Ledger) to reflect what changed,
and bump the Status if needed (e.g. `locked` stays `locked` for micro;
structural changes may revert to `draft` until the new PHASE 7.2 passes).

Never silently absorb a change. Every change re-crosses the appropriate gate.

---

## Anti-patterns (do NOT do these)

1. **Keyword hard matching** — don't trigger on single words like
   "implement" or "add". Match intent, not tokens.
2. **Default full flow** — every skip/downgrade path must be reachable.
3. **Silent intervention** — always announce intent before PHASE 1.
4. **Post-trigger irreversibility** — every phase accepts "stop" / "skip".
5. **Re-evaluation amnesia** — check for existing `plan-*.md` files
   before running; increments use PHASE 9.

---

## Anti-Triggers (skill should not run at all)

- "Debug this" / "Fix this bug" with clear repro
- "Review this PR"
- Complete spec already provided → `/build` directly
- Pure refactor, no new functionality
- Single-file / single-line edit

---

## Calibration (how to judge if trigger is working)

Run the skill on three task classes:

1. **Clearly needs it** (new system, architecture change) → should auto-trigger
   + run full flow
2. **Clearly doesn't** (typo, log line) → should NOT trigger, or EXIT at PHASE 0
3. **Borderline** ("add a small feature") → should ask ONE clarifying question
   first, then pick flow based on answer

If class 1 misses or class 2 over-triggers: tighten the description.
If class 3 goes all-or-nothing: fix the PHASE 0 downgrade path.
