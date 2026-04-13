import { NextRequest, NextResponse } from 'next/server';
import { calculatePalletFitting } from '@/lib/calculations/pallet-fitting';

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

  // ── Required params ──────────────────────────────────────────
  const rawPl  = p.get('pl');
  const rawPw  = p.get('pw');
  const rawPmh = p.get('pmh');
  const rawBl  = p.get('bl');
  const rawBw  = p.get('bw');
  const rawBh  = p.get('bh');

  if (!rawPl)  errors.push('Missing required parameter: pl (pallet length in cm)');
  if (!rawPw)  errors.push('Missing required parameter: pw (pallet width in cm)');
  if (!rawPmh) errors.push('Missing required parameter: pmh (pallet max stack height in cm)');
  if (!rawBl)  errors.push('Missing required parameter: bl (box length in cm)');
  if (!rawBw)  errors.push('Missing required parameter: bw (box width in cm)');
  if (!rawBh)  errors.push('Missing required parameter: bh (box height in cm)');

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required parameters.',
        details: errors,
        usage: '/api/pallet?pl=120&pw=80&pmh=180&bl=40&bw=30&bh=25',
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const palletLengthCm   = parseFloat(rawPl!);
  const palletWidthCm    = parseFloat(rawPw!);
  const palletMaxHeightCm = parseFloat(rawPmh!);
  const boxLengthCm      = parseFloat(rawBl!);
  const boxWidthCm       = parseFloat(rawBw!);
  const boxHeightCm      = parseFloat(rawBh!);

  if (isNaN(palletLengthCm)    || palletLengthCm    <= 0) errors.push('pl (pallet length) must be a positive number in cm');
  if (isNaN(palletWidthCm)     || palletWidthCm     <= 0) errors.push('pw (pallet width) must be a positive number in cm');
  if (isNaN(palletMaxHeightCm) || palletMaxHeightCm <= 0) errors.push('pmh (pallet max height) must be a positive number in cm');
  if (isNaN(boxLengthCm)       || boxLengthCm       <= 0) errors.push('bl (box length) must be a positive number in cm');
  if (isNaN(boxWidthCm)        || boxWidthCm        <= 0) errors.push('bw (box width) must be a positive number in cm');
  if (isNaN(boxHeightCm)       || boxHeightCm       <= 0) errors.push('bh (box height) must be a positive number in cm');

  // ── Optional params ──────────────────────────────────────────
  const rawPh   = p.get('ph');
  const rawBwt  = p.get('bwt');
  const rawMpw  = p.get('mpw');
  const rawRot  = p.get('rotate');

  const palletHeightCm     = rawPh  != null ? parseFloat(rawPh)  : 15;
  const boxWeightKg        = rawBwt != null ? parseFloat(rawBwt) : undefined;
  const maxPayloadWeightKg = rawMpw != null ? parseFloat(rawMpw) : undefined;
  const allowRotation      = rawRot !== 'false';

  if (rawPh  != null && (isNaN(palletHeightCm)     || palletHeightCm     < 0)) errors.push('ph (pallet height) must be a non-negative number in cm');
  if (rawBwt != null && (isNaN(boxWeightKg!)        || boxWeightKg!       <= 0)) errors.push('bwt (box weight) must be a positive number in kg');
  if (rawMpw != null && (isNaN(maxPayloadWeightKg!) || maxPayloadWeightKg! <= 0)) errors.push('mpw (max pallet weight) must be a positive number in kg');

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Validation error', details: errors },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const result = calculatePalletFitting({
    palletLengthCm,
    palletWidthCm,
    palletMaxHeightCm,
    palletHeightCm,
    boxLengthCm,
    boxWidthCm,
    boxHeightCm,
    boxWeightKg,
    maxPayloadWeightKg,
    allowRotation,
  });

  return NextResponse.json(
    {
      boxes_per_layer:            result.boxesPerLayer,
      layers:                     result.layers,
      total_boxes:                result.totalBoxes,
      orientation:                result.orientation,
      boxes_per_row:              result.layout.boxesPerRow,
      boxes_per_col:              result.layout.boxesPerCol,
      usable_height_cm:           result.usableHeightCm,
      utilisation_percent:        result.utilisationPercent,
      total_box_volume_cbm:       result.totalBoxVolumeCbm,
      pallet_volume_cbm:          result.palletVolumeCbm,
      wasted_space_cbm:           result.wastedSpaceCbm,
      weight_limited:             result.weightLimited,
      total_weight_kg:            result.totalWeightKg,
      remaining_weight_capacity_kg: result.remainingWeightCapacityKg,
      meta: {
        inputs: {
          pallet_length_cm:     palletLengthCm,
          pallet_width_cm:      palletWidthCm,
          pallet_max_height_cm: palletMaxHeightCm,
          pallet_height_cm:     palletHeightCm,
          box_length_cm:        boxLengthCm,
          box_width_cm:         boxWidthCm,
          box_height_cm:        boxHeightCm,
          box_weight_kg:        boxWeightKg ?? null,
          max_payload_weight_kg: maxPayloadWeightKg ?? null,
          allow_rotation:       allowRotation,
        },
      },
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
