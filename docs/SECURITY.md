# Security

## Rules

- Do not commit secrets, credentials, tokens, or private local config.
- Do not copy secrets into skill instructions, docs, generated indexes, or final
  responses.
- Treat plugin metadata and install paths as distribution-sensitive.
- Do not execute destructive commands in target repos from `/map-init`.

## Sensitive Areas

- `.claude-plugin/`
- `.codex-plugin/`
- User home install targets such as `~/.claude/skills`
- Any target repository config paths discovered by `/map-init`

## Agent Safety

- Prefer local deterministic checks.
- Do not run external live checks during map initialization.
- Ask before overwriting existing human-authored map files.
