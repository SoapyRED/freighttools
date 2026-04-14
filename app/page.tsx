import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_STATS, SITE_COPY } from '@/lib/constants/siteStats';
import TerminalDemo from './components/TerminalDemo';
import FadeInSection from './components/FadeInSection';
import NewsletterCapture from './components/NewsletterCapture';

export const metadata: Metadata = {
  title: 'FreightUtils — Free Freight Calculators & APIs',
  description:
    'Free freight calculators and REST APIs — LDM, CBM, chargeable weight, ADR lookup, HS codes and more. No signup. Built for logistics and AI agents.',
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
      { href: '/adr', label: '/api/adr', title: 'ADR Dangerous Goods', desc: `${SITE_STATS.adrEntries.toLocaleString()} entries from ${SITE_STATS.adrEdition} — lookup by UN number, class, and hazard data`, icon: '⚠️' },
      { href: '/adr-calculator', label: '/api/adr-calculator', title: 'ADR Exemption Calculator', desc: '1.1.3.6 small load exemption check for mixed hazardous loads', icon: '🧮' },
      { href: '/adr/lq-eq-checker', label: '/api/adr/lq-check', title: 'LQ/EQ Checker', desc: 'Check Limited & Excepted Quantity eligibility for mixed DG consignments', icon: '📦' },
    ],
  },
  {
    label: 'Customs & Trade',
    tools: [
      { href: '/hs', label: '/api/hs', title: 'HS Code Lookup', desc: `Search and browse ${SITE_STATS.hsCodeCount.toLocaleString()} Harmonized System commodity codes across 21 sections`, icon: '🏷️' },
      { href: '/incoterms', label: '/api/incoterms', title: 'INCOTERMS 2020', desc: `All ${SITE_STATS.incotermsCount} trade terms — who pays, who bears risk, where responsibility transfers`, icon: '📋' },
      { href: '/duty', label: '/api/duty', title: 'UK Import Duty & VAT', desc: 'Estimate import duty and VAT using live GOV.UK Trade Tariff data', icon: '🇬🇧' },
    ],
  },
  {
    label: 'Reference Data',
    tools: [
      { href: '/airlines', label: '/api/airlines', title: 'Airline Codes & AWB Prefixes', desc: 'Search airlines by name, IATA/ICAO code, or AWB prefix', icon: '✈️' },
      { href: '/unlocode', label: '/api/unlocode', title: 'UN/LOCODE Lookup', desc: `${SITE_STATS.unlocodeCount.toLocaleString()}+ transport locations — seaports, airports, rail terminals, inland depots`, icon: '🌍' },
      { href: '/uld', label: '/api/uld', title: 'ULD Types (Air Cargo)', desc: 'Air freight unit load device specs — containers, pallets, and special units', icon: '📦' },
      { href: '/vehicles', label: '/api/vehicles', title: 'Vehicle & Trailer Types', desc: 'Road freight vehicle dimensions, payload limits, and pallet capacity', icon: '🚛' },
    ],
  },
];

const dataSources = [
  { name: 'UNECE', detail: 'ADR 2025' },
  { name: 'EPAL', detail: 'Pallet specs' },
  { name: 'ISO 6780', detail: 'Pallet standards' },
  { name: 'IATA', detail: 'Air freight / ULD' },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        background: 'var(--navy)',
        padding: '64px 20px 72px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--gradient-hero)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            color: 'var(--text-faint)',
            marginBottom: 20,
          }}>
            Freight Calculators &amp; APIs
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: 20,
            color: '#fff',
          }}>
            Free Freight Tools{' '}
            <span style={{
              background: 'linear-gradient(135deg, #EF9F27, #f9913a, #EF9F27)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              for Everyone
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            color: 'var(--text-faint)',
            maxWidth: 620,
            margin: '0 auto 28px',
            lineHeight: 1.65,
          }}>
            Calculators, reference data, and open REST APIs for freight professionals,
            developers, and AI agents. No signup required.
          </p>
          <div className="stats-pill" style={{ marginBottom: 32 }}>
            {SITE_COPY.statsLine}
          </div>

          {/* Two audience CTAs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            maxWidth: 640,
            margin: '0 auto 32px',
          }} className="hero-cta-grid">
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '20px 20px 16px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Freight Tools
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5, marginBottom: 14 }}>
                Free calculators for LDM, CBM, chargeable weight, ADR compliance, and more
              </div>
              <Link href="/ldm" style={{
                display: 'inline-block',
                background: 'var(--accent)',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}>
                Use Tools &rarr;
              </Link>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '20px 20px 16px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Developer API
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5, marginBottom: 14 }}>
                {SITE_STATS.apiEndpointCount} REST endpoints, MCP server, OpenAPI spec. No signup required.
              </div>
              <Link href="/api-docs" style={{
                display: 'inline-block',
                background: 'transparent',
                color: 'var(--accent)',
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                border: '2px solid var(--accent)',
              }}>
                View API Docs &rarr;
              </Link>
            </div>
          </div>

          {/* Terminal demo */}
          <div style={{ marginTop: 8 }}>
            <TerminalDemo />
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
        {toolGroups.map((group) => {
          const useWide = group.tools.length === 2;
          return (
            <div key={group.label} style={{ marginTop: 20 }}>
              <div className="category-label">
                {group.label}
              </div>
              <div className="tool-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
              }}>
                {group.tools.map(t => (
                  <Link key={t.href} href={t.href} className="tool-card" style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '18px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    gridColumn: useWide ? 'span 2' : undefined,
                  }}>
                    <div style={{ fontSize: 22 }}>{t.icon}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t.title}</span>
                      <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>&rarr;</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>{t.desc}</span>
                    <code className="api-badge" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
                      {t.label}
                    </code>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* ── Section divider ── */}
        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── FOR FREIGHT PROFESSIONALS ── */}
        <FadeInSection>
          <section>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
            }}>
              For Freight Professionals
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 14,
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
                  color: 'var(--accent)', textDecoration: 'none', fontSize: 15,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'opacity 0.15s',
                }}>
                  <span>&rarr;</span> {link.text}
                </Link>
              ))}
            </div>
          </section>
        </FadeInSection>

        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── COMMON FREIGHT WORKFLOWS ── */}
        <FadeInSection>
          <section>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
            }}>
              Common Freight Workflows
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 24,
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
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>{w.chain}</div>
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, flex: 1 }}>
                    {w.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                  <Link href={w.href} style={{
                    marginTop: 16, fontSize: 13, fontWeight: 600, color: 'var(--accent)',
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                    transition: 'opacity 0.15s',
                  }}>
                    Start &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── FOR DEVELOPERS ── */}
        <FadeInSection>
          <section>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
            }}>
              For Developers
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 14,
            }}>
              Every tool has a REST API
            </h2>
            <p style={{
              fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7,
              marginBottom: 24, maxWidth: 700,
            }}>
              No authentication. JSON responses. CORS enabled for all origins.
              Build freight calculations into your TMS, WMS, or any system that needs them.
            </p>
            <TerminalDemo />
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/api-docs" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', color: '#fff',
                textDecoration: 'none', padding: '12px 24px',
                borderRadius: 8, fontWeight: 700, fontSize: 14,
                transition: 'opacity 0.15s',
              }}>
                View full API documentation &rarr;
              </Link>
              <Link href="/openapi.json" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'transparent', color: 'var(--text-muted)',
                textDecoration: 'none', padding: '12px 24px',
                borderRadius: 8, fontWeight: 600, fontSize: 14,
                border: '1px solid var(--border)',
                transition: 'border-color 0.15s, color 0.15s',
              }}>
                OpenAPI 3.0 Spec
              </Link>
            </div>
          </section>
        </FadeInSection>

        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── FOR AI AGENTS ── */}
        <FadeInSection>
          <section>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 12,
            }}>
              For AI Agents
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 14,
            }}>
              Designed for programmatic access
            </h2>
            <p style={{
              fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7,
              maxWidth: 700,
            }}>
              Available as an <strong>MCP server</strong> — the first and only freight MCP server for AI agents.
              Install via <code style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 4, fontSize: 13, whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>npx freightutils-mcp</code> or
              connect via URL. Reliable JSON schemas, predictable endpoints, zero auth required.
            </p>
            <p style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/api-docs#mcp" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                MCP Server Setup &rarr;
              </Link>
              <Link href="/openapi.json" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                OpenAPI 3.0 Spec &rarr;
              </Link>
            </p>
          </section>
        </FadeInSection>

        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── DATA SOURCES ── */}
        <FadeInSection>
          <section>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '2px', color: 'var(--text-faint)', marginBottom: 16,
            }}>
              Data Sources
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12,
            }}>
              {dataSources.map(d => (
                <div key={d.name} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 18px',
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
        </FadeInSection>

        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── WHY FREIGHTUTILS ── */}
        <FadeInSection>
          <section>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>
              Why <span style={{ color: 'var(--accent)' }}>FreightUtils</span>?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 28, maxWidth: 600, lineHeight: 1.6 }}>
              What makes us different from other freight tools.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {[
                { title: 'Free & Open', text: `No signup, no paywall, no vendor lock-in. ${SITE_STATS.toolCount} tools and ${SITE_STATS.apiEndpointCount} API endpoints, all free. Pay only if you need 50,000+ requests/month.` },
                { title: 'Built by a Freight Planner', text: 'Created by an ADR-certified transport planner working at Heathrow. Every formula, every dataset, verified against real operations.' },
                { title: 'API-First & Agent-Ready', text: 'REST API with OpenAPI spec, Postman collection, and the only freight MCP server for AI agents. Integrate in minutes.' },
              ].map(card => (
                <div key={card.title} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '24px 20px',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{card.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{card.text}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        <hr className="section-divider" style={{ margin: '56px 0' }} />

        {/* ── NEWSLETTER ── */}
        <NewsletterCapture />

      </main>
    </>
  );
}
