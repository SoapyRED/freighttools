#!/usr/bin/env node
/**
 * fetch-hmrc-locations.mjs
 *
 * Scrape the HMRC Appendix 16D (ITSF) and 16F (ETSF) landing pages on GOV.UK,
 * download the current ODS attachments, parse them, decompose each Location
 * Code, and emit three JSON files:
 *
 *   data/hmrc-itsf-locations.json
 *   data/hmrc-etsf-locations.json
 *   data/hmrc-changelog.json          (combined, sorted by date desc)
 *
 * Attribution: Contains public sector information licensed under the
 * Open Government Licence v3.0. Source: HM Revenue & Customs.
 *
 * Usage:  node scripts/fetch-hmrc-locations.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(REPO_ROOT, 'data');

const SOURCES = {
  itsf: {
    key: 'itsf',
    label: 'Internal Temporary Storage Facilities (Appendix 16D)',
    landing:
      'https://www.gov.uk/government/publications/internal-temporary-storage-facilities-itsfs-codes-for-data-element-523-of-the-customs-declaration-service',
    ni_column_regexes: [/^northern ireland/i],
    expected_total: 100,
    expected_lhr: 21,
    out_file: 'hmrc-itsf-locations.json',
  },
  etsf: {
    key: 'etsf',
    label: 'External Temporary Storage Facilities (Appendix 16F)',
    landing:
      'https://www.gov.uk/government/publications/external-temporary-storage-facilities-codes-for-data-element-523-of-the-customs-declaration-service',
    ni_column_regexes: [/^northern ireland/i],
    expected_total: 700,
    expected_lhr: 196,
    out_file: 'hmrc-etsf-locations.json',
  },
};

// GBAULHRLHRWXS    -> GB + AU + LHR + LHR + WXS           (3-char suffix, typical)
// GBAULHRLHRCFL1   -> GB + AU + LHR + LHR + CFL1          (4-char suffix, rare)
// GBAULALLHRRMGWDC -> GB + AU + LAL + LHR + RMGWDC        (6-char suffix, Royal Mail)
// GBAUTFKMANMCS1CNS-> GB + AU + TFK + MAN + MCS1CNS       (7-char suffix, CNS-appended)
// Prefix can be AU or GB (historic). Suffix is 3-8 alphanumerics.
const CODE_RE = /^GB(AU|GB)([A-Z0-9]{3})([A-Z]{3})([A-Z0-9]{3,8})$/;

// Match any .ods attachment on the assets.publishing.service.gov.uk CDN
// href form: /media/<hash>/<slug>.ods
const ODS_HREF_RE =
  /https:\/\/assets\.publishing\.service\.gov\.uk\/media\/[a-z0-9]+\/[^"'\s]+?\.ods/gi;

// ──────────────────────────────────────────────────────────────────────

async function httpGet(url, { asBuffer = false } = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'FreightUtils HMRC location sync (+https://www.freightutils.com)',
      Accept: asBuffer
        ? 'application/vnd.oasis.opendocument.spreadsheet,*/*'
        : 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  }
  return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text();
}

function extractOdsUrl(html) {
  const hits = [...html.matchAll(ODS_HREF_RE)].map((m) => m[0]);
  if (!hits.length) throw new Error('No .ods attachment link found on landing page.');
  // Prefer the first link under the "Documents" section (first match on page).
  return hits[0];
}

function extractChangelog(html, sourceKey) {
  // GOV.UK publication pages render change history inside
  //   <ol class="gem-c-published-dates__list">
  //     <li class="gem-c-published-dates__change-item">
  //       <time datetime="2026-04-13T11:02:16Z">13 April 2026</time>
  //       <p class="gem-c-published-dates__change-note">…description…</p>
  //     </li>
  //
  // datetime may be a bare YYYY-MM-DD or a full ISO timestamp.
  const entries = [];

  // Iterate over every change-item <li> so we don't mis-pair dates and notes.
  const itemRe =
    /<li[^>]*class="[^"]*gem-c-published-dates__change-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;

  for (const li of html.matchAll(itemRe)) {
    const block = li[1];
    const timeMatch = block.match(
      /<time[^>]*datetime="(\d{4}-\d{2}-\d{2})(?:T[^"]*)?"[^>]*>([^<]*)<\/time>/i,
    );
    if (!timeMatch) continue;
    const date = timeMatch[1];

    const noteMatch = block.match(
      /<p[^>]*class="[^"]*gem-c-published-dates__change-note[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    );
    const rawNote = noteMatch ? noteMatch[1] : '';
    const summary = rawNote
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 400);

    entries.push({ date, source: sourceKey, summary });
  }

  return entries;
}

function normaliseHeader(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function pickColumn(headerRow, candidates) {
  for (const target of candidates) {
    const idx = headerRow.findIndex((h) => {
      const norm = normaliseHeader(h);
      return target instanceof RegExp ? target.test(norm) : norm === target;
    });
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseOdsBuffer(buf, source) {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: '',
  });

  if (!rows.length) {
    throw new Error(`Empty sheet for ${source.key}`);
  }

  // Find the header row — the first row that contains "Location Code" or
  // "location code" (case-insensitive). Some sheets have a title row above.
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const norm = rows[i].map(normaliseHeader);
    if (norm.some((h) => h === 'location code')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error(
      `Could not locate header row (expected "Location Code") in ${source.key} sheet. First row: ${JSON.stringify(rows[0])}`,
    );
  }

  const header = rows[headerIdx].map(String);
  const nameIdx = pickColumn(header, ['name']);
  const addressIdx = pickColumn(header, ['address']);
  const codeIdx = pickColumn(header, ['location code']);
  const niIdx = pickColumn(header, source.ni_column_regexes);

  if (nameIdx === -1 || addressIdx === -1 || codeIdx === -1) {
    throw new Error(
      `Missing required column in ${source.key}. Header was: ${JSON.stringify(header)}`,
    );
  }

  const out = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const rawCode = String(row[codeIdx] || '').trim().toUpperCase();
    if (!rawCode) continue;

    const name = String(row[nameIdx] || '').trim();
    const address = String(row[addressIdx] || '').trim();
    const niRaw = niIdx !== -1 ? String(row[niIdx] || '').trim().toLowerCase() : '';
    const northern_ireland = niRaw === 'yes' || niRaw === 'y' || niRaw === 'true';

    const m = rawCode.match(CODE_RE);
    const decomposed = m
      ? {
          country: 'GB',
          prefix: m[1],
          office: m[2],
          airport: m[3],
          suffix: m[4],
          suffix_length: m[4].length,
        }
      : null;

    const addressLower = address.toLowerCase();
    const lhr_related =
      (decomposed && decomposed.airport === 'LHR') ||
      addressLower.includes('heathrow') ||
      addressLower.includes('hounslow');

    out.push({
      name,
      address,
      location_code: rawCode,
      northern_ireland,
      decomposed,
      lhr_related,
      malformed_code: !decomposed,
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────

async function processSource(source) {
  process.stdout.write(`\n[${source.key.toUpperCase()}] fetching landing page...\n`);
  const landingHtml = await httpGet(source.landing);
  const odsUrl = extractOdsUrl(landingHtml);
  process.stdout.write(`[${source.key.toUpperCase()}] found ODS: ${odsUrl}\n`);

  const changelog = extractChangelog(landingHtml, source.key);
  process.stdout.write(`[${source.key.toUpperCase()}] changelog entries: ${changelog.length}\n`);

  const buf = await httpGet(odsUrl, { asBuffer: true });
  process.stdout.write(`[${source.key.toUpperCase()}] downloaded ${buf.length} bytes\n`);

  const records = parseOdsBuffer(buf, source);
  const lhr = records.filter((r) => r.lhr_related);
  const malformed = records.filter((r) => r.malformed_code);

  process.stdout.write(
    `[${source.key.toUpperCase()}] parsed: total=${records.length}, lhr=${lhr.length}, malformed=${malformed.length}\n`,
  );

  // Sanity check
  const tolerance = 0.2; // ±20%
  const lowTotal = source.expected_total * (1 - tolerance);
  const highTotal = source.expected_total * (1 + tolerance);
  if (records.length < lowTotal || records.length > highTotal) {
    console.warn(
      `  WARNING: total count ${records.length} is outside ±20% of expected ${source.expected_total}. Verify source.`,
    );
  }
  const lowLhr = source.expected_lhr * (1 - tolerance);
  const highLhr = source.expected_lhr * (1 + tolerance);
  if (lhr.length < lowLhr || lhr.length > highLhr) {
    console.warn(
      `  WARNING: LHR-related count ${lhr.length} is outside ±20% of expected ${source.expected_lhr}. Verify source.`,
    );
  }
  if (malformed.length) {
    console.warn(`  WARNING: ${malformed.length} codes did not match regex.`);
  }

  return {
    meta: {
      source_key: source.key,
      label: source.label,
      landing_url: source.landing,
      ods_url: odsUrl,
      fetched_at: new Date().toISOString(),
      total_records: records.length,
      lhr_related_count: lhr.length,
      malformed_count: malformed.length,
      licence:
        'Open Government Licence v3.0. Source: HM Revenue & Customs.',
    },
    records,
    changelog,
  };
}

async function main() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  const itsf = await processSource(SOURCES.itsf);
  const etsf = await processSource(SOURCES.etsf);

  await writeFile(
    resolve(DATA_DIR, SOURCES.itsf.out_file),
    JSON.stringify({ meta: itsf.meta, records: itsf.records }, null, 2) + '\n',
    'utf8',
  );
  await writeFile(
    resolve(DATA_DIR, SOURCES.etsf.out_file),
    JSON.stringify({ meta: etsf.meta, records: etsf.records }, null, 2) + '\n',
    'utf8',
  );

  const combinedChangelog = [...itsf.changelog, ...etsf.changelog].sort(
    (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
  );
  await writeFile(
    resolve(DATA_DIR, 'hmrc-changelog.json'),
    JSON.stringify(
      {
        meta: {
          fetched_at: new Date().toISOString(),
          sources: {
            itsf: SOURCES.itsf.landing,
            etsf: SOURCES.etsf.landing,
          },
          licence: 'Open Government Licence v3.0. Source: HM Revenue & Customs.',
          total_entries: combinedChangelog.length,
        },
        entries: combinedChangelog,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log('\n────────────────────────────────────────────');
  console.log('DONE. Output files:');
  console.log(`  data/${SOURCES.itsf.out_file}  (${itsf.meta.total_records} records, ${itsf.meta.lhr_related_count} LHR)`);
  console.log(`  data/${SOURCES.etsf.out_file}  (${etsf.meta.total_records} records, ${etsf.meta.lhr_related_count} LHR)`);
  console.log(`  data/hmrc-changelog.json (${combinedChangelog.length} entries)`);
  console.log('────────────────────────────────────────────');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
