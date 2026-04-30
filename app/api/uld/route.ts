import { NextRequest, NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import {
  getAllULDs,
  getULD,
  getULDsByCategory,
  getULDsByDeck,
  ULD_COUNT,
  type ULDSpec,
} from '@/lib/calculations/uld';

// API response shape (snake_case). Internal ULDSpec uses camelCase.
function toApiResponse(u: ULDSpec) {
  return {
    code: u.code,
    name: u.name,
    slug: u.slug,
    category: u.category,
    deck_position: u.deckPosition,
    external_dimensions: u.externalDimensions,
    internal_dimensions: u.internalDimensions,
    door_dimensions: u.doorDimensions,
    max_gross_weight: u.maxGrossWeight,
    tare_weight: u.tareWeight,
    usable_volume: u.usableVolume,
    compatible_aircraft: u.compatibleAircraft,
    notes: u.notes,
  };
}

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

const ULD_META = {
  source: 'IATA ULD Technical Manual',
  total: ULD_COUNT,
  last_verified: 'May 2026',
};

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
};

// -----------------------------------------------------------------
//  OPTIONS — CORS preflight
// -----------------------------------------------------------------

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// -----------------------------------------------------------------
//  GET /api/uld
// -----------------------------------------------------------------

async function _handleGET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const typeParam     = searchParams.get('type');
  const categoryParam = searchParams.get('category');
  const deckParam     = searchParams.get('deck');

  const headers = { ...CORS_HEADERS, ...CACHE_HEADERS };

  // -- ?type= — single ULD lookup by code or slug --
  if (typeParam) {
    const t = typeParam.trim();
    const uld = getULD(t);

    if (!uld) {
      return NextResponse.json(
        {
          error: `No ULD found matching "${t}".`,
          hint: 'Use the IATA type code (e.g. AKE) or slug (e.g. ake-ld3).',
        },
        { status: 404, headers },
      );
    }

    return NextResponse.json(
      { result: toApiResponse(uld), meta: ULD_META },
      { status: 200, headers },
    );
  }

  // -- ?category= — filter by category --
  if (categoryParam) {
    const cat = categoryParam.trim().toLowerCase();
    const valid = ['container', 'pallet', 'special'];

    if (!valid.includes(cat)) {
      return NextResponse.json(
        {
          error: `Invalid category "${categoryParam}". Must be one of: ${valid.join(', ')}.`,
        },
        { status: 400, headers },
      );
    }

    const results = getULDsByCategory(cat);

    return NextResponse.json(
      { count: results.length, results: results.map(toApiResponse), meta: ULD_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } },
    );
  }

  // -- ?deck= — filter by deck position --
  if (deckParam) {
    const deck = deckParam.trim().toLowerCase();
    const valid = ['lower', 'main'];

    if (!valid.includes(deck)) {
      return NextResponse.json(
        {
          error: `Invalid deck "${deckParam}". Must be one of: lower, main.`,
        },
        { status: 400, headers },
      );
    }

    const results = getULDsByDeck(deck);

    return NextResponse.json(
      { count: results.length, results: results.map(toApiResponse), meta: ULD_META },
      { status: 200, headers: { ...headers, 'X-Total-Count': String(results.length) } },
    );
  }

  // -- No params → return all --
  const all = getAllULDs();

  return NextResponse.json(
    {
      count: all.length,
      results: all.map(toApiResponse),
      meta: ULD_META,
      usage: {
        examples: [
          '/api/uld',
          '/api/uld?type=AKE',
          '/api/uld?type=ake-ld3',
          '/api/uld?category=container',
          '/api/uld?category=pallet',
          '/api/uld?category=special',
          '/api/uld?deck=lower',
          '/api/uld?deck=main',
        ],
      },
    },
    { status: 200, headers: { ...headers, 'X-Total-Count': String(all.length) } },
  );
}

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
