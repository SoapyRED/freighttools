import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import ConsignmentCalc from './ConsignmentCalc';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=Consignment+Calculator&desc=Multi-item+CBM,+weight,+LDM+and+chargeable+weight&api=POST+/api/consignment';

export const metadata: Metadata = {
  title: 'Multi-Item Consignment Calculator',
  description: 'Multi-item freight calculator — total CBM, weight, LDM and chargeable weight for mixed consignments. Add unlimited lines. Free, no signup, REST API.',
  alternates: { canonical: 'https://www.freightutils.com/consignment-calculator' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Multi-Item Consignment Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function ConsignmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Consignment Calculator","description":"Free Consignment Calculator. Calculate total CBM, weight, loading metres and chargeable weight for mixed consignments. REST API available.","url":"https://www.freightutils.com/consignment-calculator","applicationCategory":"UtilityApplication","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"GBP"},"author":{"@type":"Person","name":"Marius Cristoiu","url":"https://www.linkedin.com/in/marius-cristoiu-a853812a2/"}}) }} />
      <PageHero title="Multi-Item Consignment" titleAccent="Calculator" subtitle="Calculate total CBM, weight, loading metres and chargeable weight for mixed consignments" differentiators={['Mixed items & pallet types', 'Vehicle suggestions', 'Free API']} />
      <div style={{ textAlign: 'center', marginTop: -24, marginBottom: 8 }}>
        <DataTimestamp text="Calculation engine verified April 2026" />
      </div>

      {/* Calculator */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>
        <ErrorBoundary><ConsignmentCalc /></ErrorBoundary>

        {/* SEO Content */}
        <div style={{ maxWidth: 700, margin: '48px auto 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            How the consignment calculator works
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            This tool calculates freight metrics for mixed consignments with multiple item types. Enter each item&apos;s dimensions, quantity, and weight to get per-item and total CBM (cubic metres), gross weight, loading metres (LDM), and chargeable weight for both air and road freight.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            <strong>Air freight chargeable weight</strong> uses the IATA standard: 1 CBM = 167 kg volumetric. The carrier charges whichever is greater — actual weight or volumetric weight. <strong>Road freight chargeable weight</strong> uses 1 LDM = 1,750 kg, the European standard for groupage pricing.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            The suggested vehicle is based on both total loading metres and total weight, selecting the smallest vehicle that fits both constraints. Stackable items halve their LDM contribution.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            What is a mixed consignment?
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            A mixed consignment (also called a groupage shipment or consolidated load) contains multiple different item types with varying dimensions, weights, and handling requirements. In real-world freight operations, almost every LTL (less-than-truckload) shipment is a mixed consignment &mdash; a transport planner might be loading 8 Euro pallets of electronics alongside 4 UK pallets of textiles and 12 cartons of samples, each with different stackability constraints. Calculating total space requirements manually is time-consuming and error-prone, which is why freight teams typically use spreadsheets. This tool replaces that spreadsheet.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Stackability and its impact on loading
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            When items are stackable (meaning a second layer can be placed on top), they effectively occupy half the floor space &mdash; the LDM is halved because two layers fit in the same loading metre. Non-stackable items (fragile goods, items exceeding standard pallet height, or goods with irregular tops) always consume their full floor footprint. In practice, non-stackable cargo is the main driver of wasted trailer space in groupage operations.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Air vs road chargeable weight
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            Air freight carriers charge by the greater of actual weight or volumetric weight (1 CBM = 167 kg). Road freight carriers in Europe charge by the greater of actual weight or LDM-based weight (1 LDM = 1,750 kg). The two systems produce very different chargeable weights for the same shipment. A bulky, lightweight consignment will have high air chargeable weight (volume-driven) but may have moderate road chargeable weight. This calculator shows both so you can compare air vs road costs accurately.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Vehicle size selection
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            The tool suggests the smallest vehicle that fits both the total loading metres and total weight: a 3.5T Luton van (4m, 1,200 kg), 7.5T rigid (5.2m, 3,500 kg), 18T rigid (10m, 12,000 kg), or 13.6m artic trailer (24,000 kg). If the consignment exceeds even the artic trailer, it flags that multiple vehicles are required. The trailer utilisation percentage helps you assess whether the vehicle is being used efficiently or if there&apos;s significant wasted capacity that could be filled with other freight.
          </p>

          <details style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 18px', fontSize: 15, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
              REST API — POST /api/consignment
            </summary>
            <div style={{ padding: '0 18px 18px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}>Send a POST request with a JSON body containing an <code>items</code> array:</p>
              <pre style={{ background: 'var(--navy)', color: '#f9913a', padding: 14, borderRadius: 8, fontSize: 12, overflow: 'auto' }}>
{`curl -X POST "https://www.freightutils.com/api/consignment" \\
  -H "Content-Type: application/json" \\
  -d '{"items": [
    {"length": 120, "width": 80, "height": 150, "quantity": 8, "grossWeight": 450, "stackable": true, "palletType": "euro"},
    {"length": 100, "width": 100, "height": 120, "quantity": 4, "grossWeight": 800}
  ]}'`}
              </pre>
            </div>
          </details>
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <ApiCallout method="POST" endpoint="/api/consignment" />
        </div>

        <div style={{ maxWidth: 700, margin: '24px auto 0' }}>
          <ToolDisclaimer text="Built by Marius C. Calculations are estimates — always verify with your carrier. Not a substitute for professional freight planning." />
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <NewsletterCapture />
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <RelatedTools tools={[
            { href: '/ldm', label: 'LDM Calculator' },
            { href: '/cbm', label: 'CBM Calculator' },
            { href: '/chargeable-weight', label: 'Chargeable Weight' },
          ]} />
        </div>
      </div>
    </>
  );
}
