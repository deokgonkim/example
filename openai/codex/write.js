#!/usr/bin/env node
"use strict";
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const path = require('path');

function usage() {
  console.error(`Usage: ${path.basename(process.argv[1])} user [tty]`);
  process.exit(1);
}

function getTTYDevice(ttyName) {
  if (ttyName.startsWith('/dev/')) {
    return ttyName;
  }
  return path.join('/dev', ttyName);
}

function findTTYForUser(username) {
  let out;
  try {
    out = execSync('who', { encoding: 'utf8' });
  } catch (err) {
    console.error('Error running who:', err.message);
    process.exit(1);
  }
  const lines = out.trim().split(/\r?\n/).filter(Boolean);
  const matches = lines.map(line => {
    const parts = line.split(/\s+/);
    return { user: parts[0], tty: parts[1] };
  }).filter(item => item.user === username);
  if (matches.length === 0) {
    console.error(`User ${username} is not logged in`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`User ${username} is logged in on multiple ttys:`);
    matches.forEach(item => console.error(`  ${item.tty}`));
    console.error('Specify a tty');
    process.exit(1);
  }
  return matches[0].tty;
}

function getSenderInfo() {
  const userInfo = os.userInfo();
  const sender = userInfo.username;
  let fromTTY = 'unknown';
  try {
    const ttyPath = fs.readlinkSync(`/proc/self/fd/${process.stdout.fd}`);
    fromTTY = ttyPath.replace(/^\/dev\//, '');
  } catch (_) {}
  const hostname = os.hostname();
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return { sender, fromTTY, hostname, time: `${hh}:${mm}` };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1 || args.length > 2 || args[0] === '-h' || args[0] === '--help') {
    usage();
  }
  const username = args[0];
  let tty = args[1];
  if (!tty) tty = findTTYForUser(username);
  const dev = getTTYDevice(tty);
  try {
    fs.accessSync(dev, fs.constants.W_OK);
  } catch (err) {
    console.error(`Cannot write to ${dev}: ${err.message}`);
    process.exit(1);
  }
  let writeStream;
  try {
    writeStream = fs.createWriteStream(dev, { flags: 'w' });
  } catch (err) {
    console.error(`Error opening ${dev}: ${err.message}`);
    process.exit(1);
  }
  const info = getSenderInfo();
  writeStream.write(
    `Message from ${info.sender}@${info.hostname} on ${info.fromTTY} at ${info.time} ...\n`
  );
  writeStream.on('error', err => {
    console.error(`Error writing to ${dev}: ${err.message}`);
    process.exit(1);
  });
  process.stdin.pipe(writeStream);
  process.stdin.on('end', () => writeStream.end());
  writeStream.on('close', () => process.exit(0));
}

main();