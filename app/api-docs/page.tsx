import type { Metadata } from 'next';
import CopyableCode from '@/app/components/CopyableCode';
import JsonBlock from '@/app/components/JsonBlock';
import QuickstartTabs from '@/app/components/QuickstartTabs';
import { SITE_STATS } from '@/lib/constants/siteStats';
import PostmanButton from '@/app/components/PostmanButton';
import ApiKeySignup from '@/app/components/ApiKeySignup';

export const metadata: Metadata = {
  title: 'API Documentation',
  description: `FreightUtils public API reference — ${SITE_STATS.apiEndpointCount} free endpoints. Loading metres, CBM, chargeable weight, pallet fitting, consignment calculator, ADR lookup, ADR exemption calculator, airline codes, INCOTERMS 2020, container capacity, unit converter, HS code lookup, UK duty & VAT, UN/LOCODE, ULD types, vehicle types, and shipment summary. No auth required.`,
};

const s = {
  main: { maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' } as React.CSSProperties,
  hero: { background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' as const },
  h1: { fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.3px', marginTop: 40 } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  endpointHeader: { background: '#1a2332', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 } as React.CSSProperties,
};

export default function ApiDocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "name": "FreightUtils API Documentation",
  "description": "REST API documentation for freight calculators, ADR dangerous goods, airline codes, HS codes, and INCOTERMS",
  "url": "https://www.freightutils.com/api-docs"
}`
        }}
      />
      <div style={s.hero}>
        <h1 style={s.h1}>API <span style={{ color: '#e87722' }}>Documentation</span></h1>
        <p style={{ fontSize: 16, color: 'var(--text-faint)', maxWidth: 500, margin: '0 auto' }}>
          All FreightUtils calculators are available as free, open REST API endpoints
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
          Last updated: {SITE_STATS.lastUpdated}
        </p>
      </div>

      <main style={s.main}>

        {/* OpenAPI spec callout — prominent */}
        <a
          href="/openapi.json"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#1a2332', color: '#fff', borderRadius: 10,
            padding: '14px 28px', fontSize: 16, fontWeight: 700,
            textDecoration: 'none', marginBottom: 28,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontFamily: "'Outfit', sans-serif",
            border: '1.5px solid #374151',
          }}
        >
          &#128229; Download OpenAPI 3.0 Spec (JSON)
        </a>
        <a
          href="/FreightUtils.postman_collection.json"
          download
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'transparent', color: '#EF9F27', borderRadius: 10,
            padding: '14px 28px', fontSize: 14, fontWeight: 700,
            textDecoration: 'none', marginBottom: 28, marginLeft: 12,
            fontFamily: "'Outfit', sans-serif",
            border: '1.5px solid #EF9F27',
          }}
        >
          &#128229; Download Postman Collection
        </a>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6, marginTop: -16 }}>
          Compatible with Swagger, Postman, and RapidAPI import
        </p>

        {/* Overview */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={s.sectionTitle}>Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
            The FreightUtils API is a free, stateless REST API. Every calculator on this site has a corresponding API endpoint.
            No authentication is required. Responses are JSON. CORS is enabled for all origins.
          </p>
          <div className="code-block">
            Base URL: https://www.freightutils.com/api
          </div>
          <a
            href="/openapi.json"
            download
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 16, padding: '10px 20px', borderRadius: 8,
              background: '#1a2332', color: '#EF9F27', textDecoration: 'none',
              fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
            }}
          >
            Download OpenAPI 3.0 Spec (JSON)
          </a>
        </div>

        {/* Reliability & Support */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={s.sectionTitle}>Reliability &amp; Support</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            FreightUtils APIs are hosted on Vercel&apos;s global edge network with automatic SSL and CDN caching.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12, marginBottom: 16,
          }}>
            {[
              { label: 'Status', value: 'APIs are actively maintained and monitored.' },
              { label: 'Support', value: 'contact@freightutils.com — corrections and API issues typically addressed within 2 business days.' },
              { label: 'Versioning', value: 'Reference endpoints (ADR, HS, airlines) include a meta object with data source and edition information. Breaking changes will be announced via the API docs page.' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-faint)', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: '#1a2332', borderRadius: 10, padding: '16px 20px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>
                Open Access Tier
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                No authentication required for casual use. Rate limit: 25 requests per day per IP. Free API keys available for 100/day.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>
                Commercial Access
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                For production integrations with higher limits, subscribe via{' '}
                <a href="https://rapidapi.com/freightutils" style={{ color: '#e87722', textDecoration: 'underline' }}>RapidAPI</a>{' '}
                or <a href="mailto:contact@freightutils.com" style={{ color: '#e87722', textDecoration: 'underline' }}>contact us directly</a>.
              </div>
            </div>
          </div>
        </div>

        {/* API Key Signup */}
        <div style={{ marginBottom: 40 }}>
          <ApiKeySignup />
        </div>

        {/* MCP Server */}
        <div id="mcp" style={{ marginBottom: 40 }}>
          <h2 style={s.sectionTitle}>MCP Server — AI Agent Integration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            FreightUtils is available as a <strong>Model Context Protocol (MCP) server</strong>, giving
            AI agents direct access to all {SITE_STATS.toolCount} freight calculation and reference tools. The first and only freight MCP server.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 8 }}>Install via npm</div>
              <CopyableCode code="npx freightutils-mcp" />
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 8 }}>Or connect via URL</div>
              <CopyableCode code="https://www.freightutils.com/api/mcp/mcp" />
            </div>
          </div>

          <div style={{ background: '#1a2332', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 12 }}>Claude Desktop Configuration</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Add to your <code style={{ background: '#2a3442', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>claude_desktop_config.json</code>:</div>
            <CopyableCode code={`{
  "mcpServers": {
    "freightutils": {
      "command": "npx",
      "args": ["freightutils-mcp"]
    }
  }
}`} />
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 12 }}>What AI agents can do</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Calculate loading metres for 20 Euro pallets on an artic trailer',
                'Look up UN 1203 and check if 200 litres qualifies for ADR exemption',
                "What's the chargeable weight for 2 boxes 120\u00d780\u00d7100cm at 500kg?",
                'Find the airline with AWB prefix 176',
                'How many boxes 40\u00d730\u00d725cm fit on a Euro pallet?',
              ].map((q, i) => (
                <div key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.5, paddingLeft: 16, borderLeft: '3px solid #e87722' }}>
                  &ldquo;{q}&rdquo;
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a
              href="https://www.npmjs.com/package/freightutils-mcp"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', color: '#fff', borderRadius: 8,
                padding: '8px 18px', fontSize: 13, fontWeight: 700,
                textDecoration: 'none', border: 'none',
              }}
            >
              npm
            </a>
            <a
              href="https://github.com/SoapyRED/freightutils-mcp"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', color: '#fff', borderRadius: 8,
                padding: '8px 18px', fontSize: 13, fontWeight: 700,
                textDecoration: 'none', border: 'none',
              }}
            >
              GitHub
            </a>
            <PostmanButton />
          </div>
        </div>

        {/* Quickstart */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={s.sectionTitle}>Get Started in 2 Minutes</h2>
          <QuickstartTabs />
        </div>

        {/* ── Shipment Summary (Composite) ── */}
        <div id="shipment-summary" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>POST</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/shipment/summary</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Shipment Summary (Composite)</span>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'inline-block', background: 'rgba(232,119,34,0.12)', color: '#e87722', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Flagship Endpoint
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Composite endpoint that chains CBM, chargeable weight, LDM, ADR compliance, and UK duty/VAT
              estimation into a single call. Accepts a unified Shipment object and returns comprehensive
              results based on transport mode.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Mode Parameter</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Mode</th><th>Calculations Included</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>road</code></td><td>CBM, LDM, pallet spaces, trailer utilisation, road chargeable weight (1 LDM = 1,750 kg), vehicle suggestion</td></tr>
                  <tr><td><code>air</code></td><td>CBM, volumetric weight (1 CBM = 167 kg), air chargeable weight</td></tr>
                  <tr><td><code>sea</code></td><td>CBM, revenue tonnes (W/M at 1 CBM = 1,000 kg), container suggestion</td></tr>
                  <tr><td><code>multimodal</code></td><td>All of the above — road, air, and sea calculations combined</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Mixed 3-item road shipment with a DG item and HS code:</p>
            <CopyableCode code={`curl -X POST "https://www.freightutils.com/api/shipment/summary" \\
  -H "Content-Type: application/json" \\
  -d '{
  "mode": "road",
  "origin": { "country": "DE", "locode": "DEHAM" },
  "destination": { "country": "GB", "locode": "GBFXT" },
  "incoterm": "CIF",
  "freightCost": 850,
  "insuranceCost": 120,
  "items": [
    {
      "description": "Machine parts on Euro pallets",
      "length": 120, "width": 80, "height": 110,
      "weight": 480, "quantity": 6,
      "stackable": false, "palletType": "euro",
      "hsCode": "847989", "customsValue": 12000
    },
    {
      "description": "Cleaning solvent (DG)",
      "length": 60, "width": 40, "height": 50,
      "weight": 25, "quantity": 4,
      "unNumber": "1993"
    },
    {
      "description": "Spare filters",
      "length": 40, "width": 30, "height": 20,
      "weight": 8, "quantity": 10,
      "stackable": true
    }
  ]
}'`} style={{ marginBottom: 16 }} />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Response</h3>
            <JsonBlock json={`{
  "mode": "road",
  "itemCount": 3,
  "totals": {
    "pieces": 20,
    "grossWeight": 3060,
    "volumeCBM": 7.28,
    "chargeableWeight": 3060,
    "billingBasis": "weight"
  },
  "modeSpecific": {
    "loadingMetres": 4.0,
    "palletSpaces": 10,
    "trailerUtilisation": 29.41,
    "suggestedVehicle": "13.6m Artic Trailer",
    "chargeableWeightRoad": 7000
  },
  "compliance": {
    "hasDangerousGoods": true,
    "adrFlags": {
      "unNumbers": ["1993"],
      "totalPoints": 300,
      "exemptionApplicable": true
    }
  },
  "customs": {
    "hsCodesPresent": true,
    "canEstimateUkDuty": true,
    "dutyEstimate": {
      "cifValue": 12970,
      "dutyRate": "1.7%",
      "dutyAmount": 220.49,
      "vatRate": "20%",
      "vatAmount": 2638.1,
      "totalTaxes": 2858.59
    }
  },
  "warnings": [],
  "disclaimer": "Estimates only — verify with carrier and customs broker",
  "dataVersion": {
    "adr": "UNECE ADR 2025",
    "hs": "WCO HS 2022",
    "duty": "GOV.UK Trade Tariff API"
  }
}`} />
            <p style={{ color: '#e87722', fontSize: 13, fontWeight: 600, marginTop: 16, padding: '10px 14px', background: 'rgba(232,119,34,0.08)', borderRadius: 8, border: '1px solid rgba(232,119,34,0.2)' }}>
              Pro tier endpoint. Free tier: 10 calls/day. Subscribe for higher limits.
            </p>
          </div>
        </div>

        {/* LDM Endpoint */}
        <div style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/ldm</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Loading Metres Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate the loading metres (LDM) required for a consignment on a UK/EU road freight trailer.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>length</code></td>
                    <td>number</td>
                    <td>Yes*</td>
                    <td>Pallet length in millimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>width</code></td>
                    <td>number</td>
                    <td>Yes*</td>
                    <td>Pallet width in millimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>pallet</code></td>
                    <td>string</td>
                    <td>No*</td>
                    <td>Preset: <code>euro</code>, <code>uk</code>, <code>half</code>, <code>quarter</code>. Replaces length/width.</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>qty</code></td>
                    <td>integer</td>
                    <td>No</td>
                    <td>Number of pallets</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><code>stackable</code></td>
                    <td>boolean</td>
                    <td>No</td>
                    <td>Whether pallets can be stacked</td>
                    <td>false</td>
                  </tr>
                  <tr>
                    <td><code>stack</code></td>
                    <td>2 or 3</td>
                    <td>No</td>
                    <td>Max stack height (used when stackable=true)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td><code>weight</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Weight per pallet in kg</td>
                    <td>null</td>
                  </tr>
                  <tr>
                    <td><code>vehicle</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td><code>artic</code>, <code>rigid10</code>, <code>rigid75</code>, <code>luton</code>, <code>us53</code> (53ft US/Canada), <code>us48</code> (48ft US), <code>custom</code></td>
                    <td>artic</td>
                  </tr>
                  <tr>
                    <td><code>vehicle_length</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Custom vehicle length in metres (required when vehicle=custom)</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>* Either <code>pallet</code> (preset ID) <strong>or</strong> both <code>length</code> and <code>width</code> must be provided.</p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>12 Euro pallets on an artic:</p>
            <div className="code-block" style={{ marginBottom: 16 }}>
              GET /api/ldm?pallet=euro&qty=12&vehicle=artic
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Custom dimensions, stackable, with weight check:</p>
            <div className="code-block" style={{ marginBottom: 16 }}>
              GET /api/ldm?length=1200&width=1000&qty=5&stackable=true&stack=2&weight=300&vehicle=rigid10
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>cURL example:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/ldm?pallet=euro&qty=12&vehicle=artic"'} style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>US 53ft trailer:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/ldm?pallet=euro&qty=20&vehicle=us53"'} style={{ marginBottom: 24 }} />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Response</h3>
            <JsonBlock json={`{
  "ldm": 4.8,
  "vehicle": {
    "name": "13.6m Artic Trailer",
    "length_m": 13.6,
    "max_payload_kg": 24000
  },
  "utilisation_percent": 35.29,
  "pallet_spaces": {
    "used": 12,
    "available": 33
  },
  "total_weight_kg": null,
  "fits": true,
  "warnings": [],
  "meta": {
    "inputs": {
      "length_mm": 1200,
      "width_mm": 800,
      "qty": 12,
      "stackable": false,
      "stack_factor": 2,
      "weight_per_pallet_kg": null,
      "vehicle": "artic"
    }
  }
}`} />
          </div>
        </div>

        {/* CBM Endpoint */}
        <div id="cbm" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/cbm</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Cubic Metres Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate the cubic metre (CBM) volume of a shipment. Returns total CBM plus equivalents
              in cubic feet, litres, and cubic inches.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>l</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Length of one piece in centimetres</td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td><code>w</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Width of one piece in centimetres</td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td><code>h</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Height of one piece in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>pcs</code></td>
                    <td>integer</td>
                    <td>No</td>
                    <td>Number of identical pieces</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>5 boxes, 120×80×100 cm each:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/cbm?l=120&w=80&h=100&pcs=5"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "cbm_per_piece": 0.96,
  "total_cbm": 4.8,
  "total_volume_m3": 4.8,
  "cubic_feet": 169.5106,
  "litres": 4800,
  "cubic_inches": 292913.8,
  "pieces": 5,
  "meta": {
    "inputs": {
      "length_cm": 120,
      "width_cm": 80,
      "height_cm": 100,
      "pieces": 5
    }
  }
}`} />
          </div>
        </div>

        {/* Chargeable Weight Endpoint */}
        <div id="chargeable-weight" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/chargeable-weight</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Air Freight Chargeable Weight</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate air freight chargeable weight — whichever is higher between actual gross weight
              and volumetric (dimensional) weight. Supports custom volumetric factors for all carriers.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>l</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Length of one piece in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>w</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Width of one piece in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>h</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Height of one piece in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>gw</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Total gross weight of all pieces in kg</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>pcs</code></td>
                    <td>integer</td>
                    <td>No</td>
                    <td>Number of identical pieces</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><code>factor</code></td>
                    <td>integer</td>
                    <td>No</td>
                    <td>Volumetric divisor: <code>6000</code> (IATA standard), <code>5000</code> (express carriers)</td>
                    <td>6000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>2 pieces, 120×80×100 cm, 500 kg total, IATA factor:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/chargeable-weight?l=120&w=80&h=100&gw=500&pcs=2&factor=6000"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "chargeable_weight_kg": 500,
  "basis": "actual",
  "gross_weight_kg": 500,
  "volumetric_weight_kg": 320,
  "volumetric_weight_per_piece_kg": 160,
  "cbm": 1.92,
  "ratio": 3.84,
  "factor": 6000,
  "pieces": 2,
  "meta": {
    "inputs": {
      "length_cm": 120,
      "width_cm": 80,
      "height_cm": 100,
      "gross_weight_kg": 500,
      "pieces": 2,
      "factor": 6000
    }
  }
}`} />
          </div>
        </div>

        {/* Pallet Fitting Endpoint */}
        <div id="pallet" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/pallet</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Pallet Box Fitting Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate how many boxes fit on a pallet using a layer-based algorithm. Returns boxes per
              layer, number of layers, total boxes, orientation used, and volume/weight analysis.
              Optional weight constraint caps the result at the pallet&apos;s maximum payload.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>pl</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Pallet length in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>pw</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Pallet width in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>pmh</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Maximum total stack height in centimetres (floor to top of cargo)</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>bl</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Box length in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>bw</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Box width in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>bh</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Box height in centimetres</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>ph</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Pallet board/deck height in cm — deducted from usable height</td>
                    <td>15</td>
                  </tr>
                  <tr>
                    <td><code>bwt</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Weight per box in kg — enables weight constraint calculation</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>mpw</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Maximum pallet payload weight in kg — caps result if weight exceeded</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><code>rotate</code></td>
                    <td>boolean</td>
                    <td>No</td>
                    <td>Allow 90° rotation of boxes for best fit. Pass <code>false</code> to disable.</td>
                    <td>true</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Request</h3>
            <CopyableCode code={'curl "https://www.freightutils.com/api/pallet?pl=120&pw=80&pmh=220&bl=40&bw=30&bh=25&bwt=5&mpw=1500"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "boxes_per_layer": 8,
  "layers": 8,
  "total_boxes": 64,
  "orientation": "original",
  "boxes_per_row": 3,
  "boxes_per_col": 2,
  "usable_height_cm": 205,
  "utilisation_percent": 62.5,
  "total_box_volume_cbm": 0.192,
  "pallet_volume_cbm": 1.968,
  "wasted_space_cbm": 1.776,
  "weight_limited": false,
  "total_weight_kg": 320,
  "remaining_weight_capacity_kg": 1180,
  "meta": {
    "inputs": {
      "pallet_length_cm": 120, "pallet_width_cm": 80,
      "pallet_max_height_cm": 220, "pallet_height_cm": 15,
      "box_length_cm": 40, "box_width_cm": 30, "box_height_cm": 25,
      "box_weight_kg": 5, "max_payload_weight_kg": 1500,
      "allow_rotation": true
    }
  }
}`} />
          </div>
        </div>

        {/* ADR Endpoint */}
        <div id="adr" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/adr</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>ADR 2025 Dangerous Goods Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Look up ADR 2025 dangerous goods by UN number, search by substance name, or filter by hazard class.
              The dataset contains {SITE_STATS.adrEntries.toLocaleString()} entries from the ADR 2025 Dangerous Goods List (Table A).
              Responses are cached for 1 hour (<code>s-maxage=3600</code>).
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Query Modes</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Max results</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>un</code></td>
                    <td>string</td>
                    <td>Exact UN number lookup. Accepts <code>1203</code>, <code>UN1203</code>, or <code>01203</code>.</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><code>search</code></td>
                    <td>string</td>
                    <td>Case-insensitive partial match on the proper shipping name. Min 2 characters. Also accepts <code>q</code> as an alias.</td>
                    <td>50</td>
                  </tr>
                  <tr>
                    <td><code>class</code></td>
                    <td>string</td>
                    <td>Filter by ADR hazard class (e.g. <code>3</code>, <code>6.1</code>, <code>1.1</code>).</td>
                    <td>100</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Provide exactly one parameter per request. Omitting all parameters returns a 400 with usage hints.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Exact UN number lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/adr?un=1203"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "count": 1,
  "results": [
    {
      "un_number": "1203",
      "proper_shipping_name": "MOTOR SPIRIT or GASOLINE or PETROL",
      "class": "3",
      "classification_code": "F1",
      "packing_group": "II",
      "labels": "3",
      "special_provisions": "243 534 664",
      "limited_quantity": "1 L",
      "excepted_quantity": "E2",
      "transport_category": "2",
      "tunnel_restriction_code": "(D/E)",
      "hazard_identification_number": "33",
      "variant_index": 0,
      "variant_count": 1
    }
  ],
  "meta": {
    "source": "UNECE ADR 2025, licensed from Labeline.com",
    "edition": "ADR 2025",
    "entries": 2939
  }
}`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Search by substance name:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/adr?search=acetone"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{ "count": 3, "results": [ ... ] }`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Filter by hazard class:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/adr?class=3"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{ "count": 50, "results": [ ... ] }`} />
          </div>
        </div>

        {/* ADR Exemption Calculator Endpoint */}
        <div id="adr-calculator" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace', marginLeft: -4 }}>POST</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/adr-calculator</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>ADR 1.1.3.6 Exemption Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate whether the ADR 1.1.3.6 small load exemption applies to a dangerous goods consignment.
              Supports single-substance GET queries and multi-substance POST requests. Checks both total points
              threshold (1,000) and per-substance quantity limits per ADR 1.1.3.6.3.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>GET — Single Substance</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>un</code></td><td>string</td><td>Yes</td><td>UN number (e.g. <code>1203</code>)</td></tr>
                  <tr><td><code>qty</code></td><td>number</td><td>Yes</td><td>Quantity in kg or litres</td></tr>
                </tbody>
              </table>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Example — 200 litres of petrol:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/adr-calculator?un=1203&qty=200"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "items": [
    {
      "un_number": "1203",
      "proper_shipping_name": "MOTOR SPIRIT or GASOLINE or PETROL",
      "class": "3",
      "transport_category": "2",
      "quantity": 200,
      "multiplier": 3,
      "points": 600
    }
  ],
  "total_points": 600,
  "threshold": 1000,
  "exempt": true,
  "has_category_zero": false,
  "has_quantity_exceedance": false,
  "warnings": [],
  "message": "1.1.3.6 exemption applies"
}`} style={{ marginBottom: 24 }} />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>POST — Multi-Substance Load</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Request body:</p>
            <div className="code-block" style={{ marginBottom: 6 }}>
              {`POST /api/adr-calculator
Content-Type: application/json

{
  "items": [
    { "un_number": "1203", "quantity": 200 },
    { "un_number": "1090", "quantity": 50 }
  ]
}`}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Response structure is identical to the GET endpoint, with multiple items in the array.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Response Fields</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 16 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>transport_category</code></td><td>string</td><td>ADR transport category (0&ndash;4)</td></tr>
                  <tr><td><code>multiplier</code></td><td>number | null</td><td>Points multiplier for the category (null for cat 0)</td></tr>
                  <tr><td><code>points</code></td><td>number | null</td><td>quantity &times; multiplier</td></tr>
                  <tr><td><code>total_points</code></td><td>number</td><td>Sum of all substance points</td></tr>
                  <tr><td><code>exempt</code></td><td>boolean</td><td>true if total &le; 1,000 AND no cat 0 AND no quantity exceedance</td></tr>
                  <tr><td><code>has_category_zero</code></td><td>boolean</td><td>true if any substance is transport category 0</td></tr>
                  <tr><td><code>has_quantity_exceedance</code></td><td>boolean</td><td>true if any substance exceeds its per-category max quantity</td></tr>
                  <tr><td><code>warnings</code></td><td>string[]</td><td>Human-readable warning messages for limit violations</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── LQ/EQ Checker Endpoint ── */}
        <div id="lq-check" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>POST</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/adr/lq-check</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>ADR Limited &amp; Excepted Quantity Checker</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Check whether dangerous goods qualify for ADR Limited Quantity (Chapter 3.4) or
              Excepted Quantity (Chapter 3.5) concessions. Accepts up to 20 items per request and
              returns per-item pass/fail status against ADR Table A limits.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Request Body</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>mode</code></td><td>string</td><td>No</td><td><code>lq</code> (default) or <code>eq</code></td></tr>
                  <tr><td><code>items</code></td><td>array</td><td>Yes</td><td>1–20 items to check</td></tr>
                  <tr><td><code>items[].un_number</code></td><td>string</td><td>Yes</td><td>UN number (e.g. <code>1203</code>)</td></tr>
                  <tr><td><code>items[].quantity</code></td><td>number</td><td>Yes</td><td>Quantity per inner packaging</td></tr>
                  <tr><td><code>items[].unit</code></td><td>string</td><td>No</td><td><code>ml</code>, <code>L</code> (default), <code>g</code>, or <code>kg</code></td></tr>
                  <tr><td><code>items[].inner_packaging_qty</code></td><td>number</td><td>No</td><td>Number of inner packagings per outer (EQ mode only)</td></tr>
                </tbody>
              </table>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Example — check LQ for 0.5 L of petrol:</p>
            <CopyableCode code={`curl -X POST https://www.freightutils.com/api/adr/lq-check \\
  -H "Content-Type: application/json" \\
  -d '{"mode":"lq","items":[{"un_number":"1203","quantity":0.5,"unit":"L"}]}'`} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "mode": "lq",
  "overall_status": "qualifies",
  "items": [
    {
      "un_number": "1203",
      "substance": "MOTOR SPIRIT or GASOLINE or PETROL",
      "class": "3",
      "packing_group": "II",
      "lq_limit": "1 L",
      "lq_limit_value": 1,
      "lq_limit_unit": "L",
      "eq_code": "E2",
      "quantity_entered": 0.5,
      "unit_entered": "L",
      "status": "within_limit",
      "reason": "0.5 L is within the LQ limit of 1 L per inner packaging"
    }
  ],
  "summary": {
    "total_items": 1,
    "qualifying": 1,
    "exceeding": 0,
    "not_permitted": 0
  },
  "references": {
    "adr_chapter": "3.4",
    "table": "3.2 Column 7a"
  }
}`} style={{ marginBottom: 24 }} />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Response Fields</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 16 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>mode</code></td><td>string</td><td><code>lq</code> or <code>eq</code></td></tr>
                  <tr><td><code>overall_status</code></td><td>string</td><td><code>qualifies</code>, <code>does_not_qualify</code>, or <code>partial</code></td></tr>
                  <tr><td><code>items[]</code></td><td>array</td><td>Per-item results with substance info, limits, and pass/fail</td></tr>
                  <tr><td><code>items[].status</code></td><td>string</td><td><code>within_limit</code>, <code>exceeds_limit</code>, or <code>not_permitted</code></td></tr>
                  <tr><td><code>summary</code></td><td>object</td><td>Counts of qualifying, exceeding, and not-permitted items</td></tr>
                  <tr><td><code>references</code></td><td>object</td><td>ADR chapter and table references</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Airlines Endpoint */}
        <div id="airlines" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/airlines</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Airline Codes &amp; AWB Prefix Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Search airlines by name, IATA code, ICAO code, AWB prefix, or country. The dataset contains
              {SITE_STATS.airlineCount.toLocaleString()} airlines including 390 cargo airlines with AWB prefixes.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Query Modes</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Match</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>q</code></td><td>string</td><td>General search — matches name, codes, prefix, country. Smart: 2&ndash;3 digits match prefix only, 2&ndash;3 letters match IATA/ICAO only, 4+ chars search all fields.</td><td>Smart</td></tr>
                  <tr><td><code>iata</code></td><td>string</td><td>IATA 2-letter code (e.g. <code>EK</code>)</td><td>Exact</td></tr>
                  <tr><td><code>icao</code></td><td>string</td><td>ICAO 3-letter code (e.g. <code>UAE</code>)</td><td>Exact</td></tr>
                  <tr><td><code>prefix</code></td><td>string</td><td>AWB 3-digit prefix (e.g. <code>176</code>)</td><td>Exact</td></tr>
                  <tr><td><code>country</code></td><td>string</td><td>Country name (e.g. <code>Germany</code>)</td><td>Partial</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>AWB prefix lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/airlines?prefix=176"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "count": 1,
  "results": [
    {
      "slug": "emirates",
      "airline_name": "Emirates",
      "iata_code": "EK",
      "icao_code": "UAE",
      "awb_prefix": ["176"],
      "callsign": "EMIRATES",
      "country": "United Arab Emirates",
      "has_cargo": true,
      "aliases": ["Emirates SkyCargo"],
      "verified": true
    }
  ],
  "meta": {
    "source": "Public IATA/ICAO data, cross-referenced",
    "airlines": 6352,
    "last_verified": "April 2026"
  }
}`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>IATA code lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/airlines?iata=EK"'} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Name search:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/airlines?q=emirates"'} style={{ marginBottom: 24 }} />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Response Fields</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 16 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>slug</code></td><td>string</td><td>URL-friendly identifier</td></tr>
                  <tr><td><code>airline_name</code></td><td>string</td><td>Official airline name</td></tr>
                  <tr><td><code>iata_code</code></td><td>string | null</td><td>2-character IATA designator</td></tr>
                  <tr><td><code>icao_code</code></td><td>string | null</td><td>3-character ICAO designator</td></tr>
                  <tr><td><code>awb_prefix</code></td><td>string[] | null</td><td>3-digit AWB prefix(es) — array, some airlines have multiple</td></tr>
                  <tr><td><code>callsign</code></td><td>string | null</td><td>Radio callsign for ATC communication</td></tr>
                  <tr><td><code>country</code></td><td>string | null</td><td>Country of registration</td></tr>
                  <tr><td><code>has_cargo</code></td><td>boolean</td><td>true if airline has AWB prefix(es)</td></tr>
                  <tr><td><code>aliases</code></td><td>string[] | null</td><td>Alternative names (e.g. cargo division name)</td></tr>
                  <tr><td><code>verified</code></td><td>boolean</td><td>true if prefix confirmed from multiple independent sources</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* INCOTERMS Endpoint */}
        <div id="incoterms" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/incoterms</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>INCOTERMS 2020 Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Look up INCOTERMS 2020 trade terms. Returns all 11 terms by default, or filter by code
              or transport category. Each term includes seller/buyer responsibilities, risk and cost
              transfer points, insurance obligations, and practical guidance.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>code</code></td>
                    <td>string</td>
                    <td>INCOTERM code (e.g. <code>FOB</code>, <code>CIF</code>, <code>DDP</code>)</td>
                  </tr>
                  <tr>
                    <td><code>category</code></td>
                    <td>string</td>
                    <td>Filter by transport mode: <code>any_mode</code> or <code>sea_only</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Omit all parameters to return all 11 INCOTERMS 2020 terms.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Single term lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/incoterms?code=FOB"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "code": "FOB",
  "name": "Free on Board",
  "slug": "fob-free-on-board",
  "category": "sea_only",
  "summary": "Seller delivers goods on board the vessel at port of shipment. One of the most commonly used terms.",
  "seller_responsibility": "Deliver goods on board the vessel at named port. Export clearance. Loading costs.",
  "buyer_responsibility": "Main sea freight, insurance, import clearance, duties.",
  "risk_transfer": "When goods are on board the vessel at port of shipment.",
  "cost_transfer": "At port of shipment, once loaded on board.",
  "insurance": "No obligation on either party.",
  "export_clearance": "Seller.",
  "import_clearance": "Buyer.",
  "best_for": "Sea freight where buyer wants to arrange their own shipping and insurance. Very commonly used in international trade.",
  "watch_out": "Sea and inland waterway ONLY. Despite being widely used, FOB is technically incorrect for containerised cargo..."
}`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Filter by transport category:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/incoterms?category=sea_only"'} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>All terms:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/incoterms"'} />
          </div>
        </div>

        {/* Containers Endpoint */}
        <div id="containers" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/containers</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Container Capacity Reference</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Shipping container specifications — internal/external dimensions, weights, door openings, and pallet
              capacity for all 10 standard ISO container types. Optionally calculate how many items fit in a specific container.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Query Modes</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>type</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>Container slug (e.g. <code>20ft-standard</code>, <code>40ft-high-cube</code>). Omit to list all.</td>
                  </tr>
                  <tr>
                    <td><code>l</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Item length in cm (requires type + w + h)</td>
                  </tr>
                  <tr>
                    <td><code>w</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Item width in cm</td>
                  </tr>
                  <tr>
                    <td><code>h</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Item height in cm</td>
                  </tr>
                  <tr>
                    <td><code>wt</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Item weight in kg</td>
                  </tr>
                  <tr>
                    <td><code>qty</code></td>
                    <td>integer</td>
                    <td>No</td>
                    <td>Number of items</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>List all containers:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/containers"'} style={{ marginBottom: 16 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Single container specs:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/containers?type=40ft-high-cube"'} style={{ marginBottom: 16 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Loading calculation — how many 60×40×40cm boxes fit in a 40ft HC:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/containers?type=40ft-high-cube&l=60&w=40&h=40&wt=15&qty=500"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "container": { "name": "40ft High Cube", "slug": "40ft-high-cube", ... },
  "loading": {
    "fits_lengthwise": 20,
    "fits_widthwise": 5,
    "fits_height": 6,
    "max_items": 600,
    "requested_qty": 500,
    "fits": true,
    "total_weight_kg": 7500,
    "within_payload": true,
    "utilisation_percent": 63.2
  }
}`} />
          </div>
        </div>

        {/* Convert Endpoint */}
        <div id="convert" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/convert</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Unit Converter</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Convert between freight-relevant units — weights, volumes, lengths, and freight-specific conversions
              (CBM to chargeable weight, CBM to freight tonnes).
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>value</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>The number to convert</td>
                  </tr>
                  <tr>
                    <td><code>from</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Source unit code</td>
                  </tr>
                  <tr>
                    <td><code>to</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Target unit code</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Supported Unit Codes</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Group</th><th>Codes</th></tr>
                </thead>
                <tbody>
                  <tr><td>Weight</td><td><code>kg</code>, <code>lbs</code>, <code>oz</code>, <code>tonnes</code>, <code>short_tons</code>, <code>long_tons</code></td></tr>
                  <tr><td>Volume</td><td><code>cbm</code>, <code>cuft</code>, <code>cuin</code>, <code>litres</code>, <code>gal_us</code>, <code>gal_uk</code></td></tr>
                  <tr><td>Length</td><td><code>cm</code>, <code>inches</code>, <code>m</code>, <code>feet</code>, <code>mm</code></td></tr>
                  <tr><td>Freight</td><td><code>chargeable_kg</code> (target only, from=cbm), <code>freight_tonnes</code> (target only, from=cbm)</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Standard conversion:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/convert?value=100&from=kg&to=lbs"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "input": { "value": 100, "unit": "kg", "name": "Kilograms" },
  "result": { "value": 220.462442, "unit": "lbs", "name": "Pounds" },
  "formula": "Kilograms × 2.204624 = Pounds"
}`} style={{ marginBottom: 16 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>CBM to chargeable weight (IATA 6000 divisor):</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/convert?value=10&from=cbm&to=chargeable_kg"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "input": { "value": 10, "unit": "cbm", "name": "Cubic Metres" },
  "result": { "value": 1666.7, "unit": "chargeable_kg", "name": "Chargeable Weight (kg)" },
  "formula": "Cubic Metres \u00d7 166.67 = Chargeable Weight (kg)",
  "note": "IATA volumetric weight: 1 CBM = 166.67 kg (divisor 6000)..."
}`} style={{ marginBottom: 16 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>CBM to freight tonnes (W/M rule):</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/convert?value=5&from=cbm&to=freight_tonnes"'} />
          </div>
        </div>

        {/* HS Codes Endpoint */}
        <div id="hs" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/hs</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>HS Code Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Search and browse Harmonized System (HS 2022) commodity codes. Supports text search by product
              description, exact code lookup with ancestor chain, and section browsing. Covers all {SITE_STATS.hsCodeCount.toLocaleString()} codes
              across 21 sections and 97 chapters.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Query Modes</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Max results</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>q</code></td>
                    <td>string</td>
                    <td>Case-insensitive search on descriptions and codes. Min 2 characters.</td>
                    <td>50</td>
                  </tr>
                  <tr>
                    <td><code>code</code></td>
                    <td>string</td>
                    <td>Exact HS code lookup (2, 4, or 6 digit). Returns full details with ancestor chain and children.</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><code>section</code></td>
                    <td>string</td>
                    <td>Browse by section (Roman numeral, e.g. <code>II</code>). Returns all chapters in that section.</td>
                    <td>All</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Provide exactly one parameter per request. Omitting all parameters returns a 400 with usage hints.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Search by description:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/hs?q=coffee"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "query": "coffee",
  "results": [
    {
      "hscode": "0901",
      "description": "Coffee, whether or not roasted...",
      "level": 4,
      "section": "II",
      "parent": "09"
    }
  ],
  "count": 12
}`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Code lookup with ancestors:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/hs?code=090111"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "hscode": "090111",
  "description": "Coffee; not roasted, not decaffeinated",
  "level": 6,
  "section": "II",
  "parent": "0901",
  "ancestors": [
    { "hscode": "09", "description": "Coffee, tea, mate and spices", "level": 2 },
    { "hscode": "0901", "description": "Coffee, whether or not roasted...", "level": 4 }
  ],
  "children": [],
  "sectionName": "Vegetable products"
}`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Browse section:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/hs?section=II"'} />
          </div>
        </div>

        {/* Consignment Calculator Endpoint */}
        <div id="consignment" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>POST</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/consignment</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Multi-Item Consignment Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate total CBM, gross weight, LDM, and chargeable weight across multiple mixed items in a single
              consignment. Supports road, air, and sea modes with mode-specific chargeable weight calculations.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Request Body (JSON)</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>mode</code></td><td>string</td><td>No</td><td><code>road</code> (default), <code>air</code>, or <code>sea</code></td></tr>
                  <tr><td><code>items</code></td><td>array</td><td>Yes</td><td>1&ndash;50 item objects (see below)</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Item Object Fields</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>length</code></td><td>number</td><td>Yes</td><td>Length in cm</td></tr>
                  <tr><td><code>width</code></td><td>number</td><td>Yes</td><td>Width in cm</td></tr>
                  <tr><td><code>height</code></td><td>number</td><td>Yes</td><td>Height in cm</td></tr>
                  <tr><td><code>quantity</code></td><td>integer</td><td>No</td><td>Number of items (default: 1)</td></tr>
                  <tr><td><code>grossWeight</code></td><td>number</td><td>No</td><td>Gross weight per item in kg</td></tr>
                  <tr><td><code>stackable</code></td><td>boolean</td><td>No</td><td>Whether items can be stacked (default: false)</td></tr>
                  <tr><td><code>palletType</code></td><td>string</td><td>No</td><td><code>euro</code>, <code>uk</code>, <code>us</code>, <code>custom</code>, <code>none</code></td></tr>
                  <tr><td><code>description</code></td><td>string</td><td>No</td><td>Item description</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Request</h3>
            <CopyableCode code={`curl -X POST "https://www.freightutils.com/api/consignment" \\
  -H "Content-Type: application/json" \\
  -d '{ "mode": "air", "items": [
    { "length": 120, "width": 80, "height": 100, "quantity": 4, "grossWeight": 300 },
    { "length": 60, "width": 40, "height": 50, "quantity": 10, "grossWeight": 15 }
  ]}'`} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "mode": "air",
  "itemCount": 2,
  "totalPieces": 14,
  "totalGrossWeight": 1350,
  "totalCBM": 5.04,
  "chargeableWeight": 1350,
  "billingBasis": "weight",
  "volumetricWeight": 841.68,
  "items": [ ... ]
}`} />
          </div>
        </div>

        {/* UK Import Duty & VAT Endpoint */}
        <div id="duty" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>POST</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/duty</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>UK Import Duty &amp; VAT Estimator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Estimate UK import duty and VAT for a commodity code using live GOV.UK Trade Tariff data.
              Accepts customs value, origin country, freight/insurance costs, and INCOTERM for CIF adjustment.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Request Body (JSON)</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>commodityCode</code></td><td>string</td><td>Yes</td><td>HS/tariff code (min 6 digits)</td></tr>
                  <tr><td><code>originCountry</code></td><td>string</td><td>Yes</td><td>ISO 2-letter country code (e.g. <code>CN</code>, <code>DE</code>)</td></tr>
                  <tr><td><code>customsValue</code></td><td>number</td><td>Yes</td><td>Goods value in GBP</td></tr>
                  <tr><td><code>freightCost</code></td><td>number</td><td>No</td><td>Freight cost in GBP (added to CIF value)</td></tr>
                  <tr><td><code>insuranceCost</code></td><td>number</td><td>No</td><td>Insurance cost in GBP (added to CIF value)</td></tr>
                  <tr><td><code>incoterm</code></td><td>string</td><td>No</td><td>INCOTERM (e.g. <code>FOB</code>, <code>CIF</code>, <code>EXW</code>)</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Request</h3>
            <CopyableCode code={`curl -X POST "https://www.freightutils.com/api/duty" \\
  -H "Content-Type: application/json" \\
  -d '{ "commodityCode": "847989", "originCountry": "CN", "customsValue": 10000, "freightCost": 500, "insuranceCost": 50, "incoterm": "FOB" }'`} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "commodityCode": "847989",
  "originCountry": "CN",
  "cifValue": 10550,
  "dutyRate": "1.7%",
  "dutyAmount": 179.35,
  "vatRate": "20%",
  "vatAmount": 2145.87,
  "totalTaxes": 2325.22,
  "preferentialRate": false,
  "meta": {
    "source": "GOV.UK Trade Tariff API",
    "licence": "Open Government Licence v3"
  }
}`} />
          </div>
        </div>

        {/* UN/LOCODE Endpoint */}
        <div id="unlocode" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/unlocode</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>UN/LOCODE Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Search and look up UN/LOCODE transport locations &mdash; {SITE_STATS.unlocodeCount.toLocaleString()}+ seaports,
              airports, rail terminals, inland depots, and border crossings worldwide.
              Responses are cached for 24 hours.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Query Modes</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>code</code></td><td>string</td><td>Exact UN/LOCODE lookup (e.g. <code>GBLHR</code>, <code>NLRTM</code>)</td></tr>
                  <tr><td><code>q</code></td><td>string</td><td>Search by name (e.g. <code>rotterdam</code>, <code>heathrow</code>)</td></tr>
                  <tr><td><code>country</code></td><td>string</td><td>Filter by country code (e.g. <code>GB</code>, <code>NL</code>)</td></tr>
                  <tr><td><code>function</code></td><td>string</td><td>Filter by function: <code>port</code>, <code>airport</code>, <code>rail</code>, <code>road</code>, <code>icd</code>, <code>border</code></td></tr>
                  <tr><td><code>limit</code></td><td>integer</td><td>Max results (1&ndash;100, default: 20)</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Search by name:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/unlocode?q=rotterdam"'} style={{ marginBottom: 4 }} />
            <JsonBlock json={`{
  "query": "rotterdam",
  "count": 3,
  "results": [
    {
      "locode": "NLRTM",
      "name": "Rotterdam",
      "country": "NL",
      "subdivision": "ZH",
      "functions": ["port", "rail", "road"],
      "coordinates": { "lat": 51.92, "lon": 4.48 }
    }
  ],
  "meta": {
    "source": "UNECE UN/LOCODE 2024-2 (PDDL)",
    "total_entries": ${SITE_STATS.unlocodeCount}
  }
}`} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Exact code lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/unlocode?code=GBLHR"'} style={{ marginBottom: 20 }} />

            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Filter by country and function:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/unlocode?country=GB&function=port&limit=10"'} />
          </div>
        </div>

        {/* ULD Types Endpoint */}
        <div id="uld" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/uld</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Air Freight ULD Types</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Look up air freight Unit Load Device (ULD) specifications. 15 types including LD3 (AKE), PMC main deck pallet,
              temperature-controlled containers, and more. Returns dimensions, weights, volume, and aircraft compatibility.
            </p>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>type</code></td><td>string</td><td>ULD code or slug (e.g. <code>AKE</code>, <code>PMC</code>). Omit to list all.</td></tr>
                  <tr><td><code>category</code></td><td>string</td><td>Filter: <code>container</code>, <code>pallet</code>, or <code>special</code></td></tr>
                  <tr><td><code>deck</code></td><td>string</td><td>Filter by deck: <code>lower</code> or <code>main</code></td></tr>
                </tbody>
              </table>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Single ULD lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/uld?type=AKE"'} style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Filter by category:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/uld?category=pallet"'} style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>All ULD types:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/uld"'} />
          </div>
        </div>

        {/* Vehicle & Trailer Types Endpoint */}
        <div id="vehicles" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/vehicles</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 'auto' }}>Vehicle &amp; Trailer Types</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Look up road freight vehicle and trailer specifications. 17 types covering articulated trailers, rigid trucks,
              and vans. Returns internal dimensions, payload limits, pallet capacity, and features.
            </p>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Parameters</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 24 }}>
              <table className="ref-table">
                <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>slug</code></td><td>string</td><td>Vehicle slug (e.g. <code>standard-curtainsider</code>). Omit to list all.</td></tr>
                  <tr><td><code>category</code></td><td>string</td><td>Filter: <code>articulated</code>, <code>rigid</code>, or <code>van</code></td></tr>
                  <tr><td><code>region</code></td><td>string</td><td>Filter: <code>EU</code> or <code>US</code></td></tr>
                </tbody>
              </table>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Example Requests</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Single vehicle lookup:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/vehicles?slug=standard-curtainsider"'} style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Filter by category:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/vehicles?category=articulated"'} style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Filter by region:</p>
            <CopyableCode code={'curl "https://www.freightutils.com/api/vehicles?region=EU"'} />
          </div>
        </div>

        {/* Response codes */}
        <h2 style={s.sectionTitle}>HTTP Status Codes</h2>
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr><th>Code</th><th>Meaning</th></tr>
            </thead>
            <tbody>
              <tr><td className="highlight">200</td><td>Success — calculation result returned as JSON</td></tr>
              <tr><td>400</td><td>Bad Request — missing or invalid parameters. Check the error message in the response.</td></tr>
              <tr><td>404</td><td>Not Found — no results for the given query (airlines and ADR endpoints)</td></tr>
              <tr><td>405</td><td>Method Not Allowed — only GET (or POST for /api/adr-calculator, /api/adr/lq-check, /api/shipment/summary) is supported</td></tr>
              <tr><td>500</td><td>Internal Server Error — unexpected error, please report via GitHub</td></tr>
            </tbody>
          </table>
        </div>

        {/* Field naming */}
        <h2 style={s.sectionTitle}>Field Naming</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
          Most endpoints use <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>snake_case</code> field names.
          <strong> Note:</strong> The <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>/api/containers</code> endpoint
          uses <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>camelCase</code> field names
          (e.g. <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>internalLengthCm</code>,{' '}
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>maxGrossKg</code>).
        </p>

        {/* Rate limiting */}
        <h2 style={s.sectionTitle}>Rate Limiting</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
          The API is free to use. Anonymous rate limit: 25 requests per day per IP. Free API key: 100 requests per day. Pro: 50,000 requests per month.
        </p>

        {/* Error Responses */}
        <h2 style={s.sectionTitle}>Error Responses</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
          All endpoints return standard HTTP error codes with a descriptive JSON error message:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            { code: '400', label: 'Bad Request', desc: 'Missing or invalid parameters', example: '{"error": "Missing required parameter: l (length in cm)"}' },
            { code: '404', label: 'Not Found', desc: 'Resource does not exist', example: '{"error": "No ADR entry found for UN number 9999"}' },
            { code: '500', label: 'Server Error', desc: 'Unexpected error', example: '{"error": "Internal server error"}' },
          ].map(err => (
            <div key={err.code} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ background: err.code === '400' ? '#f59e0b' : err.code === '404' ? '#6b7280' : '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{err.code}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{err.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>— {err.desc}</span>
              </div>
              <div className="code-block" style={{ marginTop: 6, fontSize: 12 }}>{err.example}</div>
            </div>
          ))}
        </div>

        {/* Source & Issues */}
        <h2 style={s.sectionTitle}>Source Code &amp; Issue Reporting</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
          FreightUtils is open source. Report bugs, request features, or contribute on GitHub:{' '}
          <a href="https://github.com/SoapyRED/freighttools" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>
            github.com/SoapyRED/freighttools
          </a>.
          For data corrections or API support, email{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722', textDecoration: 'underline' }}>contact@freightutils.com</a>.
        </p>

      </main>
    </>
  );
}
