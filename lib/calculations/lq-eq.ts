/**
 * ADR Limited Quantity (LQ) and Excepted Quantity (EQ) checker.
 *
 * LQ: ADR Chapter 3.4 — per inner packaging limits from Table A Column 7a
 * EQ: ADR Chapter 3.5 — per inner + per outer limits from Table A Column 7b
 */

import adrData from '@/lib/data/adr-2025.json';

// ─── Types ─────────────────────────────────────────────────────

interface AdrEntry {
  un_number: string;
  proper_shipping_name: string;
  class: string;
  packing_group: string;
  limited_quantity: string;
  excepted_quantity: string;
  transport_category: string;
}

export interface LqEqItem {
  un_number: string;
  quantity: number;
  unit: 'ml' | 'L' | 'g' | 'kg';
  inner_packaging_qty?: number;
}

export interface LqEqResultItem {
  un_number: string;
  substance: string;
  class: string;
  packing_group: string;
  lq_limit: string;
  lq_limit_value: number | null;
  lq_limit_unit: string | null;
  eq_code: string;
  quantity_entered: number;
  unit_entered: string;
  status: 'within_limit' | 'exceeds_limit' | 'not_permitted';
  reason: string;
}

export interface LqEqResult {
  mode: 'lq' | 'eq';
  overall_status: 'qualifies' | 'does_not_qualify' | 'partial';
  items: LqEqResultItem[];
  summary: {
    total_items: number;
    qualifying: number;
    exceeding: number;
    not_permitted: number;
  };
  references: {
    adr_chapter: string;
    table: string;
  };
}

// ─── EQ limits per code (ADR 3.5.1.2) ─────────────────────────

const EQ_LIMITS: Record<string, { maxInnerMl: number; maxOuterMl: number; maxInnerG: number; maxOuterG: number } | null> = {
  'E0': null, // not permitted
  'E1': { maxInnerMl: 30, maxOuterMl: 1000, maxInnerG: 30, maxOuterG: 1000 },
  'E2': { maxInnerMl: 30, maxOuterMl: 500, maxInnerG: 30, maxOuterG: 500 },
  'E3': { maxInnerMl: 30, maxOuterMl: 300, maxInnerG: 30, maxOuterG: 300 },
  'E4': { maxInnerMl: 1, maxOuterMl: 500, maxInnerG: 1, maxOuterG: 500 },
  'E5': { maxInnerMl: 1, maxOuterMl: 300, maxInnerG: 1, maxOuterG: 300 },
};

// ─── Helpers ───────────────────────────────────────────────────

function findAdrEntry(un: string): AdrEntry | undefined {
  const normalised = un.replace(/^UN/i, '').replace(/^0+/, '').padStart(4, '0');
  return (adrData as AdrEntry[]).find(e => e.un_number === normalised);
}

/** Parse "1 L", "5 kg", "500 ml", "0" etc. into { value, unit } */
function parseLqLimit(lq: string): { value: number; unit: string } | null {
  if (!lq || lq === '0') return null;
  const match = lq.match(/^([\d.]+)\s*(ml|L|kg|g)/i);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[2] };
}

/** Convert quantity to the same unit as the limit for comparison */
function convertToUnit(qty: number, fromUnit: string, toUnit: string): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();
  if (from === to) return qty;

  // Volume conversions
  if (from === 'ml' && to === 'l') return qty / 1000;
  if (from === 'l' && to === 'ml') return qty * 1000;

  // Weight conversions
  if (from === 'g' && to === 'kg') return qty / 1000;
  if (from === 'kg' && to === 'g') return qty * 1000;

  // Incompatible units — return as-is (will compare numerically)
  return qty;
}

// ─── Main checker ──────────────────────────────────────────────

export function checkLqEq(mode: 'lq' | 'eq', items: LqEqItem[]): LqEqResult {
  const results: LqEqResultItem[] = [];

  for (const item of items) {
    const entry = findAdrEntry(item.un_number);
    if (!entry) {
      throw new Error(`UN ${item.un_number} not found in ADR database`);
    }

    const base: Omit<LqEqResultItem, 'status' | 'reason'> = {
      un_number: entry.un_number,
      substance: entry.proper_shipping_name,
      class: entry.class,
      packing_group: entry.packing_group || '—',
      lq_limit: entry.limited_quantity,
      lq_limit_value: parseLqLimit(entry.limited_quantity)?.value ?? null,
      lq_limit_unit: parseLqLimit(entry.limited_quantity)?.unit ?? null,
      eq_code: entry.excepted_quantity,
      quantity_entered: item.quantity,
      unit_entered: item.unit,
    };

    if (mode === 'lq') {
      // Limited Quantity check
      if (entry.limited_quantity === '0' || !entry.limited_quantity) {
        results.push({ ...base, status: 'not_permitted', reason: 'Limited quantities not permitted for this substance' });
        continue;
      }

      if (entry.limited_quantity.startsWith('See SP')) {
        results.push({ ...base, status: 'not_permitted', reason: `Refer to special provision: ${entry.limited_quantity}` });
        continue;
      }

      const parsed = parseLqLimit(entry.limited_quantity);
      if (!parsed) {
        results.push({ ...base, status: 'not_permitted', reason: `Cannot parse LQ limit: ${entry.limited_quantity}` });
        continue;
      }

      // Handle "1 L or 1 kg" — take the applicable one based on unit
      let limitValue = parsed.value;
      let limitUnit = parsed.unit;

      // If the limit has "or" (e.g. "1 L or 1 kg"), pick the matching unit type
      if (entry.limited_quantity.includes(' or ')) {
        const parts = entry.limited_quantity.split(' or ');
        for (const part of parts) {
          const p = parseLqLimit(part.trim());
          if (p) {
            const isVolume = ['ml', 'l'].includes(item.unit.toLowerCase());
            const limitIsVolume = ['ml', 'l'].includes(p.unit.toLowerCase());
            if (isVolume === limitIsVolume) {
              limitValue = p.value;
              limitUnit = p.unit;
              break;
            }
          }
        }
      }

      const convertedQty = convertToUnit(item.quantity, item.unit, limitUnit);

      if (convertedQty <= limitValue) {
        results.push({ ...base, status: 'within_limit', reason: `${item.quantity} ${item.unit} is within the LQ limit of ${entry.limited_quantity} per inner packaging` });
      } else {
        results.push({ ...base, status: 'exceeds_limit', reason: `${item.quantity} ${item.unit} exceeds the LQ limit of ${entry.limited_quantity} per inner packaging` });
      }

    } else {
      // Excepted Quantity check
      if (entry.excepted_quantity === 'E0' || !entry.excepted_quantity) {
        results.push({ ...base, status: 'not_permitted', reason: 'Excepted quantities not permitted for this substance' });
        continue;
      }

      if (entry.excepted_quantity.startsWith('See SP')) {
        results.push({ ...base, status: 'not_permitted', reason: `Refer to special provision: ${entry.excepted_quantity}` });
        continue;
      }

      const eqLimits = EQ_LIMITS[entry.excepted_quantity];
      if (!eqLimits) {
        results.push({ ...base, status: 'not_permitted', reason: `Unknown EQ code: ${entry.excepted_quantity}` });
        continue;
      }

      // Convert to ml/g for comparison
      const isVolume = ['ml', 'l'].includes(item.unit.toLowerCase());
      const qtyInSmall = isVolume
        ? convertToUnit(item.quantity, item.unit, 'ml')
        : convertToUnit(item.quantity, item.unit, 'g');

      const maxInner = isVolume ? eqLimits.maxInnerMl : eqLimits.maxInnerG;
      const maxOuter = isVolume ? eqLimits.maxOuterMl : eqLimits.maxOuterG;
      const unitSmall = isVolume ? 'ml' : 'g';

      if (qtyInSmall > maxInner) {
        results.push({ ...base, status: 'exceeds_limit', reason: `${item.quantity} ${item.unit} (${qtyInSmall} ${unitSmall}) exceeds ${entry.excepted_quantity} inner limit of ${maxInner} ${unitSmall}` });
      } else {
        const totalOuter = qtyInSmall * (item.inner_packaging_qty ?? 1);
        if (totalOuter > maxOuter) {
          results.push({ ...base, status: 'exceeds_limit', reason: `Total per outer (${totalOuter} ${unitSmall}) exceeds ${entry.excepted_quantity} outer limit of ${maxOuter} ${unitSmall}` });
        } else {
          results.push({ ...base, status: 'within_limit', reason: `Qualifies under ${entry.excepted_quantity}: ${qtyInSmall} ${unitSmall} per inner (max ${maxInner}), ${totalOuter} ${unitSmall} per outer (max ${maxOuter})` });
        }
      }
    }
  }

  const qualifying = results.filter(r => r.status === 'within_limit').length;
  const exceeding = results.filter(r => r.status === 'exceeds_limit').length;
  const notPermitted = results.filter(r => r.status === 'not_permitted').length;

  let overall_status: LqEqResult['overall_status'];
  if (exceeding === 0 && notPermitted === 0) overall_status = 'qualifies';
  else if (qualifying === 0) overall_status = 'does_not_qualify';
  else overall_status = 'partial';

  return {
    mode,
    overall_status,
    items: results,
    summary: { total_items: results.length, qualifying, exceeding, not_permitted: notPermitted },
    references: {
      adr_chapter: mode === 'lq' ? '3.4' : '3.5',
      table: mode === 'lq' ? '3.2 Column 7a' : '3.2 Column 7b',
    },
  };
}
