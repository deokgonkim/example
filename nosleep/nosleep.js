#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const PORTAL_DEST = 'org.freedesktop.portal.Desktop';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const PORTAL_IFACE = 'org.freedesktop.portal.Inhibit';
const INHIBIT_IDLE = 8; // idle/screen saver

function parseArgs(argv) {
  const args = { appId: 'com.example.nosleep', reason: 'Keeping the session awake' };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--app-id' && argv[i + 1]) {
      args.appId = argv[++i];
    } else if (arg === '--reason' && argv[i + 1]) {
      args.reason = argv[++i];
    } else if (arg === '-h' || arg === '--help') {
      args.help = true;
    }
  }
  return args;
}

function buildGdbusArgs(appId, reason) {
  const escapedReason = reason.replace(/'/g, "\\'");
  const options = `{'reason': <'${escapedReason}'>}`;
  return [
    'call',
    '--session',
    '--dest',
    PORTAL_DEST,
    '--object-path',
    PORTAL_PATH,
    '--method',
    `${PORTAL_IFACE}.Inhibit`,
    appId,
    '',
    String(INHIBIT_IDLE),
    options,
  ];
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: nosleep.js [--app-id ID] [--reason TEXT]');
    return 0;
  }

  const gdbusArgs = buildGdbusArgs(args.appId, args.reason);
  const res = spawnSync('gdbus', gdbusArgs, { encoding: 'utf8' });

  if (res.error) {
    if (res.error.code === 'ENOENT') {
      console.error("gdbus not found. Install the 'glib2.0-bin' package.");
      return 1;
    }
    console.error('Failed to run gdbus.', res.error.message || res.error);
    return 1;
  }

  if (res.status !== 0) {
    console.error('Failed to request inhibit via xdg-desktop-portal.');
    if (res.stderr) {
      console.error(res.stderr.trim());
    }
    return res.status || 1;
  }

  const handle = (res.stdout || '').trim();
  console.log('Inhibit active. Press Ctrl+C to release.');
  if (handle) {
    console.log(`Portal handle: ${handle}`);
  }

  setInterval(() => {}, 60 * 1000);
  return 0;
}

process.on('SIGINT', () => {
  console.log('Releasing inhibit and exiting.');
  process.exit(0);
});

process.exitCode = main();
