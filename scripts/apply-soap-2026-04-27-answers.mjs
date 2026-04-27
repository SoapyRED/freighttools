#!/usr/bin/env node
/**
 * Apply Soap's 2026-04-27 verified answers to data/lhr-sheds-merged.json.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const FILE = path.resolve('data/lhr-sheds-merged.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const TODAY = '2026-04-27';

const SWISSPORT_ASC_PRESS = 'https://www.swissport.com/en/news/current-news/2025/swissport-acquires-asc-strengthening-its-position-in-london';
const HCH_COMPANIES_HOUSE = 'https://find-and-update.company-information.service.gov.uk/company/03076274';
const BIFA_HCH = 'https://www.bifa.org/find-a-member';
const CFL_WEBSITE = 'https://www.cfl.aero/';
const HMRC_ITSF_LIST = 'https://assets.publishing.service.gov.uk/media/69dcbc1eeb7e7bc56517028c/20260409_cds_de_5-23_appendix16D_internal_temporary_storage_facilities.ods';

let touched = 0;
const log = [];
const findShed = (predicate) => data.sheds.find(predicate);

// 1. BAS / BAC_EXPRESS
const bacExpress = findShed((s) => s.key === 'BAC_EXPRESS');
if (bacExpress) {
  bacExpress.routing_notes = "BA EXPRESS / Premia — same shed_code BAC as Ascentis (BAC_MAIN); EMAIL is the differentiator. Soap confirmed 2026-04-27: only BAC is sent operationally for BOTH Ascentis (Main) and Premia (Express). HMRC's BAS registration exists at the same address but no operational use observed at LHR — prealerts always sent to BAC.";
  bacExpress.hmrc.status = 'registered_unused_operationally';
  bacExpress.hmrc.note = 'Registered with HMRC as GBAULHRLHRBAS but no operational use observed at LHR; prealerts always sent to BAC. Verified by Soap on shift 2026-04-27.';
  bacExpress.confidence = 'operationally_verified';
  bacExpress.last_verified = TODAY;
  touched++; log.push('BAC_EXPRESS (BAS) — confirmed BAS registered but unused; BAC ships both Ascentis and Premia');
}

// 2. XBQ — historical
const xbq = findShed((s) => s.shed_code === 'XBQ');
if (xbq) {
  xbq.routing_notes = "Historical / deprecated. Soap confirmed 2026-04-27: XBQ is no longer operationally used; DAX (Building 875, Dunwoody) has replaced it for BARC prealerts. Slips referencing XBQ should be redirected to DAX.";
  xbq.operational_status = 'deprecated_historical';
  xbq.confidence = 'operationally_verified';
  xbq.last_verified = TODAY;
  if (xbq.hmrc) xbq.hmrc.note = 'Not in current HMRC ITSF list; superseded by DAX (Dunwoody / WFS Building 875) per Soap on shift 2026-04-27.';
  touched++; log.push('XBQ — marked deprecated_historical, points to DAX as successor');
}

// 3. DAX — current; subject_code DAX, email via BBS
const dax = findShed((s) => s.shed_code === 'DAX');
if (dax) {
  dax.subject_code = 'LHRDAX';
  dax.routing_notes = "Current BARC handler at LHR (BA Regional Cargo). Soap confirmed 2026-04-27 from on-shift observation: shed_code on prealert is DAX, but the prealert email routes via BBS (bbs.spxra.alerts@wfs.aero). EMAIL/CODE DIVERGENCE — slip header reads DAX, email envelope reads BBS. Address paperwork to DAX; route the email to bbs.spxra.alerts@wfs.aero.";
  dax.email_routing = {
    prealert_email: 'bbs.spxra.alerts@wfs.aero',
    note: 'Email routes via BBS even though shed_code is DAX — confirmed divergence as of 2026-04-27.',
    routing_code_on_email: 'BBS',
  };
  dax.confidence = 'operationally_verified';
  dax.last_verified = TODAY;
  touched++; log.push('DAX — subject_code LHRDAX confirmed; email/code divergence flagged (paperwork DAX, email BBS)');
}

// 4. ZCS — Swissport absorbed ASC Jul 2025
const zcs = findShed((s) => s.shed_code === 'ZCS');
if (zcs) {
  zcs.routing_notes = "Swissport at Building 582 Sandringham Rd. Soap confirmed 2026-04-27: Swissport acquired ASC (Aviation Servicing Company) in July 2025 and absorbed all former ASC operations. ZCS is now the operational shed code post-absorption; all former ASC prealert emails route to @swissport.com. ASC's HMRC registration JZS still exists at the same building but has no operational routing — see JZS entry for the legal-vs-operational pattern.";
  zcs.former_operator = {
    legal_name: 'Aviation Servicing Company Limited',
    common_name: 'ASC Cargo Handling',
    operated_until: '2025-07',
    absorbed_by: 'Swissport GB Limited',
  };
  zcs.citations = [
    { label: 'Swissport press release: Swissport acquires ASC, strengthening its position in London (2025)', url: SWISSPORT_ASC_PRESS },
    { label: 'HMRC ITSF Appendix 16D — ZCS registration 20 Jan 2026', url: HMRC_ITSF_LIST },
  ];
  zcs.confidence = 'operationally_verified';
  zcs.last_verified = TODAY;
  touched++; log.push('ZCS — Swissport-acquired-ASC Jul 2025 documented with citations; former_operator block + acquisition trail');
}

// 5. JZS_ASC — legal preserved, operational via ZCS
const jzs = findShed((s) => s.key === 'JZS_ASC');
if (jzs) {
  jzs.routing_notes = "Legal HMRC ITSF registration only — no operational routing as of 2026-04-27. Aviation Servicing Company was acquired by Swissport in July 2025; all former ASC operations now route via ZCS (Swissport at the same Building 582 address). JZS remains on the HMRC list as a registered ITSF facility, but anyone sending a prealert to ASC should redirect to ZCS / Swissport. Concrete example of the legal-vs-operational truth gap.";
  jzs.absorbed_by = {
    legal_name: 'Swissport GB Limited',
    operational_shed_code: 'ZCS',
    absorbed_date: '2025-07',
  };
  jzs.operational_status = 'legal_entity_preserved_operations_via_ZCS';
  jzs.citations = [
    { label: 'Swissport press release: Swissport acquires ASC (2025)', url: SWISSPORT_ASC_PRESS },
  ];
  jzs.confidence = 'operationally_verified';
  jzs.last_verified = TODAY;
  touched++; log.push('JZS — flagged "legal entity preserved, operations via ZCS" post-Swissport-acquisition');
}

// 6. CFL — needs_review
const cfl = findShed((s) => s.shed_code === 'CFL');
if (cfl) {
  cfl.routing_notes = "Data sourced from public records (HMRC ITSF list + CFL company website) and not operationally validated by FreightUtils. Subject code unknown. Prealert email spx@cfl.aero per CFL's published contact details. Treat as a starting reference rather than an operational truth — verify on shift before relying.";
  cfl.confidence = 'needs_review';
  cfl.last_verified = TODAY;
  cfl.citations = [
    { label: 'CFL website (operator self-publication)', url: CFL_WEBSITE },
    { label: 'HMRC ITSF Appendix 16D registration', url: HMRC_ITSF_LIST },
  ];
  if (cfl.hmrc) cfl.hmrc.note = 'Registered as ITSF; operational details not validated by FreightUtils.';
  touched++; log.push('CFL — flagged needs_review with citations to CFL website + HMRC; no fabricated operational detail');
}

// 7. AFS (HCH at 558) — Swissport subsidiary 2019
const afs = findShed((s) => s.shed_code === 'AFS');
if (afs) {
  afs.routing_notes = "Concrete example of operational vs regulated truth. HMRC ITSF holder is 'Heathrow Cargo Handling Limited' (HCH) — a Swissport subsidiary since 2019. Legal entity preserved post-acquisition; operations are Swissport-branded. Soap confirmed 2026-04-27: prealert email routes to LHR.558CSD@swissport.com; staff are Swissport. Always trust the slip header — Swissport reshuffles airline allocations periodically.";
  afs.legal_vs_operational = {
    legal_holder: 'Heathrow Cargo Handling Limited',
    operational_brand: 'Swissport',
    relationship: 'subsidiary',
    since: '2019',
    pattern: 'legal_entity_preserved_post_acquisition',
  };
  afs.citations = [
    { label: 'Companies House — Heathrow Cargo Handling Limited (03076274)', url: HCH_COMPANIES_HOUSE },
    { label: 'BIFA member directory (HCH listed 2025)', url: BIFA_HCH },
  ];
  afs.confidence = 'operationally_verified';
  afs.last_verified = TODAY;
  touched++; log.push('AFS (HCH at Bldg 558 Shoreham Rd West) — Swissport subsidiary 2019 documented with Companies House + BIFA citations');
}

// 8. FRX (HCH at Horton Rd, ETSF) — same pattern
const frx = findShed((s) => s.shed_code === 'FRX');
if (frx) {
  frx.routing_notes = "Same legal-vs-operational pattern as AFS (Bldg 558): HMRC ETSF holder is Heathrow Cargo Handling Limited (HCH), operations Swissport-branded since 2019. Email routes to LHR.HRDCSD@swissport.com; staff are Swissport. Registered as ETSF, not ITSF. KLM (074) may route here OR to Swissport 558 (AFS) — always trust slip header.";
  frx.legal_vs_operational = {
    legal_holder: 'Heathrow Cargo Handling Limited',
    operational_brand: 'Swissport',
    relationship: 'subsidiary',
    since: '2019',
  };
  frx.citations = [
    { label: 'Companies House — Heathrow Cargo Handling Limited (03076274)', url: HCH_COMPANIES_HOUSE },
  ];
  frx.confidence = 'operationally_verified';
  frx.last_verified = TODAY;
  touched++; log.push('FRX (HCH at Horton Rd, ETSF) — same Swissport-subsidiary pattern as AFS');
}

// Close out questions_for_soap_on_shift
const closedQuestions = data.questions_for_soap_on_shift || [];
data.questions_for_soap_on_shift = [];
data.questions_resolved = {
  closed_at: '2026-04-27T00:00:00Z',
  resolved_by: 'Soap (on-shift verification + public source citations)',
  count: closedQuestions.length,
  summary: 'All 6 questions resolved. See routing_notes on BAC_EXPRESS / XBQ / BA_125_BARC (DAX) / ZCS / JZS_ASC / CFL / AFS / FRX.',
  prior_questions: closedQuestions,
};

// Update _meta
data._meta = data._meta || {};
data._meta.operational_last_verified = TODAY;
data._meta.last_verified = TODAY;
data._meta.confidence_schema_v2 = {
  values: ['operationally_verified', 'publicly_verified', 'needs_review', 'verified', 'pending_verification'],
  notes: 'v2 values introduced 2026-04-27 alongside prior values. Backwards compatible.',
  applied_to_keys_2026_04_27: ['BAC_EXPRESS', 'XBQ', 'BA_125_BARC', 'ZCS', 'JZS_ASC', 'CFL', 'AFS', 'FRX'],
};

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
console.log(`Updated ${touched} shed entries.`);
for (const line of log) console.log(`  • ${line}`);
console.log(`Closed ${closedQuestions.length} questions_for_soap_on_shift items.`);
