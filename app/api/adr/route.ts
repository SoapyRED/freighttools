import { NextRequest, NextResponse } from 'next/server';
import {
  lookupByUnNumber,
  searchByName,
  filterByClass,
  normaliseUnNumber,
} from '@/lib/calculations/adr';

// ─────────────────────────────────────────────────────────────────
//  Headers
// ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ADR data changes yearly — long cache is appropriate
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

// ─────────────────────────────────────────────────────────────────
//  OPTIONS — CORS preflight
// ─────────────────────────────────────────────────────────────────

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─────────────────────────────────────────────────────────────────
//  GET /api/adr
// ─────────────────────────────────────────────────────────────────

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const unParam     = searchParams.get('un');
  const searchParam = searchParams.get('search');
  const classParam  = searchParams.get('class');

  const headers = { ...CORS_HEADERS, ...CACHE_HEADERS };

  // ── No params → 400 with usage hint ──
  if (!unParam && !searchParam && !classParam) {
    return NextResponse.json(
      {
        error: 'No query parameter provided.',
        usage: 'Provide one of: ?un=1203  |  ?search=gasoline  |  ?class=3',
        examples: [
          '/api/adr?un=1203',
          '/api/adr?search=gasoline',
          '/api/adr?class=3',
        ],
      },
      { status: 400, headers }
    );
  }

  // ── ?un= — exact lookup ──
  if (unParam) {
    const normalised = normaliseUnNumber(unParam);

    // Validate: must be 4 digits after normalisation
    if (!/^\d{4}$/.test(normalised)) {
      return NextResponse.json(
        { error: `Invalid UN number "${unParam}". Must be a 1–4 digit number, e.g. 1203.` },
        { status: 400, headers }
      );
    }

    const entry = lookupByUnNumber(normalised);

    if (!entry) {
      return NextResponse.json(
        {
          error: `UN number ${normalised} not found in ADR 2025 dataset.`,
          un_number: normalised,
        },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: 1, results: [entry] },
      { status: 200, headers: { ...headers, 'X-Total-Count': '1' } }
    );
  }

  // ── ?search= — name search ──
  if (searchParam) {
    const q = searchParam.trim();

    if (q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters.' },
        { status: 400, headers }
      );
    }

    const results = searchByName(q, 20);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No ADR entries found matching "${q}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }

  // ── ?class= — hazard class filter ──
  if (classParam) {
    const cls = classParam.trim();

    if (!cls) {
      return NextResponse.json(
        { error: 'Class parameter must not be empty. Example: ?class=3' },
        { status: 400, headers }
      );
    }

    const results = filterByClass(cls, 50);

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No ADR entries found for class "${cls}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }
}
