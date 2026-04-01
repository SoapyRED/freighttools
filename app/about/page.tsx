import type { Metadata } from 'next';
import Link from 'next/link';

const ogUrl = '/api/og?title=About+FreightUtils&desc=Free+freight+calculators+and+open+APIs+for+the+logistics+industry';

export const metadata: Metadata = {
  title: 'About FreightUtils — Free Freight Tools & API Platform',
  description:
    'FreightUtils provides 10 free freight calculators and open APIs for transport planners, freight forwarders, developers, and AI agents. LDM, CBM, chargeable weight, pallet fitting, ADR dangerous goods, airline codes, INCOTERMS reference, container capacity, unit converter, and HS code lookup.',
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
        background: 'var(--navy)',
        padding: '48px 20px 56px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 40px)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.5px',
          marginBottom: 14,
        }}>
          About <span style={{ color: '#EF9F27' }}>FreightUtils</span>
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-faint)',
          maxWidth: 620, margin: '0 auto', lineHeight: 1.6,
        }}>
          FreightUtils is a free utility toolkit and API platform for the freight and logistics
          industry. Built and maintained by Marius C, a UK freight transport planner with hands-on
          ADR certification and operational experience at Heathrow air cargo facilities. Every
          dataset is sourced from official standards and verified against real-world freight operations.
        </p>
        <p style={{
          fontSize: 14, color: 'var(--text-faint)',
          maxWidth: 620, margin: '12px auto 0', lineHeight: 1.6,
        }}>
          Questions, corrections, or integration help:{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#EF9F27', textDecoration: 'underline' }}>
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
              { name: 'ADR Dangerous Goods', href: '/adr' },
              { name: 'Airline Codes', href: '/airlines' },
              { name: 'INCOTERMS 2020', href: '/incoterms' },
              { name: 'Container Capacity', href: '/containers' },
              { name: 'Unit Converter', href: '/convert' },
              { name: 'HS Code Lookup', href: '/hs' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
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
            Every tool has a free REST API. No authentication, no paywall, no vendor lock-in.
            Use the website, call the API, or build it into your own systems.
          </p>
          <p>
            The data comes from official international standards &mdash; UNECE, WCO, ICC, IATA.
            We make it accessible, structured, and ready to use. Whether you&apos;re a transport
            planner checking a load at 3am or a developer wiring freight calculations into a TMS,
            the answer is the same: just use it.
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
              <div key={d.name} style={{
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
                    <path d="M1 5l3.5 3.5L11 1" stroke="#e87722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              { name: 'ADR 2025', badge: 'UNECE', entries: '2,939 entries', desc: 'Licensed from Labeline.com (ECE/TRANS/352). Next edition: ADR 2027.' },
              { name: 'HS Codes', badge: 'WCO', entries: '6,940 codes', desc: 'UN Comtrade HS 2022 (PDDL). 21 sections, 97 chapters.' },
              { name: 'Airlines', badge: 'IATA/ICAO', entries: '6,352 airlines', desc: 'Public sources, cross-referenced. 390 verified cargo AWB prefixes.' },
              { name: 'INCOTERMS', badge: 'ICC', entries: '11 terms', desc: 'ICC INCOTERMS 2020 rules with full responsibility breakdowns.' },
              { name: 'Containers', badge: 'ISO', entries: '10 types', desc: 'ISO 668 + ISO 1496 standard dimensions and capacities.' },
              { name: 'Pallets', badge: 'EPAL/ISO', entries: '6 types', desc: 'EPAL EUR pallets, ISO 6780 international, IATA ULD specs.' },
            ].map(s => (
              <div key={s.name} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{s.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#e87722',
                    background: 'rgba(232,119,34,0.1)', padding: '2px 8px', borderRadius: 10,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{s.badge}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{s.entries}</div>
                <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Developers" title="For Developers">
          <p style={{ marginBottom: 14 }}>
            Every tool has a corresponding REST API endpoint. No authentication required.
            JSON responses. Full documentation at{' '}
            <Link href="/api-docs" style={{ color: '#EF9F27', textDecoration: 'underline' }}>/api-docs</Link>.
            Build freight calculations into your TMS, WMS, booking platform, or any system
            that needs them.
          </p>
          <div className="code-block">
            GET /api/ldm?pallet=euro&amp;qty=10<br />
            GET /api/cbm?l=120&amp;w=80&amp;h=100<br />
            GET /api/chargeable-weight?l=120&amp;w=80&amp;h=100&amp;gw=500<br />
            GET /api/pallet?pl=120&amp;pw=80&amp;pmh=220&amp;bl=40&amp;bw=30&amp;bh=25<br />
            GET /api/adr?un=1203<br />
            GET /api/airlines?prefix=176<br />
            GET /api/incoterms?code=FOB<br />
            GET /api/containers?type=40ft-high-cube<br />
            GET /api/convert?value=100&amp;from=kg&amp;to=lbs<br />
            GET /api/hs?q=coffee
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
          borderLeft: '4px solid #f59e0b',
          borderRadius: 10,
          padding: '24px 28px',
          background: 'var(--bg-card)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>&#9888;</span> Important Disclaimer
          </h2>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-faint)', lineHeight: 1.6 }}>
            Questions, corrections, or integration help:{' '}
            <a
              href="mailto:contact@freightutils.com"
              style={{ color: '#EF9F27', textDecoration: 'underline' }}
            >
              contact@freightutils.com
            </a>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
            <a href="https://x.com/FreightUtils" target="_blank" rel="noopener noreferrer" style={{ color: '#EF9F27', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              @FreightUtils on X
            </a>
            <a href="https://www.linkedin.com/company/freightutils" target="_blank" rel="noopener noreferrer" style={{ color: '#EF9F27', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              LinkedIn
            </a>
          </div>
        </section>

      </main>
    </>
  );
}
