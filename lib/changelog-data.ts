export type Tag = 'New Tool' | 'Data Update' | 'API Change' | 'Bug Fix' | 'MCP Update' | 'Security';

export interface ChangelogEntry {
  isoDate: string;
  date: string;
  tag: Tag;
  title: string;
  desc: string;
  link?: string;
}

export const entries: ChangelogEntry[] = [
  {
    isoDate: '2026-04-25', date: 'Apr 25', tag: 'API Change',
    title: 'Breaking — All endpoints now return snake_case fields',
    desc: 'Six endpoints migrated from camelCase to snake_case response fields (/api/unlocode, /api/uld, /api/containers, /api/vehicles, /api/consignment, /api/duty). Site-wide consistency with the other thirteen endpoints. Clean break — no dual-output. Full field rename table in CHANGELOG.md.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-04-09', date: 'Apr 9', tag: 'New Tool',
    title: 'ADR LQ/EQ Multi-Line Checker',
    desc: 'Check Limited Quantity and Excepted Quantity eligibility for mixed dangerous goods consignments. Multi-item input with per-item breakdown, green/red/amber verdicts. POST /api/adr/lq-check.',
    link: '/adr/lq-eq-checker',
  },
  {
    isoDate: '2026-04-05', date: 'Apr 5', tag: 'New Tool',
    title: 'Air Freight ULD Type Reference',
    desc: '15 unit load device types — AKE (LD3), PMC, PLA, and more. Dimensions, weights, volume, aircraft compatibility, and deck positions. Free REST API at /api/uld.',
    link: '/uld',
  },
  {
    isoDate: '2026-04-05', date: 'Apr 5', tag: 'New Tool',
    title: 'Vehicle & Trailer Type Reference',
    desc: '17 road freight vehicle and trailer types — curtainsiders, rigids, vans, US 53ft. Dimensions, payload limits, pallet capacity. Free REST API at /api/vehicles.',
    link: '/vehicles',
  },
  {
    isoDate: '2026-04-05', date: 'Apr 5', tag: 'API Change',
    title: 'Composite Shipment Summary Endpoint',
    desc: 'POST /api/shipment/summary chains CBM, LDM, chargeable weight, ADR compliance, and UK duty estimation into one response. Accepts road/air/sea/multimodal modes.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-04-05', date: 'Apr 5', tag: 'API Change',
    title: 'Sea Freight W/M Added to Calculators',
    desc: 'Consignment calculator and chargeable weight calculator now support sea freight mode with W/M (Weight or Measure) at 1 CBM = 1 revenue tonne.',
    link: '/consignment-calculator',
  },
  {
    isoDate: '2026-04-05', date: 'Apr 5', tag: 'API Change',
    title: 'Shipment Object Schema v1',
    desc: 'Canonical FreightUtils Shipment schema defined — the foundational data model for all composite endpoints.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-04-04', date: 'Apr 4', tag: 'New Tool',
    title: 'UK Import Duty & VAT Estimator',
    desc: 'Estimate UK import duty and VAT for any commodity code using live GOV.UK Trade Tariff data. Supports Incoterm-adjusted CIF, preferential rate flagging, and cross-tool HS code workflow.',
    link: '/duty',
  },
  {
    isoDate: '2026-04-04', date: 'Apr 4', tag: 'New Tool',
    title: 'UN/LOCODE Lookup',
    desc: '116,000+ transport locations from UNECE UN/LOCODE 2024-2. Searchable by name, code, country, and function type (port, airport, rail, road, ICD, border).',
    link: '/unlocode',
  },
  {
    isoDate: '2026-04-04', date: 'Apr 4', tag: 'New Tool',
    title: 'Multi-Item Consignment Calculator',
    desc: 'Calculate total CBM, weight, LDM, and chargeable weight across mixed items. Available as web tool, REST API, and MCP tool.',
    link: '/consignment-calculator',
  },
  {
    isoDate: '2026-04-03', date: 'Apr 3', tag: 'MCP Update',
    title: 'Published to Official MCP Registry',
    desc: 'FreightUtils MCP Server v1.0.1 now on registry.modelcontextprotocol.io. Also listed on Smithery.ai, mcp.so, and 5+ directories.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-04-03', date: 'Apr 3', tag: 'API Change',
    title: 'MCP Remote SSE Endpoint Live',
    desc: 'Connect AI agents to all FreightUtils tools at freightutils.com/api/mcp/mcp. Streamable HTTP transport via mcp-handler.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-04-02', date: 'Apr 2', tag: 'API Change',
    title: 'Rate Limits Updated to 100/day',
    desc: 'Courtesy rate limit changed from 1,000/hour to 100 requests per day per IP across all API endpoints. Real enforcement via Vercel KV middleware.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-04-01', date: 'Apr 1', tag: 'New Tool',
    title: 'ADR 1.1.3.6 Exemption Calculator',
    desc: 'Calculate ADR exemption thresholds for mixed hazardous loads. Supports multi-substance mixed-load calculation.',
    link: '/adr-calculator',
  },
  {
    isoDate: '2026-04-01', date: 'Apr 1', tag: 'Data Update',
    title: 'ADR 2025 Dataset',
    desc: '2,939 dangerous goods entries from UNECE ADR 2025 edition (licensed from Labeline.com).',
    link: '/adr',
  },
  {
    isoDate: '2026-04-01', date: 'Apr 1', tag: 'Data Update',
    title: 'HS Code Dataset',
    desc: '6,940 codes from WCO HS 2022 nomenclature with full section/chapter/heading hierarchy.',
    link: '/hs',
  },
  {
    isoDate: '2026-04-01', date: 'Apr 1', tag: 'Data Update',
    title: 'Airline Codes',
    desc: '6,352 entries with IATA/ICAO codes and AWB prefixes. Cargo-only default view with 390 cargo airlines.',
    link: '/airlines',
  },
  {
    isoDate: '2026-03-15', date: 'Mar 15', tag: 'New Tool',
    title: 'FreightUtils.com Launched',
    desc: '11 free freight tools with open REST APIs. LDM, CBM, chargeable weight, pallet fitting, container capacity, unit converter, ADR, airlines, INCOTERMS, HS codes.',
    link: '/',
  },
  {
    isoDate: '2026-03-15', date: 'Mar 15', tag: 'API Change',
    title: 'OpenAPI 3.0.3 Specification Published',
    desc: 'Full OpenAPI spec covering all endpoints. Compatible with Swagger, Postman, and RapidAPI import.',
    link: '/api-docs',
  },
  {
    isoDate: '2026-03-15', date: 'Mar 15', tag: 'Data Update',
    title: 'INCOTERMS 2020 Reference Data',
    desc: 'All 11 Incoterms with seller/buyer responsibilities, risk transfer, cost transfer, and insurance details.',
    link: '/incoterms',
  },
];

export function monthGroups(): { month: string; items: ChangelogEntry[] }[] {
  const groups = new Map<string, ChangelogEntry[]>();
  for (const e of entries) {
    const d = new Date(e.isoDate + 'T00:00:00Z');
    const month = d.toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(e);
  }
  return [...groups.entries()].map(([month, items]) => ({ month, items }));
}
