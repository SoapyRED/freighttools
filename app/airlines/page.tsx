import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import { getSlimIndex, AIRLINE_COUNT, CARGO_AIRLINE_COUNT } from '@/lib/calculations/airlines';
import AirlineSearch from './AirlineSearch';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=Airline+Codes+%26+AWB+Prefix+Lookup&desc=Search+6,350%2B+airlines+by+name,+code,+or+AWB+prefix&api=GET+/api/airlines';

export const metadata: Metadata = {
  title: 'Airline Codes & AWB Prefix Lookup',
  description: 'Free airline code lookup — search 6,350+ airlines by IATA, ICAO, or AWB prefix. 390+ cargo airlines included. No signup, free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/airlines' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Airline Codes & AWB Prefix Lookup — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AirlinesPage() {
  const index = getSlimIndex();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'Airline Codes & AWB Prefixes', path: '/airlines' }]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is an AWB prefix?","acceptedAnswer":{"@type":"Answer","text":"An AWB (Air Waybill) prefix is a 3-digit code identifying the issuing airline. For example, 176 = Emirates, 020 = Lufthansa. It appears as the first 3 digits of an 11-digit air waybill number."}},{"@type":"Question","name":"What is the difference between IATA and ICAO codes?","acceptedAnswer":{"@type":"Answer","text":"IATA codes are 2-letter designators used commercially (e.g., EK for Emirates). ICAO codes are 3-letter codes used by air traffic control (e.g., UAE for Emirates)."}},{"@type":"Question","name":"Do all airlines have AWB prefixes?","acceptedAnswer":{"@type":"Answer","text":"No. Only airlines with cargo operations have AWB prefixes. Many passenger-only regional carriers don't have them. FreightUtils identifies 390 airlines with verified cargo AWB prefixes."}}]}) }} />
      <PageHero title="Airline Codes &" titleAccent="AWB Prefixes" subtitle="Search airlines by name, IATA code, ICAO code, or AWB prefix" differentiators={['6,352 airlines', 'AWB prefix search', 'Free API']} category="ref" />

      <main data-category="ref" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Search */}
        <ErrorBoundary><AirlineSearch index={index} /></ErrorBoundary>

        <ApiCallout endpoint="/api/airlines" />

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Are Airline AWB Prefixes? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Are Airline AWB Prefixes?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            An Air Waybill (AWB) prefix is a three-digit code assigned by IATA to each airline that carries cargo. It forms the first three digits of every air waybill number and uniquely identifies the issuing carrier. For example, an AWB starting with 176 identifies an Emirates shipment, while 020 is Lufthansa Cargo.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            When a freight forwarder or shipper books air cargo, the AWB prefix is essential for tracking, documentation, and carrier identification. Knowing the prefix allows operations teams to quickly identify which airline is carrying a shipment from the AWB number alone.
          </p>

          {/* Section 2: Understanding Airline Codes */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Understanding Airline Codes
          </h2>
          <div className="ref-table-wrap" style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
            <table className="ref-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Code Type</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Format</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Example</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['IATA Code', '2 letters', 'EK', 'Ticketing, reservations, timetables'],
                  ['ICAO Code', '3 letters', 'UAE', 'Air traffic control, flight plans'],
                  ['AWB Prefix', '3 digits', '176', 'Air cargo waybill identification'],
                  ['Callsign', 'Variable', 'EMIRATES', 'Radio communication with ATC'],
                ].map(([type, format, example, purpose]) => (
                  <tr key={type} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{type}</td>
                    <td style={{ padding: '11px 16px' }}>{format}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 700 }}>{example}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Airlines are identified by several different code systems, each serving a distinct purpose. <strong>IATA codes</strong> are two-letter designators used commercially — they appear on tickets, booking systems, and timetables. <strong>ICAO codes</strong> are three-letter designators used in air traffic control, flight plans, and operational contexts. The <strong>AWB prefix</strong> is specific to cargo operations and forms the first three digits of every air waybill number. <strong>Callsigns</strong> are used in radio communication between pilots and air traffic controllers.
          </p>

          {/* Section 3: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>What is an AWB prefix?</summary>
              <div className="faq-answer">
                An Air Waybill prefix is a three-digit number assigned by IATA to airlines with cargo operations. It forms the first three digits of every AWB number (e.g., 176-12345678 is an Emirates shipment). The prefix uniquely identifies the issuing carrier and is essential for cargo tracking and documentation.
              </div>
            </details>
            <details className="faq-item">
              <summary>How do I find an airline&apos;s AWB prefix?</summary>
              <div className="faq-answer">
                Use the search above — enter the airline name, IATA code, or ICAO code and the AWB prefix will be shown if the airline has cargo operations. You can also search by prefix (e.g., enter &ldquo;176&rdquo; to find Emirates). Our API also supports programmatic lookups.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the difference between IATA and ICAO codes?</summary>
              <div className="faq-answer">
                IATA codes are two-letter codes used commercially (on tickets, timetables, and booking systems). ICAO codes are three-letter codes used by air traffic control and in flight plans. For example, Emirates is EK (IATA) and UAE (ICAO). Most freight operations use IATA codes, while ICAO codes appear in operational contexts.
              </div>
            </details>
            <details className="faq-item">
              <summary>Do all airlines have AWB prefixes?</summary>
              <div className="faq-answer">
                No. Only airlines with cargo operations have AWB prefixes assigned by IATA. Of the {AIRLINE_COUNT.toLocaleString()} airlines in our database, {CARGO_AIRLINE_COUNT} have AWB prefixes. Passenger-only carriers, regional operators, and defunct airlines typically do not have cargo prefixes.
              </div>
            </details>
            <details className="faq-item">
              <summary>Can I use this data via API?</summary>
              <div className="faq-answer">
                Yes. The FreightUtils airline API is free, requires no authentication, and returns JSON. Use <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>GET /api/airlines?q=emirates</code> to search by name, <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>?iata=EK</code> for IATA code, <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>?icao=UAE</code> for ICAO code, or <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>?prefix=176</code> for AWB prefix lookup. Full documentation at <Link href="/api-docs" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>/api-docs</Link>.
              </div>
            </details>
          </div>

        </div>

        {/* Common AWB Prefix Lookup */}
        <div style={{ marginTop: 48, marginBottom: 32 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>
            Common AWB Prefix Lookup
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
            Quick reference for the most frequently searched air waybill prefixes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { prefix: '176', airline: 'Emirates', iata: 'EK' },
              { prefix: '006', airline: 'Delta Air Lines', iata: 'DL' },
              { prefix: '074', airline: 'KLM Royal Dutch Airlines', iata: 'KL' },
              { prefix: '057', airline: 'Air France', iata: 'AF' },
              { prefix: '020', airline: 'Lufthansa', iata: 'LH' },
              { prefix: '125', airline: 'British Airways', iata: 'BA' },
              { prefix: '160', airline: 'Cathay Pacific', iata: 'CX' },
              { prefix: '235', airline: 'Turkish Airlines', iata: 'TK' },
              { prefix: '618', airline: 'Singapore Airlines', iata: 'SQ' },
              { prefix: '205', airline: 'Cargolux', iata: 'CV' },
            ].map(a => (
              <Link key={a.prefix} href={`/airlines?q=${a.prefix}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 14px', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }} className="pricing-card">
                <span style={{
                  background: 'var(--bg)', color: 'var(--page-cat, var(--cat-ref))', fontWeight: 700, fontSize: 14,
                  padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', flexShrink: 0,
                }}>
                  {a.prefix}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{a.airline}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>IATA: {a.iata}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <DataTimestamp text="Airline data last verified April 2026" />
        <ToolDisclaimer text="Airline data compiled from public IATA/ICAO sources. Verify current codes with your carrier or IATA." />
        <NewsletterCapture />
        <RelatedTools tools={[
          { href: '/chargeable-weight', label: 'Calculate chargeable weight for air freight' },
          { href: '/hs', label: 'Need HS codes for customs?' },
        ]} />

        {/* Ad unit (bottom) */}

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          Data compiled from public aviation sources. Airline codes and AWB prefixes may change — always verify with the carrier for critical shipments. Last updated April 2026.
        </p>

      </main>
    </>
  );
}
