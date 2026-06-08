# Open Questions

Record missing facts, assumptions, and investigation items that future agents
should not silently guess.

## Consensus

- jkit has been reset around `/map-init` as the first retained command.
- Legacy `before-build` and `build` content was removed.
- The `/explore` command behavior is specified in `docs/specs/explore.md`, and
  the skill and command wrapper are implemented.
- The `/grill-me` command behavior is specified in `docs/specs/grill-me.md`,
  and the skill and command wrapper are implemented.
- The `/to-spec` command behavior is specified in `docs/specs/to-spec.md`, and
  the skill and command wrapper are implemented.
- The `/to-plan` command behavior is specified in `docs/specs/to-plan.md`, and
  the skill and command wrapper are implemented.
- The `/to-done` command behavior is specified in `docs/specs/to-done.md`, and
  the skill and command wrapper are implemented as adaptive orchestration from
  intent to verified done.
- The requirements-discovery slice integrates `/explore`, `/grill-me`, and
  `/clarify`, with command behavior specified under `docs/specs/`.
- The `/clarify` command behavior is specified in `docs/specs/clarify.md`, and
  the skill and command wrapper are implemented.
- `/map-repair` is the next recovery command shape; dogfooding automation is
  not needed for this slice.
- jkit supports Codex plugin consumption through `.codex-plugin/plugin.json`,
  while preserving Claude Code plugin metadata and wrappers.
- jkit uses `@nobodyjack/jkit` as the npm package name.
- `@nobodyjack/jkit@0.9.0`, `@nobodyjack/jkit@0.9.1`, and
  `@nobodyjack/jkit@0.9.2` are published on npm.
- The local root-entry package state starts at `@nobodyjack/jkit@0.9.3`.
- npm publishing uses `npm publish --access public`; if npm explicitly
  requires OTP or browser/passkey confirmation for the active account, complete
  that interactive npm auth step outside non-interactive agent execution.
- npm install has no runtime integration side effect; runtime setup is explicit.
- Codex local plugin registration is handled by `jkit codex install`.

## [ASSUMED]

- [ASSUMED] `docs/specs/` is the canonical spec location for v2 because the
  project is now a generic agent-map toolkit rather than a product backend.

## [NEEDS_INVESTIGATION]

- None currently recorded.
