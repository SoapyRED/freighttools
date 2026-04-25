import { NextRequest, NextResponse } from 'next/server';
import {
  calculateConsignment,
  type ConsignmentItemInput,
  type ConsignmentItemResult,
  type ConsignmentMode,
  type ConsignmentResult,
} from '@/lib/calculations/consignment';

// API response shape (snake_case). Internal ConsignmentResult uses camelCase.
function toItemResponse(item: ConsignmentItemResult) {
  return {
    description: item.description,
    dimensions: {
      length_cm: item.dimensions.lengthCm,
      width_cm: item.dimensions.widthCm,
      height_cm: item.dimensions.heightCm,
    },
    quantity: item.quantity,
    cbm: item.cbm,
    gross_weight_kg: item.grossWeightKg,
    ldm: item.ldm,
    chargeable_weight_air: item.chargeableWeightAir,
    chargeable_weight_road: item.chargeableWeightRoad,
    chargeable_weight_sea: item.chargeableWeightSea,
    revenue_tonnes: item.revenueTonnes,
    pallet_spaces: item.palletSpaces,
    stackable: item.stackable,
    pallet_type: item.palletType,
  };
}

function toApiResponse(r: ConsignmentResult) {
  return {
    items: r.items.map(toItemResponse),
    totals: {
      cbm: r.totals.cbm,
      gross_weight_kg: r.totals.grossWeightKg,
      ldm: r.totals.ldm,
      chargeable_weight_air: r.totals.chargeableWeightAir,
      chargeable_weight_road: r.totals.chargeableWeightRoad,
      chargeable_weight_sea: r.totals.chargeableWeightSea,
      revenue_tonnes: r.totals.revenueTonnes,
      pallet_spaces: r.totals.palletSpaces,
      item_count: r.totals.itemCount,
      piece_count: r.totals.pieceCount,
    },
    mode: r.mode,
    billing_basis: r.billingBasis,
    trailer: {
      utilisation_percent: r.trailer.utilisationPercent,
      weight_utilisation_percent: r.trailer.weightUtilisationPercent,
      pallet_spaces_used: r.trailer.palletSpacesUsed,
      pallet_spaces_available: r.trailer.palletSpacesAvailable,
      fits: r.trailer.fits,
    },
    sea: {
      suggested_container: r.sea.suggestedContainer,
      container_count: r.sea.containerCount,
    },
    suggested_vehicle: r.suggestedVehicle,
    warnings: r.warnings,
  };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-RateLimit-Limit': '25',
  'X-RateLimit-Window': '86400',
};

const CACHE = { 'Cache-Control': 'no-store' };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const h = { ...CORS, ...CACHE, 'Content-Type': 'application/json' };

  try {
    const body = await req.json();
    const rawItems: unknown[] = body?.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: items (non-empty array)' },
        { status: 400, headers: h },
      );
    }

    if (rawItems.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 items per consignment' },
        { status: 400, headers: h },
      );
    }

    const items: ConsignmentItemInput[] = rawItems.map((rawItem: unknown, i: number) => {
      const raw = rawItem as Record<string, unknown>;
      const lengthCm = Number(raw.length ?? raw.lengthCm ?? raw.l);
      const widthCm = Number(raw.width ?? raw.widthCm ?? raw.w);
      const heightCm = Number(raw.height ?? raw.heightCm ?? raw.h);
      const quantity = Math.max(1, Math.round(Number(raw.quantity ?? raw.qty ?? 1)));
      const grossWeightKg = Number(raw.grossWeight ?? raw.grossWeightKg ?? raw.weight ?? raw.gw ?? 0);

      if (!lengthCm || !widthCm || !heightCm || lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) {
        throw new Error(`Item ${i + 1}: length, width, and height are required and must be positive`);
      }

      return {
        description: String(raw.description ?? raw.desc ?? ''),
        lengthCm,
        widthCm,
        heightCm,
        quantity,
        grossWeightKg,
        stackable: raw.stackable === true || raw.stackable === 'true',
        palletType: String(raw.palletType ?? raw.pallet ?? 'none'),
      };
    });

    const modeRaw = String(body?.mode ?? 'road');
    const mode: ConsignmentMode = (['road', 'air', 'sea'].includes(modeRaw) ? modeRaw : 'road') as ConsignmentMode;
    const result = calculateConsignment(items, mode);

    return NextResponse.json(toApiResponse(result), { headers: h });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400, headers: h });
  }
}
