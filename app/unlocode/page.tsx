import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import UnlocodeSearch from './UnlocodeSearch';
import RelatedTools from '@/app/components/RelatedTools';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';
import { SITE_STATS } from '@/lib/constants/siteStats';

const ogUrl = '/api/og?title=UN/LOCODE+Lookup&desc=116,000+transport+locations+worldwide&api=GET+/api/unlocode';

export const metadata: Metadata = {
  title: 'UN/LOCODE Lookup',
  description: `Search ${SITE_STATS.unlocodeCount.toLocaleString()}+ UN/LOCODE transport locations worldwide. Ports, airports, rail terminals, and inland depots. Free lookup with REST API.`,
  alternates: { canonical: 'https://www.freightutils.com/unlocode' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'UN/LOCODE Lookup — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function UnlocodePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'UN/LOCODE Lookup', path: '/unlocode' }]) }} />
      <PageHero title="UN/LOCODE" titleAccent="Lookup" subtitle="Search transport locations worldwide — seaports, airports, rail terminals, and inland depots" differentiators={['116,129 locations', '6 facility types', 'Free API']} category="ref">
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
          Source: UNECE UN/LOCODE 2024-2 (PDDL)
        </div>
      </PageHero>

      <div data-category="ref" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
        <ErrorBoundary><UnlocodeSearch /></ErrorBoundary>

        <div style={{ maxWidth: 700, margin: '48px auto 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            What is UN/LOCODE?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            UN/LOCODE (United Nations Code for Trade and Transport Locations) is a standardised code system for identifying ports, airports, rail terminals, and other transport-related locations worldwide. Each code consists of a 2-letter country code and a 3-character location code (e.g., GBLHR = London Heathrow, NLRTM = Rotterdam).
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            The codes are maintained by UNECE and used in international trade documents, customs declarations, bills of lading, and freight management systems. This database contains {SITE_STATS.unlocodeCount.toLocaleString()} locations across all countries.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 24, marginBottom: 8 }}>Function types</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
            {[
              ['Port', 'Maritime port or harbour'],
              ['Airport', 'Civil or cargo airport'],
              ['Rail', 'Railway terminal or station'],
              ['Road', 'Road freight terminal'],
              ['ICD', 'Inland clearance depot (dry port)'],
              ['Border', 'Border crossing point'],
              ['Postal', 'Postal exchange office'],
              ['Pipeline', 'Fixed transport installation'],
            ].map(([label, desc]) => (
              <div key={label} style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 6 }}>
                <strong>{label}</strong> — {desc}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            How UN/LOCODE codes are structured
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            Each UN/LOCODE is exactly 5 characters: a 2-letter ISO 3166 country code followed by a 3-character location code. For example, <strong>GB</strong>LHR identifies London Heathrow in the United Kingdom, <strong>NL</strong>RTM identifies Rotterdam in the Netherlands, and <strong>CN</strong>SHA identifies Shanghai in China. The location code is typically derived from the location name but is not always intuitive &mdash; some codes are assigned sequentially when the name-based abbreviation is already taken.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Common use cases in freight
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            UN/LOCODE codes appear throughout international trade documentation. They are used on bills of lading (port of loading, port of discharge), air waybills (airport of departure, airport of destination), customs declarations, booking requests, and shipping instructions. Transport management systems (TMS) and enterprise resource planning (ERP) systems use UN/LOCODE as the standard identifier for locations, enabling automated routing, rate calculation, and compliance checks. If you&apos;re building freight software, UN/LOCODE is the de facto standard for identifying transport locations programmatically.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Data coverage and updates
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            UNECE publishes updated UN/LOCODE editions twice per year (typically in spring and autumn). This database contains {SITE_STATS.unlocodeCount.toLocaleString()} entries from the 2024-2 edition, covering every country in the world. Not all entries have coordinates &mdash; approximately 80% include latitude/longitude data. New locations are added continuously as countries submit updates to UNECE, and existing entries are corrected when errors are identified.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Relationship with other code systems
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            UN/LOCODE is complementary to other transport code systems. IATA airport codes (3-letter, e.g., LHR) and ICAO codes (4-letter, e.g., EGLL) identify airports specifically for the aviation industry. UN/LOCODE includes these airports but also covers seaports, rail terminals, and road hubs that IATA does not. In electronic customs declarations (such as the UK&apos;s CHIEF and CDS systems), UN/LOCODE is the required format for identifying ports of loading and discharge. Many freight management systems cross-reference UN/LOCODE with IATA codes to provide a unified location database.
          </p>

          <details style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 18px', fontSize: 15, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
              REST API — GET /api/unlocode
            </summary>
            <div style={{ padding: '0 18px 18px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}>Search by name, code, country, or function type:</p>
              <pre style={{ background: 'var(--navy)', color: '#f9913a', padding: 14, borderRadius: 8, fontSize: 12, overflow: 'auto' }}>
{`curl "https://www.freightutils.com/api/unlocode?q=rotterdam"
curl "https://www.freightutils.com/api/unlocode?code=NLRTM"
curl "https://www.freightutils.com/api/unlocode?country=GB&function=port&limit=50"`}
              </pre>
            </div>
          </details>
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <ApiCallout endpoint="/api/unlocode" />
        </div>

        <div style={{ maxWidth: 700, margin: '24px auto 0' }}>
          <ToolDisclaimer text="UN/LOCODE data from UNECE 2024-2 edition (PDDL). Coordinates are approximate. For official data, consult the UNECE Trade Facilitation website." />
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <NewsletterCapture />
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <RelatedTools tools={[
            { href: '/airlines', label: 'Airline Codes' },
            { href: '/hs', label: 'HS Code Lookup' },
            { href: '/adr', label: 'ADR Dangerous Goods' },
          ]} />
        </div>
      </div>
    </>
  );
}
