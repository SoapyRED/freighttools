import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import CbmCalc from './CbmCalc';
import containersData from '@/lib/data/containers.json';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';

const ogUrl = '/api/og?title=CBM+Calculator&desc=Cubic+metres+for+sea+and+air+freight+shipments&api=GET+/api/cbm';

export const metadata: Metadata = {
  title: 'CBM Calculator — Cubic Metres for Shipping',
  description: 'Calculate cubic metres (CBM) for sea freight, air freight, and container loading. W/M pricing rules, container capacity reference, and LDM comparison. Instant results, free.',
  alternates: { canonical: 'https://www.freightutils.com/cbm' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'CBM Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

const seaContainers = containersData.filter(c => c.category === 'sea');
const airUlds       = containersData.filter(c => c.category === 'air');

export default function CbmPage() {
  return (
    <>
      <PageHero title="CBM" titleAccent="Calculator" subtitle="Calculate cubic metres for sea freight, air freight, and container loading" />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        <ErrorBoundary><CbmCalc /></ErrorBoundary>

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Is CBM? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is CBM?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>CBM</strong> stands for cubic metre (m³) — the standard unit of volume measurement used in international shipping and logistics. One cubic metre is the volume of a cube measuring 1 metre on each side, equivalent to 1,000 litres.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In freight, CBM determines how much space your cargo occupies in a shipping container, aircraft, or warehouse. It is the primary volume measurement for sea freight pricing (particularly <strong>LCL — Less than Container Load</strong>) and is used alongside weight to calculate chargeable weight in air freight.
          </p>

          {/* Section 2: How to Calculate CBM */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How to Calculate CBM
          </h2>
          <div style={{ background: '#1a2332', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
            <code style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: 14, color: '#f59e0b', lineHeight: 2 }}>
              CBM = Length (m) × Width (m) × Height (m)<br/>
              <span style={{ color: 'var(--text-faint)' }}>If measuring in centimetres:</span><br/>
              CBM = (Length × Width × Height in cm) ÷ 1,000,000<br/>
              <br/>
              <span style={{ color: 'var(--text-faint)' }}>For multiple items of the same size:</span><br/>
              Total CBM = CBM per item × Quantity
            </code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For mixed cargo (different sizes), calculate each item separately and sum the totals.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Important:</strong> always measure the outermost dimensions of the packaged goods — including any bulges, protrusions, or irregular shapes. Carriers measure from the widest point.
          </p>

          {/* Section 3: CBM and Container Capacity */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            CBM and Container Capacity
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  {['Container Type', 'Internal Dimensions', 'Max CBM', 'Typical Usable', 'Max Payload'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['20ft Standard',  '5.90 × 2.35 × 2.39 m', '33.2 m³', '25–28 m³', '21,770 kg'],
                  ['40ft Standard',  '12.03 × 2.35 × 2.39 m', '67.7 m³', '55–58 m³', '26,480 kg'],
                  ['40ft High Cube', '12.03 × 2.35 × 2.69 m', '76.3 m³', '60–65 m³', '26,230 kg'],
                ].map(([type, dims, max, usable, payload]) => (
                  <tr key={type} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{type}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 13 }}>{dims}</td>
                    <td style={{ padding: '11px 16px', fontWeight: 700 }}>{max}</td>
                    <td style={{ padding: '11px 16px' }}>{usable}</td>
                    <td style={{ padding: '11px 16px' }}>{payload}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-faint)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Usable capacity is always less than the maximum internal volume due to pallet gaps, door clearance, and cargo shape. Plan for approximately 80–85% utilisation in practice.
          </p>

          {/* Container links */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Calculate CBM by Container Type
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Select a container or ULD below to open a pre-filled calculator with its internal dimensions.
          </p>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>
              Sea Freight Containers
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {seaContainers.map(c => (
                <Link key={c.slug} href={`/cbm/${c.slug}`} style={{
                  background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 14px', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{c.capacityCbm} m³ max</span>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>
              Air Freight ULDs
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {airUlds.map(c => (
                <Link key={c.slug} href={`/cbm/${c.slug}`} style={{
                  background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8,
                  padding: '8px 14px', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{c.capacityCbm} m³ max</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 4: CBM in Sea Freight Pricing */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            CBM in Sea Freight Pricing (W/M Rule)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In LCL (Less than Container Load) sea freight, carriers apply the &ldquo;Weight or Measure&rdquo; rule:
          </p>
          <div style={{ background: '#1a2332', borderRadius: 12, padding: '16px 24px', marginBottom: 16 }}>
            <code style={{ fontFamily: "'Courier New', monospace", fontSize: 15, color: '#f59e0b', fontWeight: 700 }}>
              1 CBM = 1,000 kg (1 freight tonne)
            </code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The carrier charges based on whichever is greater — the volume in CBM or the weight in tonnes. For example:
          </p>
          <ul style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>A shipment of <strong>2 CBM weighing 500 kg</strong> → charged for 2 CBM (volume is greater: 2 freight tonnes &gt; 0.5 actual tonnes)</li>
            <li>A shipment of <strong>1 CBM weighing 1,800 kg</strong> → charged for 1.8 tonnes (weight is greater: 1.8 tonnes &gt; 1 CBM)</li>
          </ul>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            This is a much more generous ratio than air freight, where 1 CBM equates to approximately 167 kg. This is why bulky, lightweight goods are almost always cheaper to ship by sea.
          </p>

          {/* Section 5: CBM vs LDM */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            CBM vs LDM — When to Use Which
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  {['Measurement', 'Used For', 'Unit', 'When to Use'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['CBM (Cubic Metres)', 'Sea freight, air freight, warehouse storage', 'm³', 'International shipping, container loading, volume-based pricing'],
                  ['LDM (Loading Metres)', 'European road freight', 'Linear metres of trailer floor', 'UK and EU groupage/part-load road transport'],
                ].map(([measure, used, unit, when]) => (
                  <tr key={measure} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{measure}</td>
                    <td style={{ padding: '11px 16px' }}>{used}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 13 }}>{unit}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Road freight in Europe typically prices by LDM (floor space) rather than CBM because trailer height is usually not a constraint — most standard goods don&apos;t stack to the roof. Sea and air freight price by volume because container and aircraft space is three-dimensional.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For a detailed LDM calculation, use our <Link href="/ldm" style={{ color: '#e87722', textDecoration: 'underline' }}>Loading Metres Calculator</Link>.
          </p>

          {/* Section 6: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>How many CBM fit in a 20ft container?</summary>
              <div className="faq-answer">
                A standard 20ft container has a maximum internal capacity of approximately 33.2 CBM. In practice, expect to load 25–28 CBM due to pallet gaps, door clearance, and cargo shape. For FCL shipments, plan for 80–85% space utilisation.
              </div>
            </details>
            <details className="faq-item">
              <summary>How is CBM used in air freight?</summary>
              <div className="faq-answer">
                In air freight, CBM is converted to volumetric weight using the formula: 1 CBM = 167 kg (based on the IATA divisor of 6,000). The carrier charges whichever is higher — actual weight or volumetric weight. Use our <Link href="/chargeable-weight" style={{ color: '#e87722', textDecoration: 'underline' }}>Chargeable Weight Calculator</Link> for air freight pricing.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the difference between CBM and cubic feet?</summary>
              <div className="faq-answer">
                1 CBM = 35.315 cubic feet. CBM is the international standard used in shipping. Cubic feet is more common in US domestic freight and warehousing.
              </div>
            </details>
            <details className="faq-item">
              <summary>Should I measure internal or external package dimensions?</summary>
              <div className="faq-answer">
                Always measure external dimensions of the packaged goods as they will be presented to the carrier. Include any protrusions, handles, or irregular shapes. The carrier will measure from the outermost points.
              </div>
            </details>
            <details className="faq-item">
              <summary>What does &ldquo;revenue tonne&rdquo; or &ldquo;freight tonne&rdquo; mean?</summary>
              <div className="faq-answer">
                A freight tonne (also called revenue tonne or W/M tonne) is the billing unit in sea freight: 1 freight tonne = 1 CBM or 1,000 kg, whichever is greater. This ensures carriers are compensated for both space and weight.
              </div>
            </details>
          </div>

        </div>

        <ApiCallout endpoint="/api/cbm" />
        <DataTimestamp text="Conversion factors are standard mathematical constants" />
        <ToolDisclaimer text="Calculations based on standard formulas. Always verify with your carrier for operational specifications." />
        <RelatedTools tools={[
          { href: '/ldm', label: 'Need loading metres instead?' },
          { href: '/chargeable-weight', label: 'Calculate air freight chargeable weight' },
          { href: '/containers', label: 'Check container capacity' },
        ]} />

      </main>
    </>
  );
}
