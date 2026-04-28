import { NextRequest, NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import { calculateLdm } from '@/lib/calculations/ldm';
import { PALLET_PRESET_MAP } from '@/lib/data/pallets';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-RateLimit-Limit': '25',
  'X-RateLimit-Window': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function _handleGET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // ── Parse & validate ──
  const errors: string[] = [];

  // Length
  const rawLength = searchParams.get('length');
  const rawWidth  = searchParams.get('width');
  const palletId  = searchParams.get('pallet');  // shorthand preset

  let lengthMm: number;
  let widthMm: number;

  if (palletId) {
    const preset = PALLET_PRESET_MAP[palletId];
    if (!preset) {
      errors.push(`Unknown pallet preset "${palletId}". Valid values: euro, uk, half, quarter`);
      return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400, headers: CORS_HEADERS });
    }
    lengthMm = preset.lengthMm;
    widthMm  = preset.widthMm;
  } else {
    if (!rawLength) errors.push('Missing required parameter: length (mm)');
    if (!rawWidth)  errors.push('Missing required parameter: width (mm)');
    lengthMm = rawLength ? parseFloat(rawLength) : 0;
    widthMm  = rawWidth  ? parseFloat(rawWidth)  : 0;
    if (rawLength && (isNaN(lengthMm) || lengthMm <= 0)) errors.push('length must be a positive number in millimetres');
    if (rawWidth  && (isNaN(widthMm)  || widthMm  <= 0)) errors.push('width must be a positive number in millimetres');
  }

  // Qty
  const rawQty = searchParams.get('qty') ?? '1';
  const qty = parseInt(rawQty, 10);
  if (isNaN(qty) || qty < 1) errors.push('qty must be a positive integer (default: 1)');

  // Stackable
  const stackableRaw = searchParams.get('stackable') ?? 'false';
  const stackable = stackableRaw === 'true' || stackableRaw === '1';

  // Stack factor
  const rawStack = searchParams.get('stack') ?? '2';
  const stackFactor = parseInt(rawStack, 10);
  if (stackable && (isNaN(stackFactor) || stackFactor < 2 || stackFactor > 3)) {
    errors.push('stack must be 2 or 3 when stackable=true');
  }

  // Weight
  const rawWeight = searchParams.get('weight');
  const weightPerPalletKg = rawWeight ? parseFloat(rawWeight) : null;
  if (rawWeight && (isNaN(weightPerPalletKg!) || weightPerPalletKg! < 0)) {
    errors.push('weight must be a non-negative number in kg');
  }

  // Vehicle
  const vehicleId = searchParams.get('vehicle') ?? 'artic';
  const rawCustomLen = searchParams.get('vehicle_length');
  const customVehicleLengthM = rawCustomLen ? parseFloat(rawCustomLen) : null;
  if (vehicleId === 'custom' && !rawCustomLen) {
    errors.push('vehicle_length (metres) is required when vehicle=custom');
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Validation error', details: errors },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // ── Calculate ──
  const result = calculateLdm({
    lengthMm,
    widthMm,
    qty,
    stackable,
    stackFactor,
    weightPerPalletKg,
    vehicleId: vehicleId !== 'custom' ? vehicleId : undefined,
    customVehicleLengthM,
  });

  // ── Shape response ──
  const response = {
    ldm: result.ldm,
    vehicle: {
      name: result.vehicle.name,
      length_m: result.vehicle.lengthM,
      max_payload_kg: result.vehicle.maxPayloadKg,
    },
    utilisation_percent: result.utilisationPercent,
    pallet_spaces: {
      used: result.palletSpaces.used,
      available: result.palletSpaces.available,
    },
    total_weight_kg: result.totalWeightKg,
    fits: result.fits,
    warnings: result.warnings.map(w => ({ type: w.type, message: w.message })),
    meta: {
      inputs: {
        length_mm: lengthMm,
        width_mm: widthMm,
        qty,
        stackable,
        stack_factor: stackFactor,
        weight_per_pallet_kg: weightPerPalletKg,
        vehicle: vehicleId,
      },
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
