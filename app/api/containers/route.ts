import { NextRequest, NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import { getAllContainerSpecs, getContainerSpec, calculateContainerLoading, type ContainerSpec, type LoadingResult } from '@/lib/calculations/container-capacity';

// API response shape (snake_case). Internal ContainerSpec/LoadingResult use camelCase.
function toContainerSpecResponse(c: ContainerSpec) {
  return {
    slug: c.slug,
    name: c.name,
    internal_length_cm: c.internalLengthCm,
    internal_width_cm: c.internalWidthCm,
    internal_height_cm: c.internalHeightCm,
    capacity_cbm: c.capacityCbm,
    external_length_cm: c.externalLengthCm,
    external_width_cm: c.externalWidthCm,
    external_height_cm: c.externalHeightCm,
    door_width_cm: c.doorWidthCm,
    door_height_cm: c.doorHeightCm,
    tare_weight_kg: c.tareWeightKg,
    max_gross_kg: c.maxGrossKg,
    max_payload_kg: c.maxPayloadKg,
    euro_pallets: c.euroPallets,
    gma_pallets: c.gmaPallets,
    description: c.description,
    notes: c.notes,
  };
}

function toLoadingResultResponse(l: Omit<LoadingResult, 'container'>) {
  return {
    items_per_row: l.itemsPerRow,
    items_per_col: l.itemsPerCol,
    items_per_layer: l.itemsPerLayer,
    layers: l.layers,
    total_items_fit: l.totalItemsFit,
    items_requested: l.itemsRequested,
    all_fit: l.allFit,
    total_weight_kg: l.totalWeightKg,
    volume_used_cbm: l.volumeUsedCbm,
    volume_utilisation: l.volumeUtilisation,
    weight_utilisation: l.weightUtilisation,
    limiting_factor: l.limitingFactor,
    warnings: l.warnings,
  };
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'X-RateLimit-Limit': '25', 'X-RateLimit-Window': '86400' };
const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

async function _handleGET(req: NextRequest) {
  const h = { ...CORS, ...CACHE };
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type');

  // No type → return all specs
  if (!type) {
    const specs = getAllContainerSpecs();
    return NextResponse.json({ count: specs.length, results: specs.map(toContainerSpecResponse) }, { headers: h });
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

    const { container: _container, ...loading } = result;
    return NextResponse.json(
      { container: toContainerSpecResponse(spec), loading: toLoadingResultResponse(loading) },
      { headers: h },
    );
  }

  // Just return the spec
  return NextResponse.json(toContainerSpecResponse(spec), { headers: h });
}

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
