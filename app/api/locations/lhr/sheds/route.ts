import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSheds,
  getCriticalRules,
  getAirlinePrefixOverrides,
  getMeta,
  findByKeyOrCode,
  findByHmrcCode,
  findByAirlineCode,
  findByAwbPrefix,
  search as searchSheds,
  filterByConfidence,
  type Confidence,
  type MergedShed,
} from '@/lib/calculations/lhr-sheds';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-RateLimit-Limit': '25',
  'X-RateLimit-Window': '86400',
};

const CACHE = { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' };

const VALID_CONFIDENCES: Confidence[] = [
  'verified',
  'community_contributed',
  'pending_verification',
  'operational_only',
  'hmrc_only',
];

const CANONICAL_URL = 'https://www.freightutils.com/airports/lhr/sheds';

function attributionPayload() {
  const meta = getMeta();
  return {
    last_verified: meta.operational_last_verified,
    source_url: CANONICAL_URL,
    hmrc_sources: {
      itsf: meta.hmrc_sources.itsf.source_url,
      etsf: meta.hmrc_sources.etsf.source_url,
    },
    licence: meta.licence,
  };
}

function shedWithAttribution(s: MergedShed) {
  const meta = getMeta();
  return {
    ...s,
    last_verified: s.last_verified || meta.operational_last_verified,
    source_url: CANONICAL_URL,
  };
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET(req: NextRequest) {
  const h = { ...CORS, ...CACHE, 'Content-Type': 'application/json' };
  const sp = req.nextUrl.searchParams;

  const codeParam = sp.get('code');
  const query = sp.get('q') ?? sp.get('search') ?? '';
  const airline = sp.get('airline');
  const awb = sp.get('awb');
  const confidenceParam = sp.get('confidence');
  const limit = Math.min(Math.max(1, parseInt(sp.get('limit') ?? '50')), 250);

  /* ── Code lookup (operational key, shed_code, or HMRC code) ───────── */
  if (codeParam) {
    const code = codeParam.trim();
    // If it looks like an HMRC location code (starts with GB), try HMRC lookup
    const asHmrc = code.toUpperCase().startsWith('GB') ? findByHmrcCode(code) : null;
    const matches = asHmrc ? [asHmrc] : findByKeyOrCode(code);
    if (matches.length === 0) {
      return NextResponse.json(
        {
          error: `Shed "${codeParam}" not found`,
          hint: 'Try a shed_code (e.g. WXS), an operational key (e.g. CIS_AMI), or an HMRC location code (e.g. GBAULHRLHRWXS).',
        },
        { status: 404, headers: h },
      );
    }
    return NextResponse.json(
      {
        query: { code },
        count: matches.length,
        results: matches.map(shedWithAttribution),
        meta: attributionPayload(),
      },
      { headers: h },
    );
  }

  /* ── Airline lookup ──────────────────────────────────────────────── */
  if (airline) {
    const matches = findByAirlineCode(airline);
    return NextResponse.json(
      {
        query: { airline: airline.toUpperCase() },
        count: matches.length,
        results: matches.map(shedWithAttribution),
        meta: attributionPayload(),
      },
      { headers: h },
    );
  }

  /* ── AWB prefix lookup ───────────────────────────────────────────── */
  if (awb) {
    const { override, sheds } = findByAwbPrefix(awb);
    return NextResponse.json(
      {
        query: { awb },
        override: override
          ? { awb_prefix: awb, ...override }
          : null,
        count: sheds.length,
        results: sheds.map(shedWithAttribution),
        meta: attributionPayload(),
      },
      { headers: h },
    );
  }

  /* ── Confidence filter (may combine with free-text q) ────────────── */
  if (confidenceParam) {
    if (!VALID_CONFIDENCES.includes(confidenceParam as Confidence)) {
      return NextResponse.json(
        {
          error: `Invalid confidence "${confidenceParam}"`,
          valid_values: VALID_CONFIDENCES,
        },
        { status: 400, headers: h },
      );
    }
    let list = filterByConfidence(confidenceParam as Confidence);
    if (query) {
      const lq = query.toLowerCase();
      list = list.filter(s =>
        JSON.stringify(s).toLowerCase().includes(lq),
      );
    }
    return NextResponse.json(
      {
        query: { confidence: confidenceParam, q: query || undefined },
        count: list.length,
        results: list.slice(0, limit).map(shedWithAttribution),
        meta: attributionPayload(),
      },
      { headers: h },
    );
  }

  /* ── Free-text search ────────────────────────────────────────────── */
  if (query) {
    const results = searchSheds(query, limit);
    return NextResponse.json(
      {
        query: { q: query },
        count: results.length,
        results: results.map(shedWithAttribution),
        meta: attributionPayload(),
      },
      { headers: h },
    );
  }

  /* ── Default: manifest + index ───────────────────────────────────── */
  const meta = getMeta();
  return NextResponse.json(
    {
      airport: 'LHR',
      name: 'London Heathrow',
      total_sheds: meta.total_sheds,
      confidence_distribution: meta.confidence_distribution,
      critical_rules: getCriticalRules(),
      airline_prefix_overrides: getAirlinePrefixOverrides(),
      sheds: getAllSheds().map(shedWithAttribution),
      meta: attributionPayload(),
      query_params: {
        code: 'Operational key (CIS_AMI), shed code (WXS), or HMRC location code (GBAULHRLHRWXS)',
        q: 'Free-text search across shed/handler/airline/email/HMRC address',
        airline: 'IATA airline code (e.g. BA, EK, AA)',
        awb: '3-digit AWB prefix (e.g. 125, 001)',
        confidence: `One of: ${VALID_CONFIDENCES.join(', ')}`,
        limit: 'Max results (1-250, default 50)',
      },
    },
    { headers: h },
  );
}
