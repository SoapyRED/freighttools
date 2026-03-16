import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'FreightUtils public API reference. Calculate loading metres, ADR lookups, CBM and more programmatically.',
};

const s = {
  main: { maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' } as React.CSSProperties,
  hero: { background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' as const },
  h1: { fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: '#1a2332', marginBottom: 12, letterSpacing: '-0.3px', marginTop: 40 } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid #d8dce6', borderRadius: 12, overflow: 'hidden', marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  endpointHeader: { background: '#1a2332', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 } as React.CSSProperties,
};

export default function ApiDocsPage() {
  return (
    <>
      <div style={s.hero}>
        <h1 style={s.h1}>API <span style={{ color: '#e87722' }}>Documentation</span></h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 500, margin: '0 auto' }}>
          All FreightUtils calculators are available as free, open REST API endpoints
        </p>
      </div>

      <main style={s.main}>

        {/* Overview */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={s.sectionTitle}>Overview</h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
            The FreightUtils API is a free, stateless REST API. Every calculator on this site has a corresponding API endpoint.
            No authentication is required. Responses are JSON. CORS is enabled for all origins.
          </p>
          <div className="code-block">
            Base URL: https://freightutils.com/api
          </div>
        </div>

        {/* LDM Endpoint */}
        <div style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/ldm</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>Loading Metres Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate the loading metres (LDM) required for a consignment on a UK/EU road freight trailer.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Parameters</h3>
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
                    <td><code>artic</code>, <code>rigid10</code>, <code>rigid75</code>, <code>luton</code>, <code>custom</code></td>
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
            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 20 }}>* Either <code>pallet</code> (preset ID) <strong>or</strong> both <code>length</code> and <code>width</code> must be provided.</p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>12 Euro pallets on an artic:</p>
            <div className="code-block" style={{ marginBottom: 16 }}>
              GET /api/ldm?pallet=euro&qty=12&vehicle=artic
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Custom dimensions, stackable, with weight check:</p>
            <div className="code-block" style={{ marginBottom: 16 }}>
              GET /api/ldm?length=1200&width=1000&qty=5&stackable=true&stack=2&weight=300&vehicle=rigid10
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>cURL example:</p>
            <div className="code-block" style={{ marginBottom: 24 }}>
              {`curl "https://freightutils.com/api/ldm?pallet=euro&qty=12&vehicle=artic"`}
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Response</h3>
            <div className="code-block">
              {`{
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
}`}
            </div>
          </div>
        </div>

        {/* ADR Endpoint */}
        <div id="adr" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/adr</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>ADR 2025 Dangerous Goods Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Look up ADR 2025 dangerous goods by UN number, search by substance name, or filter by hazard class.
              The dataset contains 2,336 entries from the ADR 2025 Dangerous Goods List (Table A).
              Responses are cached for 1 hour (<code>s-maxage=3600</code>).
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Query Modes</h3>
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
                    <td>Case-insensitive partial match on the proper shipping name. Min 2 characters.</td>
                    <td>20</td>
                  </tr>
                  <tr>
                    <td><code>class</code></td>
                    <td>string</td>
                    <td>Filter by ADR hazard class (e.g. <code>3</code>, <code>6.1</code>, <code>1.1</code>).</td>
                    <td>50</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 24 }}>
              Provide exactly one parameter per request. Omitting all parameters returns a 400 with usage hints.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Exact UN number lookup:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://freightutils.com/api/adr?un=1203"`}
            </div>
            <div className="code-block" style={{ marginBottom: 20 }}>
              {`{
  "count": 1,
  "results": [
    {
      "un_number": "1203",
      "proper_shipping_name": "MOTOR SPIRIT or GASOLINE or PETROL",
      "class": "3",
      "classification_code": "F1",
      "packing_group": "II",
      "labels": ["3"],
      "special_provisions": ["243", "534", "664"],
      "limited_quantity": "1 L",
      "excepted_quantity": "E2",
      "transport_category": 2,
      "tunnel_restriction_code": "D/E",
      "transport_prohibited": false,
      "hazard_identification_number": "33"
    }
  ]
}`}
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Search by substance name:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://freightutils.com/api/adr?search=acetone"`}
            </div>
            <div className="code-block" style={{ marginBottom: 20 }}>
              {`{ "count": 3, "results": [ ... ] }`}
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Filter by hazard class:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://freightutils.com/api/adr?class=3"`}
            </div>
            <div className="code-block">
              {`{ "count": 50, "results": [ ... ] }`}
            </div>
          </div>
        </div>

        {/* Coming soon endpoints */}
        <h2 style={s.sectionTitle}>Coming Soon</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { method: 'GET', path: '/api/cbm', desc: 'Cubic Metres Calculator — volume and chargeable weight for air/sea freight' },
            { method: 'GET', path: '/api/pallet', desc: 'Pallet Truck Fitting Calculator — calculate how many pallets fit per truck configuration' },
            { method: 'GET', path: '/api/chargeable-weight', desc: 'Chargeable Weight Calculator — actual vs volumetric weight for air freight' },
          ].map(ep => (
            <div key={ep.path} style={{ background: '#fff', border: '1px solid #d8dce6', borderRadius: 8, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
              <span style={{ background: '#d8dce6', color: '#5a6478', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace', flexShrink: 0 }}>{ep.method}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#1a2332', flexShrink: 0 }}>{ep.path}</span>
              <span style={{ fontSize: 13, color: '#5a6478' }}>{ep.desc}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, background: '#eef0f4', color: '#5a6478', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>Coming soon</span>
            </div>
          ))}
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
              <tr><td>400</td><td>Bad Request — missing or invalid parameters. Check the <code>details</code> array in the response.</td></tr>
              <tr><td>405</td><td>Method Not Allowed — only GET requests are supported</td></tr>
              <tr><td>500</td><td>Internal Server Error — unexpected error, please report via GitHub</td></tr>
            </tbody>
          </table>
        </div>

        {/* Rate limiting */}
        <h2 style={s.sectionTitle}>Rate Limiting</h2>
        <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
          The API is currently free and unmetered. As a courtesy, please keep requests under 1,000/hour per IP. Rate limit headers are included in every response:
        </p>
        <div className="code-block">
          X-RateLimit-Limit: 1000<br/>
          X-RateLimit-Window: 3600
        </div>

      </main>
    </>
  );
}
