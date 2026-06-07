---
description: Initialize an agent-readable repository harness.
---

Use the `map-init` skill workflow from `skills/map-init/SKILL.md`.

Initialize or augment the current repository's agent map:

- Scan the repo before writing.
- Classify it as `empty-project`, `brownfield`, or `augment`.
- Create only missing map files by default.
- Preserve existing docs unless the user confirms replacement.
- Record uncertain setup choices as consensus, `[ASSUMED]`, or
  `[NEEDS_INVESTIGATION]`.
- Verify the scaffold with lightweight checks.

If the user supplied a scaffold level, honor it:

```text
minimal | standard | full
```

Otherwise use `standard`.
