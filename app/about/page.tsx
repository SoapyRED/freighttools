import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_STATS, SITE_COPY } from '@/lib/constants/siteStats';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=About+FreightUtils&desc=Free+freight+calculators+and+open+APIs+for+the+logistics+industry';

export const metadata: Metadata = {
  title: 'About — Free Freight Tools & API Platform',
  description:
    `${SITE_STATS.toolCount} free freight calculators and open REST APIs for logistics professionals, developers, and AI agents. LDM, CBM, ADR, HS codes and more.`,
  alternates: { canonical: 'https://www.freightutils.com/about' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'About FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 48 }}>
      {label && (
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
        }}>
          {label}
        </div>
      )}
      <h2 style={{
        fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800,
        color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 14,
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'var(--bg-hero)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 20px 56px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 40px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
          marginBottom: 14,
        }}>
          About <span style={{ color: 'var(--accent)' }}>FreightUtils</span>
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-faint)',
          maxWidth: 620, margin: '0 auto', lineHeight: 1.6,
        }}>
          FreightUtils is a free utility toolkit and API platform for the freight and logistics
          industry. Built and maintained by{' '}
          <a href="https://www.linkedin.com/in/marius-cristoiu-a853812a2/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Marius Cristoiu
          </a>, a UK freight transport planner with hands-on
          ADR certification and operational experience at Heathrow air cargo facilities. Every
          dataset is sourced from official standards and verified against real-world freight operations.
        </p>
        <p style={{
          fontSize: 14, color: 'var(--text-faint)',
          maxWidth: 620, margin: '12px auto 0', lineHeight: 1.6,
        }}>
          Questions, corrections, or integration help:{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            contact@freightutils.com
          </a>
          {' '}&mdash; typical response within 2 business days.
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>

        <Section title="What We Offer">
          <p style={{ marginBottom: 14 }}>
            We provide free, accurate, no-signup freight calculators — each backed by a documented
            REST API. Whether you&apos;re a transport planner checking loading metres at 3AM, a developer
            building freight software, or an AI agent that needs reliable dangerous goods data,
            FreightUtils gives you the answer instantly.
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20,
          }}>
            {[
              { name: 'Loading Metres', href: '/ldm' },
              { name: 'CBM Calculator', href: '/cbm' },
              { name: 'Chargeable Weight', href: '/chargeable-weight' },
              { name: 'Pallet Fitting', href: '/pallet' },
              { name: 'Container Capacity', href: '/containers' },
              { name: 'Unit Converter', href: '/convert' },
              { name: 'Consignment Calculator', href: '/consignment-calculator' },
              { name: 'ADR Dangerous Goods', href: '/adr' },
              { name: 'ADR Exemption Calculator', href: '/adr-calculator' },
              { name: 'LQ/EQ Checker', href: '/adr/lq-eq-checker' },
              { name: 'HS Code Lookup', href: '/hs' },
              { name: 'INCOTERMS 2020', href: '/incoterms' },
              { name: 'UK Import Duty & VAT', href: '/duty' },
              { name: 'Airline Codes', href: '/airlines' },
              { name: 'UN/LOCODE Lookup', href: '/unlocode' },
              { name: 'ULD Types', href: '/uld' },
              { name: 'Vehicle & Trailer Types', href: '/vehicles' },
            ].map(t => (
              <Link key={t.href} href={t.href} className="about-tool-btn" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px', textDecoration: 'none',
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
              }}>
                {t.name} →
              </Link>
            ))}
          </div>
        </Section>

        <Section label="Approach" title="Why Open?">
          <p style={{ marginBottom: 14 }}>
            Every tool has a free REST API with generous rate limits &mdash; no signup needed for quick lookups.
            Free API keys available for regular use, with Pro tiers for production integrations.
            No vendor lock-in. Use the website, call the API, or build it into your own systems.
          </p>
          <p style={{ marginBottom: 14 }}>
            The data comes from official international standards &mdash; UNECE, WCO, ICC, IATA.
            We make it accessible, structured, and ready to use. Whether you&apos;re a transport
            planner checking a load at 3am or a developer wiring freight calculations into a TMS,
            the answer is the same: just use it.
          </p>
          <p>
            FreightUtils is available as a <strong>Model Context Protocol (MCP) server</strong> &mdash; the
            first freight-specific tool server for AI agents, listed on the{' '}
            <a href="https://registry.modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Official MCP Registry</a>.
            All tools including the composite Shipment Summary, sea freight W/M, and mode selectors are accessible
            via <code style={{ background: 'var(--bg-code)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>npx freightutils-mcp</code> or{' '}
            <a href="/api-docs#mcp" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>the remote endpoint</a>.
          </p>
        </Section>

        <Section label="Quality" title="Data Integrity">
          <p style={{ marginBottom: 14 }}>
            Every number on this site is audited against authoritative sources: UNECE for ADR
            dangerous goods classifications, EPAL for European pallet specifications, ISO 6780
            for international pallet standards, and IATA for air freight and ULD specifications.
            When we find an error, we fix it and document the correction.
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10,
          }}>
            {[
              { name: 'UNECE', detail: 'ADR 2025' },
              { name: 'EPAL', detail: 'Pallet specs' },
              { name: 'ISO 6780', detail: 'Pallet standards' },
              { name: 'IATA', detail: 'Air freight / ULD' },
              { name: 'WCO', detail: 'HS 2022' },
            ].map(d => (
              <div key={d.name} className="about-tool-btn" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{d.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 6 }}>{d.detail}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Value" title="Why FreightUtils">
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              'Every dataset sourced from official publications (UNECE, WCO, ICC, IATA)',
              'Built for freight workflows, not generic unit conversion',
              'Open REST APIs — no auth, no paywall, no vendor lock-in',
              'Data verified and dated — you always know what edition you\'re using',
            ].map((point, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '14px 16px',
              }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(232,119,34,0.12)', marginTop: 1,
                }}>
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{point}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Methodology" title="Data Sources &amp; Methodology">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { name: 'ADR 2025', badge: 'UNECE', entries: `${SITE_STATS.adrEntries.toLocaleString()} entries`, desc: 'Licensed from Labeline.com (ECE/TRANS/352). Next edition: ADR 2027.', href: '/adr', color: 'var(--cat-dg)', tint: 'var(--cat-dg-tint)' },
              { name: 'HS Codes', badge: 'WCO', entries: `${SITE_STATS.hsCodeCount.toLocaleString()} codes`, desc: 'UN Comtrade HS 2022 (PDDL). 21 sections, 97 chapters.', href: '/hs', color: 'var(--cat-customs)', tint: 'var(--cat-customs-tint)' },
              { name: 'Airlines', badge: 'IATA/ICAO', entries: `${SITE_STATS.airlineCount.toLocaleString()} airlines`, desc: 'Public sources, cross-referenced. 390 verified cargo AWB prefixes.', href: '/airlines', color: 'var(--cat-ref)', tint: 'var(--cat-ref-tint)' },
              { name: 'INCOTERMS', badge: 'ICC', entries: `${SITE_STATS.incotermsCount} terms`, desc: 'ICC INCOTERMS 2020 rules with full responsibility breakdowns.', href: '/incoterms', color: 'var(--cat-customs)', tint: 'var(--cat-customs-tint)' },
              { name: 'UN/LOCODE', badge: 'UNECE', entries: `${SITE_STATS.unlocodeCount.toLocaleString()} locations`, desc: 'Ports, airports, rail terminals, inland depots. UNECE 2024-2 (PDDL).', href: '/unlocode', color: 'var(--cat-ref)', tint: 'var(--cat-ref-tint)' },
              { name: 'UK Duty Rates', badge: 'GOV.UK', entries: 'Live API', desc: 'GOV.UK Trade Tariff API. Open Government Licence v3.', href: '/duty', color: 'var(--cat-customs)', tint: 'var(--cat-customs-tint)' },
              { name: 'Containers', badge: 'ISO', entries: '10 types', desc: 'ISO 668 + ISO 1496 standard dimensions and capacities.', href: '/containers', color: 'var(--cat-ops)', tint: 'var(--cat-ops-tint)' },
              { name: 'Pallets', badge: 'EPAL/ISO', entries: '6 types', desc: 'EPAL EUR pallets, ISO 6780 international, IATA ULD specs.', href: '/pallet', color: 'var(--cat-ops)', tint: 'var(--cat-ops-tint)' },
            ].map(s => (
              <Link key={s.name} href={s.href} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${s.color}`,
                borderRadius: 10, padding: '16px 18px', textDecoration: 'none',
                display: 'block', transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{s.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: s.color,
                    background: s.tint, padding: '2px 8px', borderRadius: 10,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{s.badge}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{s.entries}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section label="Developers" title="For Developers">
          <p style={{ marginBottom: 14 }}>
            {SITE_STATS.toolCount} tools across {SITE_STATS.apiEndpointCount} REST API endpoints. No signup required for casual use &mdash; 25 requests/day with no API key. Register a free key for 100 requests/day, or contact us for Pro access (50,000 requests/month). Includes a composite Shipment Summary endpoint that chains CBM, chargeable weight, ADR compliance, and UK duty estimation into one call.
            JSON responses. Full documentation at{' '}
            <Link href="/api-docs" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>/api-docs</Link>.
            Build freight calculations into your TMS, WMS, booking platform, or any system
            that needs them.
          </p>
          <div className="code-block" style={{ fontSize: 12, lineHeight: 1.8 }}>
            <span style={{ color: 'var(--text-faint)' }}># Composite endpoint — chains multiple tools in one call</span><br />
            POST /api/shipment/summary<br />
            <span style={{ color: 'var(--text-faint)' }}>&nbsp;&nbsp;{`{ "mode": "road", "items": [...] }`}</span><br />
            <br />
            <span style={{ color: 'var(--text-faint)' }}># Freight calculators</span><br />
            GET /api/ldm?pallet=euro&amp;qty=10<br />
            GET /api/cbm?l=120&amp;w=80&amp;h=100<br />
            GET /api/chargeable-weight?l=120&amp;w=80&amp;h=100&amp;gw=500<br />
            GET /api/pallet?pl=120&amp;pw=80&amp;pmh=220&amp;bl=40&amp;bw=30&amp;bh=25<br />
            GET /api/containers?type=40ft-high-cube<br />
            GET /api/convert?value=100&amp;from=kg&amp;to=lbs<br />
            POST /api/consignment<br />
            <span style={{ color: 'var(--text-faint)' }}>&nbsp;&nbsp;{`{ "mode": "air", "items": [...] }`}</span><br />
            <br />
            <span style={{ color: 'var(--text-faint)' }}># Reference data &amp; compliance</span><br />
            GET /api/adr?un=1203<br />
            GET /api/adr-calculator?un=1203&amp;qty=200<br />
            POST /api/adr/lq-check<br />
            <span style={{ color: 'var(--text-faint)' }}>&nbsp;&nbsp;{`{ "mode": "lq", "items": [{ "un_number": "1203", "quantity": 0.5, "unit": "L" }] }`}</span><br />
            GET /api/hs?q=coffee<br />
            GET /api/incoterms?code=FOB<br />
            POST /api/duty<br />
            <span style={{ color: 'var(--text-faint)' }}>&nbsp;&nbsp;{`{ "commodityCode": "847989", "originCountry": "CN", "customsValue": 10000 }`}</span><br />
            GET /api/airlines?prefix=176<br />
            GET /api/unlocode?q=rotterdam<br />
            GET /api/uld?type=AKE<br />
            GET /api/vehicles?category=van
          </div>
        </Section>

        <Section label="AI Integration" title="For AI Agents">
          <p>
            FreightUtils APIs are designed to be consumed programmatically. Consistent JSON
            schemas, predictable endpoints, and comprehensive dangerous goods data make
            FreightUtils ideal as a tool source for AI agents operating in freight and logistics
            workflows.
          </p>
        </Section>

        {/* Disclaimer */}
        <section style={{
          marginTop: 56,
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--cat-dg)',
          borderRadius: 10,
          padding: '24px 28px',
          background: 'var(--cat-dg-tint)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--cat-dg)' }}>&#9888;</span> Important Disclaimer
          </h2>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 12 }}>
              FreightUtils is a reference and calculation tool only. It does not replace professional
              classification by a certified Dangerous Goods Safety Adviser (DGSA), licensed customs
              broker, or qualified compliance officer.
            </p>
            <p style={{ marginBottom: 12 }}>
              ADR data is provided for reference purposes. The shipper and carrier assume all legal
              responsibility for dangerous goods classification, documentation, and transport compliance.
            </p>
            <p style={{ marginBottom: 12 }}>
              HS code data is for reference only. For official customs classification, consult your
              national customs authority or a licensed broker.
            </p>
            <p style={{ margin: 0 }}>
              All calculations should be independently verified before use in commercial operations.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section style={{
          marginTop: 56,
          background: 'var(--navy)',
          borderRadius: 12,
          padding: '28px 28px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-on-dark)', marginBottom: 10 }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-faint)', lineHeight: 1.6 }}>
            Questions, corrections, or integration help:{' '}
            <a
              href="mailto:contact@freightutils.com"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              contact@freightutils.com
            </a>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
            <a href="https://x.com/FreightUtils" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              @FreightUtils on X
            </a>
            <a href="https://www.linkedin.com/company/freightutils" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              LinkedIn
            </a>
          </div>
        </section>

        <NewsletterCapture />

      </main>
    </>
  );
}
