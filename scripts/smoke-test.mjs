#!/usr/bin/env node

/**
 * FreightUtils API Smoke Test
 *
 * Hits every API endpoint with known inputs, validates responses.
 * Run: node scripts/smoke-test.mjs
 * Optional: node scripts/smoke-test.mjs https://localhost:3000
 */

const BASE = process.argv[2] || 'https://www.freightutils.com';
const SMOKE_API_KEY = process.env.SMOKE_API_KEY;
const AUTH_HEADERS = SMOKE_API_KEY ? { 'X-API-Key': SMOKE_API_KEY } : {};
if (!SMOKE_API_KEY) {
  console.warn('  \x1b[33m⚠\x1b[0m SMOKE_API_KEY not set — running anonymously (25/day anon cap applies)');
}

const results = [];
let passed = 0;
let failed = 0;

async function test(name, url, opts = {}) {
  const { method = 'GET', body, expect: checks = {} } = opts;
  const start = Date.now();

  try {
    const fetchOpts = { method, headers: { 'Accept': 'application/json', ...AUTH_HEADERS } };
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

async function testApexRedirect() {
  const start = Date.now();
  try {
    const apexHost = BASE.replace(/^https?:\/\/www\./, 'https://');
    if (apexHost === BASE) {
      console.log(`  \x1b[33m⏭\x1b[0m apex redirect — skipped (BASE has no www)`);
      return;
    }
    const apexUrl = apexHost + '/ldm';
    const res = await fetch(apexUrl, { method: 'GET', redirect: 'manual' });
    const ms = Date.now() - start;
    const errors = [];
    if (res.status < 300 || res.status >= 400) errors.push(`status ${res.status} — expected 301/308`);
    if (res.status !== 301 && res.status !== 308) errors.push(`status ${res.status} — want 301 or 308, not temporary`);
    const loc = res.headers.get('location') || '';
    if (!loc.startsWith('https://www.')) errors.push(`location not www: ${loc}`);
    if (errors.length === 0) {
      console.log(`  \x1b[32m✅\x1b[0m apex redirect — ${res.status} → ${loc} (${ms}ms)`);
      passed++;
    } else {
      console.log(`  \x1b[31m❌\x1b[0m apex redirect — ${errors.join(', ')} (${ms}ms)`);
      failed++;
    }
  } catch (err) {
    console.log(`  \x1b[31m❌\x1b[0m apex redirect — ERROR: ${err.message}`);
    failed++;
  }
}

async function testSitemapCanonical() {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/sitemap.xml`);
    const ms = Date.now() - start;
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const apexForm = locs.filter(u => /^https?:\/\/freightutils\.com/.test(u));
    const wwwForm  = locs.filter(u => /^https?:\/\/www\.freightutils\.com/.test(u));
    const errors = [];
    if (res.status !== 200) errors.push(`status ${res.status} !== 200`);
    if (locs.length === 0) errors.push('no <loc> entries found');
    if (apexForm.length > 0) errors.push(`${apexForm.length} apex-form URLs (expected 0)`);
    if (wwwForm.length === 0) errors.push('no www-form URLs');
    if (errors.length === 0) {
      console.log(`  \x1b[32m✅\x1b[0m sitemap canonical form — ${wwwForm.length} www URLs, 0 apex (${ms}ms)`);
      passed++;
    } else {
      console.log(`  \x1b[31m❌\x1b[0m sitemap canonical form — ${errors.join(', ')} (${ms}ms)`);
      failed++;
    }
  } catch (err) {
    console.log(`  \x1b[31m❌\x1b[0m sitemap canonical form — ERROR: ${err.message}`);
    failed++;
  }
}

async function testDetailTitlesSingleSuffix() {
  const urls = ['/adr/un/1203', '/hs/code/611241', '/incoterms/fob-free-on-board', '/pallet/euro-pallet', '/containers/40ft-high-cube'];
  const start = Date.now();
  let checkedCount = 0;
  let singleSuffixCount = 0;
  const failures = [];
  for (const path of urls) {
    try {
      const res = await fetch(`${BASE}${path}`, { headers: { 'User-Agent': 'freightutils-smoke-test/1.0' } });
      if (res.status !== 200) continue;
      const html = await res.text();
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (!titleMatch) continue;
      const title = titleMatch[1];
      const suffixCount = (title.match(/FreightUtils\.com/g) || []).length;
      checkedCount++;
      if (suffixCount === 1) {
        singleSuffixCount++;
      } else {
        failures.push(`${path} — "${title}" (${suffixCount} suffixes)`);
      }
    } catch {
      // skip
    }
  }
  const ms = Date.now() - start;
  const errors = [];
  if (checkedCount < 3) errors.push(`only ${checkedCount} detail pages checked (need 3+)`);
  if (singleSuffixCount < 3) errors.push(`only ${singleSuffixCount}/${checkedCount} titles have single suffix`);
  if (errors.length === 0) {
    console.log(`  \x1b[32m✅\x1b[0m detail titles single-suffix — ${singleSuffixCount}/${checkedCount} clean (${ms}ms)`);
    passed++;
  } else {
    console.log(`  \x1b[31m❌\x1b[0m detail titles single-suffix — ${errors.join(', ')} (${ms}ms)`);
    for (const f of failures) console.log(`      · ${f}`);
    failed++;
  }
}

function collectCamelCaseKeys(obj, path = '', acc = []) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) collectCamelCaseKeys(obj[i], `${path}[${i}]`, acc);
  } else if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (/[A-Z]/.test(k)) acc.push(path ? `${path}.${k}` : k);
      collectCamelCaseKeys(obj[k], path ? `${path}.${k}` : k, acc);
    }
  }
  return acc;
}

async function testSnakeCaseOnly(name, url, opts = {}) {
  const start = Date.now();
  try {
    const fetchOpts = { method: opts.method || 'GET', headers: { 'Accept': 'application/json', ...AUTH_HEADERS } };
    if (opts.body) {
      fetchOpts.headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(`${BASE}${url}`, fetchOpts);
    const ms = Date.now() - start;
    const json = await res.json();
    const camelKeys = collectCamelCaseKeys(json);
    const errors = [];
    if (res.status !== 200) errors.push(`status ${res.status} !== 200`);
    if (camelKeys.length > 0) {
      const sample = camelKeys.slice(0, 5).join(', ');
      const more = camelKeys.length > 5 ? ` (+${camelKeys.length - 5} more)` : '';
      errors.push(`camelCase keys: ${sample}${more}`);
    }
    if (errors.length === 0) {
      console.log(`  \x1b[32m✅\x1b[0m ${name} — snake_case only — ${res.status} (${ms}ms)`);
      passed++;
    } else {
      console.log(`  \x1b[31m❌\x1b[0m ${name} — ${errors.join(', ')} (${ms}ms)`);
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

async function testPage(name, url, expectedStatus = 200) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${url}`, { method: 'GET', headers: { 'Accept': 'text/html', ...AUTH_HEADERS }, redirect: 'manual' });
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
    body: { commodity_code: '090111', origin_country: 'BR', customs_value: 5000 },
    expect: { hasField: 'commodity_code' },
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

  console.log('\n  API Casing — snake_case-only guard (post-migration)');
  console.log('  ────────────────────────────────────────────────────');

  await testSnakeCaseOnly('/api/unlocode',   '/api/unlocode?q=rotterdam');
  await testSnakeCaseOnly('/api/uld',        '/api/uld?type=AKE');
  await testSnakeCaseOnly('/api/containers', '/api/containers?type=40ft-high-cube');
  await testSnakeCaseOnly('/api/vehicles',   '/api/vehicles?category=van');
  await testSnakeCaseOnly('/api/consignment', '/api/consignment', {
    method: 'POST',
    body: { mode: 'air', items: [{ length: 60, width: 40, height: 30, grossWeight: 25, quantity: 2 }] },
  });
  await testSnakeCaseOnly('/api/duty', '/api/duty', {
    method: 'POST',
    body: { commodity_code: '090111', origin_country: 'BR', customs_value: 5000 },
  });

  console.log('\n  Platform Pages');
  console.log('  ──────────────');

  await testPage('/changelog',         '/changelog');
  await testPage('/status',            '/status');
  await testPage('/roadmap',           '/roadmap');
  await testPage('/docs/versioning',   '/docs/versioning');
  await testPage('/docs/deprecation',  '/docs/deprecation');

  console.log('\n  SEO Hygiene');
  console.log('  ───────────');

  await testApexRedirect();
  await testSitemapCanonical();
  await testDetailTitlesSingleSuffix();

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

await run();
