import type { Metadata } from 'next';
import Link from 'next/link';
import AdUnit from '@/app/components/AdUnit';
import ConvertTool from './ConvertTool';

const ogUrl = '/api/og?title=Weight+%26+Dimension+Converter&desc=Freight+unit+conversions&api=GET+/api/convert';

export const metadata: Metadata = {
  title: 'Freight Weight & Dimension Converter | FreightUtils',
  description: 'Free freight unit converter — convert between kg/lbs, CBM/cubic feet, cm/inches, tonnes/short tons, and more. Common conversion tables included. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/convert' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Weight & Dimension Converter — FreightUtils' }],
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
          Weight &amp; Dimension <span style={{ color: '#e87722' }}>Converter</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 560, margin: '0 auto' }}>
          Convert between metric and imperial units used in freight — weights, volumes, lengths, and freight-specific calculations
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Interactive converter */}
        <ConvertTool />

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
            Why Freight Uses Different Units
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Global freight operates across metric and imperial systems. European and Asian trade uses metric (kg, cm, CBM), while the US uses imperial (lbs, inches, cubic feet). Sea freight quotes in CBM and metric tonnes; US domestic trucking quotes in lbs and cubic feet.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Mismatched units lead to quoting errors, customs holds, and carrier surcharges. A reliable converter eliminates rounding mistakes and ensures your commercial invoice, packing list, and bill of lading all agree.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Freight Tonne vs Metric Tonne
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In sea freight, the &ldquo;freight tonne&rdquo; or &ldquo;revenue tonne&rdquo; follows the W/M rule — whichever is greater: 1 metric tonne (1,000 kg) or 1 CBM. Carriers charge per freight tonne, so a light but bulky shipment pays on volume while a dense shipment pays on weight. Use our{' '}
            <Link href="/cbm" style={{ color: '#e87722', textDecoration: 'underline' }}>CBM calculator</Link>{' '}
            to determine the volume side of the equation.
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
              <summary>How many pounds in a kilogram?</summary>
              <div className="faq-answer">
                1 kg = 2.20462 lbs. This is the most common conversion in international freight — metric countries ship in kilograms, while US carriers and customs declarations often require pounds.
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
            <details className="faq-item">
              <summary>What is a freight tonne?</summary>
              <div className="faq-answer">
                In sea freight, a <strong>freight tonne</strong> (also revenue tonne) equals 1 CBM or 1,000 kg, whichever is greater. This is the billing unit for ocean freight. If your cargo weighs 800 kg but occupies 1.5 CBM, you pay for 1.5 freight tonnes.
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
              GET /api/convert?value=100&amp;from=kg&amp;to=lbs
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
          Conversion factors are standard mathematical constants. Always verify unit requirements with your carrier or customs authority.
        </p>

      </main>
    </>
  );
}
