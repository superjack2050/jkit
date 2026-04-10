# Task Template

Use this format when decomposing specs into tasks in STAGE 4.

---

## Template

```markdown
# Tasks: [Feature Name]

> Decomposed from spec.md | [Date]
> Total: N tasks | Estimated sessions: N

---

## Task 1: [Short descriptive name]

**Implements:** FR-1, FR-2
**Depends on:** None (or Task N)

**Context:**
[Which files exist, what patterns to follow, relevant architecture context.
In codebase mode, include actual file paths and line references.]

**Goal:**
[Exactly what to build. Be specific enough that someone with no prior context
can execute this task.]

**Constraints:**
- [What NOT to change / break]
- [Patterns to follow]
- [Performance requirements if any]

**Output:**
- [ ] `path/to/new/file.ts` — [what it contains]
- [ ] `path/to/modified/file.ts` — [what changes]

**Verify:**
- [ ] AC-1: [restate the acceptance criterion]
- [ ] Run: `[specific test/curl/query command]` → `[expected output]`

---

### Interface Contract → Task N+1

> Declare what this task produces that downstream tasks depend on.
> This allows each task to be handed to a separate agent session.

After this task completes, the following are available:
- `import { fn1, fn2 } from '@/lib/module'`
- DB table `table_name` with columns: [list]
- API endpoint `METHOD /api/path` accepting [shape]

---

## Task 2: [Next task...]
...
```

---

## Decomposition Rules

### Sizing
- Each task = one Claude Code session (roughly 10-30 minutes of focused work)
- If a task has more than 5 output files, split it
- If a task spans more than 2 layers (e.g., DB + API + UI), split it

### Ordering (layer by layer)
- **Layer 0:** Schema migrations, data models, types/interfaces
- **Layer 1:** Core business logic, service functions
- **Layer 2:** API routes, controllers, handlers
- **Layer 3:** UI components, pages
- **Layer 4:** Integration tests, E2E tests
- **Layer 5:** Configuration, deployment, docs

### Interface Contracts
- Every task that has dependents MUST declare an interface contract
- The contract lists: exported functions, DB tables created, API endpoints available
- Downstream tasks reference the contract, not the implementation details
- This is what makes tasks independently executable by separate agent sessions

### Dependencies
- Minimize cross-task dependencies
- If Task B depends on Task A, state it explicitly
- Prefer tasks that can run in parallel when possible

### Context Quality
- In codebase mode: include file paths, function signatures, import patterns
- Reference the spec's FR and AC IDs — don't repeat the full text
- Include the test command specific to this project

### Common Patterns

**"Investigation" task (Task 0):**
Required when spec contains `[NEEDS_INVESTIGATION]` items. Always the first task.
Goal: gather technical evidence that the spec couldn't get through conversation.
Output: a document (e.g., `docs/investigation.md`) with findings that update the spec.
Subsequent tasks reference the investigation output, not the original spec guesses.

```markdown
## Task 0: Technical Investigation

**Resolves:** [NEEDS_INVESTIGATION] items from spec sections X, Y
**Depends on:** None (must run first)

**Goal:**
Investigate external dependencies that the spec couldn't verify during planning.
Document actual structures, selectors, API responses, or schemas.

**Investigation items:**
1. [What to investigate] — [how to investigate it]
   - Open [URL/page], inspect [element], record [selectors/structure]
   - Call [API endpoint], capture [response format]
   - Read [documentation], verify [assumption]
2. ...

**Output:**
- [ ] `docs/investigation.md` — findings for each item
- [ ] Update `spec.md` — replace [NEEDS_INVESTIGATION] tags with real values

**Verify:**
- [ ] Every [NEEDS_INVESTIGATION] in spec is resolved or flagged as blocked
- [ ] Selectors/endpoints verified in real environment (console, curl, etc.)
```

**"Install & Configure" task:**
Foundation — dependencies, config files, base types. Keep it small.

**"Core Logic" task:**
Pure business logic with no I/O. Easiest to test. Do this early.

**"Integration" task:**
Wires core logic to the framework (routes, handlers, hooks).
Depends on the core logic task.

**"UI" task:**
Visual components. Depends on API/data tasks being done.
Include mockup description or reference if available.

**"Harden & Verify" task:**
Final task. Error handling, edge cases, integration tests. Verify all ACs pass.
