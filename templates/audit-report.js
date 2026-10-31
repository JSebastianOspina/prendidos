#!/usr/bin/env node
/**
 * Parses npm audit JSON and prints a human-readable summary.
 *
 * Copy to scripts/audit-report.js in your project repo.
 * Used by templates/bitbucket-pipelines.yml (weekly dependency audit step).
 *
 * Usage:
 *   npm audit --json > audit-report.json || true
 *   node scripts/audit-report.js
 */

const fs = require('fs');
const path = require('path');

const reportPath = path.join(process.cwd(), 'audit-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('audit-report.json not found. Run: npm audit --json > audit-report.json');
  process.exit(1);
}

let audit;
try {
  audit = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch {
  console.error('Invalid JSON in audit-report.json');
  process.exit(1);
}

const metadata = audit.metadata || {};
const vulnerabilities = metadata.vulnerabilities || {};

console.log('=== npm audit summary ===');
console.log(`Total dependencies: ${metadata.totalDependencies ?? 'n/a'}`);

for (const [severity, count] of Object.entries(vulnerabilities)) {
  if (count > 0) {
    console.log(`  ${severity}: ${count}`);
  }
}

const highOrCritical = (vulnerabilities.high || 0) + (vulnerabilities.critical || 0);

if (highOrCritical > 0) {
  console.error(
    `\n${highOrCritical} high/critical vulnerabilities found — review audit-report.json`,
  );
  process.exit(1);
}

console.log('\nNo high or critical vulnerabilities ✓');
