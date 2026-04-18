#!/usr/bin/env node
// jkit installer: symlinks (or copies) the jkit skills into ~/.claude/skills/.
//
// Usage:
//   jkit install       — symlink skills into ~/.claude/skills/ (default)
//   jkit uninstall     — remove the symlinks
//   jkit status        — check current install state
//   jkit doctor        — alias for status

const fs = require('fs');
const os = require('os');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const SKILLS_SRC = path.join(PKG_ROOT, 'skills');
const SKILLS_DST = path.join(os.homedir(), '.claude', 'skills');
const SKILL_NAMES = ['before-build', 'build'];

function log(msg) {
  console.log(`[jkit] ${msg}`);
}

function skillSourceExists(name) {
  return fs.existsSync(path.join(SKILLS_SRC, name, 'SKILL.md'));
}

function ensureDstDir() {
  fs.mkdirSync(SKILLS_DST, { recursive: true });
}

function linkSkill(name) {
  const src = path.join(SKILLS_SRC, name);
  const dst = path.join(SKILLS_DST, name);

  if (fs.existsSync(dst) || fs.lstatSync(dst, { throwIfNoEntry: false })) {
    try {
      const stat = fs.lstatSync(dst);
      if (stat.isSymbolicLink()) {
        const current = fs.readlinkSync(dst);
        if (path.resolve(path.dirname(dst), current) === src) {
          log(`✓ ${name} already linked`);
          return;
        }
        log(`↻ replacing stale link for ${name}`);
        fs.unlinkSync(dst);
      } else {
        log(`⚠ ${name} exists but is not our symlink — skipping (remove manually to install)`);
        return;
      }
    } catch (_) {
      // fallthrough to create
    }
  }

  fs.symlinkSync(src, dst, 'dir');
  log(`✓ installed ${name} → ${dst}`);
}

function unlinkSkill(name) {
  const dst = path.join(SKILLS_DST, name);
  if (!fs.existsSync(dst) && !fs.lstatSync(dst, { throwIfNoEntry: false })) {
    log(`· ${name} not installed`);
    return;
  }
  const stat = fs.lstatSync(dst);
  if (!stat.isSymbolicLink()) {
    log(`⚠ ${name} exists but is not our symlink — skipping (remove manually)`);
    return;
  }
  const current = fs.readlinkSync(dst);
  if (path.resolve(path.dirname(dst), current) !== path.join(SKILLS_SRC, name)) {
    log(`⚠ ${name} is a symlink pointing elsewhere — skipping`);
    return;
  }
  fs.unlinkSync(dst);
  log(`✓ removed ${name}`);
}

function statusSkill(name) {
  const dst = path.join(SKILLS_DST, name);
  try {
    const stat = fs.lstatSync(dst);
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(dst);
      const resolved = path.resolve(path.dirname(dst), target);
      const expected = path.join(SKILLS_SRC, name);
      if (resolved === expected) {
        log(`✓ ${name}: linked to this package`);
      } else {
        log(`⚠ ${name}: linked elsewhere → ${resolved}`);
      }
    } else {
      log(`⚠ ${name}: exists but not a symlink (probably copied)`);
    }
  } catch (_) {
    log(`· ${name}: not installed`);
  }
}

function doInstall(opts = {}) {
  // When npm runs postinstall, we don't want to force-install for local dev installs.
  // Only auto-install on global installs (npm_config_global or npx exec).
  if (opts.silentIfNotGlobal) {
    const isGlobal =
      process.env.npm_config_global === 'true' ||
      !!process.env.npm_execpath?.includes('npx');
    if (!isGlobal) {
      return;
    }
  }

  ensureDstDir();
  for (const name of SKILL_NAMES) {
    if (!skillSourceExists(name)) {
      log(`⚠ source missing: skills/${name}/SKILL.md — skipping`);
      continue;
    }
    linkSkill(name);
  }
  log('Restart Claude Code (or open a new session) for the skills to load.');
}

function doUninstall() {
  for (const name of SKILL_NAMES) {
    unlinkSkill(name);
  }
}

function doStatus() {
  log(`source: ${SKILLS_SRC}`);
  log(`target: ${SKILLS_DST}`);
  for (const name of SKILL_NAMES) {
    statusSkill(name);
  }
}

function usage() {
  console.log(`jkit — jkit skills installer

Usage:
  jkit install       Symlink jkit skills into ~/.claude/skills/
  jkit uninstall     Remove the symlinks
  jkit status        Check current install state
  jkit --help        Show this message
`);
}

const args = process.argv.slice(2);
const cmd = args[0] || 'install';
const flags = new Set(args.slice(1));

switch (cmd) {
  case 'install':
    doInstall({ silentIfNotGlobal: flags.has('--silent-if-not-global') });
    break;
  case 'uninstall':
  case 'remove':
    doUninstall();
    break;
  case 'status':
  case 'doctor':
    doStatus();
    break;
  case '-h':
  case '--help':
  case 'help':
    usage();
    break;
  default:
    console.error(`[jkit] unknown command: ${cmd}`);
    usage();
    process.exit(1);
}
