# Spec: runtime update check

> Status: draft
> Product: jkit runtime
> Scope: non-blocking update notices for jkit workflow commands

## 1. Summary

jkit should surface version update notices where users actually interact with
the toolkit: `/explore`, `/grill-me`, `/clarify`, `/to-spec`, `/to-plan`,
`/to-done`, `/run`, `/map-init`, and the root `jkit` help entry.

The update check must be centralized in the `jkit` CLI and called by skills
during their orientation phase. It must not block normal workflow execution,
require network availability, or turn every command invocation into an npm
registry request.

## 2. Goals

- Add a CLI update check command that compares the local package version with
  the latest npm registry version.
- Cache npm lookup results so workflow commands do not query the registry on
  every invocation.
- Add short, non-blocking update notices to jkit workflow skills.
- Continue silently when npm, network, cache writes, or the CLI are unavailable.
- Provide machine-readable output for future tooling.

## 3. Non-goals

- Do not auto-update jkit.
- Do not block `/run`, `/to-done`, or any workflow command when update checks
  fail.
- Do not require users to run `jkit status` before seeing update notices.
- Do not add runtime dependencies.
- Do not query npm from every skill directly.

## 4. CLI behavior

Add:

```bash
jkit version
jkit update-check
jkit update-check --quiet
jkit update-check --json
jkit update-check --no-cache
```

`jkit version` prints the local jkit package version without network access.

`jkit update-check`:

- reads local version from `package.json`
- reads the latest npm version for `@nobodyjack/jkit`
- uses a 24-hour cache by default
- prints a short status
- exits 0 when the check succeeds, when no update exists, and when the registry
  is unavailable

`jkit update-check --quiet`:

- prints nothing when local version is current
- prints a short update notice only when a newer version is available
- prints nothing and exits 0 when the check cannot be completed

`jkit update-check --json` prints:

```json
{
  "packageName": "@nobodyjack/jkit",
  "localVersion": "0.9.3",
  "latestVersion": "0.9.4",
  "updateAvailable": true,
  "cached": false,
  "checkedAt": "2026-06-08T00:00:00.000Z",
  "error": null
}
```

Cache path:

```text
~/.cache/jkit/update-check.json
```

The cache should be best-effort. If it cannot be read or written, the CLI
continues without failing the workflow command.

## 5. Skill behavior

Every jkit workflow skill should run this during Phase 0 or its equivalent:

```bash
jkit update-check --quiet 2>/dev/null || true
```

The command is a non-blocking notice only. Skills must continue when:

- `jkit` is unavailable
- npm is unavailable
- network is unavailable
- the cache is stale or unreadable
- update-check prints nothing

When an update is available, the notice should be short and actionable:

```text
[jkit] update available: 0.9.4 (current 0.9.3)
[jkit] update after this run: npm install -g @nobodyjack/jkit && jkit codex install
```

## 6. Acceptance criteria

- `jkit version` prints the local version.
- `jkit update-check --json --no-cache` returns valid JSON.
- `jkit update-check --quiet --no-cache` prints an update notice only when npm
  latest is newer than local.
- npm/network failures do not make update-check exit non-zero.
- Workflow skills include a non-blocking update-check call in orientation.
- README and workflow docs describe update notices.
- Package/plugin metadata version is bumped when this behavior ships after the
  previously published npm version.
- `./scripts/agent-map-check`, `./scripts/codex-plugin-check`, and
  `npm pack --dry-run --json` pass.

## 7. Assumptions

- [ASSUMED] A 24-hour cache is frequent enough for command-entry update
  notices and avoids surprising registry traffic.
- [ASSUMED] `npm view @nobodyjack/jkit version --json` is the first-version
  registry lookup mechanism because npm is already required for installation.
- [ASSUMED] The notice should suggest `jkit codex install` because Codex users
  need plugin re-registration after a global npm update.
