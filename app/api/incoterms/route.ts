import { NextRequest, NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import { getAllIncoterms, lookupByCode, getAnyMode, getSeaOnly } from '@/lib/calculations/incoterms';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'X-RateLimit-Limit': '25', 'X-RateLimit-Window': '86400' };
const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

async function _handleGET(req: NextRequest) {
  const h = { ...CORS, ...CACHE };
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const category = searchParams.get('category');

  if (code) {
    const term = lookupByCode(code);
    if (!term) return NextResponse.json({ error: `INCOTERM "${code.toUpperCase()}" not found.`, valid_codes: 'EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF' }, { status: 404, headers: h });
    return NextResponse.json(term, { headers: h });
  }

  if (category) {
    const cat = category.toLowerCase();
    if (cat === 'any_mode') return NextResponse.json({ count: getAnyMode().length, results: getAnyMode() }, { headers: h });
    if (cat === 'sea_only') return NextResponse.json({ count: getSeaOnly().length, results: getSeaOnly() }, { headers: h });
    return NextResponse.json({ error: `Invalid category "${category}". Use "any_mode" or "sea_only".` }, { status: 400, headers: h });
  }

  return NextResponse.json({ count: getAllIncoterms().length, results: getAllIncoterms() }, { headers: h });
}

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
