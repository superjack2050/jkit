#!/usr/bin/env node
// jkit runtime installer.
//
// Primary public paths:
//   Claude Code: use the Claude Code plugin marketplace.
//   Codex:       npm install -g @nobodyjack/jkit && jkit codex install

const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const PKG_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(PKG_ROOT, 'package.json');
const PACKAGE_NAME = '@nobodyjack/jkit';
const SKILLS_SRC = path.join(PKG_ROOT, 'skills');
const SKILLS_DST = path.join(os.homedir(), '.claude', 'skills');
const SKILL_NAMES = ['jkit', 'map-init', 'explore', 'grill-me', 'clarify', 'to-spec', 'to-plan', 'to-done', 'run'];
const UPDATE_CHECK_TTL_MS = 24 * 60 * 60 * 1000;
const UPDATE_CHECK_CACHE = path.join(os.homedir(), '.cache', 'jkit', 'update-check.json');
const CODEX_PLUGIN_NAME = 'jkit';
const CODEX_MARKETPLACE_NAME = 'personal';
const CODEX_PLUGIN_SELECTOR = `${CODEX_PLUGIN_NAME}@${CODEX_MARKETPLACE_NAME}`;
const CODEX_MANIFEST = path.join(PKG_ROOT, '.codex-plugin', 'plugin.json');
const CODEX_PLUGIN_LINK = path.join(os.homedir(), 'plugins', CODEX_PLUGIN_NAME);
const CODEX_MARKETPLACE = path.join(os.homedir(), '.agents', 'plugins', 'marketplace.json');
const CODEX_MARKETPLACE_PLUGIN = {
  name: CODEX_PLUGIN_NAME,
  source: {
    source: 'local',
    path: './plugins/jkit',
  },
  policy: {
    installation: 'AVAILABLE',
    authentication: 'ON_INSTALL',
  },
  category: 'Developer Tools',
};

function log(msg) {
  console.log(`[jkit] ${msg}`);
}

function statIfExists(filePath) {
  return fs.lstatSync(filePath, { throwIfNoEntry: false });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runCodex(args) {
  const result = childProcess.spawnSync('codex', args, {
    encoding: 'utf8',
  });

  if (result.error && result.error.code === 'ENOENT') {
    throw new Error('missing Codex CLI; install or open Codex, then ensure `codex` is available on PATH');
  }
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const output = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    throw new Error(output || `codex ${args.join(' ')} failed`);
  }

  return result.stdout || '';
}

function runCommand(command, args) {
  const result = childProcess.spawnSync(command, args, {
    encoding: 'utf8',
  });

  if (result.error && result.error.code === 'ENOENT') {
    throw new Error(`missing ${command} command`);
  }
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const output = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    throw new Error(output || `${command} ${args.join(' ')} failed`);
  }

  return (result.stdout || '').trim();
}

function getLocalVersion() {
  return readJson(PACKAGE_JSON).version;
}

function compareVersions(left, right) {
  const parse = (version) =>
    String(version || '')
      .trim()
      .replace(/^v/, '')
      .split(/[+-]/)[0]
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0);

  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length, 3);

  for (let index = 0; index < length; index += 1) {
    const delta = (a[index] || 0) - (b[index] || 0);
    if (delta > 0) return 1;
    if (delta < 0) return -1;
  }
  return 0;
}

function readUpdateCache(now) {
  try {
    const cache = readJson(UPDATE_CHECK_CACHE);
    if (!cache || cache.packageName !== PACKAGE_NAME || !cache.checkedAt || !cache.latestVersion) {
      return null;
    }
    const checkedAt = Date.parse(cache.checkedAt);
    if (!Number.isFinite(checkedAt) || now - checkedAt > UPDATE_CHECK_TTL_MS) {
      return null;
    }
    return cache;
  } catch (_) {
    return null;
  }
}

function writeUpdateCache(cache) {
  try {
    writeJson(UPDATE_CHECK_CACHE, cache);
  } catch (_) {
    // Update checks are best-effort and must never block workflow commands.
  }
}

function fetchLatestVersion() {
  const raw = runCommand('npm', ['view', PACKAGE_NAME, 'version', '--json']);
  return JSON.parse(raw);
}

function checkForUpdate(options = {}) {
  const now = Date.now();
  const localVersion = getLocalVersion();
  const cached = options.noCache ? null : readUpdateCache(now);

  if (cached) {
    const updateAvailable = compareVersions(cached.latestVersion, localVersion) > 0;
    return {
      packageName: PACKAGE_NAME,
      localVersion,
      latestVersion: cached.latestVersion,
      updateAvailable,
      cached: true,
      checkedAt: cached.checkedAt,
      error: null,
    };
  }

  const checkedAt = new Date(now).toISOString();

  try {
    const latestVersion = fetchLatestVersion();
    const updateAvailable = compareVersions(latestVersion, localVersion) > 0;
    const result = {
      packageName: PACKAGE_NAME,
      localVersion,
      latestVersion,
      updateAvailable,
      cached: false,
      checkedAt,
      error: null,
    };
    writeUpdateCache({
      packageName: PACKAGE_NAME,
      latestVersion,
      checkedAt,
    });
    return result;
  } catch (error) {
    return {
      packageName: PACKAGE_NAME,
      localVersion,
      latestVersion: null,
      updateAvailable: false,
      cached: false,
      checkedAt,
      error: error.message,
    };
  }
}

function updateNotice(result) {
  return [
    `[jkit] update available: ${result.latestVersion} (current ${result.localVersion})`,
    '[jkit] update after this run: npm install -g @nobodyjack/jkit && jkit codex install',
  ].join('\n');
}

function doVersion() {
  console.log(getLocalVersion());
}

function doUpdateCheck(rawArgs) {
  const options = {
    quiet: false,
    json: false,
    noCache: false,
  };

  for (const arg of rawArgs) {
    switch (arg) {
      case '--quiet':
        options.quiet = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--no-cache':
        options.noCache = true;
        break;
      default:
        throw new Error(`unknown update-check argument: ${arg}`);
    }
  }

  const result = checkForUpdate(options);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.updateAvailable) {
    console.log(updateNotice(result));
    return;
  }

  if (options.quiet) {
    return;
  }

  if (result.error) {
    log(`· update check unavailable: ${result.error}`);
    return;
  }

  const cacheText = result.cached ? 'cached ' : '';
  log(`✓ ${PACKAGE_NAME} is up to date (${result.localVersion}, ${cacheText}latest ${result.latestVersion})`);
}

function resolveSymlink(linkPath) {
  return path.resolve(path.dirname(linkPath), fs.readlinkSync(linkPath));
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

  if (fs.existsSync(dst) || statIfExists(dst)) {
    try {
      const stat = fs.lstatSync(dst);
      if (stat.isSymbolicLink()) {
        const current = resolveSymlink(dst);
        if (current === src) {
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
  if (!fs.existsSync(dst) && !statIfExists(dst)) {
    log(`· ${name} not installed`);
    return;
  }
  const stat = fs.lstatSync(dst);
  if (!stat.isSymbolicLink()) {
    log(`⚠ ${name} exists but is not our symlink — skipping (remove manually)`);
    return;
  }
  const current = resolveSymlink(dst);
  if (current !== path.join(SKILLS_SRC, name)) {
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
      const resolved = resolveSymlink(dst);
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

function doClaudeInstall() {
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

function doClaudeUninstall() {
  for (const name of SKILL_NAMES) {
    unlinkSkill(name);
  }
}

function doClaudeStatus() {
  log('Claude Code local skills');
  log(`source: ${SKILLS_SRC}`);
  log(`target: ${SKILLS_DST}`);
  for (const name of SKILL_NAMES) {
    statusSkill(name);
  }
}

function validateCodexManifest() {
  if (!fs.existsSync(CODEX_MANIFEST)) {
    throw new Error(`missing Codex plugin manifest: ${CODEX_MANIFEST}`);
  }
  const manifest = readJson(CODEX_MANIFEST);
  if (manifest.name !== CODEX_PLUGIN_NAME) {
    throw new Error(`Codex plugin manifest name must be "${CODEX_PLUGIN_NAME}"`);
  }
  if (!manifest.skills) {
    throw new Error('Codex plugin manifest must declare a skills path');
  }
  return manifest;
}

function ensureCodexLink() {
  fs.mkdirSync(path.dirname(CODEX_PLUGIN_LINK), { recursive: true });

  const stat = statIfExists(CODEX_PLUGIN_LINK);
  if (stat) {
    if (!stat.isSymbolicLink()) {
      throw new Error(`${CODEX_PLUGIN_LINK} exists but is not a symlink; remove it manually to install`);
    }

    const current = resolveSymlink(CODEX_PLUGIN_LINK);
    if (current === PKG_ROOT) {
      log(`✓ Codex plugin link already points to this package: ${CODEX_PLUGIN_LINK}`);
      return;
    }

    log(`↻ replacing stale Codex plugin link: ${CODEX_PLUGIN_LINK} → ${current}`);
    fs.unlinkSync(CODEX_PLUGIN_LINK);
  }

  fs.symlinkSync(PKG_ROOT, CODEX_PLUGIN_LINK, 'dir');
  log(`✓ installed Codex plugin link: ${CODEX_PLUGIN_LINK} → ${PKG_ROOT}`);
}

function defaultMarketplace() {
  return {
    name: 'personal',
    interface: {
      displayName: 'Personal',
    },
    plugins: [],
  };
}

function loadMarketplace() {
  if (!fs.existsSync(CODEX_MARKETPLACE)) {
    return defaultMarketplace();
  }

  const loaded = readJson(CODEX_MARKETPLACE);
  const marketplace =
    loaded && typeof loaded === 'object' && !Array.isArray(loaded)
      ? loaded
      : defaultMarketplace();

  if (!marketplace.name) {
    marketplace.name = 'personal';
  }
  if (!marketplace.interface || typeof marketplace.interface !== 'object' || Array.isArray(marketplace.interface)) {
    marketplace.interface = { displayName: 'Personal' };
  } else if (!marketplace.interface.displayName) {
    marketplace.interface.displayName = 'Personal';
  }
  if (!Array.isArray(marketplace.plugins)) {
    marketplace.plugins = [];
  }

  return marketplace;
}

function installCodexMarketplaceEntry() {
  const marketplace = loadMarketplace();
  const index = marketplace.plugins.findIndex((plugin) => plugin && plugin.name === CODEX_PLUGIN_NAME);

  if (index >= 0) {
    marketplace.plugins[index] = CODEX_MARKETPLACE_PLUGIN;
    log(`✓ updated Codex marketplace entry: ${CODEX_PLUGIN_NAME}`);
  } else {
    marketplace.plugins.push(CODEX_MARKETPLACE_PLUGIN);
    log(`✓ added Codex marketplace entry: ${CODEX_PLUGIN_NAME}`);
  }

  writeJson(CODEX_MARKETPLACE, marketplace);
  log(`✓ wrote Codex marketplace: ${CODEX_MARKETPLACE}`);
}

function removeCodexMarketplaceEntry() {
  if (!fs.existsSync(CODEX_MARKETPLACE)) {
    log('· Codex marketplace not found');
    return;
  }

  const marketplace = loadMarketplace();
  const before = marketplace.plugins.length;
  marketplace.plugins = marketplace.plugins.filter((plugin) => !plugin || plugin.name !== CODEX_PLUGIN_NAME);

  if (marketplace.plugins.length === before) {
    log(`· Codex marketplace entry not found: ${CODEX_PLUGIN_NAME}`);
  } else {
    writeJson(CODEX_MARKETPLACE, marketplace);
    log(`✓ removed Codex marketplace entry: ${CODEX_PLUGIN_NAME}`);
  }
}

function doCodexInstall() {
  validateCodexManifest();
  ensureCodexLink();
  installCodexMarketplaceEntry();
  installCodexPlugin();
  log('Restart or refresh Codex, then open a new session for the jkit skills to load.');
}

function doCodexUninstall() {
  removeCodexPlugin();
  removeCodexMarketplaceEntry();

  const stat = statIfExists(CODEX_PLUGIN_LINK);
  if (!stat) {
    log('· Codex plugin link not installed');
    return;
  }
  if (!stat.isSymbolicLink()) {
    log(`⚠ ${CODEX_PLUGIN_LINK} exists but is not a symlink — skipping`);
    return;
  }

  const current = resolveSymlink(CODEX_PLUGIN_LINK);
  if (current !== PKG_ROOT) {
    log(`⚠ Codex plugin link points elsewhere — skipping: ${current}`);
    return;
  }

  fs.unlinkSync(CODEX_PLUGIN_LINK);
  log(`✓ removed Codex plugin link: ${CODEX_PLUGIN_LINK}`);
}

function installCodexPlugin() {
  runCodex(['plugin', 'add', CODEX_PLUGIN_SELECTOR]);
  log(`✓ installed and enabled Codex plugin: ${CODEX_PLUGIN_SELECTOR}`);
}

function removeCodexPlugin() {
  try {
    runCodex(['plugin', 'remove', CODEX_PLUGIN_SELECTOR]);
    log(`✓ removed Codex plugin install: ${CODEX_PLUGIN_SELECTOR}`);
  } catch (error) {
    log(`⚠ Codex plugin remove skipped: ${error.message}`);
  }
}

function statusCodexManifest() {
  try {
    const manifest = validateCodexManifest();
    log(`✓ manifest: ${CODEX_MANIFEST} (${manifest.name}@${manifest.version})`);
  } catch (error) {
    log(`⚠ manifest: ${error.message}`);
  }
}

function statusCodexLink() {
  const stat = statIfExists(CODEX_PLUGIN_LINK);
  if (!stat) {
    log(`· link: not installed (${CODEX_PLUGIN_LINK})`);
    return;
  }
  if (!stat.isSymbolicLink()) {
    log(`⚠ link: exists but is not a symlink (${CODEX_PLUGIN_LINK})`);
    return;
  }

  const current = resolveSymlink(CODEX_PLUGIN_LINK);
  if (current === PKG_ROOT) {
    log(`✓ link: ${CODEX_PLUGIN_LINK} → this package`);
  } else {
    log(`⚠ link: ${CODEX_PLUGIN_LINK} → ${current}`);
  }
}

function statusCodexMarketplace() {
  if (!fs.existsSync(CODEX_MARKETPLACE)) {
    log(`· marketplace: not found (${CODEX_MARKETPLACE})`);
    return;
  }

  try {
    const marketplace = loadMarketplace();
    const entry = marketplace.plugins.find((plugin) => plugin && plugin.name === CODEX_PLUGIN_NAME);
    if (!entry) {
      log(`· marketplace: ${CODEX_PLUGIN_NAME} entry not found`);
      return;
    }

    const sourcePath = entry.source && entry.source.path;
    if (entry.source && entry.source.source === 'local' && sourcePath === CODEX_MARKETPLACE_PLUGIN.source.path) {
      log(`✓ marketplace: ${CODEX_PLUGIN_NAME} registered at ${sourcePath}`);
    } else {
      log(`⚠ marketplace: ${CODEX_PLUGIN_NAME} entry has unexpected source`);
    }
  } catch (error) {
    log(`⚠ marketplace: ${error.message}`);
  }
}

function statusCodexInstall() {
  try {
    const raw = runCodex(['plugin', 'list', '--marketplace', CODEX_MARKETPLACE_NAME, '--json', '--available']);
    const listing = JSON.parse(raw);
    const installed = Array.isArray(listing.installed) ? listing.installed : [];
    const available = Array.isArray(listing.available) ? listing.available : [];
    const installedEntry = installed.find((plugin) => plugin && plugin.pluginId === CODEX_PLUGIN_SELECTOR);
    const availableEntry = available.find((plugin) => plugin && plugin.pluginId === CODEX_PLUGIN_SELECTOR);

    if (installedEntry) {
      const state = installedEntry.enabled ? 'enabled' : 'disabled';
      log(`✓ Codex install: installed, ${state} (${CODEX_PLUGIN_SELECTOR}@${installedEntry.version || 'unknown'})`);
      return;
    }
    if (availableEntry) {
      log(`· Codex install: available but not installed (${CODEX_PLUGIN_SELECTOR})`);
      return;
    }

    log(`· Codex install: not visible in marketplace ${CODEX_MARKETPLACE_NAME}`);
  } catch (error) {
    log(`⚠ Codex install: ${error.message}`);
  }
}

function doCodexStatus() {
  log('Codex plugin');
  statusCodexManifest();
  statusCodexLink();
  statusCodexMarketplace();
  statusCodexInstall();
}

function doStatus() {
  doClaudeStatus();
  console.log('');
  doCodexStatus();
}

function usage() {
  console.log(`jkit — agent-map toolkit installer

Usage:
  jkit codex install          Register, install, and enable jkit as a local Codex plugin
  jkit codex uninstall        Remove the local Codex plugin install and registration
  jkit codex status           Check Codex plugin registration and installed/enabled state

  jkit claude-code install    Symlink jkit skills into ~/.claude/skills/
  jkit claude-code uninstall  Remove local Claude Code skill symlinks
  jkit claude-code status     Check local Claude Code skill symlinks

  jkit status                 Check Claude Code and Codex state
  jkit version                Print the local jkit package version
  jkit update-check           Check npm for a newer jkit version (24h cache)
  jkit update-check --quiet   Print only when an update is available
  jkit update-check --json    Print machine-readable update status
  jkit --help                 Show this message
`);
}

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

function requireAction(runtime, action) {
  if (!action) {
    throw new Error(`missing ${runtime} action`);
  }
}

function assertNoExtra(extraArgs) {
  if (extraArgs.length > 0) {
    throw new Error(`unknown arguments: ${extraArgs.join(' ')}`);
  }
}

function dispatchRuntime(runtime, action, extraArgs) {
  requireAction(runtime, action);
  assertNoExtra(extraArgs);
  switch (runtime) {
    case 'codex':
      switch (action) {
        case 'install':
          doCodexInstall();
          return;
        case 'uninstall':
          doCodexUninstall();
          return;
        case 'status':
          doCodexStatus();
          return;
        default:
          throw new Error(`unknown codex command: ${action}`);
      }
    case 'claude-code':
      switch (action) {
        case 'install':
          doClaudeInstall();
          return;
        case 'uninstall':
          doClaudeUninstall();
          return;
        case 'status':
          doClaudeStatus();
          return;
        default:
          throw new Error(`unknown claude-code command: ${action}`);
      }
    default:
      throw new Error(`unknown runtime: ${runtime}`);
  }
}

try {
  switch (cmd) {
    case 'codex':
    case 'claude-code':
      dispatchRuntime(cmd, args[1], args.slice(2));
      break;
    case 'status':
      assertNoExtra(args.slice(1));
      doStatus();
      break;
    case 'version':
      assertNoExtra(args.slice(1));
      doVersion();
      break;
    case 'update-check':
      doUpdateCheck(args.slice(1));
      break;
    case '-h':
    case '--help':
    case 'help':
      assertNoExtra(args.slice(1));
      usage();
      break;
    default:
      console.error(`[jkit] unknown command: ${cmd}`);
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(`[jkit] ${error.message}`);
  process.exit(1);
}
