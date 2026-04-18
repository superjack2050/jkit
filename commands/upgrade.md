---
description: Update JKit to the latest version from its GitHub marketplace.
---

Update JKit by running these native Claude Code commands in sequence and
report what changed:

1. `/plugin marketplace update superjack2050/JKit`
   - Pulls the latest `.claude-plugin/marketplace.json` + `plugin.json` from
     GitHub main branch.
2. `/plugin update jkit`
   - Installs the new version if the `version` field in `plugin.json` bumped.

After both commands complete, read the installed `plugin.json` and report:
- Previous version (if known) → new version
- Any new / changed / removed skills or commands

If the `version` didn't bump, say so clearly — don't fabricate upgrade notes.

If either command fails, print the exact error and suggest the user run
them manually with `/plugin marketplace update superjack2050/JKit` and
`/plugin update jkit`.
