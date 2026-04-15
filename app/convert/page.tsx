import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import RelatedTools from '@/app/components/RelatedTools';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';
import ConvertTool from './ConvertTool';

const ogUrl = '/api/og?title=Freight+Unit+Converter&desc=Chargeable+weight,+freight+tonnes,+and+standard+conversions&api=GET+/api/convert';

export const metadata: Metadata = {
  title: 'Freight Unit Converter — Chargeable Weight, Freight Tonnes & More',
  description: 'Free freight unit converter — CBM to chargeable weight, freight tonnes, kg/lbs, cm/inches and more. Instant results with free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/convert' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Freight Unit Converter — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function ConvertPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'Unit Converter', path: '/convert' }]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Freight Unit Converter","description":"Free Freight Unit Converter. Convert chargeable weight, freight tonnes, CBM, and standard weight/dimension units. REST API available.","url":"https://www.freightutils.com/convert","applicationCategory":"UtilityApplication","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"GBP"},"author":{"@type":"Person","name":"Marius Cristoiu","url":"https://www.linkedin.com/in/marius-cristoiu-a853812a2/"}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I calculate chargeable weight for air freight?","acceptedAnswer":{"@type":"Answer","text":"Multiply L × W × H (cm) and divide by 6,000 to get volumetric weight in kg. Compare to actual gross weight — the higher figure is chargeable. Express carriers use 5,000 divisor."}},{"@type":"Question","name":"What is a freight tonne?","acceptedAnswer":{"@type":"Answer","text":"In sea freight, a freight tonne equals 1 CBM or 1,000 kg, whichever is greater. This is the billing unit for ocean freight."}},{"@type":"Question","name":"What is a short ton vs a long ton?","acceptedAnswer":{"@type":"Answer","text":"Short ton (US) = 2,000 lbs (907 kg). Long ton (UK) = 2,240 lbs (1,016 kg). Metric tonne = 2,205 lbs (1,000 kg). The difference is roughly 10%."}},{"@type":"Question","name":"How do I convert CBM to cubic feet?","acceptedAnswer":{"@type":"Answer","text":"Multiply CBM by 35.3147. Example: 2 CBM = 70.63 cubic feet."}}]}) }} />
      <PageHero title="Unit" titleAccent="Converter" subtitle="Convert freight weights, volumes, and dimensions between metric and imperial" differentiators={['Weight, volume & length', 'Freight-specific units', 'Free API']} category="ops" />

      <main data-category="ops" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Featured Freight Conversions ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Freight-Specific Conversions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
          {/* CBM → Chargeable Weight */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722', marginBottom: 8 }}>
              Air Freight
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              CBM &rarr; Chargeable Weight (kg)
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
              IATA volumetric: 1 CBM = 166.67 kg (divisor 6000). The higher of actual weight vs volumetric weight is chargeable.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', padding: '6px 12px', borderRadius: 6 }}>
              1 CBM &times; 166.67 = 166.67 kg
            </div>
          </div>

          {/* CBM → Freight Tonnes */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722', marginBottom: 8 }}>
              Sea Freight
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              CBM &rarr; Freight Tonnes (W/M)
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
              W/M rule: 1 CBM = 1 freight tonne (revenue tonne). Carrier charges whichever is greater — 1 CBM or 1,000 kg.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', padding: '6px 12px', borderRadius: 6 }}>
              1 CBM &times; 1 = 1 freight tonne
            </div>
          </div>

          {/* Actual vs Volumetric */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722', marginBottom: 8 }}>
              Chargeable Weight
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Actual vs Volumetric Weight
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
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
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Convert Any Unit
        </h2>
        <ErrorBoundary><ConvertTool defaultFrom="cbm" defaultTo="chargeable_kg" /></ErrorBoundary>

        {/* ── Reference Tables ── */}

        {/* Weight Conversions */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, marginTop: 48, letterSpacing: '-0.3px' }}>
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
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
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
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
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

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Understanding Chargeable Weight
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Air freight carriers charge on whichever is higher: actual gross weight or volumetric weight. Volumetric weight is calculated by dividing the cubic centimetre volume by a divisor (6,000 for IATA standard, 5,000 for express couriers). Light, bulky cargo always pays on volume. Use our{' '}
            <Link href="/chargeable-weight" style={{ color: '#e87722', textDecoration: 'underline' }}>chargeable weight calculator</Link>{' '}
            for multi-piece shipments.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            The W/M Rule in Sea Freight
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Ocean carriers price per &ldquo;freight tonne&rdquo; (revenue tonne) using the W/M rule — <strong>W</strong>eight or <strong>M</strong>easurement, whichever yields higher revenue. 1 freight tonne = 1 CBM or 1,000 kg. A 2 CBM shipment weighing 500 kg pays for 2 freight tonnes (volume-based). A 0.5 CBM shipment weighing 2,000 kg pays for 2 freight tonnes (weight-based). Use our{' '}
            <Link href="/cbm" style={{ color: '#e87722', textDecoration: 'underline' }}>CBM calculator</Link>{' '}
            to get the volume side.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Metric vs Imperial in Global Freight
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            European and Asian trade uses metric (kg, cm, CBM). The US uses imperial (lbs, inches, cubic feet). Sea freight quotes in CBM and metric tonnes; US domestic trucking quotes in lbs and cubic feet. Mismatched units cause quoting errors, customs holds, and carrier surcharges.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Common Freight Conversion Mistakes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Short tons vs long tons vs metric tonnes</strong> — Short tons (2,000 lbs / 907 kg) are used in US domestic freight. Long tons (2,240 lbs / 1,016 kg) appear in UK bulk commodities. Metric tonnes (2,204 lbs / 1,000 kg) are the international standard. Confusing these causes billing disputes of 10% or more.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>US gallons vs UK imperial gallons</strong> — A US gallon is 3.785 litres; a UK imperial gallon is 4.546 litres. When shipping liquids, always confirm which gallon your trading partner means.
          </p>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
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

        <ApiCallout endpoint="/api/convert" />

        <NewsletterCapture />

        <RelatedTools tools={[
          { href: '/cbm', label: 'Calculate CBM' },
          { href: '/chargeable-weight', label: 'Calculate chargeable weight' },
        ]} />

        {/* Ad unit */}
        <div style={{ marginTop: 32 }}>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          Conversion factors are standard mathematical constants. Freight-specific calculations use IATA standard divisor (6000). Always verify unit requirements with your carrier or customs authority.
        </p>

      </main>
    </>
  );
}
