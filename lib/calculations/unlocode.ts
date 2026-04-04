/**
 * UN/LOCODE search and lookup — 116K+ transport locations worldwide.
 * Data loaded from lib/data/unlocode.json (compact format).
 */

// ─── Compact entry type (as stored in JSON) ─────────────────────

interface CompactEntry {
  c: string;  // country code
  l: string;  // location code
  n: string;  // name
  a?: string; // ascii name (only if different from name)
  s?: string; // subdivision
  f?: string[]; // functions
  t?: string; // status
  i?: string; // iata code
  g?: { lat: number; lon: number }; // coordinates
}

// ─── Public types ───────────────────────────────────────────────

export interface UnlocodeEntry {
  code: string;
  country: string;
  locationCode: string;
  name: string;
  nameAscii: string;
  subdivision: string | null;
  functions: string[];
  status: string | null;
  coordinates: { lat: number; lon: number } | null;
  iataCode: string | null;
}

// ─── Data loading ───────────────────────────────────────────────

let _data: CompactEntry[] | null = null;
let _index: Map<string, number> | null = null; // code -> array index

function getData(): CompactEntry[] {
  if (!_data) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _data = require('@/lib/data/unlocode.json') as CompactEntry[];
  }
  return _data;
}

function getIndex(): Map<string, number> {
  if (!_index) {
    const data = getData();
    _index = new Map();
    for (let i = 0; i < data.length; i++) {
      _index.set(data[i].c + data[i].l, i);
    }
  }
  return _index;
}

function expand(e: CompactEntry): UnlocodeEntry {
  return {
    code: e.c + e.l,
    country: e.c,
    locationCode: e.l,
    name: e.n,
    nameAscii: e.a ?? e.n,
    subdivision: e.s ?? null,
    functions: e.f ?? [],
    status: e.t ?? null,
    coordinates: e.g ?? null,
    iataCode: e.i ?? null,
  };
}

// ─── Public functions ───────────────────────────────────────────

export const TOTAL_ENTRIES = 116129;

export function lookupByCode(code: string): UnlocodeEntry | null {
  const norm = code.toUpperCase().replace(/\s/g, '');
  const idx = getIndex().get(norm);
  if (idx === undefined) return null;
  return expand(getData()[idx]);
}

export function search(
  query: string,
  options?: { country?: string; func?: string; limit?: number }
): UnlocodeEntry[] {
  const data = getData();
  const q = query.toLowerCase().trim();
  const country = options?.country?.toUpperCase();
  const func = options?.func?.toLowerCase();
  const limit = Math.min(options?.limit ?? 20, 100);

  const results: UnlocodeEntry[] = [];

  for (const e of data) {
    // Country filter
    if (country && e.c !== country) continue;
    // Function filter
    if (func && !(e.f ?? []).includes(func)) continue;
    // Query match (code or name)
    if (q) {
      const code = (e.c + e.l).toLowerCase();
      const name = e.n.toLowerCase();
      const ascii = (e.a ?? e.n).toLowerCase();
      const iata = (e.i ?? '').toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !ascii.includes(q) && !iata.includes(q)) continue;
    }
    results.push(expand(e));
    if (results.length >= limit) break;
  }

  return results;
}

export function filterByCountry(countryCode: string, limit = 100): UnlocodeEntry[] {
  return search('', { country: countryCode, limit });
}

export function filterByFunction(func: string, limit = 100): UnlocodeEntry[] {
  return search('', { func, limit });
}
