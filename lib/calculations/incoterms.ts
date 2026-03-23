import rawData from '@/lib/data/incoterms.json';

export interface Incoterm {
  code: string;
  name: string;
  slug: string;
  category: 'any_mode' | 'sea_only';
  summary: string;
  seller_responsibility: string;
  buyer_responsibility: string;
  risk_transfer: string;
  cost_transfer: string;
  insurance: string;
  export_clearance: string;
  import_clearance: string;
  best_for: string;
  watch_out: string;
}

const ALL: Incoterm[] = rawData as Incoterm[];
const CODE_MAP = new Map<string, Incoterm>();
const SLUG_MAP = new Map<string, Incoterm>();
for (const t of ALL) {
  CODE_MAP.set(t.code, t);
  SLUG_MAP.set(t.slug, t);
}

export const INCOTERM_COUNT = ALL.length;

export function getAllIncoterms(): Incoterm[] { return ALL; }
export function getAnyMode(): Incoterm[] { return ALL.filter(t => t.category === 'any_mode'); }
export function getSeaOnly(): Incoterm[] { return ALL.filter(t => t.category === 'sea_only'); }
export function lookupByCode(code: string): Incoterm | null { return CODE_MAP.get(code.toUpperCase()) ?? null; }
export function lookupBySlug(slug: string): Incoterm | null { return SLUG_MAP.get(slug) ?? null; }
export function getAllSlugs(): string[] { return ALL.map(t => t.slug); }
