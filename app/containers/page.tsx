import type { Metadata } from 'next';
import Link from 'next/link';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import { getAllContainerSpecs, CONTAINER_COUNT } from '@/lib/calculations/container-capacity';

const ogUrl = '/api/og?title=Shipping+Container+Dimensions&desc=All+10+container+types+with+specs&api=GET+/api/containers';

export const metadata: Metadata = {
  title: 'Shipping Container Sizes — Dimensions & Capacity',
  description: 'Internal dimensions, weights, door openings, and pallet capacity for all 10 standard shipping containers. 20ft, 40ft, 40ft HC, reefer, open top, and more. ISO 668 specs. Free.',
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
      <PageHero title="Container" titleAccent="Specs" subtitle="Shipping container dimensions, weights, door openings, and pallet capacity" />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Main Reference Table ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Container Specifications
        </h2>
        <div className="ref-table-wrap" style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 40 }}>
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
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          How Many Pallets Fit?
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 48 }}>
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
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Standard Shipping Container Sizes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Shipping containers are standardised under <strong>ISO 668</strong> (classification and dimensions) and <strong>ISO 1496</strong> (specification and testing). These standards ensure that containers are interchangeable between ships, trains, and road vehicles worldwide.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The <strong>20ft</strong> and <strong>40ft</strong> containers dominate global trade because they match standard trailer lengths and vessel cell guides. A 20ft container is the base unit of measurement for container shipping — known as a <strong>TEU</strong> (Twenty-foot Equivalent Unit). A 40ft container equals 2 TEU.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            High-cube variants add 30cm (1 foot) of internal height, making them the preferred choice for light, voluminous cargo. Specialist types — open tops, flat racks, and reefers — serve specific cargo requirements that standard dry containers cannot accommodate.
          </p>

          {/* Container Weight Limits */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Container Weight Limits
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Every shipping container has three key weight figures. <strong>Tare weight</strong> is the weight of the empty container itself. <strong>Max gross weight</strong> is the maximum total weight of the container plus its contents — set at <strong>30,480 kg</strong> for all standard ISO containers. <strong>Max payload</strong> is the maximum weight of cargo that can be loaded.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The relationship is straightforward:
          </p>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid #eef0f4',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 14,
            fontFamily: 'monospace',
            fontSize: 15,
            color: 'var(--text)',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            Max Payload = Max Gross Weight &minus; Tare Weight
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In practice, <strong>road weight limits</strong> often restrict loading before container limits do. In the EU, the combined vehicle weight limit is typically <strong>44 tonnes</strong> (including truck, chassis, and container). In the UK, individual bridge weight limits may further reduce the practical maximum. Always check local regulations and carrier-specific restrictions before loading to the ISO maximum.
          </p>

          {/* Choosing the Right Container */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Choosing the Right Container
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Selecting the correct container type is one of the most impactful decisions in planning a sea freight shipment. The wrong choice can waste space, exceed weight limits, damage cargo, or incur unnecessary costs.
          </p>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '20px 0 8px' }}>Standard vs High Cube</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For most general cargo, the choice is between a standard and a high cube container. High cube containers provide approximately 13% more volume than their standard counterparts at the same length, thanks to the extra 30 cm (1 foot) of internal height. This makes them the preferred choice for light, voluminous cargo where you fill the container by volume long before reaching the weight limit. Furniture, clothing, electronics packaging, and plastic goods typically ship more efficiently in high cubes.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Standard-height containers are generally cheaper to rent and more widely available in some trade lanes. They are the better choice for dense cargo where the weight limit will be reached before the volume is filled &mdash; heavy machinery parts, canned goods, beverages, and building materials often work better in standard containers. The 40ft high cube has largely become the default for most FCL (full container load) shipments in global trade, while the 20ft standard remains the workhorse for heavy cargo.
          </p>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '20px 0 8px' }}>When to Use Specialist Containers</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Open top containers</strong> are designed for cargo that cannot be loaded through the doors &mdash; machinery, large industrial components, timber, and scrap metal are common examples. The removable roof allows loading by crane from above. Open tops cost more to hire than standard dry containers and require tarpaulin covers for weather protection.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Flat rack containers</strong> have no side walls or roof, making them suitable for oversized or out-of-gauge cargo such as vehicles, boats, heavy plant equipment, and large structural steel. Flat racks can be folded when empty for efficient repositioning. They require lashing and securing equipment, and the cargo may need to be sheeted for protection. Flat rack shipments attract surcharges for the additional space they occupy on a vessel (measured in TEU equivalents plus any overwidth or overheight allowances).
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Reefer containers</strong> are temperature-controlled units essential for perishable goods including fresh produce, frozen food, pharmaceuticals, and chemicals. Reefers can maintain temperatures between &minus;30&deg;C and +30&deg;C, with some units capable of controlled atmosphere settings to regulate oxygen and CO2 levels for fresh fruit. Reefer containers require a power connection at the port and on the vessel, and they cost significantly more than dry containers.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Road Weight Limits and Container Loading
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The ISO maximum gross weight of 30,480 kg applies to the container structure itself, but road transport regulations frequently impose lower effective limits. In the <strong>EU</strong>, the maximum combined vehicle weight for container transport is typically <strong>44 tonnes</strong>, which includes the tractor unit, chassis, empty container, and cargo. After deducting the weight of the truck (around 7,500 kg), chassis (3,500&ndash;5,000 kg), and empty container (2,300&ndash;5,000 kg depending on type), the practical payload for road transport is often 25,000&ndash;28,000 kg &mdash; well below the ISO container maximum of 28,000+ kg.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In the <strong>UK</strong>, individual bridge weight limits may further restrict the practical maximum. The UK also requires all containers over 3.5 tonnes gross to be weighed before loading onto a vessel under the SOLAS VGM (Verified Gross Mass) regulation. The VGM must be provided to the carrier and terminal before the container can be loaded. Failure to provide a VGM results in the container being refused for loading, causing delays and additional costs.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Always check the maximum vehicle weight for the specific route, including any bridge or road restrictions. Your shipping line can confirm the maximum gross weight they will accept per container, which may be lower than the ISO maximum based on their vessel stowage plan and port terminal limitations.
          </p>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
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

        <ApiCallout endpoint="/api/containers" />
        <DataTimestamp text="ISO container specifications, last verified April 2026" />
        <ToolDisclaimer text="Calculations based on standard formulas. Always verify with your carrier for operational specifications." />
        <RelatedTools tools={[
          { href: '/cbm', label: 'Calculate CBM per item' },
          { href: '/pallet', label: 'How many pallets fit?' },
          { href: '/ldm', label: 'Loading metres for road freight' },
        ]} />


        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          Weights are typical ISO container values. Actual specifications vary by manufacturer and age. Always verify with your container operator.
        </p>

      </main>
    </>
  );
}
