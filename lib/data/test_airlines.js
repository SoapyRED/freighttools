/**
 * Airline Codes & AWB Prefix — API Test Suite
 *
 * Run:  node lib/data/test_airlines.js
 * Requires the Next.js dev server at http://localhost:3000
 */

const BASE = 'http://localhost:3000/api/airlines';

const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
const failures = [];

function assert(id, desc, ok, expected, actual) {
  if (ok) {
    passed++;
    console.log(`  ${GREEN}PASS${RESET}  Test ${id} - ${desc}`);
  } else {
    failed++;
    const msg = `Test ${id} - ${desc}`;
    failures.push(msg);
    console.log(`  ${RED}FAIL${RESET}  ${msg}`);
    console.log(`         Expected: ${JSON.stringify(expected)}`);
    console.log(`         Actual:   ${JSON.stringify(actual)}`);
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  return { status: res.status, body: await res.json() };
}

const KNOWN = [
  { name: 'Emirates',              iata: 'EK', prefix: '176', country: 'United Arab Emirates' },
  { name: 'British Airways',       iata: 'BA', prefix: '125', country: 'United Kingdom' },
  { name: 'Lufthansa',             iata: 'LH', prefix: '020', country: 'Germany' },
  { name: 'Turkish Airlines',      iata: 'TK', prefix: '235', country: 'Turkey' },
  { name: 'Qatar Airways',         iata: 'QR', prefix: '157', country: 'Qatar' },
  { name: 'Singapore Airlines',    iata: 'SQ', prefix: '618', country: 'Singapore' },
  { name: 'Cathay Pacific',        iata: 'CX', prefix: '160', country: 'Hong Kong' },
  { name: 'Korean Air',            iata: 'KE', prefix: '180', country: 'South Korea' },
  { name: 'Etihad Airways',        iata: 'EY', prefix: '607', country: 'United Arab Emirates' },
  { name: 'Delta Air Lines',       iata: 'DL', prefix: '006', country: 'United States' },
  { name: 'American Airlines',     iata: 'AA', prefix: '001', country: 'United States' },
  { name: 'United Airlines',       iata: 'UA', prefix: '016', country: 'United States' },
  { name: 'Air France',            iata: 'AF', prefix: '057', country: 'France' },
  { name: 'KLM',                   iata: 'KL', prefix: '074', country: 'Netherlands' },
  { name: 'Cargolux',              iata: 'CV', prefix: '172', country: 'Luxembourg' },
  { name: 'FedEx Express',         iata: 'FX', prefix: '023', country: 'United States' },
  { name: 'United Parcel Service', iata: '5X', prefix: '406', country: 'United States' },
  { name: 'AirBridge Cargo',       iata: 'RU', prefix: '580', country: 'Russia' },
  { name: 'Nippon Cargo Airlines', iata: 'KZ', prefix: '933', country: 'Japan' },
  { name: 'TAP Air Portugal',      iata: 'TP', prefix: '047', country: 'Portugal' },
];

async function runTests() {
  console.log(`\n${BOLD}Airline Codes & AWB Prefix - API Test Suite${RESET}\n`);
  console.log('-'.repeat(55));

  // IATA code -> AWB prefix verification
  for (let i = 0; i < KNOWN.length; i++) {
    const k = KNOWN[i];
    const { status, body } = await fetchJson(`${BASE}?iata=${k.iata}`);

    if (status !== 200 || !body.results || body.results.length === 0) {
      assert(`${i+1}a`, `${k.name} (IATA ${k.iata}) found`, false,
        { status: 200 }, { status, count: body.count });
      continue;
    }

    const match = body.results.find(r =>
      r.awb_prefix && r.awb_prefix.includes(k.prefix)
    ) || body.results[0];

    const hasPrefix = match.awb_prefix && match.awb_prefix.includes(k.prefix);
    assert(`${i+1}a`, `${k.name} IATA=${k.iata} has AWB prefix ${k.prefix}`,
      hasPrefix, { prefix: k.prefix }, { prefix: match.awb_prefix });
  }

  console.log('\n' + '-'.repeat(55));
  console.log(`${BOLD}Prefix reverse lookup${RESET}\n`);

  for (let i = 0; i < KNOWN.length; i++) {
    const k = KNOWN[i];
    const { status, body } = await fetchJson(`${BASE}?prefix=${k.prefix}`);

    if (status === 404 || !body.results) {
      assert(`P-${k.prefix}`, `Prefix ${k.prefix} found`, false, 'found', 'not found');
      continue;
    }

    const nameMatch = body.results.some(r =>
      r.airline_name.toLowerCase().includes(k.name.toLowerCase().split(' ')[0])
    );
    assert(`P-${k.prefix}`, `Prefix ${k.prefix} includes ${k.name}`,
      nameMatch, k.name, body.results.map(r => r.airline_name).join(', '));
  }

  console.log('\n' + '-'.repeat(55));
  console.log(`${BOLD}Smart search tests${RESET}\n`);

  // Partial name
  {
    const { body } = await fetchJson(`${BASE}?q=emir`);
    const found = body.results && body.results.some(r => r.airline_name === 'Emirates');
    assert('S1', '?q=emir returns Emirates', found, true, !!found);
  }

  // Country
  {
    const { body } = await fetchJson(`${BASE}?country=Germany`);
    const found = body.results && body.results.some(r => r.airline_name === 'Lufthansa');
    assert('S2', '?country=Germany includes Lufthansa', found, true, !!found);
  }

  // Non-existent prefix
  {
    const { status, body } = await fetchJson(`${BASE}?prefix=998`);
    assert('S3', '?prefix=998 returns 404 empty', status === 404 && body.count === 0,
      { status: 404, count: 0 }, { status, count: body.count });
  }

  // No params
  {
    const { status } = await fetchJson(`${BASE}`);
    assert('S4', 'No params returns 400', status === 400, 400, status);
  }

  // Smart: numeric "001"
  {
    const { body } = await fetchJson(`${BASE}?q=001`);
    const onlyAA = body.results && body.results.length === 1 &&
                   body.results[0].airline_name === 'American Airlines';
    assert('S5', '?q=001 returns only American Airlines',
      onlyAA, 'American Airlines only',
      body.results ? body.results.map(r => r.airline_name) : []);
  }

  // Smart: alpha "EK"
  {
    const { body } = await fetchJson(`${BASE}?q=EK`);
    const onlyEK = body.results && body.results.length === 1 &&
                   body.results[0].airline_name === 'Emirates';
    assert('S6', '?q=EK returns only Emirates',
      onlyEK, 'Emirates only',
      body.results ? body.results.map(r => r.airline_name) : []);
  }

  // Alias: UPS Airlines
  {
    const { body } = await fetchJson(`${BASE}?q=UPS+Airlines`);
    const found = body.results && body.results.some(r => r.airline_name === 'United Parcel Service');
    assert('S7', '?q=UPS Airlines finds United Parcel Service (alias)',
      found, true, body.results ? body.results.map(r => r.airline_name) : []);
  }

  // Alias: Tampa Cargo
  {
    const { body } = await fetchJson(`${BASE}?q=Tampa+Cargo`);
    const found = body.results && body.results.some(r => r.slug === 'avianca-cargo');
    assert('S8', '?q=Tampa Cargo finds Avianca Cargo (alias)',
      found, true, body.results ? body.results.map(r => r.airline_name) : []);
  }

  // Alias: FedEx
  {
    const { body } = await fetchJson(`${BASE}?q=FedEx`);
    const found = body.results && body.results.some(r => r.slug === 'fedex-express');
    assert('S9', '?q=FedEx finds FedEx Express (alias)',
      found, true, body.results ? body.results.map(r => r.airline_name) : []);
  }

  // Summary
  const total = passed + failed;
  console.log('\n' + '='.repeat(55));
  if (failed === 0) {
    console.log(`  ${GREEN}${BOLD}RESULTS: ${passed}/${total} passed, 0 failed${RESET}`);
  } else {
    console.log(`  ${RED}${BOLD}RESULTS: ${passed}/${total} passed, ${failed} failed${RESET}`);
    for (const f of failures) console.log(`  ${RED}x${RESET} ${f}`);
  }
  console.log('='.repeat(55) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(`${RED}Fatal error:${RESET}`, err.message);
  process.exit(2);
});
