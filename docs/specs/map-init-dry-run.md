# Spec: map-init dry run

> Status: draft
> Product: jkit v2
> Scope: preview `/map-init` scaffold changes without writing files

## 1. Summary

`/map-init` should support a dry-run mode that previews the files, directories,
assumptions, open questions, and verification commands it would create without
writing repository changes.

The mode helps users inspect the proposed agent-map scaffold before accepting
it, especially in brownfield or partially documented repositories.

## 2. Background

`/map-init` currently initializes or augments repository agent maps. It is
designed to preserve existing docs and ask before overwriting human-authored
content. A dry-run mode would make that preservation policy easier to trust by
showing the planned scaffold and conflicts before any write.

## 3. Goals

- Preview the scaffold level, mode classification, and target files.
- Preview assumptions and `[NEEDS_INVESTIGATION]` items.
- Preview files that would be created, skipped, or require confirmation.
- Avoid writing, deleting, moving, or editing files in dry-run mode.
- Leave a clear next step for running `/map-init` without dry-run.

## 4. Non-goals

- Do not implement an interactive approval UI.
- Do not perform package installation, git operations, or external checks.
- Do not replace `/map-init` normal write behavior.
- Do not invent project facts that `/map-init` cannot infer.

## 5. User stories

### 5.1 Preview empty-project scaffold

As a user in an empty repository, I can run dry-run mode and see the minimal or
standard scaffold that would be created.

Acceptance criteria:

- The command reports detected mode and scaffold level.
- The command lists files and directories that would be created.
- The command records missing product facts as `[NEEDS_INVESTIGATION]`.
- No files are written.

### 5.2 Preview brownfield augmentation

As a user in an existing repository, I can preview how `/map-init` would augment
the project without touching existing docs.

Acceptance criteria:

- Existing files are listed as preserved, linked, skipped, or requiring
  confirmation.
- Potential conflicts are surfaced before writes.
- Verification commands are labeled as verified, assumed, or TBD.
- No files are written.

## 6. Command contract

Supported future forms:

```text
/map-init --dry-run
/map-init --dry-run minimal
/map-init --dry-run standard
/map-init --dry-run full
```

Dry-run output should include:

- detected mode
- scaffold level
- files and directories that would be created
- existing files that would be preserved
- conflicts requiring confirmation
- assumptions and open questions
- verification commands that would run after a real scaffold
- next recommended command

## 7. Required phases

- Reuse `/map-init` scan, classification, scaffold-level, and ambiguity rules.
- Build the planned write set in memory or as a narrative summary.
- Report the planned write set.
- Stop before any filesystem write.

## 8. Safety, data, and compatibility

- Dry-run mode must not create, edit, delete, move, chmod, or symlink files.
- Dry-run mode must not hide conflicts that normal mode would need to resolve.
- Dry-run output must not include secrets or private local config contents.
- Dry-run mode should work without network access.

## 9. Verification

Expected verification after implementation:

```text
./scripts/agent-map-check
node bin/jkit.js status
npm pack --dry-run
```

Dogfood verification should run dry-run mode in empty, brownfield, and augment
fixture repositories and confirm no files are written.

## 10. Acceptance criteria

- `/map-init --dry-run` previews scaffold changes without writing files.
- Dry-run mode reports mode, scaffold level, write set, assumptions, open
  questions, and conflicts.
- Dry-run mode supports at least `minimal` and `standard` scaffold levels.
- Dry-run mode exits before any write operation.
- The normal `/map-init` behavior remains unchanged when dry-run is absent.

## 11. Open questions

- [NEEDS_INVESTIGATION] Should dry-run output use a strict machine-readable
  format, or is concise Markdown enough for the first implementation?
- [NEEDS_INVESTIGATION] Should dry-run support a later `--apply` handoff, or
  should users rerun `/map-init` explicitly?
