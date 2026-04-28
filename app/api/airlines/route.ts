import { NextRequest, NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import {
  searchAirlines,
  filterByIata,
  filterByIcao,
  filterByPrefix,
  filterByCountry,
} from '@/lib/calculations/airlines';

// -----------------------------------------------------------------
//  Headers
// -----------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-RateLimit-Limit': '25',
  'X-RateLimit-Window': '86400',
};

const AIRLINES_META = {
  source: 'Public IATA/ICAO data, cross-referenced',
  airlines: 6352,
  last_verified: 'April 2026',
};

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

// -----------------------------------------------------------------
//  OPTIONS — CORS preflight
// -----------------------------------------------------------------

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// -----------------------------------------------------------------
//  GET /api/airlines
// -----------------------------------------------------------------

async function _handleGET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const qParam       = searchParams.get('q');
  const iataParam    = searchParams.get('iata');
  const icaoParam    = searchParams.get('icao');
  const prefixParam  = searchParams.get('prefix');
  const countryParam = searchParams.get('country');

  const headers = { ...CORS_HEADERS, ...CACHE_HEADERS };

  // -- No params -> 400 with usage hint --
  if (!qParam && !iataParam && !icaoParam && !prefixParam && !countryParam) {
    return NextResponse.json(
      {
        error: 'No query parameter provided.',
        usage: 'Provide one of: ?q=emirates  |  ?iata=EK  |  ?icao=UAE  |  ?prefix=176  |  ?country=United+Arab+Emirates',
        examples: [
          '/api/airlines?q=emirates',
          '/api/airlines?iata=EK',
          '/api/airlines?icao=UAE',
          '/api/airlines?prefix=176',
          '/api/airlines?country=United+Arab+Emirates',
        ],
      },
      { status: 400, headers }
    );
  }

  // -- ?q= — general search (name, code, prefix, country) --
  if (qParam) {
    const q = qParam.trim();

    if (q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters.' },
        { status: 400, headers }
      );
    }

    const results = searchAirlines(q, 50);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No airlines found matching "${q}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: AIRLINES_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }

  // -- ?iata= — exact IATA code lookup --
  if (iataParam) {
    const code = iataParam.trim().toUpperCase();

    if (!/^[A-Z0-9]{2}$/.test(code)) {
      return NextResponse.json(
        { error: `Invalid IATA code "${iataParam}". Must be a 2-character code, e.g. EK.` },
        { status: 400, headers }
      );
    }

    const results = filterByIata(code);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No airline found with IATA code "${code}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: AIRLINES_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }

  // -- ?icao= — exact ICAO code lookup --
  if (icaoParam) {
    const code = icaoParam.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(code)) {
      return NextResponse.json(
        { error: `Invalid ICAO code "${icaoParam}". Must be a 3-letter code, e.g. UAE.` },
        { status: 400, headers }
      );
    }

    const results = filterByIcao(code);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No airline found with ICAO code "${code}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: AIRLINES_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }

  // -- ?prefix= — AWB prefix lookup --
  if (prefixParam) {
    const prefix = prefixParam.trim();

    if (!/^\d{3}$/.test(prefix)) {
      return NextResponse.json(
        { error: `Invalid AWB prefix "${prefixParam}". Must be a 3-digit number, e.g. 176.` },
        { status: 400, headers }
      );
    }

    const results = filterByPrefix(prefix);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No airline found with AWB prefix "${prefix}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: AIRLINES_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }

  // -- ?country= — country filter --
  if (countryParam) {
    const country = countryParam.trim();

    if (country.length < 2) {
      return NextResponse.json(
        { error: 'Country parameter must be at least 2 characters.' },
        { status: 400, headers }
      );
    }

    const results = filterByCountry(country, 100);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No airlines found for country "${country}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: AIRLINES_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }
}

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
