import type { Metadata } from 'next';
import Link from 'next/link';
import AdUnit from '@/app/components/AdUnit';
import { getAllContainerSpecs, CONTAINER_COUNT } from '@/lib/calculations/container-capacity';

const ogUrl = '/api/og?title=Shipping+Container+Dimensions&desc=All+10+container+types+with+specs&api=GET+/api/containers';

export const metadata: Metadata = {
  title: 'Shipping Container Dimensions & Capacity Reference | FreightUtils',
  description: 'Free shipping container size guide — internal dimensions, weights, door openings, and pallet capacity for all 10 standard container types. ISO 668 specifications with free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/containers' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Shipping Container Dimensions — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function ContainersPage() {
  const specs = getAllContainerSpecs();

  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Shipping Container Dimensions &amp; <span style={{ color: '#e87722' }}>Capacity</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 600, margin: '0 auto' }}>
          Internal dimensions, weights, door openings, and pallet capacity for all {CONTAINER_COUNT} standard ISO shipping container types
        </p>
      </div>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Main Reference Table ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Container Specifications
        </h2>
        <div className="ref-table-wrap" style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 40 }}>
          <table className="ref-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1a2332', color: '#fff' }}>
                {['Type', 'Internal L\u00d7W\u00d7H (cm)', 'CBM', 'Tare (kg)', 'Max Payload (kg)', 'Door W\u00d7H (cm)', 'EUR Pallets (1200\u00d7800mm)'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map(c => (
                <tr key={c.slug} style={{ borderBottom: '1px solid #eef0f4' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Link href={`/containers/${c.slug}`} style={{ color: '#e87722', textDecoration: 'none' }}>{c.name}</Link>
                  </td>
                  <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>{c.internalLengthCm} &times; {c.internalWidthCm} &times; {c.internalHeightCm}</td>
                  <td style={{ padding: '11px 16px' }}>{c.capacityCbm}</td>
                  <td style={{ padding: '11px 16px' }}>{c.tareWeightKg.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px' }}>{c.maxPayloadKg.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>{c.doorWidthCm && c.doorHeightCm ? `${c.doorWidthCm} \u00d7 ${c.doorHeightCm}` : '\u2014'}</td>
                  <td style={{ padding: '11px 16px' }}>{c.euroPallets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pallet Capacity Table ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          How Many Pallets Fit?
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 48 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1a2332', color: '#fff' }}>
                {['Container', 'EUR Pallets (1200\u00d7800mm)', 'GMA Pallets (48\u00d740in)'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map(c => (
                <tr key={c.slug} style={{ borderBottom: '1px solid #eef0f4' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '11px 16px' }}>{c.euroPallets}</td>
                  <td style={{ padding: '11px 16px' }}>{c.gmaPallets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Authority Content ── */}
        <div style={{ marginTop: 16 }}>

          {/* Standard Container Sizes */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Standard Shipping Container Sizes
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Shipping containers are standardised under <strong>ISO 668</strong> (classification and dimensions) and <strong>ISO 1496</strong> (specification and testing). These standards ensure that containers are interchangeable between ships, trains, and road vehicles worldwide.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The <strong>20ft</strong> and <strong>40ft</strong> containers dominate global trade because they match standard trailer lengths and vessel cell guides. A 20ft container is the base unit of measurement for container shipping — known as a <strong>TEU</strong> (Twenty-foot Equivalent Unit). A 40ft container equals 2 TEU.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            High-cube variants add 30cm (1 foot) of internal height, making them the preferred choice for light, voluminous cargo. Specialist types — open tops, flat racks, and reefers — serve specific cargo requirements that standard dry containers cannot accommodate.
          </p>

          {/* Container Weight Limits */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Container Weight Limits
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Every shipping container has three key weight figures. <strong>Tare weight</strong> is the weight of the empty container itself. <strong>Max gross weight</strong> is the maximum total weight of the container plus its contents — set at <strong>30,480 kg</strong> for all standard ISO containers. <strong>Max payload</strong> is the maximum weight of cargo that can be loaded.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The relationship is straightforward:
          </p>
          <div style={{
            background: '#f7f8fa',
            border: '1px solid #eef0f4',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 14,
            fontFamily: 'monospace',
            fontSize: 15,
            color: '#1a2332',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            Max Payload = Max Gross Weight &minus; Tare Weight
          </div>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In practice, <strong>road weight limits</strong> often restrict loading before container limits do. In the EU, the combined vehicle weight limit is typically <strong>44 tonnes</strong> (including truck, chassis, and container). In the UK, individual bridge weight limits may further reduce the practical maximum. Always check local regulations and carrier-specific restrictions before loading to the ISO maximum.
          </p>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>What is the difference between a 40ft standard and 40ft high cube?</summary>
              <div className="faq-answer">
                A 40ft high cube is <strong>30cm (1 foot) taller</strong> internally than a standard 40ft container, giving it approximately 76 m3 of capacity versus 68 m3. The floor dimensions are identical, so both fit the same number of pallets. The high cube has a slightly lower max payload due to the heavier frame needed for the taller structure.
              </div>
            </details>
            <details className="faq-item">
              <summary>How much does an empty shipping container weigh?</summary>
              <div className="faq-answer">
                Tare weights (empty weight) vary by container type. A <strong>20ft standard</strong> weighs approximately <strong>2,300 kg</strong>, a <strong>40ft standard</strong> around <strong>3,750 kg</strong>, and a <strong>40ft flat rack</strong> up to <strong>5,000 kg</strong>. Reefer containers are heavier than dry containers of the same size due to insulation and the cooling unit.
              </div>
            </details>
            <details className="faq-item">
              <summary>Can I load a container to its maximum capacity?</summary>
              <div className="faq-answer">
                The ISO maximum gross weight is <strong>30,480 kg</strong> for all standard containers, but the practical maximum is often lower. Road weight limits (EU 44t combined vehicle weight, UK bridge restrictions), port terminal limits, and individual carrier restrictions frequently reduce the amount you can actually load. Always verify with your shipping line and transport operator before planning a heavy load.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is a reefer container?</summary>
              <div className="faq-answer">
                A reefer (refrigerated container) is a <strong>temperature-controlled container</strong> with an integrated cooling unit. Reefers maintain temperatures typically between -30 &deg;C and +30 &deg;C, making them essential for perishable goods such as food, pharmaceuticals, and chemicals. The insulation and cooling machinery reduce internal volume compared to a standard dry container of the same external size.
              </div>
            </details>
          </div>

        </div>

        {/* Ad unit */}
        <AdUnit format="auto" />

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          Weights are typical ISO container values. Actual specifications vary by manufacturer and age. Always verify with your container operator.
        </p>

      </main>
    </>
  );
}
