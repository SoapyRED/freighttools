import { NextRequest, NextResponse } from 'next/server';
import { convert, UNITS, FREIGHT_CONVERSIONS } from '@/lib/calculations/converter';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'X-RateLimit-Limit': '100', 'X-RateLimit-Window': '86400' };
const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

export function GET(req: NextRequest) {
  const h = { ...CORS, ...CACHE };
  const { searchParams } = req.nextUrl;
  const valueStr = searchParams.get('value');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const freightTargets = Object.keys(FREIGHT_CONVERSIONS).map(k => k.split('->')[1]);

  if (!valueStr || !from || !to) {
    return NextResponse.json({
      error: 'Missing required parameters.',
      usage: '?value=100&from=kg&to=lbs',
      supported_units: [...Object.keys(UNITS), ...freightTargets],
    }, { status: 400, headers: h });
  }

  const value = parseFloat(valueStr);
  if (isNaN(value)) {
    return NextResponse.json({ error: `Invalid value "${valueStr}". Must be a number.` }, { status: 400, headers: h });
  }

  const result = convert(value, from, to);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400, headers: h });
  }

  return NextResponse.json(result, { headers: h });
}
