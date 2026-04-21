#!/usr/bin/env node
/**
 * merge-lhr-sheds.mjs
 *
 * Merges three sources into a single authoritative LHR sheds dataset:
 *   1. data/operational-context-lhr.json   (operational truth — maintained by Marius Cristoiu)
 *   2. data/hmrc-itsf-locations.json       (HMRC Appendix 16D, regulated)
 *   3. data/hmrc-etsf-locations.json       (HMRC Appendix 16F, regulated)
 *
 * Output: data/lhr-sheds-merged.json
 *
 * Confidence rubric:
 *   - verified:              operational + HMRC both present, consistent
 *   - operational_only:      operational data only (or HMRC deregistered — e.g. AAS)
 *   - hmrc_only:             HMRC-registered LHR entry with no operational match
 *   - community_contributed: email/details sourced from industry peers (CIS_AMI case)
 *   - pending_verification:  operational data flagged partial / verify_on_shift / uncertain HMRC mapping
 *
 * Usage:  node scripts/merge-lhr-sheds.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const paths = {
  operational: resolve(ROOT, 'data/operational-context-lhr.json'),
  itsf:        resolve(ROOT, 'data/hmrc-itsf-locations.json'),
  etsf:        resolve(ROOT, 'data/hmrc-etsf-locations.json'),
  out:         resolve(ROOT, 'data/lhr-sheds-merged.json'),
};

/* ------------------------------------------------------------------ */
/*  Load sources                                                      */
/* ------------------------------------------------------------------ */
const operational = JSON.parse(readFileSync(paths.operational, 'utf8'));
const itsf        = JSON.parse(readFileSync(paths.itsf, 'utf8'));
const etsf        = JSON.parse(readFileSync(paths.etsf, 'utf8'));

/* ------------------------------------------------------------------ */
/*  Build HMRC lookup indexes                                         */
/* ------------------------------------------------------------------ */
/** Map<location_code, { ...record, source: 'itsf' | 'etsf' }> */
const hmrcByCode = new Map();
for (const r of itsf.records) hmrcByCode.set(r.location_code, { ...r, source: 'itsf' });
for (const r of etsf.records) hmrcByCode.set(r.location_code, { ...r, source: 'etsf' });

/** Map<suffix, Array<record>> — for fuzzy lookups when operational has no code */
const hmrcBySuffix = new Map();
for (const [code, rec] of hmrcByCode) {
  if (!rec.lhr_related) continue;
  const suffix = rec.decomposed?.suffix;
  if (!suffix) continue;
  if (!hmrcBySuffix.has(suffix)) hmrcBySuffix.set(suffix, []);
  hmrcBySuffix.get(suffix).push(rec);
}

/* ------------------------------------------------------------------ */
/*  Classify confidence                                               */
/* ------------------------------------------------------------------ */
// Community-contributed sheds per user directive (email sourced from industry peer,
// not official handler channel). Extend this list when new records are contributed.
const COMMUNITY_CONTRIBUTED_KEYS = new Set(['CIS_AMI']);

// Always pending-verification: status markers that explicitly flag uncertainty.
const PENDING_STATUSES = new Set([
  'verify_on_shift',
  'partial',
  'hmrc_registered_operational_data_missing',
]);

function classifyConfidence(opKey, op, hmrcStatus, hasHmrcCode) {
  if (COMMUNITY_CONTRIBUTED_KEYS.has(opKey)) return 'community_contributed';

  // Explicit operational status markers trump HMRC presence.
  if (op.status && PENDING_STATUSES.has(op.status)) return 'pending_verification';

  // HMRC deregistered but operationally active (AAS) — operational_only.
  if (hmrcStatus === 'industry_only_hmrc_deregistered') return 'operational_only';

  // HMRC mapping uncertain (BAC_EXPRESS → BAS).
  if (hmrcStatus === 'registered_uncertain_mapping') return 'pending_verification';

  // HMRC not in current data.
  if (hmrcStatus === 'not_found_in_current_data' || !hmrcStatus) {
    return hasHmrcCode ? 'verified' : 'operational_only';
  }

  // HMRC registered (ITSF or ETSF).
  if (hmrcStatus === 'registered' || hmrcStatus === 'registered_as_etsf') {
    return 'verified';
  }

  return 'operational_only';
}

/* ------------------------------------------------------------------ */
/*  Build merged records from operational sheds                       */
/* ------------------------------------------------------------------ */
const mergedSheds = [];
const matchedHmrcCodes = new Set();

for (const [opKey, op] of Object.entries(operational.sheds)) {
  // Only include LHR sheds in the merged output. Other-airport records
  // (GPS, LGW_WFS, BHX_DNATA) are retained in a separate `other_airports`
  // list for completeness.
  const airportField = op.airport || 'LHR';
  if (airportField !== 'LHR') continue;

  const hmrcCodeRaw = op.hmrc?.code || null;
  // Strip parenthetical hedges like "(likely — verify)"
  const hmrcCodeClean = hmrcCodeRaw
    ? hmrcCodeRaw.replace(/\s*\(.*?\)\s*/g, '').trim()
    : null;
  const hmrcStatus = op.hmrc?.status || null;

  let hmrcRecord = null;
  if (hmrcCodeClean) {
    hmrcRecord = hmrcByCode.get(hmrcCodeClean) || null;
    if (hmrcRecord) matchedHmrcCodes.add(hmrcCodeClean);
  }

  // Fallback: if no hmrc code but operational has a shed_code, try suffix match
  if (!hmrcRecord && !hmrcCodeClean && op.shed_code) {
    const candidates = hmrcBySuffix.get(op.shed_code) || [];
    if (candidates.length === 1) {
      hmrcRecord = candidates[0];
      matchedHmrcCodes.add(hmrcRecord.location_code);
    }
  }

  const confidence = classifyConfidence(opKey, op, hmrcStatus, !!hmrcRecord);

  mergedSheds.push({
    key: opKey,
    shed_code: op.shed_code,
    subject_code: op.subject_code || null,
    handler_legal_name: op.handler_legal_name || null,
    handler_common_name: op.handler_common_name || null,
    prealert_email: op.prealert_email || null,
    airlines: op.airlines || [],
    awb_prefixes: op.awb_prefixes || [],
    routing_notes: op.routing_notes || null,
    is_critical_rule: !!op.is_critical_rule,
    operational_status: op.status || null,
    hmrc: hmrcRecord
      ? {
          code:     hmrcRecord.location_code,
          status:   hmrcStatus || 'registered',
          source:   hmrcRecord.source, // 'itsf' | 'etsf'
          legal_name: hmrcRecord.name,
          address:  hmrcRecord.address,
          decomposed: hmrcRecord.decomposed,
          ...(op.hmrc?.registered_date ? { registered_date: op.hmrc.registered_date } : {}),
          ...(op.hmrc?.deregistered_date ? { deregistered_date: op.hmrc.deregistered_date } : {}),
          ...(op.hmrc?.note ? { note: op.hmrc.note } : {}),
        }
      : {
          code:   hmrcCodeClean,
          status: hmrcStatus || 'not_found_in_current_data',
          ...(op.hmrc?.note ? { note: op.hmrc.note } : {}),
          ...(op.hmrc?.deregistered_date ? { deregistered_date: op.hmrc.deregistered_date } : {}),
        },
    confidence,
    last_verified: op.last_verified || operational._meta?.last_verified || null,
    source: 'operational',
  });
}

/* ------------------------------------------------------------------ */
/*  Add HMRC-only LHR entries (not matched by operational)            */
/* ------------------------------------------------------------------ */
const hmrcOnly = [];
for (const [code, rec] of hmrcByCode) {
  if (!rec.lhr_related) continue;
  if (matchedHmrcCodes.has(code)) continue;
  hmrcOnly.push({
    key: `HMRC_${rec.decomposed?.suffix || code}`,
    shed_code: rec.decomposed?.suffix || null,
    subject_code: null,
    handler_legal_name: rec.name,
    handler_common_name: rec.name,
    prealert_email: null,
    airlines: [],
    awb_prefixes: [],
    routing_notes: null,
    is_critical_rule: false,
    operational_status: null,
    hmrc: {
      code: rec.location_code,
      status: 'registered',
      source: rec.source,
      legal_name: rec.name,
      address: rec.address,
      decomposed: rec.decomposed,
    },
    confidence: 'hmrc_only',
    last_verified: null,
    source: 'hmrc',
  });
}

// Sort HMRC-only by suffix for stable output
hmrcOnly.sort((a, b) => (a.shed_code || '').localeCompare(b.shed_code || ''));

/* ------------------------------------------------------------------ */
/*  Other-airport operational records                                 */
/* ------------------------------------------------------------------ */
const otherAirports = [];
for (const [opKey, op] of Object.entries(operational.sheds)) {
  const airportField = op.airport || 'LHR';
  if (airportField === 'LHR') continue;
  otherAirports.push({
    key: opKey,
    airport: airportField,
    shed_code: op.shed_code,
    subject_code: op.subject_code || null,
    handler_legal_name: op.handler_legal_name || null,
    handler_common_name: op.handler_common_name || null,
    prealert_email: op.prealert_email || null,
    routing_notes: op.routing_notes || null,
    last_verified: op.last_verified || null,
  });
}

/* ------------------------------------------------------------------ */
/*  Assemble output                                                   */
/* ------------------------------------------------------------------ */
const allLhrSheds = [...mergedSheds, ...hmrcOnly];

// Confidence distribution for meta
const confidenceCounts = {};
for (const s of allLhrSheds) {
  confidenceCounts[s.confidence] = (confidenceCounts[s.confidence] || 0) + 1;
}

const output = {
  _meta: {
    generated_at: new Date().toISOString(),
    primary_airport: 'LHR',
    total_sheds: allLhrSheds.length,
    operational_source_version: operational._meta?.sheds_md_version || null,
    operational_last_verified: operational._meta?.last_verified || null,
    hmrc_sources: {
      itsf: {
        fetched_at: itsf.meta?.fetched_at || null,
        total_records: itsf.meta?.total_records || null,
        lhr_related: itsf.meta?.lhr_related_count || null,
        source_url: itsf.meta?.ods_url || null,
      },
      etsf: {
        fetched_at: etsf.meta?.fetched_at || null,
        total_records: etsf.meta?.total_records || null,
        lhr_related: etsf.meta?.lhr_related_count || null,
        source_url: etsf.meta?.ods_url || null,
      },
    },
    confidence_distribution: confidenceCounts,
    licence:
      'Operational data © FreightUtils (CC BY 4.0). HMRC data: Open Government Licence v3.0, source HM Revenue & Customs.',
    corrections_email: 'mcristoiu@gmail.com',
  },
  critical_rules: operational.critical_rules,
  airline_prefix_overrides: operational.airline_prefix_overrides,
  sheds: allLhrSheds,
  other_airports: otherAirports,
  questions_for_soap_on_shift: operational.questions_for_soap_on_shift || [],
};

writeFileSync(paths.out, JSON.stringify(output, null, 2) + '\n', 'utf8');

/* ------------------------------------------------------------------ */
/*  Report                                                            */
/* ------------------------------------------------------------------ */
console.log('Merged LHR sheds written to:', paths.out);
console.log('Total sheds:', allLhrSheds.length);
console.log('Operational-sourced:', mergedSheds.length);
console.log('HMRC-only:', hmrcOnly.length);
console.log('Other-airport operational records:', otherAirports.length);
console.log('Confidence distribution:', confidenceCounts);
