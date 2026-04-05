import { NextRequest, NextResponse } from 'next/server';
import { calculateShipmentSummary } from '@/lib/calculations/shipment-summary';
import type { ShipmentRequest, ShipmentItem } from '@/lib/types/shipment';

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

    // Validate mode
    const mode = String(raw.mode ?? 'road') as ShipmentRequest['mode'];
    if (!['road', 'air', 'sea', 'multimodal'].includes(mode)) {
      return NextResponse.json({ error: 'mode must be road, air, sea, or multimodal' }, { status: 400, headers: h });
    }

    // Validate items
    const rawItems = raw.items as unknown[];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'items array is required (non-empty)' }, { status: 400, headers: h });
    }
    if (rawItems.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 items per shipment' }, { status: 400, headers: h });
    }

    const items: ShipmentItem[] = rawItems.map((r: unknown, i: number) => {
      const item = r as Record<string, unknown>;
      const length = Number(item.length ?? item.l ?? 0);
      const width = Number(item.width ?? item.w ?? 0);
      const height = Number(item.height ?? item.h ?? 0);
      const weight = Number(item.weight ?? item.grossWeight ?? item.gw ?? 0);
      const quantity = Math.max(1, Math.round(Number(item.quantity ?? item.qty ?? 1)));

      if (length <= 0 || width <= 0 || height <= 0) {
        throw new Error(`Item ${i + 1}: length, width, and height are required and must be positive`);
      }

      return {
        description: item.description ? String(item.description) : undefined,
        length, width, height, weight, quantity,
        stackable: item.stackable !== false,
        palletType: (item.palletType ?? item.pallet ?? 'none') as ShipmentItem['palletType'],
        hsCode: item.hsCode ? String(item.hsCode) : undefined,
        unNumber: item.unNumber ? String(item.unNumber) : undefined,
        customsValue: item.customsValue ? Number(item.customsValue) : undefined,
      };
    });

    // Parse optional fields
    const origin = raw.origin as { locode?: string; country: string } | undefined;
    const destination = raw.destination as { locode?: string; country: string } | undefined;
    const incoterm = raw.incoterm ? String(raw.incoterm) : undefined;
    const freightCost = Number(raw.freightCost ?? 0);
    const insuranceCost = Number(raw.insuranceCost ?? 0);
    const options = raw.options as ShipmentRequest['options'];

    const result = await calculateShipmentSummary({
      mode, items, origin, destination, incoterm, freightCost, insuranceCost, options,
    });

    return NextResponse.json(result, { headers: h });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400, headers: h });
  }
}
