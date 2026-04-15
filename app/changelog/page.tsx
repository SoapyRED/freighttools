import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'FreightUtils changelog — data updates, new tools, and API changes. Actively maintained freight data and APIs.',
  alternates: { canonical: 'https://www.freightutils.com/changelog' },
};

// ─── Data ───────────────────────────────────────────────────────

type Tag = 'New Tool' | 'Data Update' | 'API Change' | 'Bug Fix' | 'MCP Update';

interface Entry { date: string; tag: Tag; title: string; desc: string }

const TAG_COLORS: Record<Tag, { bg: string; text: string }> = {
  'New Tool':    { bg: '#dcfce7', text: '#166534' },
  'Data Update': { bg: '#dbeafe', text: '#1e40af' },
  'API Change':  { bg: '#ffedd5', text: '#9a3412' },
  'Bug Fix':     { bg: '#f3f4f6', text: '#374151' },
  'MCP Update':  { bg: '#f3e8ff', text: '#6b21a8' },
};

const entries: { month: string; items: Entry[] }[] = [
  {
    month: 'April 2026',
    items: [
      { date: 'Apr 9', tag: 'New Tool', title: 'ADR LQ/EQ Multi-Line Checker', desc: 'Check Limited Quantity and Excepted Quantity eligibility for mixed dangerous goods consignments. Multi-item input with per-item breakdown, green/red/amber verdicts. POST /api/adr/lq-check.' },
      { date: 'Apr 5', tag: 'New Tool', title: 'Air Freight ULD Type Reference', desc: '15 unit load device types — AKE (LD3), PMC, PLA, and more. Dimensions, weights, volume, aircraft compatibility, and deck positions. Free REST API at /api/uld.' },
      { date: 'Apr 5', tag: 'New Tool', title: 'Vehicle & Trailer Type Reference', desc: '17 road freight vehicle and trailer types — curtainsiders, rigids, vans, US 53ft. Dimensions, payload limits, pallet capacity. Free REST API at /api/vehicles.' },
      { date: 'Apr 5', tag: 'API Change', title: 'Composite Shipment Summary Endpoint', desc: 'POST /api/shipment/summary chains CBM, LDM, chargeable weight, ADR compliance, and UK duty estimation into one response. Accepts road/air/sea/multimodal modes.' },
      { date: 'Apr 5', tag: 'API Change', title: 'Sea Freight W/M Added to Calculators', desc: 'Consignment calculator and chargeable weight calculator now support sea freight mode with W/M (Weight or Measure) at 1 CBM = 1 revenue tonne.' },
      { date: 'Apr 5', tag: 'API Change', title: 'Shipment Object Schema v1', desc: 'Canonical FreightUtils Shipment schema defined — the foundational data model for all composite endpoints.' },
      { date: 'Apr 4', tag: 'New Tool', title: 'UK Import Duty & VAT Estimator', desc: 'Estimate UK import duty and VAT for any commodity code using live GOV.UK Trade Tariff data. Supports Incoterm-adjusted CIF, preferential rate flagging, and cross-tool HS code workflow.' },
      { date: 'Apr 4', tag: 'New Tool', title: 'UN/LOCODE Lookup', desc: '116,000+ transport locations from UNECE UN/LOCODE 2024-2. Searchable by name, code, country, and function type (port, airport, rail, road, ICD, border).' },
      { date: 'Apr 4', tag: 'New Tool', title: 'Multi-Item Consignment Calculator', desc: 'Calculate total CBM, weight, LDM, and chargeable weight across mixed items. Available as web tool, REST API, and MCP tool.' },
      { date: 'Apr 3', tag: 'MCP Update', title: 'Published to Official MCP Registry', desc: 'FreightUtils MCP Server v1.0.1 now on registry.modelcontextprotocol.io. Also listed on Smithery.ai, mcp.so, and 5+ directories.' },
      { date: 'Apr 3', tag: 'API Change', title: 'MCP Remote SSE Endpoint Live', desc: 'Connect AI agents to all FreightUtils tools at freightutils.com/api/mcp/mcp. Streamable HTTP transport via mcp-handler.' },
      { date: 'Apr 2', tag: 'API Change', title: 'Rate Limits Updated to 100/day', desc: 'Courtesy rate limit changed from 1,000/hour to 100 requests per day per IP across all API endpoints. Real enforcement via Vercel KV middleware.' },
      { date: 'Apr 1', tag: 'New Tool', title: 'ADR 1.1.3.6 Exemption Calculator', desc: 'Calculate ADR exemption thresholds for mixed hazardous loads. Supports multi-substance mixed-load calculation.' },
      { date: 'Apr 1', tag: 'Data Update', title: 'ADR 2025 Dataset', desc: '2,939 dangerous goods entries from UNECE ADR 2025 edition (licensed from Labeline.com).' },
      { date: 'Apr 1', tag: 'Data Update', title: 'HS Code Dataset', desc: '6,940 codes from WCO HS 2022 nomenclature with full section/chapter/heading hierarchy.' },
      { date: 'Apr 1', tag: 'Data Update', title: 'Airline Codes', desc: '6,352 entries with IATA/ICAO codes and AWB prefixes. Cargo-only default view with 390 cargo airlines.' },
    ],
  },
  {
    month: 'March 2026',
    items: [
      { date: 'Mar 15', tag: 'New Tool', title: 'FreightUtils.com Launched', desc: '11 free freight tools with open REST APIs. LDM, CBM, chargeable weight, pallet fitting, container capacity, unit converter, ADR, airlines, INCOTERMS, HS codes.' },
      { date: 'Mar 15', tag: 'API Change', title: 'OpenAPI 3.0.3 Specification Published', desc: 'Full OpenAPI spec covering all endpoints. Compatible with Swagger, Postman, and RapidAPI import.' },
      { date: 'Mar 15', tag: 'Data Update', title: 'INCOTERMS 2020 Reference Data', desc: 'All 11 Incoterms with seller/buyer responsibilities, risk transfer, cost transfer, and insurance details.' },
    ],
  },
];

// ─── Page ───────────────────────────────────────────────────────

export default function ChangelogPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Change<span style={{ color: '#e87722' }}>log</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-faint)', maxWidth: 520, margin: '0 auto' }}>
          Data updates, new tools, and API changes. FreightUtils is actively maintained.
        </p>
      </div>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '32px 16px 64px' }}>
        {/* Data freshness */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '16px 20px', marginBottom: 32, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text)' }}>Data freshness:</strong>{' '}
          ADR data: UNECE ADR 2025. HS codes: WCO HS 2022. Next scheduled updates: ADR 2027 (September 2026), HS 2027 (November 2026).
        </div>

        {/* Entries */}
        {entries.map(group => (
          <div key={group.month} style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 800, color: 'var(--text)',
              marginBottom: 16, letterSpacing: '-0.3px',
              paddingBottom: 8, borderBottom: '2px solid var(--border)',
            }}>
              {group.month}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.items.map((entry, i) => {
                const tag = TAG_COLORS[entry.tag];
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr', gap: 16, alignItems: 'start',
                    padding: '14px 0',
                    borderBottom: i < group.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 500, paddingTop: 2 }}>
                      {entry.date}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                          fontSize: 11, fontWeight: 700, background: tag.bg, color: tag.text,
                          letterSpacing: '0.3px',
                        }}>
                          {entry.tag}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                          {entry.title}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                        {entry.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 32, lineHeight: 1.6 }}>
          Dates are approximate. Data is sourced from official international standards bodies (UNECE, WCO, ICC, IATA).
          ADR data licensed from Labeline.com. For corrections or data issues, contact{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>
      </div>
    </>
  );
}
