import type { Metadata } from 'next';
import Link from 'next/link';
import ChargeableWeightCalc from './ChargeableWeightCalc';
import airlinesData from '@/lib/data/airlines.json';

export const metadata: Metadata = {
  title: 'Air Freight Chargeable Weight Calculator | FreightUtils',
  description: 'Calculate air freight chargeable weight instantly. Volumetric vs actual weight — free tool for IATA and express carriers. Supports all volumetric factors.',
  alternates: { canonical: 'https://freightutils.com/chargeable-weight' },
};

// Split airlines by factor for the SEO link section
const standardAirlines = airlinesData.filter(a => a.factor === 6000 && !a.express);
const expressAirlines  = airlinesData.filter(a => a.express);

export default function ChargeableWeightPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Chargeable Weight <span style={{ color: '#e87722' }}>Calculator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Air freight is charged on the higher of actual gross weight or volumetric weight.
          Enter your dimensions to find out which applies and what you&apos;ll pay for.
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        <ChargeableWeightCalc />

        {/* What is chargeable weight */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What is Chargeable Weight?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In air freight, carriers charge based on whichever is <strong>higher</strong>: the actual
            gross weight of your shipment, or its <strong>volumetric weight</strong> — a calculated
            figure that represents how much space the cargo occupies in the aircraft&apos;s hold.
            This prevents light but bulky cargo from being transported at the same rate as dense goods.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The standard formula is: <strong>Volumetric Weight (kg) = L × W × H (cm) ÷ 6,000</strong>.
            Most IATA member airlines use a divisor of 6,000 (so 1 m³ = 166.67 kg chargeable weight).
            Express carriers — FedEx, UPS, DHL — typically use <strong>5,000</strong>, making volumetric
            weight relatively heavier and more likely to apply.
          </p>

          {/* Formula box */}
          <div style={{ background: '#1a2332', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
            <code style={{ display: 'block', fontFamily: "'Courier New', monospace", fontSize: 14, color: '#f59e0b', lineHeight: 1.8 }}>
              Volumetric Weight (kg) = (L × W × H in cm) ÷ Factor<br/>
              <span style={{ color: '#8f9ab0' }}>— Factor = 6,000 (IATA standard) or 5,000 (express)</span><br/>
              <br/>
              Chargeable Weight = MAX(Gross Weight, Volumetric Weight)
            </code>
          </div>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Chargeable Weight by Airline
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Different airlines use different volumetric factors. Select your carrier below for a
            pre-configured calculator.
          </p>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a6478', marginBottom: 10 }}>
              Standard Airlines — Factor 6,000
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {standardAirlines.map(a => (
                <Link key={a.slug} href={`/chargeable-weight/${a.slug}`} style={{
                  background: '#fff', border: '1px solid #d8dce6', borderRadius: 8,
                  padding: '7px 14px', textDecoration: 'none', color: '#1a2332',
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8f9ab0' }}>{a.iata}</span>
                  {a.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a6478', marginBottom: 10 }}>
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

      </main>
    </>
  );
}
