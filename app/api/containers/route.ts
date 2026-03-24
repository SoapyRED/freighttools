import { NextRequest, NextResponse } from 'next/server';
import { getAllContainerSpecs, getContainerSpec, calculateContainerLoading } from '@/lib/calculations/container-capacity';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

export function GET(req: NextRequest) {
  const h = { ...CORS, ...CACHE };
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type');

  // No type → return all specs
  if (!type) {
    const specs = getAllContainerSpecs();
    return NextResponse.json({ count: specs.length, results: specs }, { headers: h });
  }

  const spec = getContainerSpec(type);
  if (!spec) {
    return NextResponse.json(
      { error: `Container type "${type}" not found.`, valid_types: getAllContainerSpecs().map(s => s.slug) },
      { status: 404, headers: h },
    );
  }

  // Check for loading calculation params
  const l = searchParams.get('l');
  const w = searchParams.get('w');
  const hParam = searchParams.get('h');

  if (l && w && hParam) {
    const itemL = parseFloat(l);
    const itemW = parseFloat(w);
    const itemH = parseFloat(hParam);
    const itemWt = parseFloat(searchParams.get('wt') || '0');
    const qty = parseInt(searchParams.get('qty') || '1', 10);

    if (isNaN(itemL) || isNaN(itemW) || isNaN(itemH) || itemL <= 0 || itemW <= 0 || itemH <= 0) {
      return NextResponse.json({ error: 'l, w, h must be positive numbers (cm).' }, { status: 400, headers: h });
    }

    const result = calculateContainerLoading(type, itemL, itemW, itemH, itemWt, qty);
    if (!result) {
      return NextResponse.json({ error: 'Calculation failed.' }, { status: 500, headers: h });
    }

    const { container, ...loading } = result;
    return NextResponse.json({ container: spec, loading }, { headers: h });
  }

  // Just return the spec
  return NextResponse.json(spec, { headers: h });
}
