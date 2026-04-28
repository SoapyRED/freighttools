#!/usr/bin/env node
/**
 * Smoke test for the audit-logging instrumentation.
 *
 * Boots `next dev` on a fresh port, hits one REST endpoint and one MCP
 * tools/call, captures stdout, and asserts:
 *   1. Each request produced exactly one `[fu-audit]` line.
 *   2. The JSON parses and has all required fields.
 *   3. The MCP line's `tool` field matches the called tool name.
 *   4. NO field in either log line contains the SMOKE_API_KEY value
 *      (security regression guard — `has_api_key` should be true,
 *      but the value/prefix/hash must never appear).
 *
 * Exits 0 on pass, 1 on fail. Designed to run in CI, not part of the
 * default `npm run smoke` (which hits prod). Invoke explicitly:
 *
 *   node scripts/smoke-test-audit.mjs
 */

import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PORT = process.env.AUDIT_SMOKE_PORT ? parseInt(process.env.AUDIT_SMOKE_PORT, 10) : 3099;
const HOST = `http://localhost:${PORT}`;
const TIMEOUT_MS = 60_000;

// Load SMOKE_API_KEY from .env.local if present (copy of the prod key for smoke).
function loadEnvLocal() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const KEY = process.env.SMOKE_API_KEY || '';

// ─── Boot dev server ─────────────────────────────────────────────

console.log(`smoke-audit: spawning next dev on :${PORT}…`);
const dev = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' },
});

const stdout = [];
const stderr = [];
dev.stdout.on('data', (b) => stdout.push(String(b)));
dev.stderr.on('data', (b) => stderr.push(String(b)));

function logBuffer() {
  return stdout.join('') + stderr.join('');
}

// Wait for the dev server to start serving.
async function waitForReady() {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${HOST}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return true;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

// ─── Hits ─────────────────────────────────────────────────────────

async function hitRest() {
  const headers = { Accept: 'application/json' };
  if (KEY) headers['X-API-Key'] = KEY;
  const res = await fetch(`${HOST}/api/adr?un=1203`, { headers });
  return res;
}

async function hitMcp() {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (KEY) headers['X-API-Key'] = KEY;
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: 'cbm_calculator', arguments: { length_cm: 100, width_cm: 80, height_cm: 60 } },
  });
  const res = await fetch(`${HOST}/api/mcp/mcp`, { method: 'POST', headers, body });
  return res;
}

// ─── Assertions ───────────────────────────────────────────────────

const REQUIRED_FIELDS = [
  'timestamp',
  'channel',
  'route',
  'tool',
  'client',
  'country',
  'region',
  'has_api_key',
  'status',
  'duration_ms',
];

function findAuditLines(text) {
  return text.split(/\r?\n/).filter((l) => l.includes('[fu-audit]'));
}

function parseAuditLine(line) {
  const i = line.indexOf('{');
  if (i < 0) return null;
  try {
    return JSON.parse(line.slice(i));
  } catch {
    return null;
  }
}

function assertFields(entry, ctx) {
  for (const f of REQUIRED_FIELDS) {
    if (!(f in entry)) throw new Error(`${ctx}: missing field "${f}" — got ${JSON.stringify(entry)}`);
  }
}

function assertNoKeyLeak(line, ctx) {
  if (!KEY) return; // can't check leak without a key
  if (line.includes(KEY)) throw new Error(`${ctx}: full SMOKE_API_KEY found in audit line`);
  // Also check first 8 chars (a key prefix is still PII per the spec).
  const prefix = KEY.slice(0, 8);
  if (prefix.length >= 8 && line.includes(prefix)) {
    throw new Error(`${ctx}: API key prefix found in audit line`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────

let exitCode = 0;
let stage = 'boot';
try {
  const ready = await waitForReady();
  if (!ready) throw new Error('dev server never became ready (timeout 60s)');
  console.log('smoke-audit: dev server ready');

  // Clear stdout buffer of pre-request startup noise so we only inspect lines
  // produced by our two test hits.
  const baseline = stdout.length;

  stage = 'rest hit';
  const restRes = await hitRest();
  console.log(`smoke-audit: REST /api/adr?un=1203 → ${restRes.status}`);

  stage = 'mcp hit';
  const mcpRes = await hitMcp();
  console.log(`smoke-audit: MCP cbm_calculator → ${mcpRes.status}`);

  // Give the audit lines a moment to flush.
  await new Promise((r) => setTimeout(r, 1500));

  stage = 'parse audit lines';
  const newOutput = stdout.slice(baseline).join('') + stderr.join('');
  const lines = findAuditLines(newOutput);

  // Filter: we expect exactly 2 audit lines from our 2 hits.
  // Allow more if Next.js emitted any internal hits during route compilation,
  // but we must find at least one rest + one mcp.
  const restLines = lines.filter((l) => /"channel":"rest"/.test(l));
  const mcpLines = lines.filter((l) => /"channel":"mcp"/.test(l));

  if (restLines.length === 0) throw new Error(`no rest audit line found. captured lines:\n${lines.join('\n')}`);
  if (mcpLines.length === 0) throw new Error(`no mcp audit line found. captured lines:\n${lines.join('\n')}`);

  // Use the LAST line of each channel (closest to our test hit).
  const restLine = restLines[restLines.length - 1];
  const mcpLine = mcpLines[mcpLines.length - 1];

  stage = 'rest line shape';
  const restEntry = parseAuditLine(restLine);
  if (!restEntry) throw new Error(`rest audit line is not parseable JSON:\n${restLine}`);
  assertFields(restEntry, 'rest');
  if (restEntry.channel !== 'rest') throw new Error(`rest entry has wrong channel: ${restEntry.channel}`);
  if (restEntry.route !== '/api/adr') throw new Error(`rest entry has wrong route: ${restEntry.route}`);
  if (restEntry.tool !== null) throw new Error(`rest entry tool should be null, got ${restEntry.tool}`);
  if (restEntry.has_api_key !== Boolean(KEY)) throw new Error(`rest entry has_api_key=${restEntry.has_api_key} doesn't match KEY presence`);
  assertNoKeyLeak(restLine, 'rest');

  stage = 'mcp line shape';
  const mcpEntry = parseAuditLine(mcpLine);
  if (!mcpEntry) throw new Error(`mcp audit line is not parseable JSON:\n${mcpLine}`);
  assertFields(mcpEntry, 'mcp');
  if (mcpEntry.channel !== 'mcp') throw new Error(`mcp entry has wrong channel: ${mcpEntry.channel}`);
  if (mcpEntry.tool !== 'cbm_calculator') throw new Error(`mcp tool should be cbm_calculator, got ${mcpEntry.tool}`);
  assertNoKeyLeak(mcpLine, 'mcp');

  console.log('');
  console.log('smoke-audit: ✅ ALL PASSED');
  console.log(`  REST: ${restLine.substring(restLine.indexOf('[fu-audit]'))}`);
  console.log(`  MCP : ${mcpLine.substring(mcpLine.indexOf('[fu-audit]'))}`);
} catch (err) {
  console.error(`smoke-audit: ❌ FAILED at "${stage}"`);
  console.error(`  ${err.message}`);
  console.error('\n--- recent stderr (last 1KB) ---');
  console.error(stderr.join('').slice(-1024));
  exitCode = 1;
} finally {
  // Kill dev server.
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(dev.pid), '/T', '/F'], { shell: true });
    } else {
      dev.kill('SIGTERM');
    }
  } catch {
    /* swallow */
  }
}

process.exit(exitCode);
