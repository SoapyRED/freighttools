import type { Metadata } from 'next';
import Link from 'next/link';
import { getSlimIndex, ENTRY_COUNT } from '@/lib/calculations/adr';
import AdrSearch from './AdrSearch';
import AdUnit from '@/app/components/AdUnit';

const ogUrl = '/api/og?title=ADR+Dangerous+Goods+Lookup&desc=Search+2%2C939+UN+numbers+from+ADR+2025&api=GET+/api/adr';

export const metadata: Metadata = {
  title: 'ADR Dangerous Goods Lookup | FreightUtils',
  description: 'Free ADR 2025 dangerous goods lookup — search 2,939 entries by UN number or substance name. Official UNECE data with class, packing group, labels, tunnel codes, and transport category. Free REST API available.',
  alternates: { canonical: 'https://freightutils.com/adr' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR Dangerous Goods Lookup — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrPage() {
  // Build slim index server-side — passed to Client Component as prop
  // (~120 KB raw / ~30 KB gzipped — safe to embed)
  const index = getSlimIndex();

  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR Dangerous Goods <span style={{ color: '#e87722' }}>Lookup</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 500, margin: '0 auto' }}>
          Search {ENTRY_COUNT.toLocaleString()} UN numbers from the ADR 2025 dangerous goods list — free, instant, no signup
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Search */}
        <AdrSearch index={index} />

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          Data sourced from the official UNECE ADR 2025 publication (ECE/TRANS/352). For operational use, always verify against the{' '}
          <a href="https://unece.org/transport/dangerous-goods/adr-2025" target="_blank" rel="noopener noreferrer" style={{ color: '#8f9ab0', textDecoration: 'underline' }}>
            current ADR in force
          </a>.
        </p>

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
              GET /api/adr?un=1203
            </code>
          </div>
          <Link
            href="/api-docs#adr"
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
            View API Docs →
          </Link>
        </div>

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Is ADR? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is ADR?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>ADR</strong> (Accord européen relatif au transport international des marchandises Dangereuses par Route) is the European Agreement concerning the International Carriage of Dangerous Goods by Road. It is a United Nations treaty administered by <strong>UNECE</strong> (the United Nations Economic Commission for Europe) that sets out the rules for transporting hazardous materials by road across 54 contracting parties — covering the EU, UK, and beyond.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            ADR is updated every two years. The current edition, <strong>ADR 2025</strong>, entered into force on 1 January 2025 with a six-month transitional period for full implementation.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The agreement covers classification of dangerous goods, packaging and labelling requirements, vehicle construction and equipment standards, documentation (including the transport document and instructions in writing), and training requirements for drivers and other personnel involved in the carriage of dangerous goods.
          </p>

          {/* Section 2: Understanding ADR Table A */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Understanding ADR Table A
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            Table A of Chapter 3.2 is the core reference in ADR — the complete list of dangerous goods authorised for international road transport. Each entry includes:
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Field</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>What it means</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['UN Number', 'Four-digit identifier assigned by the UN Committee of Experts (e.g. UN1203 for petrol)'],
                  ['Proper Shipping Name (PSN)', 'The official name used on transport documents. Must be used exactly as published — not trade names or abbreviations'],
                  ['Class', 'The primary hazard class (1–9). Determines placarding, segregation, and handling rules'],
                  ['Classification Code', 'A letter/number code indicating the specific hazard within the class (e.g. FC = flammable corrosive)'],
                  ['Packing Group', 'I (great danger), II (medium danger), or III (minor danger). Not all classes use packing groups'],
                  ['Labels', 'The hazard labels required on packages — may include subsidiary hazard labels'],
                  ['Tunnel Restriction Code', 'Determines which road tunnels the goods may pass through (A–E scale, with A being most restrictive)'],
                  ['Transport Category', 'Used for calculating the 1.1.3.6 exemption threshold — categories 0–4'],
                ].map(([field, desc]) => (
                  <tr key={field} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1e2535', whiteSpace: 'nowrap' }}>{field}</td>
                    <td style={{ padding: '11px 16px', color: '#5a6478', lineHeight: 1.5 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: ADR Hazard Classes */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            ADR Hazard Classes
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Class</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Description</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Examples</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Explosives', 'Ammunition, fireworks, detonators'],
                  ['2', 'Gases', 'Propane, oxygen, aerosols'],
                  ['3', 'Flammable liquids', 'Petrol, diesel, paint, adhesives'],
                  ['4.1', 'Flammable solids', 'Matches, sulphur, metal powders'],
                  ['4.2', 'Spontaneously combustible', 'White phosphorus, activated carbon'],
                  ['4.3', 'Dangerous when wet', 'Sodium, lithium, calcium carbide'],
                  ['5.1', 'Oxidising substances', 'Hydrogen peroxide, ammonium nitrate'],
                  ['5.2', 'Organic peroxides', 'Benzoyl peroxide'],
                  ['6.1', 'Toxic substances', 'Pesticides, cyanides, methanol'],
                  ['6.2', 'Infectious substances', 'Clinical waste, biological cultures'],
                  ['7', 'Radioactive material', 'Uranium, medical isotopes'],
                  ['8', 'Corrosive substances', 'Sulphuric acid, sodium hydroxide, batteries'],
                  ['9', 'Miscellaneous dangerous goods', 'Lithium batteries, environmentally hazardous substances, vehicles'],
                ].map(([cls, desc, examples]) => (
                  <tr key={cls} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 700, color: '#1e2535', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{cls}</td>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1e2535' }}>{desc}</td>
                    <td style={{ padding: '11px 16px', color: '#5a6478', lineHeight: 1.5 }}>{examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Tunnel Restriction Codes */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Tunnel Restriction Codes Explained
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Code</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['A', 'Prohibited in tunnels of category A only (most restricted tunnels)'],
                  ['B', 'Prohibited in tunnels of categories B, C, D, and E'],
                  ['C', 'Prohibited in tunnels of categories C, D, and E'],
                  ['D', 'Prohibited in tunnels of categories D and E'],
                  ['E', 'Prohibited in tunnels of category E (least restricted — almost all tunnels)'],
                  ['— (dash)', 'No tunnel restriction'],
                ].map(([code, meaning]) => (
                  <tr key={code} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 700, color: '#1e2535', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{code}</td>
                    <td style={{ padding: '11px 16px', color: '#5a6478', lineHeight: 1.5 }}>{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#8f9ab0', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Tunnel codes appear in parentheses in ADR Table A, e.g. (D/E). Where two codes are shown separated by a slash, the first applies to bulk/tank transport and the second to packages.
          </p>

          {/* Section 5: Variant Entries */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Variant Entries
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Some UN numbers have multiple entries in Table A — these are called <strong>variants</strong>. A single UN number may appear several times with different proper shipping names, hazard divisions, or packing groups. For example, <Link href="/adr/un/0015" style={{ color: '#e87722', textDecoration: 'underline' }}>UN0015</Link> (Ammunition, Smoke) has three entries for different explosive divisions.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            FreightUtils preserves all variant entries from the official ADR 2025 Table A. When you look up a UN number with multiple variants, all entries are displayed so you can identify the correct classification for your specific substance or article.
          </p>

          {/* Section 6: About This Data */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            About This Data
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            This ADR dataset contains <strong>2,939 entries</strong> covering <strong>2,347 unique UN numbers</strong>, rebuilt directly from the official UNECE ADR 2025 publication (ECE/TRANS/352). The source data was purchased as the English/French Digital Package from UN Publications and includes all additions and corrections in the 2025 edition.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For operational decisions — including classification, packaging, labelling, and routing — always refer to the full ADR text and consult your <strong>Dangerous Goods Safety Adviser (DGSA)</strong> where required. This tool is a reference aid, not a substitute for the complete regulation.
          </p>

          {/* Section 7: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>How often is ADR updated?</summary>
              <div className="faq-answer">
                ADR is revised on a two-year cycle. The current edition (<strong>ADR 2025</strong>) is valid from 1 January 2025. The next edition (ADR 2027) will enter into force on 1 January 2027. Each new edition includes a six-month transitional period during which the previous edition may still be applied.
              </div>
            </details>
            <details className="faq-item">
              <summary>What are the 11 new UN numbers in ADR 2025?</summary>
              <div className="faq-answer">
                ADR 2025 added 11 new entries not present in ADR 2023: <strong>UN0514</strong> (fire suppressant devices), <strong>UN3551–3552</strong> (sodium ion batteries), <strong>UN3553</strong> (disilane), <strong>UN3554</strong> (gallium articles), <strong>UN3555</strong> (trifluoromethyltetrazole), <strong>UN3556–3558</strong> (battery-powered vehicles — lithium ion, lithium metal, and sodium ion), <strong>UN3559</strong> (fire suppressant devices, Class 9), and <strong>UN3560</strong> (tetramethylammonium hydroxide solution).
              </div>
            </details>
            <details className="faq-item">
              <summary>What is a Dangerous Goods Safety Adviser (DGSA)?</summary>
              <div className="faq-answer">
                Under ADR Chapter 1.8.3, any undertaking involved in the carriage of dangerous goods by road — or the related packing, loading, filling, or unloading — must appoint a <strong>DGSA</strong>. The adviser must hold a valid DGSA certificate obtained by passing the relevant examination.
              </div>
            </details>
            <details className="faq-item">
              <summary>Does ADR apply in the UK after Brexit?</summary>
              <div className="faq-answer">
                Yes. The UK remains a contracting party to ADR. The Carriage of Dangerous Goods and Use of Transportable Pressure Equipment Regulations 2009 (as amended) implement ADR into UK domestic law. The UK applies ADR 2025 with certain national derogations published by the Department for Transport.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the 1.1.3.6 exemption?</summary>
              <div className="faq-answer">
                ADR section 1.1.3.6 provides exemptions from certain requirements (such as vehicle marking and driver training) when the total quantity of dangerous goods carried does not exceed the thresholds set by transport category. Each substance is assigned a transport category (0–4) with a corresponding maximum quantity. Category 0 has no exemption; category 4 allows unlimited quantities under the exemption.
              </div>
            </details>
            <details className="faq-item">
              <summary>Can I use this data via API?</summary>
              <div className="faq-answer">
                Yes. Every UN number is accessible via our free REST API at <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>/api/adr</code>. No authentication required. Query by UN number (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>?un=1203</code>) or search by name (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>?q=petrol</code>). Full documentation at <Link href="/api-docs" style={{ color: '#e87722', textDecoration: 'underline' }}>/api-docs</Link>.
              </div>
            </details>
          </div>

        </div>

        {/* Ad unit (bottom) */}
        <AdUnit format="auto" />

      </main>
    </>
  );
}
