import type { Metadata } from 'next';
import Link from 'next/link';
import PalletFittingCalc from './PalletFittingCalc';
import palletsData from '@/lib/data/pallets.json';
import AdUnit from '@/app/components/AdUnit';

const ogUrl = '/api/og?title=Pallet+Fitting+Calculator&desc=How+many+boxes+fit+on+a+pallet%3F+Visual+layer+diagram.&api=GET+/api/pallet';

export const metadata: Metadata = {
  title: 'Pallet Fitting Calculator — How Many Boxes Fit on a Pallet?',
  description: 'Calculate how many boxes or cartons fit on any pallet. Visual top-down layer diagram. Supports 15 standard pallet types. Free tool for warehouse and logistics professionals.',
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

        {/* How it works */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            How Does the Pallet Fitting Calculator Work?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The calculator uses a <strong>layer-based greedy algorithm</strong> — the same method warehouse
            operatives use when manually building pallet loads. It works in two steps:
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Step 1 — One layer:</strong> The box footprint (length × width) is tiled across the
            pallet footprint using simple integer division. If rotation is enabled, both the original and
            rotated orientations are tried and whichever fits more boxes per layer is chosen.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Step 2 — Stack height:</strong> The number of layers is calculated as{' '}
            <code style={{ background: '#f0f2f5', padding: '1px 5px', borderRadius: 4 }}>
              floor(usable height ÷ box height)
            </code>{' '}
            where usable height = max stack height − pallet board height. If box weight and max pallet
            weight are provided, the result is further capped so total weight never exceeds the pallet rating.
          </p>

          {/* Formula */}
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

          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The <strong>top-down SVG diagram</strong> shows one layer of boxes on the pallet footprint.
            Orange rectangles are boxes; grey space is unused. The diagram scales automatically to
            your input — you can see at a glance whether the arrangement is efficient or has
            significant wasted space at the edges.
          </p>

          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Note: This calculator assumes all boxes are the same size, orientation is consistent
            within each layer, and no overhang beyond the pallet edge. For mixed loads or
            irregular shapes, professional load-planning software is recommended.
          </p>
        </div>

        {/* Pallet type links */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
          Calculate by Pallet Type
        </h2>
        <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          Select a standard pallet type to open a pre-filled calculator with its exact dimensions.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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

        {/* Ad unit */}
        <AdUnit format="auto" />

      </main>
    </>
  );
}
