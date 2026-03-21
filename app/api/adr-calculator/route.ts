import { NextRequest, NextResponse } from 'next/server';
import {
  lookupByUnNumber,
  normaliseUnNumber,
} from '@/lib/calculations/adr';

// -----------------------------------------------------------------
//  Headers
// -----------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

// -----------------------------------------------------------------
//  OPTIONS -- CORS preflight
// -----------------------------------------------------------------

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// -----------------------------------------------------------------
//  Transport-category multiplier lookup
// -----------------------------------------------------------------

function getMultiplier(transportCategory: string | null): number | null {
  switch (transportCategory) {
    case '0':                return null;
    case '1':                return 50;
    case '2':                return 3;
    case '3':                return 1;
    case '4':                return 0;
    case null:
    case '-':
    case 'See SP 671':       return null;
    default:                 return null;
  }
}

// -----------------------------------------------------------------
//  Shared calculation logic
// -----------------------------------------------------------------

interface RequestItem {
  un_number: string;
  quantity: number;
}

interface ResultItem {
  un_number: string;
  proper_shipping_name: string;
  class: string;
  transport_category: string | null;
  quantity: number;
  multiplier: number | null;
  points: number | null;
}

function calculate(items: RequestItem[], headers: Record<string, string>) {
  const resultItems: ResultItem[] = [];
  let totalPoints = 0;
  let hasCategoryZero = false;

  for (const item of items) {
    const normalised = normaliseUnNumber(String(item.un_number));

    if (!/^\d{4}$/.test(normalised)) {
      return NextResponse.json(
        { error: `Invalid UN number "${item.un_number}". Must be a 1-4 digit number.` },
        { status: 400, headers },
      );
    }

    const entries = lookupByUnNumber(normalised);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: `UN number ${normalised} not found in ADR 2025 dataset.` },
        { status: 400, headers },
      );
    }

    const variant = entries[0];
    const tc = variant.transport_category;
    const multiplier = getMultiplier(tc);

    if (tc === '0') {
      hasCategoryZero = true;
    }

    const qty = Number(item.quantity) || 0;
    const points = multiplier !== null ? multiplier * qty : null;

    if (points !== null) {
      totalPoints += points;
    }

    resultItems.push({
      un_number: normalised,
      proper_shipping_name: variant.proper_shipping_name,
      class: variant.class,
      transport_category: tc,
      quantity: qty,
      multiplier,
      points,
    });
  }

  const threshold = 1000;
  let exempt: boolean;
  let message: string;

  if (hasCategoryZero) {
    exempt = false;
    message = 'Category 0 substance in load \u2014 full ADR compliance required';
  } else if (totalPoints > threshold) {
    exempt = false;
    message = 'Total points exceed 1,000 threshold \u2014 full ADR compliance required';
  } else {
    exempt = true;
    message = '1.1.3.6 exemption applies';
  }

  return NextResponse.json(
    {
      items: resultItems,
      total_points: totalPoints,
      threshold,
      exempt,
      has_category_zero: hasCategoryZero,
      message,
    },
    { status: 200, headers },
  );
}

// -----------------------------------------------------------------
//  GET /api/adr-calculator?un=1203&qty=200
// -----------------------------------------------------------------

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const unParam  = searchParams.get('un');
  const qtyParam = searchParams.get('qty');

  const headers = { ...CORS_HEADERS, ...CACHE_HEADERS };

  if (!unParam || !qtyParam) {
    return NextResponse.json(
      {
        error: 'Missing required parameters.',
        usage: 'Provide both: ?un=1203&qty=200',
        examples: ['/api/adr-calculator?un=1203&qty=200'],
      },
      { status: 400, headers },
    );
  }

  const qty = Number(qtyParam);
  if (isNaN(qty) || qty < 0) {
    return NextResponse.json(
      { error: `Invalid quantity "${qtyParam}". Must be a non-negative number.` },
      { status: 400, headers },
    );
  }

  return calculate([{ un_number: unParam, quantity: qty }], headers);
}

// -----------------------------------------------------------------
//  POST /api/adr-calculator  { items: [{ un_number, quantity }] }
// -----------------------------------------------------------------

export async function POST(req: NextRequest) {
  const headers = { ...CORS_HEADERS, ...CACHE_HEADERS };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400, headers },
    );
  }

  const { items } = body as { items?: unknown };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        error: 'Request body must contain a non-empty "items" array.',
        usage: '{ "items": [{ "un_number": "1203", "quantity": 200 }] }',
      },
      { status: 400, headers },
    );
  }

  for (const item of items) {
    if (!item || typeof item !== 'object' || !('un_number' in item) || !('quantity' in item)) {
      return NextResponse.json(
        { error: 'Each item must have "un_number" and "quantity" fields.' },
        { status: 400, headers },
      );
    }
  }

  return calculate(items as RequestItem[], headers);
}
