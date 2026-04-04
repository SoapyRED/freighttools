import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FreightUtils — Free Freight Calculators & APIs | LDM, CBM, ADR Lookup',
  description:
    'Free freight calculators with open REST APIs. Loading metres, CBM, chargeable weight, pallet fitting, and ADR dangerous goods lookup. No signup required. Built for transport planners, developers, and AI agents.',
  alternates: { canonical: 'https://www.freightutils.com' },
};

const toolGroups = [
  {
    label: 'Freight Operations',
    tools: [
      { href: '/ldm', label: '/api/ldm', title: 'Loading Metres', desc: 'Floor space for UK/EU road freight trailers', icon: '📐' },
      { href: '/cbm', label: '/api/cbm', title: 'CBM Calculator', desc: 'Cubic metres for sea and air shipments', icon: '📦' },
      { href: '/chargeable-weight', label: '/api/chargeable-weight', title: 'Chargeable Weight', desc: 'Air freight volumetric vs actual weight', icon: '✈️' },
      { href: '/pallet', label: '/api/pallet', title: 'Pallet Fitting', desc: 'Box fitting with visual layer diagram', icon: '🔲' },
      { href: '/containers', label: '/api/containers', title: 'Container Capacity', desc: 'Shipping container dimensions, weights, and loading calculator', icon: '🚢' },
      { href: '/convert', label: '/api/convert', title: 'Unit Converter', desc: 'Convert freight weights, volumes, and dimensions between metric and imperial', icon: '🔄' },
      { href: '/consignment-calculator', label: '/api/consignment', title: 'Consignment Calculator', desc: 'Multi-item CBM, weight, LDM, and chargeable weight for mixed consignments', icon: '📦' },
    ],
  },
  {
    label: 'Dangerous Goods',
    tools: [
      { href: '/adr', label: '/api/adr', title: 'ADR Dangerous Goods', desc: '2,939 entries from UNECE ADR 2025 — lookup by UN number and 1.1.3.6 exemption calculator', icon: '⚠️' },
      { href: '/adr-calculator', label: '/api/adr-calculator', title: 'ADR Exemption Calculator', desc: '1.1.3.6 small load exemption check for mixed hazardous loads', icon: '🧮' },
    ],
  },
  {
    label: 'Customs & Trade',
    tools: [
      { href: '/hs', label: '/api/hs', title: 'HS Code Lookup', desc: 'Search and browse 6,940 Harmonized System commodity codes across 21 sections', icon: '🏷️' },
      { href: '/incoterms', label: '/api/incoterms', title: 'INCOTERMS 2020', desc: 'All 11 trade terms — who pays, who bears risk, where responsibility transfers', icon: '📋' },
    ],
  },
  {
    label: 'Reference Data',
    tools: [
      { href: '/airlines', label: '/api/airlines', title: 'Airline Codes & AWB Prefixes', desc: 'Search airlines by name, IATA/ICAO code, or AWB prefix', icon: '✈️' },
      { href: '/unlocode', label: '/api/unlocode', title: 'UN/LOCODE Lookup', desc: '116,000+ transport locations — seaports, airports, rail terminals, inland depots', icon: '🌍' },
    ],
  },
];
const tools = toolGroups.flatMap(g => g.tools);

const dataSources = [
  { name: 'UNECE', detail: 'ADR 2025' },
  { name: 'EPAL', detail: 'Pallet specs' },
  { name: 'ISO 6780', detail: 'Pallet standards' },
  { name: 'IATA', detail: 'Air freight / ULD' },
];

export default function HomePage() {
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'FreightUtils',
        url: 'https://www.freightutils.com',
        description: 'Free freight calculators and dangerous goods reference data with open REST APIs',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.freightutils.com/adr?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'FreightUtils',
        url: 'https://www.freightutils.com',
        email: 'contact@freightutils.com',
        sameAs: [
          'https://x.com/FreightUtils',
          'https://www.linkedin.com/company/freightutils',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@freightutils.com',
          contactType: 'customer support',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      {/* ── HERO ── */}
      <section style={{
        background: 'var(--navy)',
        padding: '56px 20px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--text-faint)',
            marginBottom: 16,
          }}>
            Freight Calculators
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            marginBottom: 16,
          }}>
            Free Freight Calculators{' '}
            <span style={{ color: '#EF9F27' }}>&amp; APIs</span>
          </h1>
          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            color: 'var(--text-faint)',
            maxWidth: 600,
            margin: '0 auto 20px',
            lineHeight: 1.6,
          }}>
            Free freight calculation tools and dangerous goods reference data. Open access — just use it. Every tool has a REST API.
          </p>
          <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>
            Built by a UK freight transport planner with hands-on ADR certification and operational experience at Heathrow air cargo facilities.
          </div>
          <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 14, letterSpacing: '0.2px' }}>
            13 tools &middot; 2,939 ADR entries &middot; 6,940 HS codes &middot; 6,352 airlines &middot; 116K+ locations &middot; OpenAPI 3.0.3 &middot; Updated April 2026
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM STRIP ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 24px', position: 'relative', zIndex: 3 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, flexWrap: 'wrap', padding: '14px 0',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-faint)' }}>
            Available on
          </span>
          {[
            { label: 'npm', href: 'https://www.npmjs.com/package/freightutils-mcp' },
            { label: 'MCP Registry', href: 'https://registry.modelcontextprotocol.io' },
            { label: 'Postman', href: 'https://www.postman.com/warped-moon-987147/freightutils' },
            { label: 'GitHub', href: 'https://github.com/SoapyRED/freightutils-mcp' },
          ].map(p => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ecosystem-badge"
              style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-faint)',
                textDecoration: 'none', padding: '6px 14px',
                border: '1px solid var(--border)', borderRadius: 6,
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {p.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── TOOL GRID (grouped by category) ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>
        {toolGroups.map((group) => (
          <div key={group.label} style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1.5px', color: 'var(--text-faint)',
              padding: '0 4px 6px',
            }}>
              {group.label}
            </div>
            <div className="tool-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
            }}>
              {group.tools.map(t => (
                <Link key={t.href} href={t.href} className="tool-card" style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '16px 14px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <div style={{ fontSize: 20 }}>{t.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.title}</span>
                    <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>&rarr;</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</span>
                  <code style={{
                    fontSize: 10,
                    color: '#EF9F27',
                    fontFamily: 'monospace',
                    marginTop: 'auto',
                  }}>
                    {t.label}
                  </code>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* ── FOR FREIGHT PROFESSIONALS ── */}
        <section style={{ marginTop: 64 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
          }}>
            For Freight Professionals
          </div>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 12,
          }}>
            Quick, accurate answers — no signup required
          </h2>
          <p style={{
            fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7,
            marginBottom: 20, maxWidth: 700,
          }}>
            Built for transport planners, freight forwarders, warehouse teams, and customs brokers
            who need answers fast. No login, no paywall — just open the tool and get your result.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: '/ldm', text: 'Calculate loading metres for your next trailer' },
              { href: '/adr', text: 'Look up ADR dangerous goods by UN number' },
              { href: '/hs', text: 'Check HS codes for customs declarations' },
              { href: '/airlines', text: 'Find airline codes and AWB prefixes' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                color: '#EF9F27', textDecoration: 'none', fontSize: 15,
                fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>&rarr;</span> {link.text}
              </Link>
            ))}
          </div>
        </section>

        {/* ── COMMON FREIGHT WORKFLOWS ── */}
        <section style={{ marginTop: 64 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
          }}>
            Common Freight Workflows
          </div>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 20,
          }}>
            See how the tools work together
          </h2>
          <div className="workflow-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {[
              {
                emoji: '\u2708\uFE0F', title: 'Air Freight Quote',
                chain: 'CBM \u2192 Chargeable Weight \u2192 Airlines',
                steps: ['Calculate shipment volume (CBM)', 'Get chargeable weight (volumetric vs actual)', 'Find carrier codes and AWB prefixes'],
                href: '/cbm',
              },
              {
                emoji: '\u26A0\uFE0F', title: 'DG Road Transport',
                chain: 'ADR Lookup \u2192 1.1.3.6 Calculator \u2192 Tunnel Codes',
                steps: ['Look up UN number and hazard class', 'Check if 1.1.3.6 exemption applies', 'Verify tunnel restriction codes for route'],
                href: '/adr',
              },
              {
                emoji: '\uD83C\uDFF7\uFE0F', title: 'Customs Preparation',
                chain: 'HS Code \u2192 INCOTERMS \u2192 Containers',
                steps: ['Find the correct HS commodity code', 'Confirm trade term responsibilities', 'Check container specs for your shipment'],
                href: '/hs',
              },
            ].map(w => (
              <div key={w.title} className="tool-card" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '20px 18px', display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{w.emoji}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>{w.title}</h3>
                <div style={{ fontSize: 12, color: '#EF9F27', fontWeight: 600, marginBottom: 14 }}>{w.chain}</div>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, flex: 1 }}>
                  {w.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <Link href={w.href} style={{
                  marginTop: 16, fontSize: 13, fontWeight: 600, color: '#EF9F27',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  Start &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOR DEVELOPERS ── */}
        <section style={{ marginTop: 64 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--text-faint)',
            marginBottom: 12,
          }}>
            For Developers
          </div>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.3px',
            marginBottom: 12,
          }}>
            Every tool has a REST API
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: 20,
            maxWidth: 700,
          }}>
            No authentication. JSON responses. CORS enabled for all origins.
            Build freight calculations into your TMS, WMS, or any system that needs them.
          </p>
          <div className="code-block" style={{ marginBottom: 12 }}>
            {`$ curl "https://www.freightutils.com/api/cbm?l=120&w=80&h=100"`}
          </div>
          <div className="code-block" style={{ marginBottom: 24 }}>
            {`{
  "total_cbm": 0.96,
  "cubic_feet": 33.9021,
  "litres": 960,
  "pieces": 1
}`}
          </div>
          <Link href="/api-docs" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#EF9F27',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
          }}>
            View full API documentation →
          </Link>
        </section>

        {/* ── FOR AI AGENTS ── */}
        <section style={{ marginTop: 56 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--text-faint)',
            marginBottom: 12,
          }}>
            For AI Agents
          </div>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.3px',
            marginBottom: 12,
          }}>
            Designed for programmatic access
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: 700,
          }}>
            Now available as an <strong>MCP server</strong> — the first and only freight MCP server for AI agents.
            Install via <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: 4, fontSize: 13, whiteSpace: 'nowrap' }}>npx freightutils-mcp</code> or
            connect via URL. Reliable JSON schemas, predictable endpoints, zero auth required.
          </p>
          <p style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/api-docs#mcp" style={{ color: '#e87722', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              MCP Server Setup &rarr;
            </Link>
            <Link href="/openapi.json" style={{ color: '#e87722', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              OpenAPI 3.0 Spec &rarr;
            </Link>
          </p>
        </section>

        {/* ── DATA SOURCES ── */}
        <section style={{ marginTop: 56 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--text-faint)',
            marginBottom: 16,
          }}>
            Data Sources
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 12,
          }}>
            {dataSources.map(d => (
              <div key={d.name} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{d.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{d.detail}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6 }}>
            All data audited against official publications. Pallet specifications verified against manufacturer standards.
          </p>
        </section>

      </main>
    </>
  );
}
