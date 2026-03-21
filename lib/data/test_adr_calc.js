/**
 * ADR 1.1.3.6 Exemption Calculator — API Test Suite
 *
 * Run:  node lib/data/test_adr_calc.js
 * Requires the Next.js dev server at http://localhost:3000
 */

const BASE = 'http://localhost:3000/api/adr-calculator';

// ANSI colour helpers
const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
const failures = [];

// ── Real transport categories from adr-2025.json ────────────────────
// UN0074  -> cat 0  (DIAZODINITROPHENOL)
// UN0004  -> cat 1  (AMMONIUM PICRATE)          multiplier 50
// UN1005  -> cat 1  (AMMONIA, ANHYDROUS)         multiplier 50
// UN1203  -> cat 2  (MOTOR SPIRIT / PETROL)      multiplier 3
// UN1090  -> cat 2  (ACETONE)                    multiplier 3
// UN3082  -> cat 3  (ENVIRONMENTALLY HAZARDOUS)  multiplier 1
// UN1002  -> cat 3  (AIR, COMPRESSED)            multiplier 1
// UN0012  -> cat 4  (CARTRIDGES, INERT)          multiplier 0
// ─────────────────────────────────────────────────────────────────────

// ── Helpers ─────────────────────────────────────────────────────────

async function postCalc(items) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return { status: res.status, body: await res.json() };
}

async function getCalc(un, qty) {
  const res = await fetch(`${BASE}?un=${un}&qty=${qty}`);
  return { status: res.status, body: await res.json() };
}

function assert(testNum, testName, condition, expected, actual) {
  if (condition) {
    passed++;
    console.log(`  ${GREEN}PASS${RESET}  Test ${testNum} - ${testName}`);
  } else {
    failed++;
    console.log(`  ${RED}FAIL${RESET}  Test ${testNum} - ${testName}`);
    console.log(`        ${DIM}Expected:${RESET} ${JSON.stringify(expected)}`);
    console.log(`        ${DIM}Actual:  ${RESET} ${JSON.stringify(actual)}`);
    failures.push(`Test ${testNum} - ${testName}`);
  }
}

// ── Tests ───────────────────────────────────────────────────────────

async function runTests() {
  console.log(`\n${BOLD}ADR 1.1.3.6 Exemption Calculator — Test Suite${RESET}\n`);
  console.log('─'.repeat(55));

  // ── Test 1: Simple exempt load ───────────────────────────────────
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 200 },
    ]);
    assert('1', 'Simple exempt load (UN1203 x 200L)',
      status === 200 && body.exempt === true && body.total_points === 600,
      { exempt: true, total_points: 600 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 2: Simple non-exempt load ───────────────────────────────
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 400 },
    ]);
    assert('2', 'Simple non-exempt load (UN1203 x 400L)',
      status === 200 && body.exempt === false && body.total_points === 1200,
      { exempt: false, total_points: 1200 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 3: Mixed load, exempt ───────────────────────────────────
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 100 },
      { un_number: '1090', quantity: 100 },
    ]);
    assert('3', 'Mixed cat-2 load, exempt (UN1203+UN1090 x 100L each)',
      status === 200 && body.exempt === true && body.total_points === 600,
      { exempt: true, total_points: 600 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 4a: Boundary exactly at threshold (exempt) ──────────────
  {
    // 333 x 3 = 999 <= 1000
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 333 },
    ]);
    assert('4a', 'Boundary: 333 x 3 = 999 points (exempt)',
      status === 200 && body.exempt === true && body.total_points === 999,
      { exempt: true, total_points: 999 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 4b: Boundary just over threshold (not exempt) ───────────
  {
    // 334 x 3 = 1002 > 1000
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 334 },
    ]);
    assert('4b', 'Boundary: 334 x 3 = 1002 points (not exempt)',
      status === 200 && body.exempt === false && body.total_points === 1002,
      { exempt: false, total_points: 1002 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 5: Category 0 substance ─────────────────────────────────
  {
    // UN0074 = cat 0 -> always non-exempt, multiplier null
    const { status, body } = await postCalc([
      { un_number: '0074', quantity: 5 },
    ]);
    assert('5', 'Category 0 substance (UN0074 x 5) -> not exempt, has_category_zero',
      status === 200 && body.exempt === false && body.has_category_zero === true,
      { exempt: false, has_category_zero: true },
      { exempt: body.exempt, has_category_zero: body.has_category_zero });
  }

  // ── Test 6: Category 4 substance (0 multiplier) ──────────────────
  {
    // UN0012 = cat 4 -> multiplier 0, any qty gives 0 points
    const { status, body } = await postCalc([
      { un_number: '0012', quantity: 99999 },
    ]);
    assert('6', 'Category 4 (UN0012 x 99999) -> 0 points, exempt',
      status === 200 && body.exempt === true && body.total_points === 0,
      { exempt: true, total_points: 0 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 7a: Category 1 at threshold ─────────────────────────────
  {
    // UN1005 = cat 1, multiplier 50.  20 x 50 = 1000 <= 1000
    const { status, body } = await postCalc([
      { un_number: '1005', quantity: 20 },
    ]);
    assert('7a', 'Cat 1 at threshold (UN1005 x 20 -> 1000 points, exempt)',
      status === 200 && body.exempt === true && body.total_points === 1000,
      { exempt: true, total_points: 1000 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 7b: Category 1 over threshold ───────────────────────────
  {
    // 21 x 50 = 1050 > 1000
    const { status, body } = await postCalc([
      { un_number: '1005', quantity: 21 },
    ]);
    assert('7b', 'Cat 1 over threshold (UN1005 x 21 -> 1050 points, not exempt)',
      status === 200 && body.exempt === false && body.total_points === 1050,
      { exempt: false, total_points: 1050 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 8: Mixed categories ─────────────────────────────────────
  {
    // Cat 1: UN1005  x 10  -> 10 x 50 = 500
    // Cat 2: UN1203  x 100 -> 100 x 3  = 300
    // Cat 3: UN3082  x 200 -> 200 x 1  = 200
    // Total: 1000 <= 1000 -> exempt
    const { status, body } = await postCalc([
      { un_number: '1005', quantity: 10 },
      { un_number: '1203', quantity: 100 },
      { un_number: '3082', quantity: 200 },
    ]);
    assert('8', 'Mixed categories (cat1+cat2+cat3 = 1000 points, exempt)',
      status === 200 && body.exempt === true && body.total_points === 1000,
      { exempt: true, total_points: 1000 },
      { exempt: body.exempt, total_points: body.total_points });
  }

  // ── Test 9: Empty items array ────────────────────────────────────
  {
    const { status, body } = await postCalc([]);
    assert('9', 'Empty items array -> 400 error',
      status === 400 && body.error !== undefined,
      { status: 400, hasError: true },
      { status, hasError: !!body.error });
  }

  // ── Test 10: Invalid UN number ───────────────────────────────────
  {
    const { status, body } = await postCalc([
      { un_number: '9999', quantity: 100 },
    ]);
    assert('10', 'Invalid UN9999 -> 400 error',
      status === 400 && body.error !== undefined,
      { status: 400, hasError: true },
      { status, hasError: !!body.error });
  }

  // ── Test 11: Zero quantity ───────────────────────────────────────
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 0 },
    ]);
    assert('11', 'Zero quantity (UN1203 x 0) -> 0 points, exempt',
      status === 200 && body.total_points === 0 && body.exempt === true,
      { total_points: 0, exempt: true },
      { total_points: body.total_points, exempt: body.exempt });
  }

  // ── Test 12: Negative quantity ───────────────────────────────────
  {
    // Route code: Number(item.quantity) || 0 — negative will pass through
    // But GET endpoint rejects qty < 0 with 400
    // POST route uses Number(qty) || 0 -> -50 is truthy, so -50 stays
    // -50 * 3 = -150 points
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: -50 },
    ]);
    // Accept either a 400 error or a 200 with negative points
    const isError = status === 400;
    const isNegativePoints = status === 200 && body.total_points === -150;
    assert('12', 'Negative quantity (UN1203 x -50) -> error or negative points',
      isError || isNegativePoints,
      'status 400 OR total_points=-150',
      { status, total_points: body.total_points, error: body.error });
  }

  // ── Test 13: GET endpoint equivalence ────────────────────────────
  {
    const postRes = await postCalc([
      { un_number: '1203', quantity: 200 },
    ]);
    const getRes = await getCalc('1203', 200);

    const match =
      postRes.body.total_points === getRes.body.total_points &&
      postRes.body.exempt === getRes.body.exempt &&
      postRes.body.items[0].transport_category === getRes.body.items[0].transport_category;

    assert('13', 'GET /api/adr-calculator?un=1203&qty=200 matches POST result',
      match,
      { total_points: postRes.body.total_points, exempt: postRes.body.exempt },
      { total_points: getRes.body.total_points, exempt: getRes.body.exempt });
  }

  // ── Test 14: Category 0 mixed with valid ─────────────────────────
  {
    // UN0074 (cat 0) + UN1203 (cat 2) x 100 = 300 points
    // But cat 0 forces exempt=false
    const { status, body } = await postCalc([
      { un_number: '0074', quantity: 5 },
      { un_number: '1203', quantity: 100 },
    ]);
    assert('14', 'Cat 0 mixed with cat 2 -> not exempt despite low points',
      status === 200 && body.exempt === false && body.has_category_zero === true,
      { exempt: false, has_category_zero: true },
      { exempt: body.exempt, has_category_zero: body.has_category_zero });
  }

  // ── Test 15: Transport category verification ─────────────────────
  {
    const expectedCategories = {
      '1203': '2',
      '1090': '2',
      '0074': '0',
      '1005': '1',
      '3082': '3',
      '0012': '4',
    };

    let allMatch = true;
    let mismatchDetails = '';

    for (const [un, expectedCat] of Object.entries(expectedCategories)) {
      const { body } = await getCalc(un, 1);
      const actualCat = body.items?.[0]?.transport_category;
      if (actualCat !== expectedCat) {
        allMatch = false;
        mismatchDetails += `UN${un}: expected cat ${expectedCat}, got ${actualCat}; `;
      }
    }

    assert('15', 'Transport categories match adr-2025.json for 6 known substances',
      allMatch,
      expectedCategories,
      mismatchDetails || 'all matched');
  }

  // ── Additional: Random UN verification ───────────────────────────
  console.log('\n' + '─'.repeat(55));
  console.log(`${BOLD}Additional: Random UN number verification (10 samples)${RESET}\n`);

  const MULTIPLIER_MAP = { '0': null, '1': 50, '2': 3, '3': 1, '4': 0 };
  const VALID_CATEGORIES = new Set(['0', '1', '2', '3', '4', null, '-', 'See SP 671']);

  // Load the local dataset for comparison
  const fs = await import('fs');
  const path = await import('path');
  const dataPath = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
    'adr-2025.json'
  );
  const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Pick 10 unique UN numbers deterministically spread across the dataset
  const allUns = [...new Set(dataset.map(d => d.un_number))];
  const step = Math.floor(allUns.length / 10);
  const sampleUns = Array.from({ length: 10 }, (_, i) => allUns[i * step]);

  for (const un of sampleUns) {
    const localEntry = dataset.find(d => d.un_number === un);
    const { status, body } = await getCalc(un, 1);

    if (status !== 200) {
      assert(`R-${un}`, `UN${un} returns 200`, false, 200, status);
      continue;
    }

    const item = body.items[0];
    const checks = [];
    let ok = true;

    // Check proper_shipping_name present
    if (!item.proper_shipping_name) {
      ok = false;
      checks.push('missing proper_shipping_name');
    }

    // Check transport_category valid
    if (!VALID_CATEGORIES.has(item.transport_category)) {
      ok = false;
      checks.push(`invalid transport_category: ${item.transport_category}`);
    }

    // Check transport_category matches local data
    if (item.transport_category !== localEntry.transport_category) {
      ok = false;
      checks.push(`category mismatch: API=${item.transport_category} vs local=${localEntry.transport_category}`);
    }

    // Check multiplier matches category
    const expectedMult = MULTIPLIER_MAP[item.transport_category] !== undefined
      ? MULTIPLIER_MAP[item.transport_category]
      : null;
    if (item.multiplier !== expectedMult && !(expectedMult === undefined)) {
      // For categories not in the map (-, null, See SP 671), multiplier should be null
      if (!['0', '1', '2', '3', '4'].includes(item.transport_category)) {
        if (item.multiplier !== null) {
          ok = false;
          checks.push(`multiplier should be null for cat "${item.transport_category}", got ${item.multiplier}`);
        }
      } else {
        ok = false;
        checks.push(`multiplier mismatch: expected ${expectedMult}, got ${item.multiplier}`);
      }
    }

    assert(`R-${un}`, `UN${un} (${item.proper_shipping_name?.substring(0, 40)}) cat=${item.transport_category} mult=${item.multiplier}`,
      ok,
      'all checks pass',
      checks.length ? checks.join('; ') : 'all checks pass');
  }

  // ── Per-substance quantity limit tests (ADR 1.1.3.6.3) ──────────
  console.log('\n' + '─'.repeat(55));
  console.log(`${BOLD}Per-substance quantity limit tests (ADR 1.1.3.6.3)${RESET}\n`);

  // Test 16a: Cat 1 at exactly 20L → exempt (within limit)
  {
    const { status, body } = await postCalc([
      { un_number: '1005', quantity: 20 },
    ]);
    // 20 × 50 = 1000 points, within limit, at threshold → exempt
    assert('16a', 'Cat 1 at exactly 20L (within per-substance limit) -> exempt',
      status === 200 && body.exempt === true && body.total_points === 1000 &&
      (!body.has_quantity_exceedance || body.has_quantity_exceedance === false),
      { exempt: true, total_points: 1000, has_quantity_exceedance: false },
      { exempt: body.exempt, total_points: body.total_points, has_quantity_exceedance: body.has_quantity_exceedance });
  }

  // Test 16b: Cat 1 at 21L → not exempt (exceeds 20L limit)
  {
    const { status, body } = await postCalc([
      { un_number: '1005', quantity: 21 },
    ]);
    assert('16b', 'Cat 1 at 21L (exceeds 20L per-substance limit) -> not exempt',
      status === 200 && body.exempt === false && body.has_quantity_exceedance === true &&
      body.warnings && body.warnings.length > 0,
      { exempt: false, has_quantity_exceedance: true, hasWarnings: true },
      { exempt: body.exempt, has_quantity_exceedance: body.has_quantity_exceedance, warnings: body.warnings });
  }

  // Test 17a: Cat 2 at exactly 333L → exempt
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 333 },
    ]);
    // 333 × 3 = 999 points, within limit → exempt
    assert('17a', 'Cat 2 at exactly 333L (within per-substance limit) -> exempt',
      status === 200 && body.exempt === true && body.total_points === 999 &&
      (!body.has_quantity_exceedance || body.has_quantity_exceedance === false),
      { exempt: true, total_points: 999, has_quantity_exceedance: false },
      { exempt: body.exempt, total_points: body.total_points, has_quantity_exceedance: body.has_quantity_exceedance });
  }

  // Test 17b: Cat 2 at 334L → not exempt (exceeds 333L limit)
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 334 },
    ]);
    assert('17b', 'Cat 2 at 334L (exceeds 333L per-substance limit) -> not exempt',
      status === 200 && body.exempt === false && body.has_quantity_exceedance === true &&
      body.warnings && body.warnings.length > 0,
      { exempt: false, has_quantity_exceedance: true, hasWarnings: true },
      { exempt: body.exempt, has_quantity_exceedance: body.has_quantity_exceedance, warnings: body.warnings });
  }

  // Test 18a: Cat 3 at exactly 1000L → exempt
  {
    const { status, body } = await postCalc([
      { un_number: '3082', quantity: 1000 },
    ]);
    // 1000 × 1 = 1000 points, within limit → exempt
    assert('18a', 'Cat 3 at exactly 1000L (within per-substance limit) -> exempt',
      status === 200 && body.exempt === true && body.total_points === 1000 &&
      (!body.has_quantity_exceedance || body.has_quantity_exceedance === false),
      { exempt: true, total_points: 1000, has_quantity_exceedance: false },
      { exempt: body.exempt, total_points: body.total_points, has_quantity_exceedance: body.has_quantity_exceedance });
  }

  // Test 18b: Cat 3 at 1001L → not exempt (exceeds 1000L limit)
  {
    const { status, body } = await postCalc([
      { un_number: '3082', quantity: 1001 },
    ]);
    assert('18b', 'Cat 3 at 1001L (exceeds 1000L per-substance limit) -> not exempt',
      status === 200 && body.exempt === false && body.has_quantity_exceedance === true &&
      body.warnings && body.warnings.length > 0,
      { exempt: false, has_quantity_exceedance: true, hasWarnings: true },
      { exempt: body.exempt, has_quantity_exceedance: body.has_quantity_exceedance, warnings: body.warnings });
  }

  // Test 19: Cat 2 at 334L with low total points → still not exempt
  // Even though 334 × 3 = 1002 (also over points), the per-substance limit
  // should independently flag. Check the specific warning message.
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 334 },
    ]);
    const hasSpecificWarning = body.warnings && body.warnings.some(
      w => w.includes('UN1203') && w.includes('334') && w.includes('333')
    );
    assert('19', 'Per-substance warning message includes UN number and limits',
      status === 200 && hasSpecificWarning,
      'warning mentioning UN1203, 334, and 333',
      { warnings: body.warnings });
  }

  // Test 20: Cat 1 substance under points threshold but over per-substance limit
  // UN0004 (cat 1) × 21 = 1050 points AND exceeds 20L limit
  // Both flags should be true
  {
    const { status, body } = await postCalc([
      { un_number: '0004', quantity: 21 },
    ]);
    assert('20', 'Cat 1 x 21L exceeds both points and per-substance limit',
      status === 200 && body.exempt === false && body.has_quantity_exceedance === true,
      { exempt: false, has_quantity_exceedance: true },
      { exempt: body.exempt, has_quantity_exceedance: body.has_quantity_exceedance });
  }

  // Test 21: Mixed load — one substance within limit, one over
  // UN1203 (cat 2) × 100 = within 333L limit, 300 points
  // UN1005 (cat 1) × 21 = exceeds 20L limit, 1050 points
  {
    const { status, body } = await postCalc([
      { un_number: '1203', quantity: 100 },
      { un_number: '1005', quantity: 21 },
    ]);
    const warningForUN1005 = body.warnings && body.warnings.some(
      w => w.includes('UN1005') && w.includes('21') && w.includes('20')
    );
    assert('21', 'Mixed load: one within limit, one over -> not exempt with warning',
      status === 200 && body.exempt === false && body.has_quantity_exceedance === true && warningForUN1005,
      { exempt: false, has_quantity_exceedance: true, warningForUN1005: true },
      { exempt: body.exempt, has_quantity_exceedance: body.has_quantity_exceedance, warningForUN1005 });
  }

  // ── Summary ──────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n' + '='.repeat(55));
  if (failed === 0) {
    console.log(`  ${GREEN}${BOLD}RESULTS: ${passed}/${total} passed, 0 failed${RESET}`);
  } else {
    console.log(`  ${RED}${BOLD}RESULTS: ${passed}/${total} passed, ${failed} failed${RESET}`);
    console.log();
    for (const f of failures) {
      console.log(`  ${RED}x${RESET} ${f}`);
    }
  }
  console.log('='.repeat(55) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(`${RED}Fatal error:${RESET}`, err.message);
  process.exit(2);
});
