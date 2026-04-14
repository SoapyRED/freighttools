import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import RelatedTools from '@/app/components/RelatedTools';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';
import VehicleSearch from './VehicleSearch';
import { getAllVehicles, VEHICLE_REF_COUNT } from '@/lib/calculations/vehicle-ref';

const ogUrl = '/api/og?title=Vehicle+%26+Trailer+Types&desc=17+vehicle+specs+with+dimensions+%26+payload&api=GET+/api/vehicles';

export const metadata: Metadata = {
  title: 'Road Freight Vehicle & Trailer Types',
  description: `Free reference for ${VEHICLE_REF_COUNT} road freight vehicles and trailers — dimensions, payload, pallet capacity. EU and US specs with REST API.`,
  alternates: { canonical: 'https://www.freightutils.com/vehicles' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Vehicle & Trailer Types — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function VehiclesPage() {
  const vehicles = getAllVehicles();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'Vehicle & Trailer Types', path: '/vehicles' }]) }} />
      <PageHero title="Vehicle & Trailer" titleAccent="Types" subtitle="Road freight vehicle dimensions, payload limits, and pallet capacity" differentiators={['17 vehicle types', 'EU & US specs', 'Free API']} />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Interactive search */}
        <ErrorBoundary><VehicleSearch vehicles={vehicles} /></ErrorBoundary>

        {/* ── Educational Content ── */}
        <div style={{ marginTop: 56 }}>

          {/* Common Road Freight Vehicles */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Common Road Freight Vehicles
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Road freight vehicles range from panel vans capable of carrying a few pallets to 44-tonne articulated trailers with space for 33 euro pallets. The standard European articulated curtainsider is the workhorse of the industry, measuring 13.6 metres internally with a 2.4-metre width and 2.7-metre clearance. Rigid trucks fill the gap between vans and artics, offering payloads from 2.5 to 14 tonnes depending on the chassis weight rating.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Specialist trailer types extend these capabilities. Mega trailers provide 3.0 metres of internal height for voluminous cargo. Double-deck trailers double the pallet count by splitting the load space into two levels, which is common in FMCG and retail distribution. Refrigerated trailers maintain temperature control for perishable and pharmaceutical goods, while flatbeds and low-loaders handle oversized and heavy plant equipment.
          </p>

          {/* How to Choose the Right Vehicle Size */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How to Choose the Right Vehicle Size
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Matching cargo to the correct vehicle starts with three questions: how many pallets, what total weight, and does the delivery site have any access restrictions? A full load of 26 UK pallets requires a standard artic, but if the total weight is under 10 tonnes and the site has a narrow entrance, an 18-tonne rigid may be a better fit. For lighter consignments of one to four pallets, a Luton van or large panel van keeps costs down and avoids the need for a tail lift at the delivery point.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Always check pallet height as well as floor count. Standard trailers offer 2.7 metres of clearance, but stacking two 1.8-metre pallets requires a mega trailer. Use the <Link href="/ldm" style={{ color: '#e87722', fontWeight: 600, textDecoration: 'none' }}>loading metre calculator</Link> to convert your pallet dimensions into LDM, then compare against the vehicle lengths listed above to find the smallest vehicle that fits your shipment.
          </p>

          {/* EU vs US Trailer Differences */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            EU vs US Trailer Differences
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            European and North American trailers differ in both dimensions and weight limits. The standard EU articulated trailer is 13.6 metres long and 2.48 metres wide, with a maximum combined vehicle weight of 44 tonnes. The US standard 53-foot dry van is longer at 16.15 metres and slightly wider at 2.59 metres (102 inches), but the federal gross vehicle weight limit is only 80,000 lbs (36,287 kg). This means US trailers have more floor space but a lower weight ceiling relative to their size.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Pallet standards also differ. European operations use the 1200&times;800 mm EUR pallet and the 1200&times;1000 mm UK pallet, while North American logistics centres are built around the 48&times;40 inch GMA pallet. These dimensional differences mean pallet counts are not directly comparable between EU and US trailers. When planning cross-border shipments, always confirm which pallet type will be used at both origin and destination.
          </p>
        </div>

        <ApiCallout endpoint="/api/vehicles" />
        <ToolDisclaimer text="Specifications are typical industry values and may vary by manufacturer, configuration, and age. Always confirm with your carrier or operator." />
        <NewsletterCapture />
        {/* Cross-links */}
        <RelatedTools tools={[
          { href: '/ldm', label: 'LDM Calculator' },
          { href: '/consignment-calculator', label: 'Consignment Calculator' },
          { href: '/containers', label: 'Container Dimensions' },
          { href: '/pallet', label: 'Pallet Fitting' },
        ]} />

      </main>
    </>
  );
}
