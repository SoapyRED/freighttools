import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import { getAllULDs, ULD_COUNT } from '@/lib/calculations/uld';
import UldSearch from './UldSearch';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=Air+Freight+ULD+Types&desc=15%2B+unit+load+device+specs,+dimensions+%26+weights&api=GET+/api/uld';

export const metadata: Metadata = {
  title: 'Air Freight ULD Types — Unit Load Devices',
  description:
    'Free ULD reference — 15+ air cargo unit load device types with dimensions, weights, volumes, and aircraft compatibility. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/uld' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Air Freight ULD Types — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function UldPage() {
  const data = getAllULDs();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'ULD Types', path: '/uld' }]) }} />
      <PageHero title="ULD" titleAccent="Types" subtitle="Air cargo unit load device specifications — containers, pallets, and special units" differentiators={['15 ULD types', 'Aircraft compatibility', 'Free API']} category="ref" />

      <main data-category="ref" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Search + Cards */}
        <ErrorBoundary><UldSearch data={data} /></ErrorBoundary>

        <ApiCallout endpoint="/api/uld" />

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What is a ULD? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is a ULD?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            A Unit Load Device (ULD) is a standardised container or pallet used to load cargo, baggage, and mail onto aircraft. ULDs are built to strict IATA and airline specifications so they lock securely into aircraft cargo holds. Each ULD type has a unique IATA code (such as AKE for the LD3 container) that identifies its dimensions, weight limits, and compatible aircraft.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Using ULDs dramatically speeds up aircraft loading and unloading. Instead of handling individual packages, ground crews move pre-built ULD units with dollies and loaders. A wide-body freighter like a Boeing 747F can carry over 30 ULD positions across its main and lower decks.
          </p>

          {/* Section 2: Lower Deck vs Main Deck */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Lower Deck vs Main Deck
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Aircraft cargo space is divided into two areas. The <strong>lower deck</strong> (also called the belly) sits beneath the passenger cabin on passenger aircraft or beneath the main deck on freighters. Lower deck ULDs like the LD3 (AKE) and LD9 (AAP) are contoured to fit the curved fuselage cross-section, which is why they have angled sides. The <strong>main deck</strong> is the primary cargo floor on freighter aircraft, accessed through a large side-loading door. Main deck pallets and containers (PMC, AMJ, PAG) are larger and rectangular because the full fuselage width is available.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Passenger airlines only use lower deck ULDs for cargo (the main deck carries passengers). Freighter aircraft use both decks, giving them significantly more cargo capacity. Some ULD types like the PLA (P1P) pallet are designed to work on both decks.
          </p>

          {/* Section 3: How ULDs are used */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How ULDs Are Used in Air Cargo
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The process of loading cargo into a ULD is called <strong>buildup</strong>, and unloading is called <strong>breakdown</strong>. During buildup, individual shipments are stacked inside the ULD, weighed, and secured with nets or straps. The completed ULD is then transported on dollies to the aircraft and loaded using high-loaders or roller systems built into the cargo hold floor.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Airlines own and manage most ULD fleets, tracking each unit with unique serial numbers. Freight forwarders and shippers typically do not own ULDs — they deliver loose cargo to the airline or ground handling agent, who performs the buildup. Some large freight forwarders have agreements to build up their own ULDs at warehouse facilities, returning the completed units to the airline for loading. Accurate ULD weight declarations are critical for aircraft weight and balance calculations.
          </p>

        </div>

        <DataTimestamp text="ULD specifications last verified May 2026" />
        <ToolDisclaimer text="ULD data based on IATA ULD Technical Manual specifications. Always confirm exact dimensions and weight limits with the operating airline, as individual airline variants may differ." />
        <NewsletterCapture />
        <RelatedTools tools={[
          { href: '/chargeable-weight', label: 'Calculate chargeable weight for air freight' },
          { href: '/airlines', label: 'Airline codes & AWB prefix lookup' },
          { href: '/cbm', label: 'CBM calculator for cargo dimensions' },
        ]} />

        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          ULD specifications compiled from IATA standards. Individual airline ULD variants may have slightly different dimensions or weight limits. Last updated May 2026.
        </p>

      </main>
    </>
  );
}
