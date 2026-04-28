import { NextRequest, NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import { calculateShipmentSummary } from '@/lib/calculations/shipment-summary';
import type { ShipmentRequest, ShipmentItem } from '@/lib/types/shipment';

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

async function _handleGET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with a JSON body.', usage: 'POST /api/shipment/summary with { mode, items: [...] }' },
    { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } },
  );
}

async function _handlePOST(req: NextRequest) {
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
      // Polyglot input — accept both casings on every item-level field.
      // Canonical form is snake_case (matches v0.2.0 downstream clients);
      // camelCase aliases preserved for backwards compat.
      const length = Number(item.length ?? item.l ?? 0);
      const width = Number(item.width ?? item.w ?? 0);
      const height = Number(item.height ?? item.h ?? 0);
      const weight = Number(item.weight ?? item.gross_weight ?? item.grossWeight ?? item.gw ?? 0);
      const quantity = Math.max(1, Math.round(Number(item.quantity ?? item.qty ?? 1)));

      if (length <= 0 || width <= 0 || height <= 0) {
        throw new Error(`Item ${i + 1}: length, width, and height are required and must be positive`);
      }

      return {
        description: item.description ? String(item.description) : undefined,
        length, width, height, weight, quantity,
        stackable: item.stackable !== false,
        palletType: ((item.pallet_type ?? item.palletType ?? item.pallet) ?? 'none') as ShipmentItem['palletType'],
        hsCode: (item.hs_code ?? item.hsCode) ? String(item.hs_code ?? item.hsCode) : undefined,
        unNumber: (item.un_number ?? item.unNumber) ? String(item.un_number ?? item.unNumber) : undefined,
        customsValue: (item.customs_value ?? item.customsValue) ? Number(item.customs_value ?? item.customsValue) : undefined,
      };
    });

    // Parse optional fields
    const origin = raw.origin as { locode?: string; country: string } | undefined;
    const destination = raw.destination as { locode?: string; country: string } | undefined;
    const incoterm = raw.incoterm ? String(raw.incoterm) : undefined;
    const freightCost = Number(raw.freight_cost ?? raw.freightCost ?? 0);
    const insuranceCost = Number(raw.insurance_cost ?? raw.insuranceCost ?? 0);
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

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
export const POST = withAuditRest(_handlePOST);
