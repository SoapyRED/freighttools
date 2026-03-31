import type { Metadata } from 'next';
import Link from 'next/link';
import { getSlimIndex, getCalcIndex, ENTRY_COUNT } from '@/lib/calculations/adr';
import AdrTabs from './AdrTabs';
import AdUnit from '@/app/components/AdUnit';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';

const ogUrl = '/api/og?title=ADR+Dangerous+Goods+Lookup&desc=Search+2%2C939+UN+numbers+from+ADR+2025&api=GET+/api/adr';

export const metadata: Metadata = {
  title: 'ADR Dangerous Goods — Lookup & 1.1.3.6 Exemption Calculator | FreightUtils',
  description: 'Free ADR 2025 dangerous goods lookup — search 2,939 entries by UN number and calculate 1.1.3.6 exemption points. Official UNECE data with class, packing group, labels, tunnel codes, and transport category. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/adr' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR Dangerous Goods Lookup — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrPage() {
  const searchIndex = getSlimIndex();
  const calcIndex = getCalcIndex();

  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR Dangerous <span style={{ color: '#e87722' }}>Goods</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 560, margin: '0 auto' }}>
          Search {ENTRY_COUNT.toLocaleString()} UN numbers from ADR 2025 and calculate 1.1.3.6 exemption points &mdash; free, instant, no signup
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Tools */}
        <AdrTabs searchIndex={searchIndex} calcIndex={calcIndex} />

        {/* Data provenance */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          Data: UNECE ADR 2025, licensed from Labeline.com. 2,939 entries covering all hazard classes. Last verified April 2026.
        </p>
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 4, lineHeight: 1.6 }}>
          For operational use, always verify against the{' '}
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
                    <td style={{ padding: '11px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{field}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{desc}</td>
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
                    <td style={{ padding: '11px 16px', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{cls}</td>
                    <td style={{ padding: '11px 16px', fontWeight: 600 }}>{desc}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Transport Categories & 1.1.3.6 Exemption */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Transport Categories and the 1.1.3.6 Exemption
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Every dangerous substance in ADR Table A is assigned a <strong>transport category</strong> from 0 to 4. These categories are the foundation of the ADR 1.1.3.6 small load exemption, which allows certain quantities of dangerous goods to be carried with reduced requirements. Understanding transport categories is essential for any freight operator moving mixed loads that might include small quantities of hazardous materials.
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Category</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Points Multiplier</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Max Quantity Under Exemption</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Typical Substances</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['0', 'No exemption', '0 — never exempt', 'Explosives (1.1A, 1.2B), self-reactive substances'],
                  ['1', '50', '20 kg / 20 L', 'Most Class 1 articles, radioactive material, infectious substances'],
                  ['2', '3', '333 kg / 333 L', 'Petrol (UN1203), many flammable liquids PG II, toxic substances PG I'],
                  ['3', '1', '1,000 kg / 1,000 L', 'Diesel (UN1202), most PG III flammable liquids, corrosives PG II-III'],
                  ['4', '0', 'Unlimited', 'Lithium batteries (UN3481), environmentally hazardous UN3082, aerosols UN1950'],
                ].map(([cat, mult, max, examples]) => (
                  <tr key={cat} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 700, fontFamily: 'monospace' }}>{cat}</td>
                    <td style={{ padding: '11px 16px' }}>{mult}</td>
                    <td style={{ padding: '11px 16px', fontWeight: 600 }}>{max}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The exemption calculation works by multiplying the quantity of each substance (in kg or litres) by the transport category multiplier, then summing all the points. If the total is 1,000 or below, the load qualifies for the 1.1.3.6 exemption. This exemption reduces requirements around vehicle placarding, written instructions, driver training certification (ADR licence), and equipment. It does not exempt the consignor from proper packaging, labelling, and documentation.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For example, carrying 200 litres of petrol (transport category 2, multiplier 3) gives 600 points. Adding 100 kg of a category 3 substance (multiplier 1) adds 100 points, for a total of 700 &mdash; still under 1,000, so the exemption applies. Use our <Link href="/adr-calculator" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR 1.1.3.6 calculator</Link> to check your mixed loads instantly.
          </p>

          {/* Section: Packing Groups */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Packing Groups Explained
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Packing groups indicate the degree of danger presented by a substance and determine the performance standard required of its packaging. ADR assigns three packing groups:
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Packing Group I (PG I)</strong> &mdash; substances presenting high danger. Packaging must meet the most stringent performance tests. Examples include carbon disulphide (Class 3, extremely flammable) and hydrogen cyanide (Class 6.1, highly toxic). PG I substances have lower quantity thresholds for exemptions and more restrictive transport conditions.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Packing Group II (PG II)</strong> &mdash; substances presenting medium danger. This is the most common packing group in everyday freight. Petrol (UN1203), many industrial solvents, and common corrosives like hydrochloric acid fall into PG II.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Packing Group III (PG III)</strong> &mdash; substances presenting low danger. Diesel fuel (UN1202), many paints and adhesives, and dilute acid solutions are typically PG III. These substances still require proper dangerous goods packaging and labelling, but the packaging performance standards are less demanding.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Not all hazard classes use packing groups. Classes 1 (explosives), 2 (gases), 5.2 (organic peroxides), 6.2 (infectious substances), and 7 (radioactive) have their own classification systems. When reading ADR Table A, an empty packing group column indicates that the class uses a different categorisation method.
          </p>

          {/* Section: Reading ADR Labels */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How to Read ADR Hazard Labels
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            ADR hazard labels are the diamond-shaped warning labels affixed to packages, containers, and vehicles carrying dangerous goods. Each label corresponds to a hazard class or division and follows a standardised design specified in ADR Chapter 5.2.2. The labels use a consistent system of colours, symbols, and numbers to communicate hazard information to handlers, emergency responders, and other road users.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Every package must carry the primary hazard label for its class. If the substance has subsidiary risks (for example, a substance that is both flammable and toxic), additional subsidiary hazard labels must also be applied. The class number appears in the bottom corner of the label. A flame symbol indicates flammability (Classes 3, 4), a skull and crossbones indicates toxicity (Class 6.1), a test tube with corrosion indicates corrosive substances (Class 8), and a trefoil symbol indicates radioactive material (Class 7).
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In addition to class labels, packages must display the <strong>UN number</strong> of the substance, preceded by the letters &ldquo;UN&rdquo;. The UN number is shown in black digits at least 12 mm high (6 mm for packages of 5 litres or 5 kg or less). On vehicles and containers, orange-coloured plates display the hazard identification number (Kemler code) in the top half and the UN number in the bottom half. For example, a tanker carrying petrol would show &ldquo;33&rdquo; over &ldquo;1203&rdquo; on its orange plate, where &ldquo;33&rdquo; indicates a highly flammable liquid.
          </p>

          {/* Section 5: Tunnel Restriction Codes */}
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
                    <td style={{ padding: '11px 16px', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{code}</td>
                    <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{meaning}</td>
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

        {/* Learn More */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            Learn More
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { href: '/adr/changes-2025', title: 'ADR 2025 Changes', desc: 'Full summary of what changed in the latest edition' },
              { href: '/adr/tunnel-codes', title: 'Tunnel Codes Guide', desc: 'Categories A–E explained with UK-specific tunnels' },
              { href: '/adr/limited-quantities', title: 'Limited Quantities (LQ)', desc: 'Packaging, exemptions, and the July 2025 training rule' },
              { href: '/adr/training-guide', title: 'ADR Training Guide', desc: 'Who needs training, course types, and UK costs' },
            ].map(g => (
              <Link key={g.href} href={g.href} style={{
                background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
                padding: '16px 18px', textDecoration: 'none', display: 'block',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: '#5a6478', lineHeight: 1.5 }}>{g.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <DataTimestamp text="ADR 2025 data, last updated April 2026" />
        <ToolDisclaimer text="ADR reference data only. Classification is the consignor's legal responsibility. Consult a DGSA for compliance decisions." />
        <RelatedTools tools={[
          { href: '/ldm', label: 'Calculate loading metres for DG shipments' },
          { href: '/containers', label: 'Check container capacity for hazmat cargo' },
          { href: '/hs', label: 'Find the HS code for this substance' },
          { href: '/incoterms', label: 'INCOTERMS for dangerous goods shipping' },
        ]} />

        {/* Ad unit (bottom) */}
        <AdUnit format="auto" />

      </main>
    </>
  );
}
