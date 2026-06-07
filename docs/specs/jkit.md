# jkit Root Entry

## Intent

`jkit` should provide a lightweight root entry for users who have installed the
plugin and need to understand what is available, how the workflow is shaped, or
why commands are not showing up after installation.

This entry is a router and help surface, not a workflow stage.

## User Experience

Users may invoke the entry as the host runtime allows:

```text
/jkit
$jkit
```

The entry should:

- confirm what jkit is
- list the current workflow commands
- explain the recommended flow
- route the user to the next likely command
- explain how to check install state when plugin commands or skills are missing

The entry should not:

- write specs, plans, records, or generated indexes
- implement code
- run repository verification by default
- replace `/explore`, `/grill-me`, `/clarify`, `/to-spec`, `/to-plan`,
  `/to-done`, or `/run`

## Routing Guidance

When the user asks for help with jkit:

- Use `/map-init` when the repository does not yet have an agent map.
- Use `/explore` when the requirement is rough or solution direction is not
  selected.
- Use `/grill-me` when a selected direction still needs requirement and
  solution pressure testing.
- Use `/to-spec` when the behavior should become a durable spec.
- Use `/clarify` when one existing spec has planning-blocking ambiguity.
- Use `/to-plan` when one reviewable spec is ready to become an ExecPlan.
- Use `/to-done` only for clear, bounded work that can take the fast path.
- Use `/run` when an active ExecPlan is ready for execution.

## Platform Notes

Codex exposes enabled skills in the slash command list and also allows explicit
skill invocation with `$`. Therefore jkit ships `skills/jkit/SKILL.md` as the
portable root entry. If a runtime does not expose `/jkit` directly, `$jkit`
remains the canonical explicit invocation.

Claude Code command wrappers may expose command names differently from Codex.
The root entry should still be backed by the same skill so behavior remains
consistent across runtimes.

## Acceptance Criteria

- `skills/jkit/SKILL.md` exists and describes the root help/routing behavior.
- `commands/jkit.md` exists as a thin wrapper when command wrappers are
  packaged.
- README command tables mention `jkit` as the help/routing entry.
- `AGENTS.md`, `agent-map.yaml`, and generated indexes include the new entry.
- Runtime installers include `jkit` in the local skill list.
- Package dry run includes the new skill and command wrapper.
