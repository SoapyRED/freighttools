import type { Metadata } from 'next';
import Link from 'next/link';
import CbmCalc from './CbmCalc';
import containersData from '@/lib/data/containers.json';

export const metadata: Metadata = {
  title: 'CBM Calculator — Cubic Metres Volume Calculator | FreightUtils',
  description: 'Calculate CBM (cubic metres) for freight shipments instantly. Convert to cubic feet, litres, and cubic inches. Free tool for sea and air freight.',
  alternates: { canonical: 'https://freightutils.com/cbm' },
};

const seaContainers = containersData.filter(c => c.category === 'sea');
const airUlds       = containersData.filter(c => c.category === 'air');

export default function CbmPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          CBM <span style={{ color: '#e87722' }}>Calculator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Calculate cubic metres (CBM) for any shipment. Enter length, width, height in centimetres
          and get instant volume in m³, cubic feet, and litres.
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        <CbmCalc />

        {/* What is CBM */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What is CBM in Freight?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>CBM (cubic metre)</strong> is the standard unit of volume used in international
            freight — sea, air, and road — to measure how much space a shipment occupies.
            It is calculated by multiplying length × width × height (all in metres), or by dividing
            the same product in centimetres by 1,000,000. Carriers use CBM to quote LCL sea freight
            rates, compare volumetric vs actual weight for air freight, and plan container loads.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In <strong>LCL (Less than Container Load)</strong> sea freight, you typically pay per CBM
            or per freight tonne — whichever is higher. One freight tonne equals either 1,000 kg or
            1 CBM (the W/M ratio is 1:1). In <strong>air freight</strong>, CBM is converted to
            volumetric weight using the carrier&apos;s divisor (6,000 for IATA airlines, 5,000 for
            express carriers) and compared against actual gross weight — the higher is the chargeable weight.
          </p>

          {/* Formula */}
          <div style={{ background: '#1a2332', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
            <code style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: 14, color: '#f59e0b', lineHeight: 1.8 }}>
              CBM = (Length cm × Width cm × Height cm) ÷ 1,000,000<br/>
              <span style={{ color: '#8f9ab0' }}>— or equivalently: L(m) × W(m) × H(m)</span><br/>
              <br/>
              Total CBM = CBM per piece × Number of pieces
            </code>
          </div>

          {/* Container links */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Calculate CBM by Container Type
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Select a container or ULD below to open a pre-filled calculator with its internal dimensions.
          </p>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a6478', marginBottom: 10 }}>
              Sea Freight Containers
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {seaContainers.map(c => (
                <Link key={c.slug} href={`/cbm/${c.slug}`} style={{
                  background: '#fff', border: '1px solid #d8dce6', borderRadius: 8,
                  padding: '8px 14px', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2332' }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: '#8f9ab0', fontFamily: 'monospace' }}>{c.capacityCbm} m³ max</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a6478', marginBottom: 10 }}>
              Air Freight ULDs
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {airUlds.map(c => (
                <Link key={c.slug} href={`/cbm/${c.slug}`} style={{
                  background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8,
                  padding: '8px 14px', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2332' }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: '#8f9ab0', fontFamily: 'monospace' }}>{c.capacityCbm} m³ max</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
