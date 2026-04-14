import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import { getAllIncoterms, getAnyMode, getSeaOnly, INCOTERM_COUNT } from '@/lib/calculations/incoterms';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=INCOTERMS+2020+Reference&desc=All+11+trade+terms+explained&api=GET+/api/incoterms';

export const metadata: Metadata = {
  title: 'INCOTERMS 2020 Reference — All 11 Trade Terms Explained',
  description: 'Free INCOTERMS 2020 guide — all 11 trade terms with buyer/seller responsibilities, risk transfer, and comparison table. Free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/incoterms' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'INCOTERMS 2020 Reference — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function IncotermsPage() {
  const anyMode = getAnyMode();
  const seaOnly = getSeaOnly();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'INCOTERMS 2020', path: '/incoterms' }]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the difference between FOB and CIF?","acceptedAnswer":{"@type":"Answer","text":"Under FOB, the seller delivers goods on board the vessel and the buyer arranges freight and insurance. Under CIF, the seller pays for both freight and insurance to the destination port."}},{"@type":"Question","name":"Which INCOTERM should I use for containerised cargo?","acceptedAnswer":{"@type":"Answer","text":"The ICC recommends FCA instead of FOB for containerised cargo. FCA aligns the risk transfer point with the actual handover at the terminal."}},{"@type":"Question","name":"Are INCOTERMS legally binding?","acceptedAnswer":{"@type":"Answer","text":"INCOTERMS are not law — they become binding only when both parties incorporate them into their contract. They are widely recognised by courts and arbitration bodies."}},{"@type":"Question","name":"What does DDP mean for VAT and import duties?","acceptedAnswer":{"@type":"Answer","text":"Under DDP, the seller is responsible for all costs including import clearance, duties, and VAT in the destination country."}}]}) }} />
      <PageHero title="INCOTERMS" titleAccent="2020" subtitle="International commercial terms — who pays, who bears risk, where responsibility transfers" differentiators={['All 11 rules', 'Buyer vs seller breakdown', 'Free API']} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Quick Reference Cards ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>
          Quick Reference
        </h2>

        {/* Any Mode of Transport */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, marginTop: 24 }}>
          Any Mode of Transport
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          {anyMode.map(term => (
            <Link
              key={term.code}
              href={`/incoterms/${term.slug}`}
              style={{
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: 16,
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={undefined}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                {term.code}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                {term.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                {term.summary}
              </div>
              <span style={{
                display: 'inline-block',
                background: '#fff7ed',
                color: '#9a3412',
                border: '1px solid #fdba74',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
              }}>
                Any mode
              </span>
            </Link>
          ))}
        </div>

        {/* Sea and Inland Waterway Only */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>
          Sea and Inland Waterway Only
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 48,
        }}>
          {seaOnly.map(term => (
            <Link
              key={term.code}
              href={`/incoterms/${term.slug}`}
              style={{
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: 16,
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                {term.code}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                {term.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                {term.summary}
              </div>
              <span style={{
                display: 'inline-block',
                background: '#dbeafe',
                color: '#1e40af',
                border: '1px solid #93c5fd',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
              }}>
                Sea &amp; Inland Waterway
              </span>
            </Link>
          ))}
        </div>

        {/* ── Comparison Table ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          INCOTERMS 2020 Comparison Table
        </h2>
        <div className="ref-table-wrap" style={{ marginBottom: 48 }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Risk Transfer</th>
                <th>Seller Pays Transport?</th>
                <th>Seller Pays Insurance?</th>
                <th>Seller Handles Import?</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['EXW', "Seller's premises", 'No', 'No', 'No', 'Any'],
                ['FCA', 'First carrier', 'No', 'No', 'No', 'Any'],
                ['CPT', 'First carrier', 'Yes', 'No', 'No', 'Any'],
                ['CIP', 'First carrier', 'Yes', 'Yes (Clause A)', 'No', 'Any'],
                ['DAP', 'Destination', 'Yes', 'No', 'No', 'Any'],
                ['DPU', 'Destination (unloaded)', 'Yes', 'No', 'No', 'Any'],
                ['DDP', 'Destination', 'Yes', 'Yes', 'Yes', 'Any'],
                ['FAS', 'Alongside ship', 'No', 'No', 'No', 'Sea & IW'],
                ['FOB', 'On board vessel', 'No', 'No', 'No', 'Sea & IW'],
                ['CFR', 'On board vessel', 'Yes', 'No', 'No', 'Sea & IW'],
                ['CIF', 'On board vessel', 'Yes', 'Yes (Clause C)', 'No', 'Sea & IW'],
              ].map(([term, risk, transport, insurance, importCl, mode]) => (
                <tr key={term}>
                  <td><strong>{term}</strong></td>
                  <td>{risk}</td>
                  <td>{transport}</td>
                  <td>{insurance}</td>
                  <td>{importCl}</td>
                  <td>{mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          {/* What Are INCOTERMS? */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Are INCOTERMS?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>INCOTERMS</strong> (International Commercial Terms) are a set of 11 standardised trade terms published by the <strong>International Chamber of Commerce (ICC)</strong>. They define the responsibilities, costs, and risks between buyers and sellers in international and domestic trade transactions.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The current edition, <strong>INCOTERMS 2020</strong>, came into effect on 1 January 2020 and replaced the previous 2010 edition. These terms are incorporated into sales contracts worldwide and are recognised by courts and trade authorities in virtually every country.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Each INCOTERM specifies which party (buyer or seller) is responsible for arranging transport, paying freight costs, arranging and paying for insurance, handling export and import customs clearance, and bearing risk during transit. They do <strong>not</strong> cover transfer of ownership, payment terms, or remedies for breach of contract.
          </p>

          {/* Key Changes in INCOTERMS 2020 */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Key Changes in INCOTERMS 2020
          </h2>
          <ul style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.8, marginBottom: 14, paddingLeft: 24 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>DAT renamed to DPU</strong> — Delivered at Terminal (DAT) was renamed to Delivered at Place Unloaded (DPU) to clarify that delivery can occur at any named place, not just a terminal or port.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>CIP insurance upgraded to Clause A</strong> — Under CIP, the seller must now arrange all-risks insurance (ICC Clause A) instead of the basic cover (ICC Clause C) required under INCOTERMS 2010. CIF remains at Clause C for sea transport.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>FCA and bills of lading</strong> — FCA now includes a provision allowing the buyer to instruct their carrier to issue an on-board bill of lading to the seller, addressing a longstanding problem with letter of credit transactions.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>Security-related obligations</strong> — All 11 terms now include explicit allocation of security-related transport obligations, reflecting the increased importance of cargo security in global supply chains.
            </li>
          </ul>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>What is the difference between FOB and CIF?</summary>
              <div className="faq-answer">
                Under <strong>FOB</strong> (Free on Board), the seller delivers goods on board the vessel at the port of shipment and the buyer arranges and pays for sea freight and insurance. Under <strong>CIF</strong> (Cost, Insurance and Freight), the seller pays for both the freight and insurance to the destination port. In both cases, risk transfers to the buyer when goods are loaded on board the vessel at the origin port — the key difference is who pays for transport and insurance.
              </div>
            </details>
            <details className="faq-item">
              <summary>Which INCOTERM should I use for containerised cargo?</summary>
              <div className="faq-answer">
                The ICC recommends <strong>FCA</strong> (Free Carrier) instead of FOB for containerised cargo. With containers, the seller typically delivers goods to a container terminal — not directly on board the vessel. FOB technically requires delivery on board the ship, which creates an ambiguity for containers that are loaded by the terminal operator. FCA aligns the risk transfer point with the actual handover at the terminal.
              </div>
            </details>
            <details className="faq-item">
              <summary>Are INCOTERMS legally binding?</summary>
              <div className="faq-answer">
                INCOTERMS are not law — they are <strong>contractual terms</strong> that become binding only when both parties agree to incorporate them into their sales contract. To use them, the contract should reference the specific term and edition (e.g. &quot;FCA [named place] INCOTERMS 2020&quot;). They are widely recognised by courts and arbitration bodies around the world.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the difference between CIP and CIF?</summary>
              <div className="faq-answer">
                <strong>CIP</strong> (Carriage and Insurance Paid To) applies to any mode of transport, while <strong>CIF</strong> (Cost, Insurance and Freight) is for sea and inland waterway only. Since INCOTERMS 2020, CIP requires the seller to arrange all-risks insurance (ICC Clause A), whereas CIF only requires basic cover (ICC Clause C). CIP is recommended for multimodal and containerised shipments.
              </div>
            </details>
            <details className="faq-item">
              <summary>What does DDP mean for VAT and import duties?</summary>
              <div className="faq-answer">
                Under <strong>DDP</strong> (Delivered Duty Paid), the seller is responsible for all costs including import customs clearance, duties, and taxes (such as VAT/GST) in the destination country. This means the seller may need to register for VAT in the buyer&apos;s country or appoint a fiscal representative. DDP offers maximum convenience for the buyer but places significant obligations on the seller.
              </div>
            </details>
            <details className="faq-item">
              <summary>Can I use this data via API?</summary>
              <div className="faq-answer">
                Yes. All {INCOTERM_COUNT} INCOTERMS are accessible via our free REST API at <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>/api/incoterms</code>. No authentication required. Query all terms or look up by code (e.g. <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>/api/incoterms?code=FOB</code>). Full documentation at <Link href="/api-docs" style={{ color: '#e87722', textDecoration: 'underline' }}>/api-docs</Link>.
              </div>
            </details>
          </div>

        </div>

        <ApiCallout endpoint="/api/incoterms" />

        <DataTimestamp text="INCOTERMS 2020, current as of April 2026" />
        <ToolDisclaimer text="INCOTERMS 2020 reference based on ICC official rules. For contractual use, consult the full ICC publication." />
        <NewsletterCapture />
        <RelatedTools tools={[
          { href: '/hs', label: 'Look up HS codes for customs' },
          { href: '/chargeable-weight', label: 'Calculate chargeable weight' },
        ]} />

        {/* Ad unit */}
        <div style={{ marginTop: 32 }}>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          INCOTERMS is a registered trademark of the International Chamber of Commerce (ICC). This tool provides general guidance only — always refer to the official ICC publication for contractual purposes.
        </p>

      </main>
    </>
  );
}
