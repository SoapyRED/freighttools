import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import ChargeableWeightCalc from './ChargeableWeightCalc';
import airlinesData from '@/lib/data/airlines.json';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';

const ogUrl = '/api/og?title=Chargeable+Weight+Calculator&desc=Air+freight+volumetric+vs+actual+weight&api=GET+/api/chargeable-weight';

export const metadata: Metadata = {
  title: 'Chargeable Weight Calculator — Air Freight',
  description: 'Compare actual vs volumetric weight for air freight. IATA 6000 divisor, carrier variations, worked examples, and tips to reduce your chargeable weight. Free, instant.',
  alternates: { canonical: 'https://www.freightutils.com/chargeable-weight' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Chargeable Weight Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

// Split airlines by factor for the SEO link section
const standardAirlines = airlinesData.filter(a => a.factor === 6000 && !a.express);
const expressAirlines  = airlinesData.filter(a => a.express);

export default function ChargeableWeightPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What divisor do most airlines use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The IATA standard divisor is 6,000 (cm/kg). Most international air freight carriers follow this. Express couriers like DHL, FedEx, and UPS typically use 5,000, which results in a higher volumetric weight for the same dimensions."
              }
            },
            {
              "@type": "Question",
              "name": "Can I negotiate the volumetric divisor?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Large-volume shippers can sometimes negotiate custom divisors with carriers based on their cargo profile. If you consistently ship high-density goods, a higher divisor (or waived volumetric charges) may be negotiable."
              }
            },
            {
              "@type": "Question",
              "name": "What is the \"pivot weight\" or density break-even?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The break-even density for the IATA 6,000 divisor is approximately 167 kg per cubic metre. If your cargo density exceeds this, you'll be charged on actual weight. Below it, volumetric weight applies. Knowing your typical cargo density helps predict which weight will apply."
              }
            },
            {
              "@type": "Question",
              "name": "How does chargeable weight differ for sea freight?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sea freight (LCL) uses the \"W/M\" rule: 1 CBM = 1,000 kg. The carrier charges whichever is greater — the volume in CBM or the weight in tonnes. This is a much more generous ratio than air freight, which is why bulky goods are typically shipped by sea."
              }
            },
            {
              "@type": "Question",
              "name": "Does chargeable weight include pallet weight?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Actual gross weight includes all packaging, pallets, crates, and wrapping. Airlines weigh the complete shipment as tendered. For dimensions, measure the outermost points including any protrusions, handles, or irregular shapes."
              }
            }
          ]
        }) }}
      />
      <PageHero title="Chargeable Weight" titleAccent="Calculator" subtitle="Compare actual vs volumetric weight for air and sea freight" />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        <ErrorBoundary><ChargeableWeightCalc /></ErrorBoundary>

        {/* What is chargeable weight */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What is Chargeable Weight?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In air freight, carriers charge based on whichever is <strong>higher</strong>: the actual
            gross weight of your shipment, or its <strong>volumetric weight</strong> — a calculated
            figure that represents how much space the cargo occupies in the aircraft&apos;s hold.
            This prevents light but bulky cargo from being transported at the same rate as dense goods.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The standard formula is: <strong>Volumetric Weight (kg) = L × W × H (cm) ÷ 6,000</strong>.
            Most IATA member airlines use a divisor of 6,000 (so 1 m³ = 166.67 kg chargeable weight).
            Express carriers — FedEx, UPS, DHL — typically use <strong>5,000</strong>, making volumetric
            weight relatively heavier and more likely to apply.
          </p>

          {/* Formula box */}
          <div style={{ background: '#1a2332', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
            <code style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: 14, color: '#f59e0b', lineHeight: 1.8 }}>
              Volumetric Weight (kg) = (L × W × H in cm) ÷ Factor<br/>
              <span style={{ color: 'var(--text-faint)' }}>— Factor = 6,000 (IATA standard) or 5,000 (express)</span><br/>
              <br/>
              Chargeable Weight = MAX(Gross Weight, Volumetric Weight)
            </code>
          </div>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            The IATA Standard: 6,000 vs 5,000 Divisor
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The volumetric divisor determines how aggressively space is priced relative to weight. The <strong>IATA standard divisor of 6,000</strong> means that 6,000 cubic centimetres equals 1 kg of chargeable weight, or equivalently, 1 cubic metre equals 166.67 kg. This has been the default for the majority of airline cargo carriers since IATA Resolution 600a standardised the calculation.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Express and integrator carriers (DHL Express, FedEx, UPS, TNT) typically use a <strong>divisor of 5,000</strong>, which means 1 cubic metre equals 200 kg of chargeable weight. This lower divisor makes volumetric weight higher for the same dimensions, reflecting the fact that express carriers offer door-to-door delivery with faster transit times and the space in their aircraft is at a premium. The practical effect is that express shipments are more likely to be charged on volumetric weight than on actual weight.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Some carriers use their own custom divisors. For example, certain Middle Eastern and Asian carriers may offer a divisor of 6,000 for general cargo but 5,000 for e-commerce parcels. Always confirm the applicable divisor with your carrier or freight forwarder before quoting a shipment, as the difference between 5,000 and 6,000 can change a volumetric weight calculation by 20%.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How Carriers Round Chargeable Weight
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Rounding rules vary by carrier and can materially affect your invoice. Under IATA rules, chargeable weight is typically rounded up to the next 0.5 kg. So a calculated volumetric weight of 167.1 kg would be charged as 167.5 kg. Some carriers round to the next whole kilogram, making that same shipment 168 kg chargeable. Express carriers often round each piece individually before summing, while traditional airlines may round only the total. For multi-piece shipments, this distinction can mean a difference of several kilograms.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Additionally, most carriers apply a <strong>minimum chargeable weight</strong>, commonly 1 kg per piece for small parcels or a minimum per-shipment threshold. Even a small envelope may be charged as 1 kg chargeable weight. For consolidations, the total chargeable weight of the entire AWB (Air Waybill) is used, not the sum of individual pieces.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Tips for Reducing Chargeable Weight
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Since chargeable weight is the higher of actual and volumetric weight, the goal is to bring both as close together as possible. Light, bulky shipments (where volumetric weight dominates) benefit from tighter packing: reduce box dimensions by eliminating excess dunnage, vacuum-pack soft goods, and avoid oversized cartons. Even removing 2 cm from each dimension of a 50-piece shipment can meaningfully reduce the total volumetric weight.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For dense shipments (where actual weight dominates), the focus shifts to weight reduction: consider lighter packaging materials, ship in bulk rather than individually boxed items, or use lighter pallet materials. Occasionally, switching from air freight to sea freight for the heaviest portion of a mixed-mode shipment is more cost-effective than optimising air freight dimensions.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            When booking with express carriers (divisor 5,000), the volumetric break-even density is 200 kg per cubic metre. Any cargo denser than this will be charged on actual weight; anything lighter pays on volume. For standard airlines (divisor 6,000), the break-even is 166.67 kg per cubic metre. Knowing your cargo&apos;s density helps you predict whether optimising dimensions or weight will have a bigger impact.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Multi-Piece Shipments and Consolidations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For shipments with multiple pieces of different sizes, each piece is measured individually and its volumetric weight calculated. The total chargeable weight is then the higher of total actual weight versus total volumetric weight — not the sum of per-piece chargeable weights. This means that in a mixed shipment, a few bulky pieces can push the entire consignment onto volumetric billing even if most pieces are dense. When preparing air freight bookings, list every piece with its individual dimensions and weight so the carrier can calculate the correct chargeable weight for the whole AWB.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Consolidators and freight forwarders often aggregate multiple shippers&apos; cargo under a single master AWB. In these cases, the chargeable weight is calculated on the total consolidated shipment, which can sometimes benefit shippers whose cargo would be volumetric on its own but becomes weight-based when combined with denser goods.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Chargeable Weight by Airline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Different airlines use different volumetric factors. Select your carrier below for a
            pre-configured calculator.
          </p>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>
              Standard Airlines — Factor 6,000
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {standardAirlines.map(a => (
                <Link key={a.slug} href={`/chargeable-weight/${a.slug}`} style={{
                  background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '7px 14px', textDecoration: 'none', color: 'var(--text)',
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-faint)' }}>{a.iata}</span>
                  {a.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>
              Express Carriers — Factor 5,000
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {expressAirlines.map(a => (
                <Link key={a.slug} href={`/chargeable-weight/${a.slug}`} style={{
                  background: '#fff', border: '1px solid #fdba74', borderRadius: 8,
                  padding: '7px 14px', textDecoration: 'none', color: '#9a3412',
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fdba74' }}>{a.iata}</span>
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <ApiCallout endpoint="/api/chargeable-weight" />
        <DataTimestamp text="IATA standards, last verified April 2026" />
        <ToolDisclaimer text="Calculations based on standard formulas. Always verify with your carrier for operational specifications." />
        <RelatedTools tools={[
          { href: '/airlines', label: "Find your airline's AWB prefix" },
          { href: '/cbm', label: 'Calculate CBM for volume' },
          { href: '/incoterms', label: 'Check INCOTERMS for your shipment' },
        ]} />

      </main>
    </>
  );
}
