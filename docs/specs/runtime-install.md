# Spec: runtime-install

> Status: draft
> Product: jkit v2
> Scope: runtime-specific install UX, npm package name, and bilingual README

## 1. Summary

jkit installation should be documented and implemented by AI agent runtime.
Claude Code should use the Claude Code plugin marketplace as the primary path.
Codex should use npm to install the jkit CLI/package, then an explicit jkit CLI
command to register the local Codex plugin.

The public README should default to Chinese and link to an English version.

## 2. Goals

- Make `README.md` the default Chinese README.
- Add `README.en.md` as the English version and link both files.
- Use `@nobodyjack/jkit` as the npm package name.
- Remove npm postinstall runtime side effects. `npm install -g` installs jkit;
  runtime integration happens only after explicit commands.
- Add Codex runtime CLI commands:
  - `jkit codex install`
  - `jkit codex uninstall`
  - `jkit codex status`
- Preserve Claude Code local symlink fallback only through explicit namespaced
  commands:
  - `jkit claude-code install`
  - `jkit claude-code uninstall`
  - `jkit claude-code status`
- Make `jkit status` report both Claude Code local symlink state and Codex
  local plugin registration state.
- Remove historical compatibility entry points:
  - `jkit install`
  - `jkit uninstall`
  - `jkit remove`
  - `jkit doctor`
  - `jkit claude`
  - `--silent-if-not-global`

## 3. Non-goals

- Do not publish to npm.
- Do not add an official Claude Code or Codex marketplace listing.
- Do not change skill behavior or command semantics.
- Do not auto-install into Claude Code or Codex from npm postinstall.
- Do not add runtime dependencies.

## 4. Behavior contract

### Claude Code

- The recommended README path presents Claude Code installation first as a
  semantic prompt copied into Claude Code, then as manual terminal commands:

```text
帮我安装 jkit Claude Code plugin。

请执行或引导我执行：

/plugin marketplace add superjack2050/jkit
/plugin install jkit@jkit
/reload-plugins

安装完成后，请验证 jkit commands 是否可用。
```

- Manual Claude Code install is a terminal fallback through npm and the local
  skill symlink installer:

```bash
npm install -g @nobodyjack/jkit
jkit claude-code install
jkit claude-code status
```

- The npm CLI keeps this local symlink fallback for development and controlled
  manual installs.
- `jkit claude-code install` symlinks each shipped skill into
  `~/.claude/skills`.
- `jkit claude-code status` reports every shipped skill as linked, missing, or
  conflicting.
- No root-level install/uninstall aliases are supported.
- No short `jkit claude` alias is supported.

### Codex

- The recommended README path presents Codex installation first as a prompt
  copied into Codex:

```text
帮我安装 jkit Codex plugin。

请在终端执行：

npm install -g @nobodyjack/jkit
jkit codex install
jkit codex status

安装完成后，请重启或刷新 Codex，开启新会话，并验证 jkit skills 是否可用。
```

- Manual Codex install remains available as terminal commands:

```bash
npm install -g @nobodyjack/jkit
jkit codex install
jkit codex status
```

- `jkit codex install` verifies `.codex-plugin/plugin.json`, creates or updates
  `~/plugins/jkit` as a symlink to the current package root, and adds or updates
  a `jkit` entry in `~/.agents/plugins/marketplace.json`.
- `jkit codex install` then runs `codex plugin add jkit@personal` so Codex
  installs and enables the plugin instead of only discovering it in the local
  marketplace.
- The Codex marketplace entry uses local plugin source path `./plugins/jkit`.
- Existing non-jkit marketplace entries are preserved.
- Existing non-symlink `~/plugins/jkit` paths are not overwritten.
- `jkit codex uninstall` runs `codex plugin remove jkit@personal`, removes the
  `jkit` marketplace entry, and removes `~/plugins/jkit` only when it is a
  symlink to the current package root.
- `jkit codex status` reports the manifest, symlink, marketplace entry, and
  official Codex installed/enabled state from `codex plugin list`.

### README

- `README.md` is Chinese by default.
- `README.en.md` is the English version.
- Installation is grouped by runtime:
  - Claude Code
  - Codex
- Each runtime has two paths:
  - install with the AI agent
  - manual install

## 5. Verification

```bash
node -c bin/jkit.js
node bin/jkit.js --help
node bin/jkit.js status
tmp_home="$(mktemp -d)" && HOME="$tmp_home" node bin/jkit.js codex install && HOME="$tmp_home" node bin/jkit.js codex status && HOME="$tmp_home" node bin/jkit.js codex uninstall
node bin/jkit.js install >/tmp/jkit-legacy-install.out 2>&1 && exit 1 || true
node bin/jkit.js claude-code install --silent-if-not-global >/tmp/jkit-legacy-flag.out 2>&1 && exit 1 || true
npm pack --dry-run
./scripts/codex-plugin-check
./scripts/agent-map-generate
./scripts/agent-map-check
```

## 6. Acceptance criteria

- README defaults to Chinese and links to English.
- English README links back to Chinese.
- README installation commands match implemented CLI behavior.
- `package.json` uses `@nobodyjack/jkit`.
- npm install has no runtime integration postinstall side effect.
- Codex install/status/uninstall commands work against a temporary `HOME`.
- Historical root-level install/uninstall/doctor aliases are not supported.
- Agent maps and generated indexes are refreshed.
