/**
 * Centralised SEO title + meta description builders.
 *
 * Why centralise: GSC last 90 days showed pos 7-10 with ~0% CTR across the
 * highest-impression queries (HS code, ADR/UN, airline, container pages —
 * 17.5K US impressions / 9 clicks). Title clarity matters most; we needed
 * a single place to define the patterns and lint them.
 *
 * Design constraints (enforced at build time by scripts/lint-seo-titles.mjs):
 *   - title.absolute ≤ 60 chars where possible; if longer, primary search
 *     keyword must appear in the first 50 chars
 *   - description ≤ 155 chars
 *   - description must contain "free" AND ("no login" OR "updated {year}")
 *   - no template fallback returns just "FreightUtils" as the title
 *
 * The root layout's `title.template: '%s | FreightUtils.com'` would push
 * every dynamic title past 60 chars, so the builders return
 * `title: { absolute: ... }` to bypass the template. Index page metadata
 * exports do the same for consistency.
 *
 * NB: keep these builders pure — no `fetch`, no I/O, no Date.now() except
 * via SITE_YEAR. Same input → same output, so the lint can call them with
 * fixture data and assert length/keyword rules deterministically.
 */

import type { Metadata } from 'next';

// Pinned to the dataset year so the description is stable across the year
// without having to know the current date. Bump when we ship a new dataset
// edition (ADR 2027, etc.).
export const SITE_YEAR = '2026';

export const TITLE_SOFT_LIMIT = 60;
export const TITLE_HARD_LIMIT = 70; // for cases where we accept the overflow but need keyword in first 50
export const META_HARD_LIMIT = 155;

/**
 * Truncate text to fit a target length, ending with "…" if cut.
 * Tries to cut at the last word boundary within max-1 chars; falls back to
 * hard slice if the text has no spaces in the second half.
 */
export function truncateForTitle(text: string, max: number): string {
  if (text.length <= max) return text;
  const room = max - 1; // room for the ellipsis char
  const slice = text.slice(0, room);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.5) return slice.slice(0, lastSpace) + '…';
  return slice + '…';
}

/**
 * Constructs the OG image URL with proper encoding. Centralised so we don't
 * drift between pages.
 */
export function buildOgUrl(opts: { badge?: string; title: string; desc: string; api?: string }): string {
  const params = new URLSearchParams();
  if (opts.badge) params.set('badge', opts.badge);
  params.set('title', opts.title);
  params.set('desc', opts.desc);
  if (opts.api) params.set('api', opts.api);
  return `/api/og?${params.toString()}`;
}

// ─── HS code page ────────────────────────────────────────────────────

export function buildHsCodeMetadata(input: {
  code: string;             // raw code, e.g. "611241"
  formattedCode: string;    // formatHsCode output, e.g. "61.12.41"
  description: string;      // WCO description, e.g. "Women's or girls' swimwear of synthetic fibres"
  parentFormatted?: string; // formatted parent heading, e.g. "61.12"
}): Metadata {
  const { code, formattedCode, description, parentFormatted } = input;

  // Title goal: "HS Code {code} — {short_description} | Tariff & Duty Lookup"
  // The HS keyword is the code number, in the first 16 chars — well under 50.
  // We try the full template first; if it's over 60 chars, drop the
  // "| Tariff & Duty Lookup" suffix; if still over 60, truncate the description.
  const fixedPrefix = `HS Code ${formattedCode} — `;
  const fullSuffix = ' | Tariff & Duty Lookup';
  const fullTitle = `${fixedPrefix}${description}${fullSuffix}`;
  let title: string;
  if (fullTitle.length <= TITLE_SOFT_LIMIT) {
    title = fullTitle;
  } else {
    const noSuffix = `${fixedPrefix}${description}`;
    if (noSuffix.length <= TITLE_HARD_LIMIT) {
      title = noSuffix;
    } else {
      // Truncate description to land at TITLE_HARD_LIMIT
      const room = TITLE_HARD_LIMIT - fixedPrefix.length;
      title = `${fixedPrefix}${truncateForTitle(description, room)}`;
    }
  }

  // Meta: spec template fits 123 chars for an 8-char formatted code; well under 155.
  let metaDesc = `Free HS code ${formattedCode} lookup: WCO description, UK trade tariff, duty rates, related codes. No login. Updated ${SITE_YEAR}.`;
  if (parentFormatted) {
    const withParent = `Free HS code ${formattedCode} (heading ${parentFormatted}) lookup: WCO description, UK tariff, duty rates. No login. Updated ${SITE_YEAR}.`;
    if (withParent.length <= META_HARD_LIMIT) metaDesc = withParent;
  }

  const ogUrl = buildOgUrl({
    badge: 'HS',
    title: `HS ${formattedCode}`,
    desc: truncateForTitle(description, 80),
  });

  return {
    title: { absolute: title },
    description: metaDesc,
    alternates: { canonical: `https://www.freightutils.com/hs/code/${code}` },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `HS ${formattedCode} — FreightUtils` }],
      title,
      description: metaDesc,
    },
    twitter: { card: 'summary_large_image', images: [ogUrl], title, description: metaDesc },
    other: { 'article:modified_time': `${SITE_YEAR}-04-01T00:00:00Z` },
  };
}

// ─── ADR / UN page ────────────────────────────────────────────────────

export function buildAdrUnMetadata(input: {
  unNumber: string;
  properShippingName: string;
  class: string;
  packingGroup: string | null;
  tunnelCode: string | null;
  transportCategory: string | null;
  variantCount?: number;
}): Metadata {
  const { unNumber, properShippingName, class: cls, packingGroup, tunnelCode, transportCategory, variantCount } = input;

  // Title goal: "UN {number} {proper_name} — ADR Class {class} PG {pg}"
  // Keyword "UN {number}" is at chars 0-8, well under 50.
  // "UN 1234 " = 8, " — ADR Class X PG Y" = up to 19, so name gets ~33 in 60.
  const pgPart = packingGroup ? ` PG ${packingGroup}` : '';
  const classSuffix = ` — ADR Class ${cls}${pgPart}`;
  const fixedPrefix = `UN ${unNumber} `;
  const room = TITLE_SOFT_LIMIT - fixedPrefix.length - classSuffix.length;
  const shortName = truncateForTitle(properShippingName, Math.max(room, 14));
  let title = `${fixedPrefix}${shortName}${classSuffix}`;
  // Add variant suffix only if total stays under TITLE_HARD_LIMIT.
  if (variantCount && variantCount > 1) {
    const withVariant = `${title} (${variantCount} variants)`;
    if (withVariant.length <= TITLE_HARD_LIMIT) title = withVariant;
  }

  // Meta: include tunnel + transport category when available.
  const tunnelPart = tunnelCode ? `, tunnel code ${tunnelCode}` : '';
  const catPart = transportCategory ? `, transport category ${transportCategory}` : '';
  const pgMeta = packingGroup ? `, packing group ${packingGroup}` : '';
  const tail = `. Free lookup, ADR ${SITE_YEAR === '2026' ? '2025' : SITE_YEAR} dataset.`;
  // Build progressively shorter descriptions until one fits 155.
  const candidates = [
    () => `UN ${unNumber} ${properShippingName}. ADR class ${cls}${pgMeta}${tunnelPart}${catPart}${tail}`,
    () => `UN ${unNumber} ${truncateForTitle(properShippingName, 60)}. ADR class ${cls}${pgMeta}${tunnelPart}${catPart}${tail}`,
    () => `UN ${unNumber} ${truncateForTitle(properShippingName, 50)}. ADR class ${cls}${pgMeta}${tunnelPart}${tail}`,
    () => `UN ${unNumber} ${truncateForTitle(properShippingName, 40)}. ADR class ${cls}${pgMeta}${tail}`,
    () => `UN ${unNumber} ${truncateForTitle(properShippingName, 25)}. ADR class ${cls}${pgMeta}${tail}`,
  ];
  let metaDesc = '';
  for (const build of candidates) {
    const candidate = build();
    if (candidate.length <= META_HARD_LIMIT) {
      metaDesc = candidate;
      break;
    }
  }
  if (!metaDesc) {
    metaDesc = candidates[candidates.length - 1]().slice(0, META_HARD_LIMIT - 1) + '…';
  }

  const ogUrl = buildOgUrl({
    badge: `UN${unNumber}`,
    title: truncateForTitle(properShippingName, 60),
    desc: `Class ${cls}${pgPart} — ADR ${SITE_YEAR === '2026' ? '2025' : SITE_YEAR}`,
    api: `GET /api/adr?un=${unNumber}`,
  });

  return {
    title: { absolute: title },
    description: metaDesc,
    alternates: { canonical: `https://www.freightutils.com/adr/un/${unNumber}` },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `UN ${unNumber} — ${truncateForTitle(properShippingName, 60)}` }],
      title,
      description: metaDesc,
    },
    twitter: { card: 'summary_large_image', images: [ogUrl], title, description: metaDesc },
    other: { 'article:modified_time': `${SITE_YEAR}-04-01T00:00:00Z` },
  };
}

// ─── Airline page ─────────────────────────────────────────────────────

export function buildAirlineMetadata(input: {
  slug: string;
  airlineName: string;
  iataCode: string | null;
  icaoCode: string | null;
  awbPrefix: string[] | null;
  country: string | null;
}): Metadata {
  const { slug, airlineName, iataCode, icaoCode, awbPrefix, country } = input;

  const prefixStr = awbPrefix && awbPrefix.length > 0 ? awbPrefix[0] : null;

  const longSuffix = [
    iataCode && `IATA Code ${iataCode}`,
    icaoCode && `ICAO ${icaoCode}`,
    prefixStr && `AWB Prefix ${prefixStr}`,
  ].filter(Boolean).join(', ');

  const shortSuffix = [
    iataCode && `IATA ${iataCode}`,
    icaoCode && `ICAO ${icaoCode}`,
    prefixStr && `AWB ${prefixStr}`,
  ].filter(Boolean).join(', ');

  // The "primary search keyword" for an airline page is the IATA-code
  // pair, e.g. "IATA CA". We need the FULL keyword phrase to land within
  // the first 50 chars of the rendered title — not just start there —
  // so the SERP snippet shows it before any cut.
  //
  // Layout: "{name} — {suffix}". Suffix starts at name.length + 3.
  // For the first ~10 chars of the suffix to fit in pos 50, we need
  // name.length ≤ 37 when codes are present.
  const keywordReserveAfterName = 13; // " — IATA XXX, " or similar
  const maxNameForKeyword = 50 - keywordReserveAfterName;

  let title: string;
  if (longSuffix && (`${airlineName} — ${longSuffix}`).length <= TITLE_SOFT_LIMIT) {
    title = `${airlineName} — ${longSuffix}`;
  } else if (shortSuffix && (`${airlineName} — ${shortSuffix}`).length <= TITLE_SOFT_LIMIT) {
    title = `${airlineName} — ${shortSuffix}`;
  } else if (longSuffix && airlineName.length <= maxNameForKeyword && (`${airlineName} — ${longSuffix}`).length <= TITLE_HARD_LIMIT) {
    // Long suffix fits hard cap AND name short enough to keep codes in keyword window
    title = `${airlineName} — ${longSuffix}`;
  } else if (shortSuffix && airlineName.length <= maxNameForKeyword && (`${airlineName} — ${shortSuffix}`).length <= TITLE_HARD_LIMIT) {
    title = `${airlineName} — ${shortSuffix}`;
  } else if (shortSuffix) {
    // Truncate the name so the codes stay in the first 50 chars (keyword window)
    const truncatedName = truncateForTitle(airlineName, maxNameForKeyword);
    title = `${truncatedName} — ${shortSuffix}`;
    // If still over the hard cap, drop to the shortest possible
    if (title.length > TITLE_HARD_LIMIT) {
      title = `${truncateForTitle(airlineName, Math.max(maxNameForKeyword - 5, 12))} — ${shortSuffix}`;
    }
  } else {
    title = truncateForTitle(`${airlineName} — Airline Codes`, TITLE_SOFT_LIMIT);
  }

  // Meta: include codes + country if known. Always end with "Free airline code lookup updated YYYY."
  const codeBits = [
    iataCode && `IATA ${iataCode}`,
    icaoCode && `ICAO ${icaoCode}`,
    prefixStr && `AWB prefix ${prefixStr}`,
  ].filter(Boolean).join(', ');
  const tail = ` Free airline code lookup updated ${SITE_YEAR}.`;
  const candidates = [
    () => `${airlineName} airline codes: ${codeBits}.${country ? ` Based in ${country}.` : ''}${tail}`,
    () => `${airlineName} airline codes: ${codeBits}.${tail}`,
    () => `${truncateForTitle(airlineName, 30)} airline codes: ${codeBits}.${tail}`,
    () => `${truncateForTitle(airlineName, 20)}: ${codeBits}.${tail}`,
  ];
  let metaDesc = '';
  for (const build of candidates) {
    const candidate = build();
    if (candidate.length <= META_HARD_LIMIT) {
      metaDesc = candidate;
      break;
    }
  }
  if (!metaDesc) metaDesc = candidates[candidates.length - 1]().slice(0, META_HARD_LIMIT - 1) + '…';

  const ogUrl = buildOgUrl({
    badge: 'Airline+Codes',
    title: airlineName,
    desc: codeBits || 'Airline reference data',
  });

  return {
    title: { absolute: title },
    description: metaDesc,
    alternates: { canonical: `https://www.freightutils.com/airlines/${slug}` },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${airlineName} — FreightUtils` }],
      title,
      description: metaDesc,
    },
    twitter: { card: 'summary_large_image', images: [ogUrl], title, description: metaDesc },
  };
}

// ─── Container page ───────────────────────────────────────────────────

// Manual ISO-code mapping for the fixed roster of container types we ship
// pages for. Keep in lock-step with CONTAINER_SPECS in
// lib/calculations/container-capacity.ts. New types added there must be
// added here too — the lint will catch missing entries by failing the
// page lookup.
const CONTAINER_ISO_CODES: Record<string, string> = {
  '20ft-standard': '22G1',
  '40ft-standard': '42G1',
  '40ft-high-cube': '45G1',
  '45ft-high-cube': 'L5G1',
  '20ft-reefer': '22R1',
  '40ft-reefer': '42R1',
  '40ft-reefer-high-cube': '45R1',
  '20ft-open-top': '22U1',
  '40ft-open-top': '42U1',
  '20ft-flat-rack': '22P1',
  '40ft-flat-rack': '42P1',
};

export function buildContainerMetadata(input: {
  slug: string;
  name: string; // e.g. "20ft Reefer"
  internalLengthCm: number;
  internalWidthCm: number;
  internalHeightCm: number;
  capacityCbm: number;
  maxPayloadKg: number;
  euroPallets: string;
}): Metadata {
  const { slug, name, internalLengthCm, internalWidthCm, internalHeightCm, capacityCbm, maxPayloadKg } = input;
  const isoCode = CONTAINER_ISO_CODES[slug] ?? null;

  // Title goal: "{type} Container — Dimensions, Weight, Capacity (ISO Specs)"
  // For "20ft Reefer" (11 chars) the full version is 64 chars.
  // Use progressively shorter suffixes if needed.
  const suffixes = [
    ' Container — Dimensions, Weight, Capacity (ISO Specs)',
    ' Container — Dimensions, Weight, Capacity & ISO',
    ' Container — Dimensions, Weight, Capacity',
    ' — Dimensions, Weight & Capacity',
  ];
  let title = `${name}${suffixes[0]}`;
  for (const suffix of suffixes) {
    const candidate = `${name}${suffix}`;
    if (candidate.length <= TITLE_SOFT_LIMIT) { title = candidate; break; }
    title = candidate;
  }
  if (title.length > TITLE_HARD_LIMIT) title = truncateForTitle(title, TITLE_HARD_LIMIT);

  // Meta: include all key specs. Cap 155 chars.
  const isoPart = isoCode ? `ISO ${isoCode} spec` : 'ISO 668 spec';
  const candidates = [
    () => `${name} container internal/external dimensions, max gross weight, payload, cubic capacity, door opening. ${isoPart}. Free, no login.`,
    () => `${name} container internal dimensions, max gross weight, payload, capacity, door opening. ${isoPart}. Free, no login.`,
    () => `${name} container dimensions, payload, capacity, door opening. ${isoPart}. Free, no login.`,
    () => `${name} container dimensions, payload, capacity. ${isoPart}. Free, no login.`,
  ];
  let metaDesc = '';
  for (const build of candidates) {
    const candidate = build();
    if (candidate.length <= META_HARD_LIMIT) { metaDesc = candidate; break; }
  }
  if (!metaDesc) metaDesc = candidates[candidates.length - 1]().slice(0, META_HARD_LIMIT - 1) + '…';

  const ogUrl = buildOgUrl({
    badge: 'Containers',
    title: `${name} Container`,
    desc: `${internalLengthCm}×${internalWidthCm}×${internalHeightCm}cm • ${capacityCbm} CBM • ${maxPayloadKg.toLocaleString()} kg`,
  });

  return {
    title: { absolute: title },
    description: metaDesc,
    alternates: { canonical: `https://www.freightutils.com/containers/${slug}` },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${name} Container — FreightUtils` }],
      title,
      description: metaDesc,
    },
    twitter: { card: 'summary_large_image', images: [ogUrl], title, description: metaDesc },
  };
}

// ─── Section index pages ─────────────────────────────────────────────

/**
 * Builder for the four section-index pages so they share the same shape
 * and the lint can validate them. Returns a partial Metadata that the
 * page combines with its own openGraph image url.
 */
export function buildSectionIndexMetadata(input: {
  /** Index path slug, e.g. 'hs', 'adr', 'airlines', 'containers' */
  slug: 'hs' | 'adr' | 'airlines' | 'containers';
  title: string;
  description: string;
  ogUrl: string;
}): Metadata {
  return {
    title: { absolute: input.title },
    description: input.description,
    alternates: { canonical: `https://www.freightutils.com/${input.slug}` },
    openGraph: {
      images: [{ url: input.ogUrl, width: 1200, height: 630, alt: `${input.title} — FreightUtils` }],
      title: input.title,
      description: input.description,
    },
    twitter: { card: 'summary_large_image', images: [input.ogUrl], title: input.title, description: input.description },
  };
}
