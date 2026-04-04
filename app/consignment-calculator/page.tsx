import type { Metadata } from 'next';
import ConsignmentCalc from './ConsignmentCalc';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';

const ogUrl = '/api/og?title=Consignment+Calculator&desc=Multi-item+CBM,+weight,+LDM+and+chargeable+weight&api=POST+/api/consignment';

export const metadata: Metadata = {
  title: 'Multi-Item Consignment Calculator — FreightUtils',
  description: 'Calculate total CBM, weight, loading metres and chargeable weight for mixed consignments. Free freight calculator with REST API.',
  alternates: { canonical: 'https://www.freightutils.com/consignment-calculator' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Multi-Item Consignment Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function ConsignmentPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Multi-Item Consignment <span style={{ color: '#e87722' }}>Calculator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 580, margin: '0 auto' }}>
          Calculate total CBM, weight, loading metres, and chargeable weight for mixed consignments. Add multiple items and get per-line and grand totals instantly.
        </p>
        <DataTimestamp text="Calculation engine verified April 2026" />
      </div>

      {/* Calculator */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>
        <ConsignmentCalc />

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
          <RelatedTools tools={[
            { href: '/ldm', label: 'LDM Calculator' },
            { href: '/cbm', label: 'CBM Calculator' },
            { href: '/chargeable-weight', label: 'Chargeable Weight' },
          ]} />
        </div>

        <div style={{ maxWidth: 700, margin: '24px auto 0' }}>
          <ToolDisclaimer text="Built by Marius C. Calculations are estimates — always verify with your carrier. Not a substitute for professional freight planning." />
        </div>
      </div>
    </>
  );
}
