import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import PalletFittingCalc from './PalletFittingCalc';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import palletsData from '@/lib/data/pallets.json';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=Pallet+Fitting+Calculator&desc=How+many+boxes+fit+on+a+pallet%3F+Visual+layer+diagram.&api=GET+/api/pallet';

export const metadata: Metadata = {
  title: 'Pallet Fitting Calculator — How Many Boxes Fit on a Pallet?',
  description: 'Free pallet calculator — how many boxes fit on a pallet? 15 types including EUR, GMA, IATA. Visual layer diagrams. No signup, free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/pallet' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Pallet Fitting Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function PalletPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'Pallet Fitting Calculator', path: '/pallet' }]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Pallet Fitting Calculator","description":"Free Pallet Fitting Calculator. Calculate how many boxes fit on a pallet with layer-by-layer stacking for 15 pallet types. REST API available.","url":"https://www.freightutils.com/pallet","applicationCategory":"UtilityApplication","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"GBP"},"author":{"@type":"Person","name":"Marius Cristoiu","url":"https://www.linkedin.com/in/marius-cristoiu-a853812a2/"}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How many Euro pallets fit in a 13.6m trailer?","acceptedAnswer":{"@type":"Answer","text":"33 Euro pallets in a single floor layer. Double-stacked: up to 66, subject to height (max 2.7m internal) and weight limits (24,000 kg payload)."}},{"@type":"Question","name":"What is the maximum pallet height for road freight?","acceptedAnswer":{"@type":"Answer","text":"Standard trailers have 2.65–2.70m internal height. Mega/jumbo trailers offer up to 3.0m. After deducting pallet deck height (~15 cm), usable stacking height is typically 2.50–2.55m."}},{"@type":"Question","name":"Can boxes overhang the pallet edge?","acceptedAnswer":{"@type":"Answer","text":"Minor overhang (1–2 cm) is common but reduces stacking stability. Significant overhang risks damage during transport and may not fit standard racking."}},{"@type":"Question","name":"Which pallet type should I use for air freight?","acceptedAnswer":{"@type":"Answer","text":"Air freight uses IATA ULD pallets (e.g., PMC P6P at 318×244 cm) rather than standard Euro or UK pallets. These are designed to fit aircraft cargo holds."}}]}) }} />
      <PageHero title="Pallet Fitting" titleAccent="Calculator" subtitle="Calculate how many boxes fit on a pallet with layer-by-layer stacking" differentiators={['Layer-by-layer stacking', 'Rotation optimisation', 'Free API']} category="ops" />

      <main data-category="ops" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        <ErrorBoundary><PalletFittingCalc /></ErrorBoundary>

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Is Pallet Fitting? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is Pallet Fitting?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Pallet fitting (also called pallet loading or pallet optimisation) is the process of calculating how many boxes, cartons, or items can be loaded onto a pallet while respecting the pallet&apos;s dimensions and weight limits.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Efficient pallet loading reduces shipping costs, minimises wasted space, and ensures cargo stability during transport. A well-packed pallet uses the full footprint and stacks to a safe height without overhanging the pallet edges — overhang increases the risk of damage during handling and can prevent pallets from fitting into racking systems.
          </p>

          {/* Algorithm explainer */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How Does the Calculator Work?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The calculator uses a <strong>layer-based greedy algorithm</strong> — the same method warehouse operatives use when manually building pallet loads. It works in two steps:
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Step 1 — One layer:</strong> The box footprint (length × width) is tiled across the pallet footprint using simple integer division. If rotation is enabled, both orientations are tried and whichever fits more boxes per layer is chosen.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Step 2 — Stack height:</strong> The number of layers is calculated as <code style={{ background: '#f0f2f5', padding: '1px 5px', borderRadius: 4 }}>floor(usable height ÷ box height)</code> where usable height = max stack height − pallet board height. If box weight and max pallet weight are provided, the result is further capped so total weight never exceeds the pallet rating.
          </p>
          <div style={{ background: 'var(--bg-code)', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
            <code style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: 13, color: '#f59e0b', lineHeight: 2 }}>
              Boxes per layer = floor(pallet L ÷ box L) × floor(pallet W ÷ box W)<br />
              <span style={{ color: 'var(--text-faint)' }}>— repeated for rotated orientation, best wins</span><br />
              <br />
              Layers = floor((max stack height − pallet board height) ÷ box height)<br />
              <br />
              Total boxes = boxes per layer × layers
            </code>
          </div>

          {/* Section 2: Common Pallet Types */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Common Pallet Types and Dimensions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            FreightUtils includes 15 pallet types with specifications audited against official standards from EPAL, ISO 6780, and IATA.
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                  {['Pallet', 'Dimensions (L×W)', 'Max Load', 'Standard', 'Common Use'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['EUR/EPAL 1', '1200 × 800 mm', '1,500 kg', 'EPAL / ISO 6780', 'European road freight — most widely used pallet in Europe'],
                  ['EUR/EPAL 2', '1200 × 1000 mm', '1,250 kg', 'EPAL', 'UK standard — common in UK retail and distribution'],
                  ['EUR/EPAL 3', '1000 × 1200 mm', '1,250 kg', 'EPAL / ISO 6780', 'Common in FMCG and beverage industries'],
                  ['EUR/EPAL 6 (Half)', '800 × 600 mm', '750 kg', 'EPAL', 'Retail display, point-of-sale, small consignments'],
                  ['GMA (N. American)', '1219 × 1016 mm', '1,089 kg', 'GMA / ISO', 'Standard pallet in North America (48×40 inches)'],
                  ['CP1', '1000 × 1200 mm', '1,250 kg', 'EPAL', 'Chemical industry standard'],
                  ['CP3', '1140 × 1140 mm', '1,250 kg', 'EPAL', 'Chemical drums and IBCs'],
                  ['Aircraft PMC', '3175 × 2438 mm', 'Varies', 'IATA', 'Main deck air freight — ULD pallet for wide-body aircraft'],
                ].map(([pallet, dims, load, std, use]) => (
                  <tr key={pallet} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{pallet}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' }}>{dims}</td>
                    <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>{load}</td>
                    <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>{std}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-faint)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            All specifications audited against EPAL, ISO 6780, and IATA official publications. For the complete list of 15 pallet types, use the calculator above.
          </p>

          {/* Pallet type links */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Calculate by Pallet Type
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Select a standard pallet type to open a pre-filled calculator with its exact dimensions.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {palletsData.map(p => (
              <Link key={p.slug} href={`/pallet/${p.slug}`} style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 14px', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                  {p.lengthCm} × {p.widthCm} cm · {p.maxHeightCm} cm max
                </span>
              </Link>
            ))}
          </div>

          {/* Section 3: Pallet Loading Best Practices */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Pallet Loading Best Practices
          </h2>
          <ul style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 12 }}><strong>Fill the footprint first.</strong> Maximise the pallet area before stacking height. A pallet loaded to 80% area but full height wastes 20% of every layer.</li>
            <li style={{ marginBottom: 12 }}><strong>Interlock layers where possible.</strong> Alternating box orientation between layers (brick pattern) improves stack stability and reduces the need for excessive stretch wrapping.</li>
            <li style={{ marginBottom: 12 }}><strong>Respect the pallet edge.</strong> Overhang beyond the pallet edge causes damage during forklift handling and prevents pallets from fitting into standard racking (typical beam clearance is designed for flush-loaded pallets).</li>
            <li style={{ marginBottom: 12 }}><strong>Check weight before height.</strong> A pallet stacked to maximum height but exceeding the safe working load (SWL) is unsafe. Always check both dimensions.</li>
            <li><strong>Consider the vehicle.</strong> Standard European trailers have an internal height of approximately 2.65–2.70m. With a pallet height of 15cm, the maximum cargo height is typically 220cm (including pallet). For containers, check the internal height of the specific container type.</li>
          </ul>

          {/* Section 4: Vehicle Compatibility */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Pallet Dimensions and Vehicle Compatibility
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                  {['Vehicle / Container', 'Internal Width', 'Internal Height', 'EUR 1 per row', 'EUR 2 per row'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['13.6m Artic Trailer', '2,450 mm', '2,650–2,700 mm', '3 lengthwise or 2 widthwise', '2 widthwise'],
                  ['20ft Container', '2,350 mm', '2,390 mm', '2 widthwise (tight)', '2 widthwise (tight)'],
                  ['40ft Container', '2,350 mm', '2,390 mm', '2 widthwise (tight)', '2 widthwise (tight)'],
                  ['40ft High Cube', '2,350 mm', '2,690 mm', '2 widthwise', '2 widthwise'],
                ].map(([vehicle, width, height, eur1, eur2]) => (
                  <tr key={vehicle} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{vehicle}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 13 }}>{width}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 13 }}>{height}</td>
                    <td style={{ padding: '11px 16px' }}>{eur1}</td>
                    <td style={{ padding: '11px 16px' }}>{eur2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-faint)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Container widths (2,350mm) are tighter than European trailers (2,450mm). Two EUR 1 pallets side by side (2 × 800mm = 1,600mm) fit with clearance, but two EUR 2 pallets (2 × 1,000mm = 2,000mm) leave only 350mm gap — check your specific container.
          </p>

          {/* Section 5: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>How many Euro pallets fit in a 13.6m trailer?</summary>
              <div className="faq-answer">
                33 EUR 1 pallets (1200×800mm) fit in a single floor layer in a standard 13.6m European articulated trailer. If double-stacked, up to 66 can be carried subject to height and weight limits. For EUR 2 pallets (1200×1000mm), 26 fit in a single layer. Use our <Link href="/ldm" style={{ color: '#e87722', textDecoration: 'underline' }}>LDM Calculator</Link> for detailed calculations.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the maximum pallet height for road freight?</summary>
              <div className="faq-answer">
                There is no single universal standard. The practical maximum loaded height for European road freight is approximately 220cm (pallet + cargo) based on a standard trailer internal height of 2.65–2.70m. Some carriers specify lower limits. Always confirm with your carrier.
              </div>
            </details>
            <details className="faq-item">
              <summary>Can boxes overhang the pallet edge?</summary>
              <div className="faq-answer">
                Overhang is strongly discouraged. It causes damage during handling and prevents pallets from fitting into standard racking systems. Most warehouses and carriers require flush-loaded pallets. If overhang is unavoidable, it should be no more than 25mm per side and clearly communicated to the carrier.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the difference between SWL and max gross weight?</summary>
              <div className="faq-answer">
                Safe Working Load (SWL) is the maximum weight a pallet is designed to carry in normal use. Max gross weight includes the pallet&apos;s own weight (tare) plus the cargo. For an EPAL 1 pallet with a tare weight of approximately 25kg and SWL of 1,500kg, the max gross weight is 1,525kg.
              </div>
            </details>
            <details className="faq-item">
              <summary>Which pallet type should I use for air freight?</summary>
              <div className="faq-answer">
                Air freight uses ULD (Unit Load Device) pallets defined by IATA, not standard road pallets. The most common is the PMC (P1P) at 3175×2438mm for main deck loading on wide-body aircraft. Lower deck positions use smaller ULD containers. Standard EUR pallets are used for road transport to and from the airport but are not loaded directly onto aircraft.
              </div>
            </details>
          </div>

        </div>

        <ApiCallout endpoint="/api/pallet" />
        <DataTimestamp text="Pallet specifications per EPAL/ISO 6780, last verified April 2026" />
        <ToolDisclaimer text="Calculations based on standard formulas. Always verify with your carrier for operational specifications." />
        <NewsletterCapture />
        <RelatedTools tools={[
          { href: '/ldm', label: 'Calculate loading metres' },
          { href: '/containers', label: 'Check container capacity for palletised cargo' },
        ]} />

        {/* Ad unit */}

      </main>
    </>
  );
}
