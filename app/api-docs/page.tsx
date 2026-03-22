import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'FreightUtils public API reference — 7 free endpoints. Loading metres, CBM, ADR lookup, ADR 1.1.3.6 exemption calculator, chargeable weight, pallet fitting, and airline codes. No auth required.',
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
            Base URL: https://www.freightutils.com/api
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
              {`curl "https://www.freightutils.com/api/ldm?pallet=euro&qty=12&vehicle=artic"`}
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

        {/* CBM Endpoint */}
        <div id="cbm" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/cbm</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>Cubic Metres Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate the cubic metre (CBM) volume of a shipment. Returns total CBM plus equivalents
              in cubic feet, litres, and cubic inches.
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
                    <td><code>pcs</code></td>
                    <td>integer</td>
                    <td>No</td>
                    <td>Number of identical pieces</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Example Request</h3>
            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>5 boxes, 120×80×100 cm each:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://www.freightutils.com/api/cbm?l=120&w=80&h=100&pcs=5"`}
            </div>
            <div className="code-block">
              {`{
  "cbm_per_piece": 0.096,
  "total_cbm": 0.48,
  "total_volume_m3": 0.48,
  "cubic_feet": 16.951,
  "litres": 480,
  "cubic_inches": 29291.4,
  "pieces": 5,
  "meta": {
    "inputs": {
      "length_cm": 120,
      "width_cm": 80,
      "height_cm": 100,
      "pieces": 5
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
              {`curl "https://www.freightutils.com/api/adr?un=1203"`}
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
              {`curl "https://www.freightutils.com/api/adr?search=acetone"`}
            </div>
            <div className="code-block" style={{ marginBottom: 20 }}>
              {`{ "count": 3, "results": [ ... ] }`}
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Filter by hazard class:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://www.freightutils.com/api/adr?class=3"`}
            </div>
            <div className="code-block">
              {`{ "count": 50, "results": [ ... ] }`}
            </div>
          </div>
        </div>

        {/* ADR Exemption Calculator Endpoint */}
        <div id="adr-calculator" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace', marginLeft: -4 }}>POST</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/adr-calculator</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>ADR 1.1.3.6 Exemption Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate whether the ADR 1.1.3.6 small load exemption applies to a dangerous goods consignment.
              Supports single-substance GET queries and multi-substance POST requests. Checks both total points
              threshold (1,000) and per-substance quantity limits per ADR 1.1.3.6.3.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>GET — Single Substance</h3>
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

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Example — 200 litres of petrol:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://www.freightutils.com/api/adr-calculator?un=1203&qty=200"`}
            </div>
            <div className="code-block" style={{ marginBottom: 24 }}>
              {`{
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
}`}
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>POST — Multi-Substance Load</h3>
            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Request body:</p>
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
            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 24 }}>
              Response structure is identical to the GET endpoint, with multiple items in the array.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Response Fields</h3>
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

        {/* Airlines Endpoint */}
        <div id="airlines" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/airlines</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>Airline Codes &amp; AWB Prefix Lookup</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Search airlines by name, IATA code, ICAO code, AWB prefix, or country. The dataset contains
              6,300+ airlines including 390 cargo airlines with AWB prefixes.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Query Modes</h3>
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

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Example Requests</h3>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>AWB prefix lookup:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://www.freightutils.com/api/airlines?prefix=176"`}
            </div>
            <div className="code-block" style={{ marginBottom: 20 }}>
              {`{
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
      "verified": true
    }
  ]
}`}
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>IATA code lookup:</p>
            <div className="code-block" style={{ marginBottom: 20 }}>
              {`curl "https://www.freightutils.com/api/airlines?iata=EK"`}
            </div>

            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>Name search:</p>
            <div className="code-block" style={{ marginBottom: 24 }}>
              {`curl "https://www.freightutils.com/api/airlines?q=emirates"`}
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Response Fields</h3>
            <div className="ref-table-wrap" style={{ marginBottom: 16 }}>
              <table className="ref-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>airline_name</code></td><td>string</td><td>Official airline name</td></tr>
                  <tr><td><code>iata_code</code></td><td>string | null</td><td>2-character IATA designator</td></tr>
                  <tr><td><code>icao_code</code></td><td>string | null</td><td>3-character ICAO designator</td></tr>
                  <tr><td><code>awb_prefix</code></td><td>string[] | null</td><td>3-digit AWB prefix(es) — array, some airlines have multiple</td></tr>
                  <tr><td><code>callsign</code></td><td>string | null</td><td>Radio callsign for ATC communication</td></tr>
                  <tr><td><code>country</code></td><td>string | null</td><td>Country of registration</td></tr>
                  <tr><td><code>has_cargo</code></td><td>boolean</td><td>true if airline has AWB prefix(es)</td></tr>
                  <tr><td><code>verified</code></td><td>boolean</td><td>true if prefix confirmed from multiple independent sources</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chargeable Weight Endpoint */}
        <div id="chargeable-weight" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/chargeable-weight</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>Air Freight Chargeable Weight</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate air freight chargeable weight — whichever is higher between actual gross weight
              and volumetric (dimensional) weight. Supports custom volumetric factors for all carriers.
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

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Example Request</h3>
            <p style={{ color: '#5a6478', fontSize: 13, marginBottom: 6 }}>2 pieces, 120×80×100 cm, 500 kg total, IATA factor:</p>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://www.freightutils.com/api/chargeable-weight?l=120&w=80&h=100&gw=500&pcs=2&factor=6000"`}
            </div>
            <div className="code-block">
              {`{
  "chargeable_weight_kg": 640,
  "basis": "volumetric",
  "gross_weight_kg": 500,
  "volumetric_weight_kg": 640,
  "volumetric_weight_per_piece_kg": 320,
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
}`}
            </div>
          </div>
        </div>

        {/* Pallet Fitting Endpoint */}
        <div id="pallet" style={s.card}>
          <div style={s.endpointHeader}>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>GET</span>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>/api/pallet</span>
            <span style={{ color: '#8f9ab0', fontSize: 13, marginLeft: 'auto' }}>Pallet Box Fitting Calculator</span>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 20, lineHeight: 1.7 }}>
              Calculate how many boxes fit on a pallet using a layer-based algorithm. Returns boxes per
              layer, number of layers, total boxes, orientation used, and volume/weight analysis.
              Optional weight constraint caps the result at the pallet&apos;s maximum payload.
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

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Example Request</h3>
            <div className="code-block" style={{ marginBottom: 4 }}>
              {`curl "https://www.freightutils.com/api/pallet?pl=120&pw=80&pmh=220&bl=40&bw=30&bh=25&bwt=5&mpw=1500"`}
            </div>
            <div className="code-block">
              {`{
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
}`}
            </div>
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
              <tr><td>405</td><td>Method Not Allowed — only GET (or POST for /api/adr-calculator) is supported</td></tr>
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
