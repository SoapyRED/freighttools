#!/usr/bin/env node

/**
 * FreightUtils API Smoke Test
 *
 * Hits every API endpoint with known inputs, validates responses.
 * Run: node scripts/smoke-test.mjs
 * Optional: node scripts/smoke-test.mjs https://localhost:3000
 */

const BASE = process.argv[2] || 'https://www.freightutils.com';
const results = [];
let passed = 0;
let failed = 0;

async function test(name, url, opts = {}) {
  const { method = 'GET', body, expect: checks = {} } = opts;
  const start = Date.now();

  try {
    const fetchOpts = { method, headers: { 'Accept': 'application/json' } };
    if (body) {
      fetchOpts.headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE}${url}`, fetchOpts);
    const ms = Date.now() - start;
    const json = await res.json();

    const errors = [];

    // Status check
    const expectedStatus = checks.status || 200;
    if (res.status !== expectedStatus) errors.push(`status ${res.status} !== ${expectedStatus}`);

    // Field checks
    if (checks.hasField) {
      for (const field of [].concat(checks.hasField)) {
        const val = field.split('.').reduce((o, k) => o?.[k], json);
        if (val === undefined || val === null) errors.push(`missing field: ${field}`);
      }
    }

    // Value checks
    if (checks.fieldEquals) {
      for (const [path, expected] of Object.entries(checks.fieldEquals)) {
        const val = field(json, path);
        if (val !== expected) errors.push(`${path}: ${val} !== ${expected}`);
      }
    }

    // Numeric range checks
    if (checks.fieldGt) {
      for (const [path, min] of Object.entries(checks.fieldGt)) {
        const val = field(json, path);
        if (typeof val !== 'number' || val <= min) errors.push(`${path}: ${val} not > ${min}`);
      }
    }

    // Contains check (string field contains substring)
    if (checks.fieldContains) {
      for (const [path, substr] of Object.entries(checks.fieldContains)) {
        const val = String(field(json, path) || '');
        if (!val.toLowerCase().includes(substr.toLowerCase())) errors.push(`${path} doesn't contain "${substr}"`);
      }
    }

    // Timeout check
    if (ms > 5000) errors.push(`slow: ${ms}ms`);

    if (errors.length === 0) {
      const preview = checks.preview ? String(field(json, checks.preview)).substring(0, 40) : '';
      console.log(`  \x1b[32m✅\x1b[0m ${name} — ${res.status} — ${preview || 'OK'} (${ms}ms)`);
      passed++;
    } else {
      console.log(`  \x1b[31m❌\x1b[0m ${name} — ${res.status} — ${errors.join(', ')} (${ms}ms)`);
      failed++;
    }

    results.push({ name, status: res.status, ms, errors, ok: errors.length === 0 });
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`  \x1b[31m❌\x1b[0m ${name} — NETWORK ERROR: ${err.message} (${ms}ms)`);
    failed++;
    results.push({ name, status: 0, ms, errors: [err.message], ok: false });
  }
}

function field(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

async function testPage(name, url, expectedStatus = 200) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${url}`, { method: 'GET', headers: { 'Accept': 'text/html' }, redirect: 'manual' });
    const ms = Date.now() - start;
    const errors = [];
    if (res.status !== expectedStatus) errors.push(`status ${res.status} !== ${expectedStatus}`);
    if (ms > 5000) errors.push(`slow: ${ms}ms`);
    if (errors.length === 0) {
      console.log(`  \x1b[32m✅\x1b[0m ${name} — ${res.status} — OK (${ms}ms)`);
      passed++;
    } else {
      console.log(`  \x1b[31m❌\x1b[0m ${name} — ${res.status} — ${errors.join(', ')} (${ms}ms)`);
      failed++;
    }
    results.push({ name, status: res.status, ms, errors, ok: errors.length === 0 });
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`  \x1b[31m❌\x1b[0m ${name} — NETWORK ERROR: ${err.message} (${ms}ms)`);
    failed++;
    results.push({ name, status: 0, ms, errors: [err.message], ok: false });
  }
}

// ─── Test Suite ──────────────────────────────────────────────────

async function run() {
  console.log(`\n  FreightUtils API Smoke Test`);
  console.log(`  Base: ${BASE}\n`);

  console.log('  Freight Calculators');
  console.log('  ─────────────────');

  await test('/api/ldm', '/api/ldm?pallet=euro&qty=10', {
    expect: { hasField: 'ldm', fieldGt: { ldm: 0 }, preview: 'ldm' },
  });

  await test('/api/cbm', '/api/cbm?l=120&w=80&h=100', {
    expect: { hasField: ['total_cbm', 'cubic_feet'], preview: 'total_cbm' },
  });

  await test('/api/chargeable-weight', '/api/chargeable-weight?l=120&w=80&h=100&gw=500', {
    expect: { hasField: 'chargeable_weight_kg', preview: 'chargeable_weight_kg' },
  });

  await test('/api/pallet', '/api/pallet?pl=120&pw=80&pmh=220&bl=40&bw=30&bh=25', {
    expect: { hasField: ['total_boxes', 'layers'], fieldGt: { boxes_per_layer: 0 }, preview: 'total_boxes' },
  });

  await test('/api/containers', '/api/containers?type=40ft-high-cube', {
    expect: { hasField: 'slug', preview: 'name' },
  });

  await test('/api/convert', '/api/convert?value=100&from=kg&to=lbs', {
    expect: { hasField: 'result.value', preview: 'result.value' },
  });

  await test('/api/consignment', '/api/consignment', {
    method: 'POST',
    body: { mode: 'air', items: [{ length: 60, width: 40, height: 30, grossWeight: 25, quantity: 2 }] },
    expect: { hasField: ['totals', 'mode'], preview: 'mode' },
  });

  console.log('\n  Reference Data & Compliance');
  console.log('  ──────────────────────────');

  await test('/api/adr', '/api/adr?un=1203', {
    expect: { hasField: 'results', fieldGt: { count: 0 }, preview: 'results.0.proper_shipping_name' },
  });

  await test('/api/adr-calculator', '/api/adr-calculator?un=1203&qty=200', {
    expect: { hasField: ['total_points', 'exempt'], preview: 'total_points' },
  });

  await test('/api/adr/lq-check', '/api/adr/lq-check', {
    method: 'POST',
    body: { mode: 'lq', items: [{ un_number: '1203', quantity: 0.5, unit: 'L' }] },
    expect: { hasField: ['overall_status', 'items'], preview: 'overall_status' },
  });

  await test('/api/hs', '/api/hs?q=coffee', {
    expect: { hasField: 'results', fieldGt: { count: 0 }, preview: 'count' },
  });

  await test('/api/incoterms', '/api/incoterms?code=FOB', {
    expect: { hasField: ['code', 'name'], preview: 'name' },
  });

  await test('/api/duty', '/api/duty', {
    method: 'POST',
    body: { commodityCode: '090111', originCountry: 'BR', customsValue: 5000 },
    expect: { hasField: 'commodityCode' },
  });

  await test('/api/airlines', '/api/airlines?prefix=176', {
    expect: { hasField: 'results', fieldGt: { count: 0 }, preview: 'results.0.airline_name' },
  });

  await test('/api/unlocode', '/api/unlocode?q=rotterdam', {
    expect: { hasField: 'results', fieldGt: { count: 0 }, preview: 'results.0.name' },
  });

  await test('/api/uld', '/api/uld?type=AKE', {
    expect: { hasField: 'result.code', preview: 'result.name' },
  });

  await test('/api/vehicles', '/api/vehicles?category=van', {
    expect: { hasField: 'results', fieldGt: { count: 0 }, preview: 'count' },
  });

  console.log('\n  Infrastructure');
  console.log('  ─────────────');

  await test('/api/health', '/api/health', {
    expect: { hasField: ['status', 'version', 'tools'], fieldContains: { status: 'ok' }, preview: 'version' },
  });

  await test('/api/tools', '/api/tools', {
    expect: { hasField: ['count', 'tools'], fieldGt: { count: 15 }, preview: 'count' },
  });

  console.log('\n  Platform Pages');
  console.log('  ──────────────');

  await testPage('/changelog',         '/changelog');
  await testPage('/status',            '/status');
  await testPage('/roadmap',           '/roadmap');
  await testPage('/docs/versioning',   '/docs/versioning');
  await testPage('/docs/deprecation',  '/docs/deprecation');

  // ─── Summary ──────────────────────────────────────────────────

  const total = passed + failed;
  console.log(`\n  ────────────────────────────`);
  if (failed === 0) {
    console.log(`  \x1b[32m✅ ALL PASSED: ${passed}/${total}\x1b[0m`);
  } else {
    console.log(`  \x1b[31m❌ RESULT: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

run();
