import type { Metadata } from 'next';
import Link from 'next/link';
import AdUnit from '@/app/components/AdUnit';
import AdrExemptionCalc from './AdrExemptionCalc';
import { getCalcIndex } from '@/lib/calculations/adr';

const ogUrl = '/api/og?title=ADR+1.1.3.6+Exemption+Calculator&desc=Calculate+transport+category+points+for+mixed+DG+loads&api=POST+/api/adr-calculator';

export const metadata: Metadata = {
  title: 'ADR 1.1.3.6 Exemption Calculator — Free Points Calculator | FreightUtils',
  description: 'Free ADR 1.1.3.6 exemption calculator. Calculate transport category points for mixed dangerous goods loads. Instant results with official ADR 2025 data. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/adr-calculator' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR 1.1.3.6 Exemption Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrCalculatorPage() {
  const index = getCalcIndex();

  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          1.1.3.6 Exemption <span style={{ color: '#e87722' }}>Calculator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          Calculate transport category points for mixed dangerous goods loads. Check whether the ADR 1.1.3.6 small load exemption applies.
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Calculator */}
        <AdrExemptionCalc index={index} />

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Is the ADR 1.1.3.6 Exemption? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is the ADR 1.1.3.6 Exemption?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            ADR section 1.1.3.6 provides a simplified transport regime for <strong>small quantities of dangerous goods</strong>. When the total &ldquo;points&rdquo; across all substances in a load stays at or below <strong>1,000</strong>, many of the stricter ADR requirements are relaxed.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            This exemption is widely used by businesses that transport limited quantities &mdash; maintenance companies carrying solvents, farms with pesticides, cleaning product distributors, and construction firms with adhesives and gas cylinders.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            It applies across all <strong>ADR signatory countries</strong> (54 contracting parties including the EU, UK, Switzerland, and Turkey). Post-Brexit, the exemption is mirrored in GB domestic legislation under the <strong>Carriage of Dangerous Goods Regulations 2009</strong> (CDG 2009, as amended).
          </p>

          {/* Section 2: How the Points System Works */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How the Points System Works
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            Each substance in ADR Table A is assigned a <strong>transport category</strong> (0&ndash;4). To calculate whether the exemption applies, multiply each substance&apos;s quantity by its category multiplier. If the sum across all substances is &le; 1,000, the 1.1.3.6 exemption applies.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            <strong>Important:</strong> ADR 1.1.3.6.3 also imposes <strong>per-substance quantity limits</strong>. Even if the total points are under 1,000, the exemption does not apply if any single substance exceeds its category&apos;s maximum quantity. For example, a Category 1 substance is limited to 20&nbsp;kg or litres &mdash; carrying 21&nbsp;litres of a Cat&nbsp;1 substance invalidates the exemption regardless of the points total.
          </p>
          <div className="ref-table-wrap" style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 16 }}>
            <table className="ref-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Transport Category</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Per-Substance Limit</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Multiplier</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Points Formula</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['0', '0 (not permitted)', '—', 'Exemption cannot apply'],
                  ['1', '20 kg or litres', '50', 'quantity × 50'],
                  ['2', '333 kg or litres', '3', 'quantity × 3'],
                  ['3', '1,000 kg or litres', '1', 'quantity × 1'],
                  ['4', 'Unlimited', '0', 'Always 0 points'],
                ].map(([cat, maxQty, multiplier, formula]) => (
                  <tr key={cat} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 700, fontFamily: 'monospace' }}>{cat}</td>
                    <td style={{ padding: '11px 16px' }}>{maxQty}</td>
                    <td style={{ padding: '11px 16px', fontWeight: 600 }}>{multiplier}</td>
                    <td style={{ padding: '11px 16px' }}>{formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: What Changes Under the Exemption */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            What Changes Under the Exemption
          </h2>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>
            NOT required under 1.1.3.6:
          </h3>
          <ul style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 24, paddingLeft: 24 }}>
            <li style={{ marginBottom: 6 }}>ADR driver training certificate (but basic awareness training <strong>IS</strong> still required)</li>
            <li style={{ marginBottom: 6 }}>Orange plates on the vehicle</li>
            <li style={{ marginBottom: 6 }}>Written instructions (though recommended as good practice)</li>
            <li style={{ marginBottom: 6 }}>Full ADR transport document (a simplified document is acceptable)</li>
            <li style={{ marginBottom: 6 }}>Vehicle approval certificate</li>
            <li style={{ marginBottom: 6 }}>Marking and placarding of the transport unit</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>
            Still REQUIRED under 1.1.3.6:
          </h3>
          <ul style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 24, paddingLeft: 24 }}>
            <li style={{ marginBottom: 6 }}>Proper packaging and labelling of individual packages</li>
            <li style={{ marginBottom: 6 }}>Basic awareness training for all personnel involved</li>
            <li style={{ marginBottom: 6 }}>Fire extinguisher in the vehicle</li>
            <li style={{ marginBottom: 6 }}>Segregation rules between incompatible classes</li>
            <li style={{ marginBottom: 6 }}>General safety obligations under ADR Chapter 1.4</li>
          </ul>

          {/* Section 4: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>Does the 1.1.3.6 exemption apply to all hazard classes?</summary>
              <div className="faq-answer">
                It applies to most classes, but substances in <strong>transport category 0</strong> are always excluded. Category 0 includes certain explosives (Class 1), self-reactive substances, organic peroxides, and other high-risk materials. If any item in the load is category 0, full ADR compliance is required for that substance regardless of the total points.
              </div>
            </details>
            <details className="faq-item">
              <summary>Can I mix substances from different transport categories?</summary>
              <div className="faq-answer">
                Yes. The points system is specifically designed for mixed loads. Each substance contributes points based on its own transport category multiplier. The total across all items determines whether the exemption applies.
              </div>
            </details>
            <details className="faq-item">
              <summary>What happens if my load exceeds 1,000 points?</summary>
              <div className="faq-answer">
                Full ADR compliance is required for the entire transport operation. This means ADR-trained driver, orange plates, written instructions, compliant transport documents, and an approved vehicle. There is no partial exemption.
              </div>
            </details>
            <details className="faq-item">
              <summary>Does the 1.1.3.6 exemption apply in the UK after Brexit?</summary>
              <div className="faq-answer">
                Yes. The UK adopted the ADR exemption thresholds into domestic law through the <strong>Carriage of Dangerous Goods Regulations 2009</strong> (as amended). The calculation method and thresholds are identical to ADR. The exemption applies to both domestic and international transport.
              </div>
            </details>
            <details className="faq-item">
              <summary>How do I determine a substance&apos;s transport category?</summary>
              <div className="faq-answer">
                Every entry in ADR Table A includes a transport category column (column 15). You can look up any substance using our <Link href="/adr" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR Lookup tool</Link>. The transport category is shown on each UN number page.
              </div>
            </details>
          </div>

        </div>

        {/* Ad unit (bottom) */}
        <AdUnit format="auto" />

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          Data sourced from the official UNECE ADR 2025 publication (ECE/TRANS/352). This calculator is a reference aid &mdash; for operational decisions, always refer to the full ADR text and consult your{' '}
          <strong>Dangerous Goods Safety Adviser (DGSA)</strong> where required. See the{' '}
          <a href="https://unece.org/transport/dangerous-goods/adr-2025" target="_blank" rel="noopener noreferrer" style={{ color: '#8f9ab0', textDecoration: 'underline' }}>
            current ADR in force
          </a>.
        </p>

      </main>
    </>
  );
}
