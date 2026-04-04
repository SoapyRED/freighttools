import { NextRequest, NextResponse } from 'next/server';
import { calculateDuty } from '@/lib/calculations/duty';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Window': '86400',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const h = { ...CORS, 'Content-Type': 'application/json' };

  try {
    const body = await req.json();
    const raw = body as Record<string, unknown>;

    const commodityCode = String(raw.commodityCode ?? raw.commodity_code ?? raw.code ?? '').trim();
    const originCountry = String(raw.originCountry ?? raw.origin_country ?? raw.origin ?? '').trim().toUpperCase();
    const customsValue = Number(raw.customsValue ?? raw.customs_value ?? raw.value ?? 0);
    const freightCost = Number(raw.freightCost ?? raw.freight_cost ?? raw.freight ?? 0);
    const insuranceCost = Number(raw.insuranceCost ?? raw.insurance_cost ?? raw.insurance ?? 0);
    const incoterm = String(raw.incoterm ?? raw.incoterms ?? '').trim().toUpperCase() || undefined;

    if (!commodityCode || commodityCode.length < 6) {
      return NextResponse.json({ error: 'commodity_code is required (min 6 digits)' }, { status: 400, headers: h });
    }
    if (!originCountry || originCountry.length !== 2) {
      return NextResponse.json({ error: 'origin_country is required (ISO 2-letter code)' }, { status: 400, headers: h });
    }
    if (customsValue <= 0) {
      return NextResponse.json({ error: 'customs_value must be a positive number' }, { status: 400, headers: h });
    }

    const result = await calculateDuty({
      commodityCode,
      originCountry,
      customsValue,
      freightCost,
      insuranceCost,
      incoterm,
    });

    return NextResponse.json(result, { headers: h });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400, headers: h });
  }
}
