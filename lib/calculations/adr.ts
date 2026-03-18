import adrData from '../data/adr-2025.json';

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

export interface AdrEntry {
  un_number: string;
  proper_shipping_name: string;
  class: string;
  classification_code: string;
  packing_group: string | null;
  labels: string | null;
  special_provisions: string | null;
  limited_quantity: string | null;
  excepted_quantity: string | null;
  transport_category: string | null;
  tunnel_restriction_code: string | null;
  hazard_identification_number: string | null;
  variant_index: number;
  variant_count: number;
}

export interface AdrEntrySlim {
  un_number: string;
  proper_shipping_name: string;
  class: string;
  packing_group: string | null;
  variant_index: number;
  variant_count: number;
}

// ─────────────────────────────────────────────────────────────────
//  Module-level singleton — loaded once, reused across all calls
// ─────────────────────────────────────────────────────────────────

function toPublicEntry(raw: Record<string, unknown>): AdrEntry {
  return {
    un_number:                    raw.un_number as string,
    proper_shipping_name:         raw.proper_shipping_name as string,
    class:                        raw.class as string,
    classification_code:          (raw.classification_code as string) ?? '',
    packing_group:                (raw.packing_group as string | null) ?? null,
    labels:                       (raw.labels as string | null) ?? null,
    special_provisions:           (raw.special_provisions as string | null) ?? null,
    limited_quantity:             (raw.limited_quantity as string | null) ?? null,
    excepted_quantity:            (raw.excepted_quantity as string | null) ?? null,
    transport_category:           (raw.transport_category as string | null) ?? null,
    tunnel_restriction_code:      (raw.tunnel_restriction_code as string | null) ?? null,
    hazard_identification_number: (raw.hazard_identification_number as string | null) ?? null,
    variant_index:                (raw.variant_index as number) ?? 0,
    variant_count:                (raw.variant_count as number) ?? 1,
  };
}

const ALL_ENTRIES: AdrEntry[] = (adrData as Record<string, unknown>[]).map(toPublicEntry);

// Build UN → entries[] map for O(1) lookups (one UN can have multiple variants)
const UN_MAP = new Map<string, AdrEntry[]>();
for (const entry of ALL_ENTRIES) {
  const existing = UN_MAP.get(entry.un_number);
  if (existing) {
    existing.push(entry);
  } else {
    UN_MAP.set(entry.un_number, [entry]);
  }
}

// ─────────────────────────────────────────────────────────────────
//  UN number normalisation
//  Accepts: "1203", "01203", "UN1203", "un 1203"
//  Always returns 4-digit zero-padded string, e.g. "1203"
// ─────────────────────────────────────────────────────────────────
export function normaliseUnNumber(input: string): string {
  const digits = input.replace(/[^0-9]/g, '');
  return digits.padStart(4, '0');
}

// ─────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────

/**
 * Exact lookup by UN number — returns ALL variants for that UN.
 * Accepts "1203", "UN1203", "01203" etc.
 */
export function lookupByUnNumber(un: string): AdrEntry[] {
  const normalised = normaliseUnNumber(un);
  return UN_MAP.get(normalised) ?? [];
}

/**
 * Search proper shipping name (case-insensitive partial match).
 * Returns matching entries including all variants.
 */
export function searchByName(query: string, limit = 20): AdrEntry[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const results: AdrEntry[] = [];
  for (const entry of ALL_ENTRIES) {
    if (
      entry.proper_shipping_name.toLowerCase().includes(q) ||
      entry.un_number.includes(q)
    ) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Filter by ADR hazard class (e.g. "3", "1.1", "6.1").
 * Matches entries where class starts with the supplied value.
 */
export function filterByClass(cls: string, limit = 50): AdrEntry[] {
  if (!cls || cls.trim().length === 0) return [];
  const c = cls.trim();
  const results: AdrEntry[] = [];
  for (const entry of ALL_ENTRIES) {
    if (entry.class === c || entry.class.startsWith(c + '.')) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Returns all unique UN numbers (4-digit zero-padded strings).
 * Used by generateStaticParams to build static pages.
 */
export function getAllUnNumbers(): string[] {
  return Array.from(UN_MAP.keys()).sort();
}

/**
 * Slim index for client-side search on /adr page.
 * Returns first variant per UN for the search result list.
 */
export function getSlimIndex(): AdrEntrySlim[] {
  return ALL_ENTRIES.map(({ un_number, proper_shipping_name, class: cls, packing_group, variant_index, variant_count }) => ({
    un_number,
    proper_shipping_name,
    class: cls,
    packing_group,
    variant_index,
    variant_count,
  }));
}

/**
 * Returns sorted array of all unique hazard classes for filtering UI.
 */
export function getAllClasses(): string[] {
  const classes = new Set(ALL_ENTRIES.map(e => e.class));
  return Array.from(classes).sort();
}

/** Total number of entries in the dataset (including all variants) */
export const ENTRY_COUNT = ALL_ENTRIES.length;

/** Total number of unique UN numbers */
export const UN_COUNT = UN_MAP.size;
