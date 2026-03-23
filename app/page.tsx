import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FreightUtils — Free Freight Calculators & APIs | LDM, CBM, ADR Lookup',
  description:
    'Free freight calculators with open REST APIs. Loading metres, CBM, chargeable weight, pallet fitting, and ADR dangerous goods lookup. No signup required. Built for transport planners, developers, and AI agents.',
  alternates: { canonical: 'https://www.freightutils.com' },
};

const tools = [
  { href: '/ldm', label: '/api/ldm', title: 'Loading Metres', desc: 'Floor space for UK/EU road freight trailers', icon: '📐' },
  { href: '/cbm', label: '/api/cbm', title: 'CBM Calculator', desc: 'Cubic metres for sea and air shipments', icon: '📦' },
  { href: '/chargeable-weight', label: '/api/chargeable-weight', title: 'Chargeable Weight', desc: 'Air freight volumetric vs actual weight', icon: '✈️' },
  { href: '/pallet', label: '/api/pallet', title: 'Pallet Fitting', desc: 'Box fitting with visual layer diagram', icon: '🔲' },
  { href: '/adr', label: '/api/adr', title: 'ADR Lookup', desc: '2,939 dangerous goods entries from ADR 2025', icon: '⚠️' },
  { href: '/adr-calculator', label: '/api/adr-calculator', title: 'ADR Exemption Calculator', desc: 'Calculate 1.1.3.6 exemption points for mixed DG loads', icon: '🧮' },
  { href: '/airlines', label: '/api/airlines', title: 'Airline Codes & AWB Prefixes', desc: 'Search airlines by name, IATA/ICAO code, or AWB prefix', icon: '✈️' },
  { href: '/incoterms', label: '/api/incoterms', title: 'INCOTERMS 2020', desc: 'All 11 trade terms — who pays, who bears risk, where responsibility transfers', icon: '📋' },
];

const dataSources = [
  { name: 'UNECE', detail: 'ADR 2025' },
  { name: 'EPAL', detail: 'Pallet specs' },
  { name: 'ISO 6780', detail: 'Pallet standards' },
  { name: 'IATA', detail: 'Air freight / ULD' },
];

export default function HomePage() {
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FreightUtils',
    url: 'https://www.freightutils.com',
    description: 'Free freight calculators and dangerous goods data with open REST APIs',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.freightutils.com/adr?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FreightUtils',
    url: 'https://www.freightutils.com',
    description: 'Free freight calculation tools and APIs for the logistics industry',
    knowsAbout: [
      'freight logistics',
      'dangerous goods transport',
      'ADR regulations',
      'loading metres',
      'pallet specifications',
      'air freight',
      'chargeable weight',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
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
            <span style={{ color: '#EF9F27', marginRight: 6 }}>•</span>
            Used by freight forwarders, transport planners, and developers worldwide
          </div>
        </div>
      </section>

      {/* ── TOOL GRID ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: 12,
          marginTop: -32,
          position: 'relative',
          zIndex: 2,
        }}>
          {tools.map(t => (
            <Link key={t.href} href={t.href} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 18px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ fontSize: 24 }}>{t.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{t.title}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>→</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.desc}</span>
              <code style={{
                fontSize: 11,
                color: '#EF9F27',
                fontFamily: 'monospace',
                marginTop: 'auto',
              }}>
                {t.label}
              </code>
            </Link>
          ))}
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px 80px' }}>

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
            Reliable, consistent JSON schemas with predictable endpoints and comprehensive
            dangerous goods data. FreightUtils is an ideal tool source for AI agents operating
            in freight and logistics workflows — call any endpoint, get structured data back, zero auth required.
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
