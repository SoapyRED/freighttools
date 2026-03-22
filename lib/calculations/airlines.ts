/**
 * Airline Codes & AWB Prefix Library
 * Source: airline_codes_merged.csv — 6,335 airlines, 268 with AWB prefixes
 */

import rawData from '@/lib/data/airline-codes.json';

// ── Types ──────────────────────────────────────────────────────────

export interface Airline {
  slug: string;
  airline_name: string;
  iata_code: string | null;
  icao_code: string | null;
  awb_prefix: string[] | null;
  callsign: string | null;
  country: string | null;
  has_cargo: boolean;
  aliases?: string[];
}

export interface AirlineSlim {
  slug: string;
  airline_name: string;
  iata_code: string | null;
  icao_code: string | null;
  awb_prefix: string[] | null;
  country: string | null;
  has_cargo: boolean;
  aliases?: string[];
}

// ── Data singleton ─────────────────────────────────────────────────

const ALL_AIRLINES: Airline[] = rawData as Airline[];
const SLUG_MAP = new Map<string, Airline>();
for (const a of ALL_AIRLINES) {
  SLUG_MAP.set(a.slug, a);
}

// ── Counts ─────────────────────────────────────────────────────────

export const AIRLINE_COUNT = ALL_AIRLINES.length;
export const CARGO_AIRLINE_COUNT = ALL_AIRLINES.filter(a => a.has_cargo).length;

// ── Lookup functions ───────────────────────────────────────────────

export function lookupBySlug(slug: string): Airline | null {
  return SLUG_MAP.get(slug) ?? null;
}

export function searchAirlines(query: string, limit = 50): Airline[] {
  const q = query.trim();
  if (!q) return [];

  const ql = q.toLowerCase();
  const isShortNumeric = /^\d{2,3}$/.test(q);          // 2-3 digits → prefix/code only
  const isShortAlpha = /^[A-Za-z]{2,3}$/.test(q);      // 2-3 letters → code only

  const results: Airline[] = [];
  for (const a of ALL_AIRLINES) {
    let match = false;

    if (isShortNumeric) {
      // Numeric 2-3 chars: match AWB prefix (exact) or IATA code only
      match = (a.awb_prefix !== null && a.awb_prefix.includes(q)) ||
              (a.iata_code !== null && a.iata_code === q);
    } else if (isShortAlpha) {
      // Alpha 2-3 chars: match IATA or ICAO code only (case-insensitive)
      const qu = q.toUpperCase();
      match = (a.iata_code !== null && a.iata_code === qu) ||
              (a.icao_code !== null && a.icao_code === qu);
    } else {
      // 4+ chars or mixed: search all fields including aliases
      match = a.airline_name.toLowerCase().includes(ql) ||
              (a.aliases && a.aliases.some(al => al.toLowerCase().includes(ql))) ||
              (a.iata_code !== null && a.iata_code.toLowerCase() === ql) ||
              (a.icao_code !== null && a.icao_code.toLowerCase() === ql) ||
              (a.awb_prefix !== null && a.awb_prefix.includes(q)) ||
              (a.country !== null && a.country.toLowerCase().includes(ql));
    }

    if (match) {
      results.push(a);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function filterByIata(iata: string): Airline[] {
  const q = iata.trim().toUpperCase();
  return ALL_AIRLINES.filter(a => a.iata_code === q);
}

export function filterByIcao(icao: string): Airline[] {
  const q = icao.trim().toUpperCase();
  return ALL_AIRLINES.filter(a => a.icao_code === q);
}

export function filterByPrefix(prefix: string): Airline[] {
  const q = prefix.trim();
  return ALL_AIRLINES.filter(a => a.awb_prefix && a.awb_prefix.includes(q));
}

export function filterByCountry(country: string, limit = 100): Airline[] {
  const q = country.trim().toLowerCase();
  return ALL_AIRLINES.filter(a => a.country && a.country.toLowerCase().includes(q)).slice(0, limit);
}

export function getCargoAirlines(): Airline[] {
  return ALL_AIRLINES.filter(a => a.has_cargo);
}

export function getAllCargoSlugs(): string[] {
  return ALL_AIRLINES.filter(a => a.has_cargo).map(a => a.slug);
}

// Slim index for client-side search
export function getSlimIndex(): AirlineSlim[] {
  return ALL_AIRLINES.map(({ slug, airline_name, iata_code, icao_code, awb_prefix, country, has_cargo, aliases }) => ({
    slug,
    airline_name,
    iata_code,
    icao_code,
    awb_prefix,
    country,
    has_cargo,
    ...(aliases ? { aliases } : {}),
  }));
}
