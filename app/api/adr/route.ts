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
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Window': '86400',
};

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

const ADR_META = {
  source: 'UNECE ADR 2025, licensed from Labeline.com',
  edition: 'ADR 2025',
  entries: 2939,
};

// ─────────────────────────────────────────────────────────────────
//  OPTIONS — CORS preflight
// ─────────────────────────────────────────────────────────────────

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─────────────────────────────────────────────────────────────────
//  Strip internal metadata from response entries
// ─────────────────────────────────────────────────────────────────

function stripMeta(entry: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _source, _edition, variant_id, ...rest } = entry as Record<string, unknown>;
  return rest;
}

// ─────────────────────────────────────────────────────────────────
//  GET /api/adr
// ─────────────────────────────────────────────────────────────────

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const unParam     = searchParams.get('un');
  const searchParam = searchParams.get('search') || searchParams.get('q');
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

  // ── ?un= — exact lookup (returns all variants) ──
  if (unParam) {
    const normalised = normaliseUnNumber(unParam);

    if (!/^\d{4}$/.test(normalised)) {
      return NextResponse.json(
        { error: `Invalid UN number "${unParam}". Must be a 1–4 digit number, e.g. 1203.` },
        { status: 400, headers }
      );
    }

    const entries = lookupByUnNumber(normalised);

    if (entries.length === 0) {
      return NextResponse.json(
        {
          error: `UN number ${normalised} not found in ADR 2025 dataset.`,
          un_number: normalised,
        },
        { status: 404, headers }
      );
    }

    const results = entries.map(e => stripMeta(e as unknown as Record<string, unknown>));

    return NextResponse.json(
      { count: results.length, results, meta: ADR_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }

  // ── ?search= or ?q= — name search ──
  if (searchParam) {
    const q = searchParam.trim();

    if (q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters.' },
        { status: 400, headers }
      );
    }

    const results = searchByName(q, 50).map(e => stripMeta(e as unknown as Record<string, unknown>));

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No ADR entries found matching "${q}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: ADR_META },
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

    const results = filterByClass(cls, 100).map(e => stripMeta(e as unknown as Record<string, unknown>));

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No ADR entries found for class "${cls}".`, count: 0, results: [] },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { count: results.length, results, meta: ADR_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } }
    );
  }
}
