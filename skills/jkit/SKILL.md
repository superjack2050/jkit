---
name: jkit
version: 0.1.0
description: |
  Show the jkit root help and route users to the right workflow command. Use
  when the user invokes /jkit, $jkit, asks what jkit commands are available,
  asks how to start, or needs to verify whether the plugin loaded.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
---

# jkit - Root Help And Routing

`jkit` is the lightweight root entry for the workflow. It explains what is
available and routes the user to the next command.

This is not a workflow stage. Do not write specs, create plans, edit files,
implement code, or run verification unless the user explicitly asks for that
action.

## Phase 0 - Update Check

Run when available:

```bash
jkit update-check --quiet 2>/dev/null || true
```

Continue silently if the command is unavailable or the check fails.

## Output Shape

Reply with concise help:

```text
jkit is an agent-map-driven development toolkit for coding-agent harnesses.

Recommended flow:
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
                                             \-> /to-done ->/

Use:
- /map-init when this repo needs an agent map
- /explore when the requirement is rough
- /grill-me when a selected direction needs decision review
- /to-spec when behavior should become a reviewable spec
- /clarify when an existing spec blocks planning
- /to-plan when a spec is ready for an executable plan
- /to-done for clear, bounded work
- /run to execute an active plan to verified completion

If commands or skills are missing after install, run:
jkit codex status
jkit claude-code status
```

Adapt the wording to the user's runtime and current question. Keep the answer
short by default.

## Routing Rules

- If there is no agent map in the current repository, recommend `/map-init`.
- If the user has a rough idea, recommend `/explore`.
- If the user has selected a direction but needs decision review, recommend
  `/grill-me`.
- If the user wants durable behavior, recommend `/to-spec`.
- If the user points at an existing ambiguous spec, recommend `/clarify`.
- If the user has a reviewable spec ready for execution planning, recommend
  `/to-plan`.
- If the task is clear, bounded, and low ambiguity, recommend `/to-done`.
- If an active ExecPlan exists and the user wants execution, recommend `/run`.

## Install Troubleshooting

For Codex:

```bash
jkit codex status
codex plugin list --marketplace personal --json --available
```

Codex sessions may need a restart, refresh, or new thread after plugin install
or update. If `/jkit` is not visible but skills are enabled, `$jkit` is the
portable explicit invocation.

For Claude Code:

```bash
jkit claude-code status
```

Claude Code may need `/reload-plugins` or a new session after plugin install.
