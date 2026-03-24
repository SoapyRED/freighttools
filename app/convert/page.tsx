import type { Metadata } from 'next';
import Link from 'next/link';
import AdUnit from '@/app/components/AdUnit';
import ConvertTool from './ConvertTool';

const ogUrl = '/api/og?title=Freight+Unit+Converter&desc=Chargeable+weight,+freight+tonnes,+and+standard+conversions&api=GET+/api/convert';

export const metadata: Metadata = {
  title: 'Freight Unit Converter — Chargeable Weight, Freight Tonnes & More | FreightUtils',
  description: 'Free freight unit converter — CBM to chargeable weight (IATA 6000), CBM to freight tonnes (W/M rule), plus kg/lbs, CBM/cubic feet, cm/inches and more. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/convert' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Freight Unit Converter — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function ConvertPage() {
  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Freight Unit <span style={{ color: '#e87722' }}>Converter</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 560, margin: '0 auto' }}>
          Freight-specific conversions Google can&apos;t answer — chargeable weight, freight tonnes, plus all standard weight, volume, and length conversions
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Featured Freight Conversions ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Freight-Specific Conversions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
          {/* CBM → Chargeable Weight */}
          <div style={{
            background: '#fff', border: '1px solid #d8dce6', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722', marginBottom: 8 }}>
              Air Freight
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>
              CBM &rarr; Chargeable Weight (kg)
            </div>
            <p style={{ fontSize: 13, color: '#5a6478', lineHeight: 1.6, marginBottom: 10 }}>
              IATA volumetric: 1 CBM = 166.67 kg (divisor 6000). The higher of actual weight vs volumetric weight is chargeable.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#1a2332', background: '#f7f8fa', padding: '6px 12px', borderRadius: 6 }}>
              1 CBM &times; 166.67 = 166.67 kg
            </div>
          </div>

          {/* CBM → Freight Tonnes */}
          <div style={{
            background: '#fff', border: '1px solid #d8dce6', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722', marginBottom: 8 }}>
              Sea Freight
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>
              CBM &rarr; Freight Tonnes (W/M)
            </div>
            <p style={{ fontSize: 13, color: '#5a6478', lineHeight: 1.6, marginBottom: 10 }}>
              W/M rule: 1 CBM = 1 freight tonne (revenue tonne). Carrier charges whichever is greater — 1 CBM or 1,000 kg.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#1a2332', background: '#f7f8fa', padding: '6px 12px', borderRadius: 6 }}>
              1 CBM &times; 1 = 1 freight tonne
            </div>
          </div>

          {/* Actual vs Volumetric */}
          <div style={{
            background: '#fff', border: '1px solid #d8dce6', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722', marginBottom: 8 }}>
              Chargeable Weight
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>
              Actual vs Volumetric Weight
            </div>
            <p style={{ fontSize: 13, color: '#5a6478', lineHeight: 1.6, marginBottom: 10 }}>
              Air carriers charge on whichever is higher. Use our dedicated calculator for multi-piece shipments with different dimensions.
            </p>
            <Link href="/chargeable-weight" style={{
              display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#e87722', textDecoration: 'none',
            }}>
              Chargeable Weight Calculator &rarr;
            </Link>
          </div>
        </div>

        {/* Interactive converter */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Convert Any Unit
        </h2>
        <ConvertTool defaultFrom="cbm" defaultTo="chargeable_kg" />

        {/* ── Reference Tables ── */}

        {/* Weight Conversions */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, marginTop: 48, letterSpacing: '-0.3px' }}>
          Weight Conversions
        </h2>
        <div className="ref-table-wrap" style={{ marginBottom: 32 }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Factor</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1 kg', '2.20462 lbs', '\u00D7 2.20462'],
                ['1 tonne', '2,204.62 lbs', '\u00D7 2,204.62'],
                ['1 tonne', '1.10231 short tons (US)', '\u00D7 1.10231'],
                ['1 tonne', '0.984207 long tons (UK)', '\u00D7 0.984207'],
                ['1 lb', '0.453592 kg', '\u00D7 0.453592'],
                ['1 short ton', '907.185 kg', '\u00D7 907.185'],
              ].map(([from, to, factor]) => (
                <tr key={from + to}>
                  <td>{from}</td>
                  <td>{to}</td>
                  <td>{factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Volume Conversions */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Volume Conversions
        </h2>
        <div className="ref-table-wrap" style={{ marginBottom: 32 }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Factor</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1 CBM', '35.3147 ft\u00B3', '\u00D7 35.3147'],
                ['1 CBM', '61,023.7 in\u00B3', '\u00D7 61,023.7'],
                ['1 CBM', '1,000 litres', '\u00D7 1,000'],
                ['1 litre', '0.264172 US gal', '\u00D7 0.264172'],
                ['1 litre', '0.219969 UK gal', '\u00D7 0.219969'],
              ].map(([from, to, factor]) => (
                <tr key={from + to}>
                  <td>{from}</td>
                  <td>{to}</td>
                  <td>{factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Length Conversions */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Length Conversions
        </h2>
        <div className="ref-table-wrap" style={{ marginBottom: 32 }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Factor</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1 cm', '0.393701 inches', '\u00D7 0.393701'],
                ['1 m', '3.28084 feet', '\u00D7 3.28084'],
                ['1 m', '39.3701 inches', '\u00D7 39.3701'],
                ['1 inch', '2.54 cm', '\u00D7 2.54'],
                ['1 foot', '30.48 cm', '\u00D7 30.48'],
              ].map(([from, to, factor]) => (
                <tr key={from + to}>
                  <td>{from}</td>
                  <td>{to}</td>
                  <td>{factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Authority Content ── */}
        <div style={{ marginTop: 56 }}>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Understanding Chargeable Weight
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Air freight carriers charge on whichever is higher: actual gross weight or volumetric weight. Volumetric weight is calculated by dividing the cubic centimetre volume by a divisor (6,000 for IATA standard, 5,000 for express couriers). Light, bulky cargo always pays on volume. Use our{' '}
            <Link href="/chargeable-weight" style={{ color: '#e87722', textDecoration: 'underline' }}>chargeable weight calculator</Link>{' '}
            for multi-piece shipments.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            The W/M Rule in Sea Freight
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Ocean carriers price per &ldquo;freight tonne&rdquo; (revenue tonne) using the W/M rule — <strong>W</strong>eight or <strong>M</strong>easurement, whichever yields higher revenue. 1 freight tonne = 1 CBM or 1,000 kg. A 2 CBM shipment weighing 500 kg pays for 2 freight tonnes (volume-based). A 0.5 CBM shipment weighing 2,000 kg pays for 2 freight tonnes (weight-based). Use our{' '}
            <Link href="/cbm" style={{ color: '#e87722', textDecoration: 'underline' }}>CBM calculator</Link>{' '}
            to get the volume side.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Metric vs Imperial in Global Freight
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            European and Asian trade uses metric (kg, cm, CBM). The US uses imperial (lbs, inches, cubic feet). Sea freight quotes in CBM and metric tonnes; US domestic trucking quotes in lbs and cubic feet. Mismatched units cause quoting errors, customs holds, and carrier surcharges.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Common Freight Conversion Mistakes
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Short tons vs long tons vs metric tonnes</strong> — Short tons (2,000 lbs / 907 kg) are used in US domestic freight. Long tons (2,240 lbs / 1,016 kg) appear in UK bulk commodities. Metric tonnes (2,204 lbs / 1,000 kg) are the international standard. Confusing these causes billing disputes of 10% or more.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>US gallons vs UK imperial gallons</strong> — A US gallon is 3.785 litres; a UK imperial gallon is 4.546 litres. When shipping liquids, always confirm which gallon your trading partner means.
          </p>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>How do I calculate chargeable weight for air freight?</summary>
              <div className="faq-answer">
                Multiply L &times; W &times; H (in cm) and divide by 6,000 to get the volumetric weight in kg. Compare this to the actual gross weight — the higher figure is chargeable. For express carriers (DHL, FedEx, UPS), use a divisor of 5,000 instead. Our <Link href="/chargeable-weight" style={{ color: '#e87722', textDecoration: 'underline' }}>chargeable weight calculator</Link> handles multi-piece shipments automatically.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is a freight tonne?</summary>
              <div className="faq-answer">
                In sea freight, a <strong>freight tonne</strong> (also revenue tonne) equals 1 CBM or 1,000 kg, whichever is greater. This is the billing unit for ocean freight. If your cargo weighs 800 kg but occupies 1.5 CBM, you pay for 1.5 freight tonnes.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is a short ton vs a long ton?</summary>
              <div className="faq-answer">
                A <strong>short ton</strong> (US) = 2,000 lbs (907.185 kg). A <strong>long ton</strong> (UK/imperial) = 2,240 lbs (1,016.05 kg). A <strong>metric tonne</strong> = 2,204.62 lbs (1,000 kg). Always clarify which &ldquo;ton&rdquo; is meant in freight quotes and contracts — the difference between a short ton and a metric tonne is roughly 10%.
              </div>
            </details>
            <details className="faq-item">
              <summary>How do I convert CBM to cubic feet?</summary>
              <div className="faq-answer">
                Multiply CBM by 35.3147. For example, 2 CBM = 70.63 cubic feet. This conversion is needed when moving between international (CBM) and US domestic (cubic feet) freight quotes.
              </div>
            </details>
          </div>

        </div>

        {/* API callout */}
        <div style={{
          marginTop: 48,
          background: '#1a2332',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 4 }}>
              Building something? Use the API.
            </div>
            <code style={{ color: '#e87722', fontSize: 13 }}>
              GET /api/convert?value=10&amp;from=cbm&amp;to=chargeable_kg
            </code>
          </div>
          <Link
            href="/api-docs#convert"
            style={{
              background: '#e87722',
              color: '#fff',
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            View API Docs &rarr;
          </Link>
        </div>

        {/* Ad unit */}
        <div style={{ marginTop: 32 }}>
          <AdUnit format="auto" />
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          Conversion factors are standard mathematical constants. Freight-specific calculations use IATA standard divisor (6000). Always verify unit requirements with your carrier or customs authority.
        </p>

      </main>
    </>
  );
}
