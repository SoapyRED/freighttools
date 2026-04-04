import { NextRequest, NextResponse } from 'next/server';
import { search, lookupByCode, TOTAL_ENTRIES } from '@/lib/calculations/unlocode';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Window': '86400',
};

const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET(req: NextRequest) {
  const h = { ...CORS, ...CACHE, 'Content-Type': 'application/json' };
  const sp = req.nextUrl.searchParams;

  const code = sp.get('code');
  const q = sp.get('q') ?? sp.get('search') ?? '';
  const country = sp.get('country') ?? undefined;
  const func = sp.get('function') ?? sp.get('func') ?? undefined;
  const limit = Math.min(Math.max(1, parseInt(sp.get('limit') ?? '20')), 100);

  // Single code lookup
  if (code) {
    const entry = lookupByCode(code);
    if (!entry) {
      return NextResponse.json({ error: `UN/LOCODE "${code}" not found` }, { status: 404, headers: h });
    }
    return NextResponse.json(entry, { headers: h });
  }

  // Search
  if (!q && !country && !func) {
    return NextResponse.json({
      total_entries: TOTAL_ENTRIES,
      message: 'Provide ?q= (search), ?code= (exact lookup), ?country= (filter), or ?function= (port/airport/rail/road/icd/border)',
      example: '/api/unlocode?q=rotterdam',
    }, { headers: h });
  }

  const results = search(q, { country, func, limit });

  return NextResponse.json({
    query: q || undefined,
    country: country || undefined,
    function: func || undefined,
    count: results.length,
    results,
    meta: {
      source: 'UNECE UN/LOCODE 2024-2 (PDDL)',
      total_entries: TOTAL_ENTRIES,
    },
  }, { headers: h });
}
