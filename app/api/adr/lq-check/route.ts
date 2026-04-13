import { NextRequest, NextResponse } from 'next/server';
import { checkLqEq, type LqEqItem } from '@/lib/calculations/lq-eq';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-RateLimit-Limit': '25',
  'X-RateLimit-Window': '86400',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET() {
  return NextResponse.json({
    error: 'Use POST with a JSON body',
    usage: {
      method: 'POST',
      body: {
        mode: 'lq or eq',
        items: [{ un_number: '1203', quantity: 0.5, unit: 'L' }],
      },
    },
  }, { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } });
}

export async function POST(req: NextRequest) {
  const h = { ...CORS, 'Content-Type': 'application/json' };

  try {
    const body = await req.json();
    const raw = body as Record<string, unknown>;

    // Validate mode
    const mode = String(raw.mode ?? 'lq');
    if (!['lq', 'eq'].includes(mode)) {
      return NextResponse.json({ error: "mode must be 'lq' or 'eq'" }, { status: 400, headers: h });
    }

    // Validate items
    const rawItems = raw.items as unknown[];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'items array is required (non-empty)' }, { status: 400, headers: h });
    }
    if (rawItems.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 items per check' }, { status: 400, headers: h });
    }

    const validUnits = ['ml', 'L', 'g', 'kg'];
    const items: LqEqItem[] = rawItems.map((r: unknown, i: number) => {
      const item = r as Record<string, unknown>;
      const un = String(item.un_number ?? '').replace(/^UN/i, '');
      const qty = Number(item.quantity);
      const unit = String(item.unit ?? 'L');

      if (!un || un.length < 1 || un.length > 4) {
        throw new Error(`Item ${i + 1}: un_number must be a 1-4 digit number`);
      }
      if (!qty || qty <= 0) {
        throw new Error(`Item ${i + 1}: quantity must be a positive number`);
      }
      if (!validUnits.includes(unit)) {
        throw new Error(`Item ${i + 1}: unit must be one of: ${validUnits.join(', ')}`);
      }

      return {
        un_number: un,
        quantity: qty,
        unit: unit as LqEqItem['unit'],
        inner_packaging_qty: item.inner_packaging_qty ? Number(item.inner_packaging_qty) : undefined,
      };
    });

    const result = checkLqEq(mode as 'lq' | 'eq', items);
    return NextResponse.json(result, { headers: h });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400, headers: h });
  }
}
