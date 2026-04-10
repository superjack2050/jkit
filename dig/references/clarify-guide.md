# Clarification Guide

Detailed guidance for STAGE 2 — the ask-then-act clarification phase.

---

## Core Philosophy

> "The cost of a wrong assumption compounds through every downstream task.
> The cost of one good question is 30 seconds."

Every question should serve at least one of three purposes:

1. **Gather information** — fill gaps needed to write the spec
2. **Verify intent** — confirm what the user said matches what they actually need
3. **Check feasibility** — ensure the requirement is technically achievable within scope

### Three Lenses

**Lens 1: Information → "What do I need to know?"**
- Fill gaps in the 8 dimensions
- Never ask what you can detect or what the user already told you
- Frame questions as choices, not open-ended when possible

**Lens 2: Intent → "Is this what you really mean?"**
- Watch for XY Problems — the user may be describing a solution when they have a different underlying need
- When the stated request sounds overengineered, ask about the root goal:
  "You mentioned [complex solution]. What's the underlying problem? There might be a simpler path."
- When ambiguous terms appear ("real-time", "scalable", "AI-powered"), pin them down:
  "When you say real-time, do you mean sub-second sync like Google Docs, or just auto-refresh every few seconds?"
- Reflect back your understanding for the user to confirm before moving on:
  "So the core need is X, and Y is a nice-to-have. Is that right?"

**Lens 3: Feasibility → "Can this actually be built?"**
- Flag scope traps early — features that sound simple but have hidden complexity
  (real-time collaboration, offline sync, rich text editing, payment systems)
- When a requirement is technically risky, surface the trade-off:
  "This would require [complex dependency]. A simpler approach would be [alternative]. Worth the extra complexity?"
- In codebase mode: check if the existing architecture can support the requirement,
  or if it would need significant refactoring
- If the total scope exceeds a reasonable appetite, proactively suggest cuts:
  "This is shaping up to be a large project. Want to split into phases?"

If the user delegates a decision, **propose then confirm** — don't silently assume.

---

## 8 Dimensions: Targets and Question Bank

### 1. Why Now (Motivation & Urgency)

**Clarity target:** Can state the trigger event and the cost of inaction.

**Why it matters:** Without "why", every scope decision is a coin flip. "Competitor launches
next week" vs "had a shower thought" → completely different spec urgency and scope.

Good questions:
- "What triggered this? User complaint, competitive pressure, data insight, or your own idea?"
- "What happens if you don't build this? Who feels the pain?"
- "Is there a deadline or external event driving this?"

Skip if: User already explained motivation, or this is clearly a personal/learning project.

**Impact on spec:** Shapes the Overview (why section), influences scope trade-offs,
sets urgency for Appetite dimension.


### 2. For Whom & Status Quo (User + Current Solution)

**Clarity target:** Can draw a specific user persona + describe their current workaround
and its pain points.

**Why it matters:** Your product doesn't compete against nothing — it competes against
what users do today. If you don't know the status quo, you can't design something better.
(JTBD: "What are they currently hiring to do this job?")

Good questions:
- "Who specifically has this problem? Not 'developers' — what kind, in what situation?"
- "How do they solve this today? What tools/workarounds do they use?"
- "What's the most painful part of their current approach?"
- "If they switch to your product, what habit do they need to change?"

Skip if: The feature is an internal tool for the user themselves (they ARE the user).

**Impact on spec:** Shapes Actor table, informs FR priorities (solve the biggest pain first),
defines the "good enough" bar (must be clearly better than status quo).


### 3. Goal, Scope & No-go's (What + What NOT)

**Clarity target:** Can write the Overview paragraph + list all FRs + state what is
explicitly out of scope.

**Why it matters:** Shape Up's core insight — "fixed time, variable scope." Knowing what
you're NOT doing is as important as knowing what you are. No-go's prevent scope creep.

Good questions:
- "What exactly should this do? Walk me through the core flow."
- "What's the smallest version that would be useful?"
- "What should this explicitly NOT do? Any features you want to defer?"
- "Is there a reference product or example that captures what you want?"

Skip if: User gave a detailed description with clear boundaries AND explicit exclusions.

**Impact on spec:** Directly produces Overview, FR list, and a No-go's section.


### 4. Actors & Permissions

**Clarity target:** Can draw the complete Actor table with permission boundaries.

**When to ask:** Feature involves more than one user type, or access control matters.

Good questions:
- "Who uses this? Just one type of user, or are there different roles?"
- "Who can trigger this? Any users, only admins, or system-only (cron)?"
- "Should this respect existing permission levels, or does it need new roles?"

Skip if: Feature is clearly single-actor (e.g., "add dark mode toggle") AND
dimension 2 already established there's only one user type.

**Impact on spec:** Actor table, data model (role fields, RLS), middleware/auth logic.


### 5. Acceptance Criteria & Metrics

**Clarity target:** Can write 3+ Given/When/Then that the user would approve,
plus name at least 1 measurable success indicator.

**Why it matters:** AC defines "done" for the agent. Metrics define "success" for the human.
Without metrics, you'll know if it works but not if it matters.

Good questions:
- "Walk me through the happy path — what does the user see step by step?"
- "What's the one scenario that, if it works, proves the feature is done?"
- "After launch, what metric would tell you this was successful?"
  (e.g., conversion rate, time-to-task, retention, error reduction)
- "Any specific performance thresholds? (response time, accuracy, etc.)"

Skip if: You can derive clear ACs from the goal and actors already gathered.
Metrics can be [ASSUMED] if user doesn't have a strong opinion.

**Impact on spec:** AC table (with verify commands), may require analytics/tracking in data model.


### 6. Technical Constraints

**Clarity target:** Can determine the tech choice for every layer (FE/BE/DB/deploy).

In codebase mode, lead with what you detected:
- "I see you're using [framework]. Should this follow the existing pattern in [file]?"
- "Your project uses both REST and tRPC. Which should this endpoint use?"

In conversation mode:
- "What's your tech stack? (framework, database, hosting)"
- "Any existing infrastructure this needs to integrate with?"

**When user says "you recommend":**
Present a recommended stack with 2-3 sentences of reasoning.
Wait for confirmation before proceeding. Do NOT silently assume.

Skip if: Codebase detection already answered this AND there's only one reasonable approach.

**Impact on spec:** Data Model syntax, File Map, API Contract format, all implementation specs.


### 7. Risks: Edge Cases, Rabbit Holes & Pre-mortem

**Clarity target:** Can identify top 3 risks + answer "if this fails, the most likely reason is..."

**Why it matters:** Three complementary lenses (Stripe + Shape Up + Lenny):
- **Edge cases:** What inputs/states could break this? (Stripe: enumerate up front)
- **Rabbit holes:** What looks simple but could explode in complexity? (Shape Up)
- **Pre-mortem:** If this ships and fails, what's the #1 reason? (Lenny)

Good questions:
- "What's the trickiest part of this? Anything that looks simple but might not be?"
- "If this project fails, what would be the most likely reason?"
- "Any data migration, third-party API, or concurrency concern I should worry about?"

Skip if: Feature is simple CRUD with obvious error handling and no external dependencies.

**Impact on spec:** Edge Cases table, may surface new FRs or constraints, informs task ordering.


### 8. Appetite (Time Budget)

**Clarity target:** Can answer "this is worth at most N days/weeks of effort."

**Why it matters:** Shape Up's key insight — appetite is NOT an estimate. It's a decision:
"How much is this problem worth to us?" This constrains scope from above. If the appetite
is 1 week and the spec looks like 3 weeks, the spec must be cut — not the timeline extended.

Good questions:
- "How much time is this worth? Days, a week, a few weeks?"
- "If it can't be done in [appetite], would you cut scope or extend time?"
- "Is this a 'bet' (okay if it doesn't work out) or a 'must-ship'?"

Skip if: User already indicated urgency/timeline, or this is a learning/exploration project.

**Impact on spec:** May trigger scope reduction. Added to spec header as a constraint.
Influences task granularity (tight appetite → fewer, coarser tasks).

---

## Clarification Rules

| Rule | Detail |
|------|--------|
| **Stopping condition** | Each dimension: stop when clarity target is met. No round limits. |
| **Natural convergence** | Clarity targets + skip rules + user control ("enough, just build it") ensure convergence without artificial caps. |
| **One question per round** | Each AskUserQuestion = ONE focused question (sub-bullets OK) |
| **Combine when efficient** | If 2+ dimensions are equally unclear, use multi-question AskUserQuestion |
| **Delegated decisions** | User says "you decide" → propose with reasoning → wait for confirm |
| **Impatient user** | User says "just build it" → ask ONE clarifying question max, then proceed |
| **Reference materials** | User shares mockup/doc/example → extract answers, confirm understanding |

## Adaptive Depth

| Project Type | Dimensions to Prioritize | Dimensions to Lighten |
|--------------|-------------------------|----------------------|
| New product from scratch | All 8, especially 1-2 (Why, Whom) | None |
| New feature in existing product | 3 (Scope), 5 (AC), 7 (Risks) | 1-2 (often obvious), 6 (detectable) |
| Small bug-adjacent change | 3 (Scope), 5 (AC) | 1-2-4-8 (skip or 1 question) |

---

## External Dependency Resolution

When a requirement depends on external systems (web pages to scrape, third-party APIs,
specific DOM structures, undocumented services), some information **cannot be gathered
through conversation alone**. It requires technical evidence.

Follow this priority chain:

### When to Scan

External dependency resolution operates at two levels:

**Level 1: Continuous (throughout Dim 1-8)**
Whenever any dimension surfaces an external reference, immediately use available tools
to gather evidence. This includes both technical and business/context information:

- Dim 1: user mentions a deadline or event → search for context if unclear
- Dim 2: user says "like BrainGrid" → search what BrainGrid does, features, pricing
- Dim 2: user says "currently using easybill" → search easybill's capabilities and limits
- Dim 3: user says "must comply with EU VAT invoice rules" → search the legal requirements
- Dim 4: user says "in Amazon seller central" → search seller central page structure
- Dim 6: user says "use Cloudflare D1" → search D1 limitations, SQLite compatibility
- Dim 7: user mentions a third-party dependency → search for known issues, rate limits

**Level 2: Systematic check (after Dim 8)**
After Dim 8 (Appetite), the final scope is locked — appetite may have cut some FRs.
Do a final sweep on the surviving FRs + Actors + ACs and ask:
"Does this depend on something outside the codebase whose structure, format, or behavior
I still don't have evidence for?"

Why after Appetite, not earlier: appetite may cut FRs. No point investigating
dependencies for features that got descoped. Check only what will actually be built.

**Both levels are implicit.** Do not announce "scanning dependencies" to the user.
Use tools silently, then weave findings into the conversation naturally:
"I found that Amazon has an official SP-API for invoice upload. For the tech approach,
would you prefer DOM scraping or the API route?"

### Priority 1: Tools First

Discover what tools are available in this session and use the best fit to gather evidence.
Do not assume a fixed tool list — the user may have MCP servers, plugins, or skills
that provide specialized access.

**After finding evidence → present to user for confirmation.**
Search results may be outdated or inaccurate. Briefly share what you found and ask
if it matches their experience. User confirmation turns evidence into fact.

### Priority 2: Ask User with Guidance

When tools can't access the information, ask the user to provide concrete evidence.

**Principles:**
- Be specific about WHAT you need — "I need to see the order row's HTML structure"
  not "tell me about the page"
- Suggest the simplest method first — "save the page as HTML" before "open DevTools"
- Adapt to the user's skill level — if they seem non-technical, suggest screenshots
  or copy-pasting visible text rather than console commands
- If the user provides a file path, use Read to analyze it yourself

### Priority 3: Mark and Classify

When evidence is still unavailable, mark **specific details** (not entire FRs):
- `[ASSUMED]` — reasonable guess, safe to code against, minor rework risk
- `[NEEDS_INVESTIGATION]` blocking — no evidence, core to the FR → generates Task 0
- `[NEEDS_INVESTIGATION]` non-blocking — affects detail not architecture → verify step in task

---

## Anti-Patterns

- Asking "What tech stack?" when you can read package.json
- Asking about edge cases before the happy path is clear
- Re-asking something the user already answered
- Asking questions that don't change the spec (curiosity ≠ necessity)
- Silently assuming when the user explicitly asked for a recommendation
- Skipping "Why Now" and "For Whom" — they feel soft but they're load-bearing
- Jumping to technical dimensions before understanding the problem
- Stopping too early because "the basics are covered" — all dimensions matter
