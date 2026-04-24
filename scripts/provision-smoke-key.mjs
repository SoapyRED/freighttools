#!/usr/bin/env node

/**
 * Provision a Pro-tier smoke-test API key and store it in three places:
 *   1. Vercel KV — the canonical key store (plan: "pro", so no rate limit
 *      interference for back-to-back smoke runs).
 *   2. Vercel env — as SMOKE_API_KEY across production/preview/development.
 *   3. .env.local — so local smoke runs see it immediately.
 *
 * Idempotent: if a key already exists for smoke-test@freightutils.com, it's
 * reused and its plan is refreshed to "pro".
 *
 * The key value is NEVER printed to stdout. Only status messages + a non-
 * reversible hash for audit.
 *
 * Required env (sourced from .env.local + .env.vercel-production):
 *   KV_REST_API_URL, KV_REST_API_TOKEN
 *   VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID
 */

import { randomBytes, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const REQUIRED = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'VERCEL_TOKEN', 'VERCEL_TEAM_ID', 'VERCEL_PROJECT_ID'];
for (const k of REQUIRED) {
  if (!process.env[k]) {
    console.error(`Missing required env: ${k}`);
    process.exit(1);
  }
}

const KV_URL = process.env.KV_REST_API_URL.replace(/\/$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

const SMOKE_EMAIL = 'smoke-test@freightutils.com';

function generateKey() {
  return 'fu_' + randomBytes(16).toString('hex');
}

function shortHash(s) {
  return createHash('sha256').update(s).digest('hex').slice(0, 10);
}

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV get ${key} failed: ${res.status}`);
  const { result } = await res.json();
  if (result === null || result === undefined) return null;
  try { return JSON.parse(result); } catch { return result; }
}

async function kvSet(key, value) {
  const body = JSON.stringify(value);
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`KV set ${key} failed: ${res.status} ${txt}`);
  }
}

async function vercelUpsertEnv(key, value) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        value,
        target: ['production', 'preview', 'development'],
        type: 'encrypted',
      }),
    }
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Vercel env upsert failed: ${res.status} ${txt}`);
  }
}

function upsertLocalEnv(key, value) {
  const path = '.env.local';
  let existing = '';
  if (existsSync(path)) existing = readFileSync(path, 'utf8');
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  const updated = re.test(existing)
    ? existing.replace(re, line)
    : existing.replace(/\s*$/, '\n') + line + '\n';
  writeFileSync(path, updated);
}

async function main() {
  console.log('Provisioning smoke-test API key...');

  const existing = await kvGet(`email:${SMOKE_EMAIL}`);
  let apiKey;
  if (typeof existing === 'string' && existing.startsWith('fu_')) {
    apiKey = existing;
    console.log(`  Existing key found for ${SMOKE_EMAIL} — reusing (hash: ${shortHash(apiKey)})`);
  } else {
    apiKey = generateKey();
    console.log(`  Generated new key (hash: ${shortHash(apiKey)})`);
  }

  const record = {
    email: SMOKE_EMAIL,
    plan: 'pro',
    created: new Date().toISOString(),
    use_case: 'scripts/smoke-test.mjs — CI smoke test',
  };

  await kvSet(`key:${apiKey}`, record);
  await kvSet(`email:${SMOKE_EMAIL}`, apiKey);
  console.log('  ✓ Written to Vercel KV (plan: pro, 50k req/month)');

  await vercelUpsertEnv('SMOKE_API_KEY', apiKey);
  console.log('  ✓ Upserted SMOKE_API_KEY in Vercel env (production/preview/development)');

  upsertLocalEnv('SMOKE_API_KEY', apiKey);
  console.log('  ✓ Upserted SMOKE_API_KEY in .env.local');

  console.log('\nDone. Smoke test can now read SMOKE_API_KEY and send it as X-API-Key.');
}

await main();
