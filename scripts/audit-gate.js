#!/usr/bin/env node
/**
 * Fails when npm audit reports high/critical advisories that are not allowlisted.
 *
 * Allowlist: .audit-allowlist.json — each entry needs an advisory ID, a reason, and a
 * reviewBy date. Expired entries fail the gate so exceptions get re-evaluated.
 *
 * Usage:
 *   node scripts/audit-gate.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BLOCKING = new Set(['high', 'critical']);
const allowlistPath = path.join(process.cwd(), '.audit-allowlist.json');

const allowlist = fs.existsSync(allowlistPath)
  ? JSON.parse(fs.readFileSync(allowlistPath, 'utf8')).advisories || []
  : [];

const today = new Date().toISOString().slice(0, 10);
const expired = allowlist.filter((entry) => entry.reviewBy < today);
const allowedIds = new Set(allowlist.filter((entry) => entry.reviewBy >= today).map((e) => e.id));

let audit;
try {
  audit = JSON.parse(execSync('npm audit --json', { encoding: 'utf8' }));
} catch (error) {
  // npm audit exits non-zero when it finds vulnerabilities; the JSON is still on stdout.
  audit = JSON.parse(error.stdout);
}

const blocking = new Map();
for (const vulnerability of Object.values(audit.vulnerabilities || {})) {
  for (const source of vulnerability.via) {
    if (typeof source !== 'object' || !BLOCKING.has(source.severity)) continue;
    const id = source.url.split('/').pop();
    if (!allowedIds.has(id)) {
      blocking.set(id, `${source.severity}: ${source.name} — ${source.title} (${source.url})`);
    }
  }
}

for (const entry of expired) {
  console.error(`Allowlist entry ${entry.id} expired on ${entry.reviewBy} — re-evaluate it.`);
}

if (blocking.size > 0) {
  console.error(`${blocking.size} high/critical advisories found:`);
  for (const line of blocking.values()) console.error(`  ${line}`);
}

if (blocking.size > 0 || expired.length > 0) {
  process.exit(1);
}

console.log(`No blocking advisories ✓ (${allowedIds.size} allowlisted)`);
