import { NextRequest, NextResponse } from 'next/server';
import { calculateCbm } from '@/lib/calculations/cbm';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Window': '3600',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const errors: string[] = [];

  // ── Required params ──
  const rawL = p.get('l');
  const rawW = p.get('w');
  const rawH = p.get('h');

  if (!rawL) errors.push('Missing required parameter: l (length in cm)');
  if (!rawW) errors.push('Missing required parameter: w (width in cm)');
  if (!rawH) errors.push('Missing required parameter: h (height in cm)');

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required parameters.',
        details: errors,
        usage: '/api/cbm?l=120&w=80&h=100&pcs=5',
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const lengthCm = parseFloat(rawL!);
  const widthCm  = parseFloat(rawW!);
  const heightCm = parseFloat(rawH!);

  if (isNaN(lengthCm) || lengthCm <= 0) errors.push('l (length) must be a positive number in cm');
  if (isNaN(widthCm)  || widthCm  <= 0) errors.push('w (width) must be a positive number in cm');
  if (isNaN(heightCm) || heightCm <= 0) errors.push('h (height) must be a positive number in cm');

  // ── Optional params ──
  const rawPcs = p.get('pcs') ?? '1';
  const pieces = parseInt(rawPcs, 10);
  if (isNaN(pieces) || pieces < 1) errors.push('pcs (pieces) must be a positive integer (default: 1)');

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Validation error', details: errors },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = calculateCbm({ lengthCm, widthCm, heightCm, pieces });

  return NextResponse.json(
    {
      cbm_per_piece:  result.cbmPerPiece,
      total_cbm:      result.totalCbm,
      total_volume_m3: result.totalVolumeM3,
      cubic_feet:     result.cubicFeet,
      litres:         result.litres,
      cubic_inches:   result.cubicInches,
      pieces:         result.pieces,
      meta: {
        inputs: {
          length_cm: lengthCm,
          width_cm:  widthCm,
          height_cm: heightCm,
          pieces,
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
