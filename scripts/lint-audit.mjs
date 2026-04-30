#!/usr/bin/env node
/**
 * Build-time lint — fails if any in-scope `app/api/**` route file is missing
 * the audit-logging wrapper. Pairs with the casing lint at lint-api-casing.mjs.
 *
 * In-scope rule: every route file that handles tool / lookup / calculator
 * calls MUST import either `withAuditRest` (for REST handlers) or
 * `withAuditMcp` (for the MCP transport route) from `@/lib/observability/audit`.
 *
 * Excluded routes (carve-outs, per the audience-instrumentation sprint spec):
 *   - /api/keys/register      (account creation; no audience signal needed)
 *   - /api/auth/*             (session-cookie auth, not API-key auth)
 *   - /api/health             (uptime probe; high-volume, low-signal)
 *   - /api/cron/*             (internal cron handlers)
 *   - /api/feedback           (admin form)
 *   - /api/newsletter/*       (mailing list)
 *   - /api/subscribe          (mailing list)
 *   - /api/stripe/*           (payment + webhook)
 *   - /api/og                 (image, returns ImageResponse not JSON)
 *   - /api/mcp/route.ts       (alias that forwards to [transport]; instrumented there)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const API_DIR = path.resolve(process.cwd(), 'app/api');

const EXCLUDED_PATHS = [
  /^auth\//,
  /^health\//,
  /^keys\//,
  /^cron\//,
  /^feedback\//,
  /^newsletter\//,
  /^subscribe\//,
  /^stripe\//,
  /^og\//,
  /^mcp\/route\.ts$/,
];

const MCP_TRANSPORT = /^mcp\/\[transport\]\/route\.ts$/;

function findRouteFiles(dir, results = [], rootDir = dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRouteFiles(full, results, rootDir);
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      results.push({ full, rel: path.relative(rootDir, full).replace(/\\/g, '/') });
    }
  }
  return results;
}

function isExcluded(rel) {
  return EXCLUDED_PATHS.some((re) => re.test(rel));
}

function isMcpRoute(rel) {
  return MCP_TRANSPORT.test(rel);
}

function checkFile({ full, rel }) {
  const source = fs.readFileSync(full, 'utf8');
  if (isMcpRoute(rel)) {
    const ok = /from\s+['"]@\/lib\/observability\/audit['"]/.test(source) && /withAuditMcp/.test(source);
    return ok ? null : `${rel}: missing import of withAuditMcp from @/lib/observability/audit`;
  }
  const ok = /from\s+['"]@\/lib\/observability\/audit['"]/.test(source) && /withAuditRest/.test(source);
  return ok ? null : `${rel}: missing import of withAuditRest from @/lib/observability/audit`;
}

function main() {
  if (!fs.existsSync(API_DIR)) {
    console.error(`lint-audit: app/api not found at ${API_DIR}`);
    process.exit(2);
  }

  const all = findRouteFiles(API_DIR, [], API_DIR);
  const inScope = all.filter((f) => !isExcluded(f.rel));
  const violations = [];
  for (const f of inScope) {
    const v = checkFile(f);
    if (v) violations.push(v);
  }

  if (violations.length > 0) {
    console.error(`lint-audit: ${violations.length} route(s) missing audit wrapper:\n`);
    for (const v of violations) console.error(`  app/api/${v}`);
    console.error(`\nEvery in-scope app/api/**/route.ts must import withAuditRest (or withAuditMcp on the MCP transport route) from @/lib/observability/audit and apply it to its exported HTTP-method handlers.`);
    process.exit(1);
  }

  const excludedCount = all.length - inScope.length;
  console.log(`lint-audit: ${inScope.length} in-scope route file(s) wrapped (${excludedCount} excluded by carve-out).`);
  process.exit(0);
}

main();
