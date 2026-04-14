import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSlimIndex, getCalcIndex, ENTRY_COUNT } from '@/lib/calculations/adr';
import { SITE_STATS } from '@/lib/constants/siteStats';
import AdrTabs from './AdrTabs';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=ADR+Dangerous+Goods+Lookup&desc=Search+2%2C939+UN+numbers+from+ADR+2025&api=GET+/api/adr';

export const metadata: Metadata = {
  title: 'ADR Dangerous Goods — Lookup & 1.1.3.6 Exemption Calculator',
  description: `Search ${SITE_STATS.adrEntries.toLocaleString()} ADR 2025 dangerous goods by UN number. Check 1.1.3.6 exemption, tunnel codes, and LQ limits. Free, instant, API-ready.`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org",
        "@type":"FAQPage",
        "mainEntity":[
          {"@type":"Question","name":"How often is ADR updated?","acceptedAnswer":{"@type":"Answer","text":"ADR is revised on a two-year cycle. The current edition (ADR 2025) is valid from 1 January 2025. The next edition (ADR 2027) will enter into force on 1 January 2027. Each new edition includes a six-month transitional period during which the previous edition may still be applied."}},
          {"@type":"Question","name":"What are the 11 new UN numbers in ADR 2025?","acceptedAnswer":{"@type":"Answer","text":"ADR 2025 added 11 new entries not present in ADR 2023: UN0514 (fire suppressant devices), UN3551–3552 (sodium ion batteries), UN3553 (disilane), UN3554 (gallium articles), UN3555 (trifluoromethyltetrazole), UN3556–3558 (battery-powered vehicles — lithium ion, lithium metal, and sodium ion), UN3559 (fire suppressant devices, Class 9), and UN3560 (tetramethylammonium hydroxide solution)."}},
          {"@type":"Question","name":"What is a Dangerous Goods Safety Adviser (DGSA)?","acceptedAnswer":{"@type":"Answer","text":"Most undertakings involved in the carriage, packing, loading, filling, or unloading of dangerous goods are required to appoint a DGSA under ADR Chapter 1.8.3, subject to exemptions for small quantities and certain ancillary activities. The adviser must hold a valid DGSA certificate obtained by passing the relevant examination."}},
          {"@type":"Question","name":"Does ADR apply in the UK after Brexit?","acceptedAnswer":{"@type":"Answer","text":"Yes. The UK remains a contracting party to ADR. The Carriage of Dangerous Goods and Use of Transportable Pressure Equipment Regulations 2009 (as amended) implement ADR into UK domestic law. The UK applies ADR 2025 with certain national derogations published by the Department for Transport."}},
          {"@type":"Question","name":"What is the 1.1.3.6 exemption?","acceptedAnswer":{"@type":"Answer","text":"ADR section 1.1.3.6 provides exemptions from certain requirements (such as vehicle marking and driver training) when the total quantity of dangerous goods carried does not exceed the thresholds set by transport category. Each substance is assigned a transport category (0–4) with a corresponding maximum quantity. Category 0 has no exemption; category 4 allows unlimited quantities under the exemption."}},
          {"@type":"Question","name":"Can I use this data via API?","acceptedAnswer":{"@type":"Answer","text":"Yes. Every UN number is accessible via the free REST API at /api/adr. No authentication required. Query by UN number (?un=1203) or search by name (?q=petrol). Full documentation at /api-docs."}}
        ]
      }) }} />
      <PageHero title="ADR Dangerous Goods" titleAccent="Lookup" subtitle="Search dangerous goods by UN number, substance name, or hazard class" badge="ADR 2025" differentiators={['2,939 ADR 2025 entries', 'Free API', 'No signup required']} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Tools */}
        <ErrorBoundary><AdrTabs searchIndex={searchIndex} calcIndex={calcIndex} /></ErrorBoundary>

        {/* Data provenance */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          Data: {SITE_STATS.adrEdition}, licensed from Labeline.com. {SITE_STATS.adrEntries.toLocaleString()} entries covering all hazard classes. Last verified {SITE_STATS.lastUpdated}.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, lineHeight: 1.6 }}>
          For operational use, always verify against the{' '}
          <a href="https://unece.org/transport/dangerous-goods/about-adr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-faint)', textDecoration: 'underline' }}>
            current ADR in force
          </a>.
        </p>

        <ApiCallout endpoint="/api/adr" />

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* Section 1: What Is ADR? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is ADR?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>ADR</strong> (Accord européen relatif au transport international des marchandises Dangereuses par Route) is the European Agreement concerning the International Carriage of Dangerous Goods by Road. It is a United Nations treaty administered by <strong>UNECE</strong> (the United Nations Economic Commission for Europe) that sets out the rules for transporting hazardous materials by road across 54 contracting parties — covering the EU, UK, and beyond.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            ADR is updated every two years. The current edition, <strong>ADR 2025</strong>, entered into force on 1 January 2025 with a six-month transitional period for full implementation.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The agreement covers classification of dangerous goods, packaging and labelling requirements, vehicle construction and equipment standards, documentation (including the transport document and instructions in writing), and training requirements for drivers and other personnel involved in the carriage of dangerous goods.
          </p>

          {/* Section 2: Understanding ADR Table A */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Understanding ADR Table A
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            Table A of Chapter 3.2 is the core reference in ADR — the complete list of dangerous goods authorised for international road transport. Each entry includes:
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
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
                  ['Tunnel Restriction Code', 'Determines which road tunnels the goods may pass through. Tunnel categories range from A (least restrictive — most DG permitted) to E (most restrictive — almost no DG permitted). A restriction code of (D/E) means the goods are prohibited from tunnels of categories D and E.'],
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
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            ADR Hazard Classes
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
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
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Transport Categories and the 1.1.3.6 Exemption
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Every dangerous substance in ADR Table A is assigned a <strong>transport category</strong> from 0 to 4. These categories are the foundation of the ADR 1.1.3.6 small load exemption, which allows certain quantities of dangerous goods to be carried with reduced requirements. Understanding transport categories is essential for any freight operator moving mixed loads that might include small quantities of hazardous materials.
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
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
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The exemption calculation works by multiplying the quantity of each substance (in kg or litres) by the transport category multiplier, then summing all the points. If the total is 1,000 or below, the load qualifies for the 1.1.3.6 exemption. This exemption reduces requirements around vehicle placarding, written instructions, driver training certification (ADR licence), and equipment. It does not exempt the consignor from proper packaging, labelling, and documentation.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For example, carrying 200 litres of petrol (transport category 2, multiplier 3) gives 600 points. Adding 100 kg of a category 3 substance (multiplier 1) adds 100 points, for a total of 700 &mdash; still under 1,000, so the exemption applies. Use our <Link href="/adr-calculator" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR 1.1.3.6 calculator</Link> to check your mixed loads instantly.
          </p>

          {/* Section: Packing Groups */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Packing Groups Explained
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Packing groups indicate the degree of danger presented by a substance and determine the performance standard required of its packaging. ADR assigns three packing groups:
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Packing Group I (PG I)</strong> &mdash; substances presenting high danger. Packaging must meet the most stringent performance tests. Examples include carbon disulphide (Class 3, extremely flammable) and hydrogen cyanide (Class 6.1, highly toxic). PG I substances have lower quantity thresholds for exemptions and more restrictive transport conditions.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Packing Group II (PG II)</strong> &mdash; substances presenting medium danger. This is the most common packing group in everyday freight. Petrol (UN1203), many industrial solvents, and common corrosives like hydrochloric acid fall into PG II.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Packing Group III (PG III)</strong> &mdash; substances presenting low danger. Diesel fuel (UN1202), many paints and adhesives, and dilute acid solutions are typically PG III. These substances still require proper dangerous goods packaging and labelling, but the packaging performance standards are less demanding.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Not all hazard classes use packing groups. Classes 1 (explosives), 2 (gases), 5.2 (organic peroxides), 6.2 (infectious substances), and 7 (radioactive) have their own classification systems. When reading ADR Table A, an empty packing group column indicates that the class uses a different categorisation method.
          </p>

          {/* Section: Reading ADR Labels */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How to Read ADR Hazard Labels
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            ADR hazard labels are the diamond-shaped warning labels affixed to packages, containers, and vehicles carrying dangerous goods. Each label corresponds to a hazard class or division and follows a standardised design specified in ADR Chapter 5.2.2. The labels use a consistent system of colours, symbols, and numbers to communicate hazard information to handlers, emergency responders, and other road users.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Every package must carry the primary hazard label for its class. If the substance has subsidiary risks (for example, a substance that is both flammable and toxic), additional subsidiary hazard labels must also be applied. The class number appears in the bottom corner of the label. A flame symbol indicates flammability (Classes 3, 4), a skull and crossbones indicates toxicity (Class 6.1), a test tube with corrosion indicates corrosive substances (Class 8), and a trefoil symbol indicates radioactive material (Class 7).
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In addition to class labels, packages must display the <strong>UN number</strong> of the substance, preceded by the letters &ldquo;UN&rdquo;. The UN number is shown in black digits at least 12 mm high (6 mm for packages of 5 litres or 5 kg or less). On vehicles and containers, orange-coloured plates display the hazard identification number (Kemler code) in the top half and the UN number in the bottom half. For example, a tanker carrying petrol would show &ldquo;33&rdquo; over &ldquo;1203&rdquo; on its orange plate, where &ldquo;33&rdquo; indicates a highly flammable liquid.
          </p>

          {/* Section 5: Tunnel Restriction Codes */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Tunnel Restriction Codes Explained
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Code</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['A', 'Passage prohibited through Category A tunnels only — very few tunnels apply this restriction'],
                  ['B', 'Prohibited through tunnels of categories B, C, D, and E'],
                  ['C', 'Prohibited through tunnels of categories C, D, and E'],
                  ['D', 'Prohibited through tunnels of categories D and E'],
                  ['E', 'Prohibited through Category E tunnels only — only the most restrictive tunnels'],
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
          <p style={{ color: 'var(--text-faint)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Tunnel codes appear in parentheses in ADR Table A, e.g. (D/E). Where two codes are shown separated by a slash, the first applies to bulk/tank transport and the second to packages.
          </p>

          {/* Section 5: Variant Entries */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Variant Entries
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Some UN numbers have multiple entries in Table A — these are called <strong>variants</strong>. A single UN number may appear several times with different proper shipping names, hazard divisions, or packing groups. For example, <Link href="/adr/un/0015" style={{ color: '#e87722', textDecoration: 'underline' }}>UN0015</Link> (Ammunition, Smoke) has three entries for different explosive divisions.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            FreightUtils preserves all variant entries from the official ADR 2025 Table A. When you look up a UN number with multiple variants, all entries are displayed so you can identify the correct classification for your specific substance or article.
          </p>

          {/* Section 6: About This Data */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            About This Data
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            This ADR dataset contains <strong>{SITE_STATS.adrEntries.toLocaleString()} entries</strong> covering <strong>2,347 unique UN numbers</strong>, licensed from Labeline.com, sourced from the official {SITE_STATS.adrEdition} publication (ECE/TRANS/352). The dataset includes all additions and corrections in the 2025 edition.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            For operational decisions — including classification, packaging, labelling, and routing — always refer to the full ADR text and consult your <strong>Dangerous Goods Safety Adviser (DGSA)</strong> where required. This tool is a reference aid, not a substitute for the complete regulation.
          </p>

          {/* Section 7: FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
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
                Most undertakings involved in the carriage, packing, loading, filling, or unloading of dangerous goods are required to appoint a <strong>DGSA</strong> under ADR Chapter 1.8.3, subject to exemptions for small quantities and certain ancillary activities. The adviser must hold a valid DGSA certificate obtained by passing the relevant examination. See <a href="https://www.gov.uk/guidance/moving-dangerous-goods" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>GOV.UK guidance</a> for full details.
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

        {/* Most Searched Substances */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>
            Most Searched Substances
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
            Quick access to the most commonly looked up UN numbers in ADR 2025.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { un: '1203', name: 'Petrol / Gasoline', cls: '3' },
              { un: '1202', name: 'Diesel Fuel', cls: '3' },
              { un: '1263', name: 'Paint', cls: '3' },
              { un: '3481', name: 'Lithium Ion Batteries (in equipment)', cls: '9' },
              { un: '1950', name: 'Aerosols', cls: '2' },
              { un: '3082', name: 'Environmentally Hazardous Substance', cls: '9' },
              { un: '1993', name: 'Flammable Liquid NOS', cls: '3' },
              { un: '2794', name: 'Batteries, Wet (acid)', cls: '8' },
              { un: '1090', name: 'Acetone', cls: '3' },
              { un: '3480', name: 'Lithium Ion Batteries', cls: '9' },
            ].map(s => (
              <Link key={s.un} href={`/adr/un/${s.un}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 14px', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }} className="pricing-card">
                <span style={{
                  background: '#1a2332', color: '#e87722', fontWeight: 700, fontSize: 13,
                  padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', flexShrink: 0,
                }}>
                  {s.un}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>Class {s.cls}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Learn More */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
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
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '16px 18px', textDecoration: 'none', display: 'block',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{g.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <DataTimestamp text="ADR 2025 data, last updated April 2026" />
        <ToolDisclaimer text="ADR reference data only. Classification is the consignor's legal responsibility. Consult a DGSA for compliance decisions." />
        <NewsletterCapture />
        <RelatedTools tools={[
          { href: '/ldm', label: 'Calculate loading metres for DG shipments' },
          { href: '/containers', label: 'Check container capacity for hazmat cargo' },
          { href: '/hs', label: 'Find the HS code for this substance' },
          { href: '/incoterms', label: 'INCOTERMS for dangerous goods shipping' },
        ]} />

        {/* Ad unit (bottom) */}

      </main>
    </>
  );
}
