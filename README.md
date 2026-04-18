# JKit

Cognitive-transparency planning for Claude Code. Turns fuzzy ideas into
explicit plan files before coding.

JKit attacks one failure mode of AI coding: **silent defaults at ambiguity
points**. The model confidently fills gaps and marches forward; the user
discovers the wrong path hours later. JKit forces every assumption, every
unknown, and every hidden design choice into one of three explicit forms —
confirmed consensus, tagged assumption, or controlled unknown — and
surfaces them before any code gets written.

## What's inside

| Skill | What it does |
|-------|-------------|
| `/before-build` | Clarifies requirements, surfaces silent defaults, writes `plan-<feature-slug>.md` (spec + design + tasks + ambiguity ledger) |
| `/build` | Executes the tasks from a locked plan file, one by one, with verification |

## Install

Pick the path that fits your workflow.

### Option A — Claude Code plugin (recommended)

```
/plugin marketplace add YOUR_GITHUB_USERNAME/JKit
/plugin install jkit@jkit
```

Updates:
```
/plugin update jkit
```

### Option B — git clone + symlink (no package manager needed)

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/JKit ~/code/JKit
mkdir -p ~/.claude/skills
ln -sfn ~/code/JKit/skills/before-build ~/.claude/skills/before-build
ln -sfn ~/code/JKit/skills/build ~/.claude/skills/build
```

Or run the bundled installer (same effect, with status/uninstall commands):
```bash
node ~/code/JKit/bin/jkit.js install
node ~/code/JKit/bin/jkit.js status
```

Updates:
```bash
cd ~/code/JKit && git pull
# symlinks follow automatically
```

### Option C — npm (coming soon)

An `npx @scope/jkit` installer is wired up in the repo but not yet
published to npm. Once published, the commands will be:
```bash
npx @scope/jkit                    # install
npx @scope/jkit@latest             # upgrade
```

## Usage

Start in any project directory, then:

```
/before-build
```

JKit walks you through clarification → spec → design → ambiguity review,
producing `plan-<feature-slug>.md`. When you're satisfied:

```
/build <feature-slug>
```

runs the tasks in order.

## Why one plan file per feature

A single `plan-<feature-slug>.md` holds everything: what you're building,
how you're building it, the atomic tasks, and every assumption the agent
made along the way. The final section — the **Ambiguity Ledger** —
aggregates every `[ASSUMED]`, `[NEEDS_INVESTIGATION]`, and silent default
into one scroll. That's the artifact you scrutinize before any code
gets written.

For multi-feature projects, each feature gets its own `plan-<slug>.md`.
The skill auto-detects existing plans and routes follow-up requests
through a blast-radius classifier to keep changes contained.

## Uninstall

| Method | Command |
|--------|---------|
| Plugin | `/plugin uninstall jkit` |
| npm / bundled installer | `node bin/jkit.js uninstall` (or `jkit uninstall` if installed globally) |
| Manual | `rm ~/.claude/skills/before-build ~/.claude/skills/build` |

## License

MIT — see [LICENSE](./LICENSE).
