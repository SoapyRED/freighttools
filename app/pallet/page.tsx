import type { Metadata } from 'next';
import Link from 'next/link';
import PalletFittingCalc from './PalletFittingCalc';
import palletsData from '@/lib/data/pallets.json';
import AdUnit from '@/app/components/AdUnit';

const ogUrl = '/api/og?title=Pallet+Fitting+Calculator&desc=How+many+boxes+fit+on+a+pallet%3F+Visual+layer+diagram.&api=GET+/api/pallet';

export const metadata: Metadata = {
  title: 'Pallet Fitting Calculator — How Many Boxes Fit on a Pallet?',
  description: 'Free pallet fitting calculator — calculate how many boxes fit on a pallet. 15 pallet types including EUR/EPAL, GMA, and IATA air freight. Audited dimensions, loading best practices, and vehicle compatibility. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/pallet' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Pallet Fitting Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function PalletPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Pallet Fitting <span style={{ color: '#e87722' }}>Calculator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Enter your pallet and box dimensions to see exactly how many boxes fit per layer,
          how many layers stack within the height limit, and a live top-down diagram of the arrangement.
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        <PalletFittingCalc />

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Is Pallet Fitting? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is Pallet Fitting?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Pallet fitting (also called pallet loading or pallet optimisation) is the process of calculating how many boxes, cartons, or items can be loaded onto a pallet while respecting the pallet&apos;s dimensions and weight limits.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Efficient pallet loading reduces shipping costs, minimises wasted space, and ensures cargo stability during transport. A well-packed pallet uses the full footprint and stacks to a safe height without overhanging the pallet edges — overhang increases the risk of damage during handling and can prevent pallets from fitting into racking systems.
          </p>

          {/* Algorithm explainer */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How Does the Calculator Work?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The calculator uses a <strong>layer-based greedy algorithm</strong> — the same method warehouse operatives use when manually building pallet loads. It works in two steps:
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Step 1 — One layer:</strong> The box footprint (length × width) is tiled across the pallet footprint using simple integer division. If rotation is enabled, both orientations are tried and whichever fits more boxes per layer is chosen.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Step 2 — Stack height:</strong> The number of layers is calculated as <code style={{ background: '#f0f2f5', padding: '1px 5px', borderRadius: 4 }}>floor(usable height ÷ box height)</code> where usable height = max stack height − pallet board height. If box weight and max pallet weight are provided, the result is further capped so total weight never exceeds the pallet rating.
          </p>
          <div style={{ background: '#1a2332', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
            <code style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: 13, color: '#f59e0b', lineHeight: 2 }}>
              Boxes per layer = floor(pallet L ÷ box L) × floor(pallet W ÷ box W)<br />
              <span style={{ color: '#8f9ab0' }}>— repeated for rotated orientation, best wins</span><br />
              <br />
              Layers = floor((max stack height − pallet board height) ÷ box height)<br />
              <br />
              Total boxes = boxes per layer × layers
            </code>
          </div>

          {/* Section 2: Common Pallet Types */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Common Pallet Types and Dimensions
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            FreightUtils includes 15 pallet types with specifications audited against official standards from EPAL, ISO 6780, and IATA.
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
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
          <p style={{ color: '#8f9ab0', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            All specifications audited against EPAL, ISO 6780, and IATA official publications. For the complete list of 15 pallet types, use the calculator above.
          </p>

          {/* Pallet type links */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Calculate by Pallet Type
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Select a standard pallet type to open a pre-filled calculator with its exact dimensions.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {palletsData.map(p => (
              <Link key={p.slug} href={`/pallet/${p.slug}`} style={{
                background: '#fff', border: '1px solid #d8dce6', borderRadius: 8,
                padding: '8px 14px', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2332' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#8f9ab0', fontFamily: 'monospace' }}>
                  {p.lengthCm} × {p.widthCm} cm · {p.maxHeightCm} cm max
                </span>
              </Link>
            ))}
          </div>

          {/* Section 3: Pallet Loading Best Practices */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Pallet Loading Best Practices
          </h2>
          <ul style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 12 }}><strong>Fill the footprint first.</strong> Maximise the pallet area before stacking height. A pallet loaded to 80% area but full height wastes 20% of every layer.</li>
            <li style={{ marginBottom: 12 }}><strong>Interlock layers where possible.</strong> Alternating box orientation between layers (brick pattern) improves stack stability and reduces the need for excessive stretch wrapping.</li>
            <li style={{ marginBottom: 12 }}><strong>Respect the pallet edge.</strong> Overhang beyond the pallet edge causes damage during forklift handling and prevents pallets from fitting into standard racking (typical beam clearance is designed for flush-loaded pallets).</li>
            <li style={{ marginBottom: 12 }}><strong>Check weight before height.</strong> A pallet stacked to maximum height but exceeding the safe working load (SWL) is unsafe. Always check both dimensions.</li>
            <li><strong>Consider the vehicle.</strong> Standard European trailers have an internal height of approximately 2.65–2.70m. With a pallet height of 15cm, the maximum cargo height is typically 220cm (including pallet). For containers, check the internal height of the specific container type.</li>
          </ul>

          {/* Section 4: Vehicle Compatibility */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Pallet Dimensions and Vehicle Compatibility
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
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
          <p style={{ color: '#8f9ab0', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Container widths (2,350mm) are tighter than European trailers (2,450mm). Two EUR 1 pallets side by side (2 × 800mm = 1,600mm) fit with clearance, but two EUR 2 pallets (2 × 1,000mm = 2,000mm) leave only 350mm gap — check your specific container.
          </p>

          {/* Section 5: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
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

        {/* Ad unit */}
        <AdUnit format="auto" />

      </main>
    </>
  );
}
