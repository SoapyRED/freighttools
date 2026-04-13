import { NextRequest, NextResponse } from 'next/server';
import { calculateChargeableWeight, calculateSeaChargeableWeight, DEFAULT_FACTOR } from '@/lib/calculations/chargeable-weight';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-RateLimit-Limit': '25',
  'X-RateLimit-Window': '86400',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const errors: string[] = [];

  // ── Required params ──
  const rawL  = p.get('l');
  const rawW  = p.get('w');
  const rawH  = p.get('h');
  const rawGw = p.get('gw');

  if (!rawL)  errors.push('Missing required parameter: l (length in cm)');
  if (!rawW)  errors.push('Missing required parameter: w (width in cm)');
  if (!rawH)  errors.push('Missing required parameter: h (height in cm)');
  if (!rawGw) errors.push('Missing required parameter: gw (gross weight in kg)');

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required parameters.',
        details: errors,
        usage: '/api/chargeable-weight?l=120&w=80&h=100&gw=500&pcs=2&factor=6000',
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const lengthCm     = parseFloat(rawL!);
  const widthCm      = parseFloat(rawW!);
  const heightCm     = parseFloat(rawH!);
  const grossWeightKg = parseFloat(rawGw!);

  if (isNaN(lengthCm)      || lengthCm <= 0)       errors.push('l (length) must be a positive number in cm');
  if (isNaN(widthCm)       || widthCm <= 0)        errors.push('w (width) must be a positive number in cm');
  if (isNaN(heightCm)      || heightCm <= 0)       errors.push('h (height) must be a positive number in cm');
  if (isNaN(grossWeightKg) || grossWeightKg <= 0)  errors.push('gw (gross weight) must be a positive number in kg');

  // ── Optional params ──
  const rawPcs    = p.get('pcs') ?? '1';
  const rawFactor = p.get('factor') ?? String(DEFAULT_FACTOR);

  const pieces = parseInt(rawPcs, 10);
  const factor = parseInt(rawFactor, 10);

  if (isNaN(pieces) || pieces < 1)    errors.push('pcs (pieces) must be a positive integer (default: 1)');
  if (isNaN(factor) || factor <= 0)   errors.push('factor must be a positive number (default: 6000)');

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Validation error', details: errors },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // ── Mode ──
  const mode = p.get('mode') ?? 'air';

  if (mode === 'sea') {
    const seaResult = calculateSeaChargeableWeight({ lengthCm, widthCm, heightCm, grossWeightKg, pieces });
    return NextResponse.json({
      chargeable_weight_kg: seaResult.chargeableWeightKg,
      basis: seaResult.billingBasis,
      gross_weight_kg: seaResult.grossWeightKg,
      gross_weight_tonnes: seaResult.grossWeightTonnes,
      revenue_tonnes: seaResult.revenueTonnes,
      cbm: seaResult.cbm,
      ratio: seaResult.ratio,
      billing_basis: seaResult.billingBasis,
      mode: 'sea',
      pieces: seaResult.pieces,
      meta: { inputs: { length_cm: lengthCm, width_cm: widthCm, height_cm: heightCm, gross_weight_kg: grossWeightKg, pieces, mode: 'sea' } },
    }, { headers: CORS_HEADERS });
  }

  // ── Calculate (air mode) ──
  const result = calculateChargeableWeight({
    lengthCm,
    widthCm,
    heightCm,
    grossWeightKg,
    pieces,
    factor,
  });

  return NextResponse.json(
    {
      chargeable_weight_kg:          result.chargeableWeightKg,
      basis:                          result.basis,
      gross_weight_kg:               result.grossWeightKg,
      volumetric_weight_kg:          result.volumetricWeightTotalKg,
      volumetric_weight_per_piece_kg: result.volumetricWeightPerPieceKg,
      cbm:                            result.cbm,
      ratio:                          result.ratio,
      factor:                         result.factor,
      pieces:                         result.pieces,
      meta: {
        inputs: {
          length_cm:       lengthCm,
          width_cm:        widthCm,
          height_cm:       heightCm,
          gross_weight_kg: grossWeightKg,
          pieces,
          factor,
        },
      },
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
