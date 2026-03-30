import type { Metadata } from 'next';
import Link from 'next/link';
import AdUnit from '@/app/components/AdUnit';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import HsSearch from './HsSearch';
import { HsSectionCard } from './HsLinkCard';
import { getSlimIndex, getAllSections, TOTAL_CODES, CHAPTER_COUNT, HEADING_COUNT, SUBHEADING_COUNT, SECTION_COUNT } from '@/lib/calculations/hs';

const ogUrl = '/api/og?title=HS+Code+Lookup&desc=Search+6%2C940+Harmonized+System+codes&api=GET+/api/hs';

export const metadata: Metadata = {
  title: 'HS Code Lookup — Harmonized System Search | FreightUtils',
  description: 'Free HS code lookup — search and browse all 6,940 Harmonized System codes across 21 sections and 97 chapters. HS 2022 data with free REST API.',
  alternates: { canonical: 'https://www.freightutils.com/hs' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'HS Code Lookup — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function HsPage() {
  const index = getSlimIndex();
  const sections = getAllSections();

  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          HS Code Lookup &mdash; Harmonized System <span style={{ color: '#e87722' }}>Search</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 600, margin: '0 auto' }}>
          Search {TOTAL_CODES.toLocaleString()} HS codes across {SECTION_COUNT} sections and {CHAPTER_COUNT} chapters &mdash; free, instant, no signup
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Search */}
        <HsSearch index={index} />

        {/* ── Section Browser ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, marginTop: 48, letterSpacing: '-0.3px' }}>
          Browse by Section
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 48 }}>
          {sections.map(s => (
            <HsSectionCard key={s.numeral} href={`/hs/section/${s.numeral}`} numeral={s.numeral} name={s.name} />
          ))}
        </div>

        {/* ── Authority Content ── */}
        <div style={{ marginTop: 16 }}>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Are HS Codes?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The Harmonized System (HS) is a standardised numerical system for classifying internationally traded products, maintained by the <strong>World Customs Organization (WCO)</strong>. Over 200 countries use the HS as the basis for their customs tariffs and trade statistics.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The system classifies approximately {SUBHEADING_COUNT.toLocaleString()} commodity groups using 6-digit codes, organised into {SECTION_COUNT} sections and {CHAPTER_COUNT} chapters. The first 6 digits are internationally harmonised &mdash; meaning code 090111 refers to the same product (unroasted, non-decaffeinated coffee) in every country in the world.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How HS Codes Are Structured
          </h2>
          <div style={{
            background: '#f7f8fa', border: '1px solid #eef0f4', borderRadius: 10,
            padding: '20px 24px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, color: '#8f9ab0', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Example: Coffee
            </div>
            {[
              { label: 'Section II', desc: 'Vegetable Products', indent: 0 },
              { label: 'Chapter 09', desc: 'Coffee, tea, mat\u00e9 and spices', indent: 1 },
              { label: 'Heading 0901', desc: 'Coffee, whether or not roasted or decaffeinated', indent: 2 },
              { label: 'Subheading 090111', desc: 'Coffee, not roasted, not decaffeinated', indent: 3 },
            ].map(item => (
              <div key={item.label} style={{
                padding: '8px 12px', marginLeft: item.indent * 24,
                borderLeft: item.indent > 0 ? '2px solid #e87722' : 'none',
                marginBottom: 4,
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2332' }}>{item.label}</span>
                <span style={{ fontSize: 14, color: '#5a6478', marginLeft: 8 }}>&mdash; {item.desc}</span>
              </div>
            ))}
          </div>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Sections</strong> ({SECTION_COUNT}, Roman numerals) &rarr; <strong>Chapters</strong> ({CHAPTER_COUNT}, 2-digit) &rarr; <strong>Headings</strong> ({HEADING_COUNT.toLocaleString()}, 4-digit) &rarr; <strong>Subheadings</strong> ({SUBHEADING_COUNT.toLocaleString()}, 6-digit). Countries add digits beyond 6 for their own tariff schedules (UK uses 10 digits, US uses 10 digits, EU uses 8&ndash;10 digits).
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Why HS Codes Matter
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            HS codes determine: <strong>customs duty rates</strong>, <strong>import/export restrictions</strong>, <strong>trade statistics</strong>, and <strong>regulatory compliance</strong>. Incorrect classification can result in wrong duty payments, customs delays, seized goods, or fines. Every commercial invoice for international trade must include the correct HS code.
          </p>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <details className="faq-item">
              <summary>How many HS codes are there?</summary>
              <div className="faq-answer">
                Approximately {SUBHEADING_COUNT.toLocaleString()} at the international 6-digit level, organised into {CHAPTER_COUNT} chapters and {SECTION_COUNT} sections. The total number of codes across all levels (chapters, headings, and subheadings) is {TOTAL_CODES.toLocaleString()}.
              </div>
            </details>
            <details className="faq-item">
              <summary>Are HS codes the same in every country?</summary>
              <div className="faq-answer">
                The first 6 digits are internationally standardised by the World Customs Organization. Countries add their own digits beyond that for national tariff purposes. For example, the UK uses 10-digit commodity codes, and the US uses 10-digit HTS codes &mdash; but both start with the same 6-digit HS foundation.
              </div>
            </details>
            <details className="faq-item">
              <summary>What is the difference between HS, HTS, and CN codes?</summary>
              <div className="faq-answer">
                <strong>HS</strong> (Harmonized System) is the international 6-digit base maintained by the WCO. <strong>HTS</strong> (Harmonized Tariff Schedule) is used by the US with 10 digits. <strong>CN</strong> (Combined Nomenclature) is used by the EU with 8 digits. All are built on the same 6-digit HS foundation.
              </div>
            </details>
            <details className="faq-item">
              <summary>How do I find the right HS code for my product?</summary>
              <div className="faq-answer">
                Search by product description using the search tool above, or browse by section and chapter. For official classification rulings, consult your national customs authority &mdash; in the UK, use the{' '}
                <a href="https://www.trade-tariff.service.gov.uk/find_commodity" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>UK Trade Tariff</a>; in the US, use the{' '}
                <a href="https://hts.usitc.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>USITC HTS</a>.
              </div>
            </details>
            <details className="faq-item">
              <summary>How often do HS codes change?</summary>
              <div className="faq-answer">
                The WCO updates the Harmonized System every 5 years. The current version is <strong>HS 2022</strong>. The next update (HS 2027) is scheduled for January 2027.
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
              GET /api/hs?q=coffee
            </code>
          </div>
          <Link
            href="/api-docs#hs"
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

        <DataTimestamp text="HS 2022 data from UN Comtrade, last updated March 2026" />
        <RelatedTools tools={[
          { href: '/chargeable-weight', label: 'Calculate import duty weight' },
          { href: '/incoterms', label: 'Check INCOTERMS for this shipment' },
          { href: '/adr', label: 'Is this a dangerous good? Check ADR' },
        ]} />

        {/* Ad unit */}
        <div style={{ marginTop: 32 }}>
          <AdUnit format="auto" />
        </div>

        {/* Data attribution */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          HS code data sourced from UN Comtrade (HS 2022). Published under the Public Domain Dedication and License (PDDL). For official tariff classifications, always consult your national customs authority.
        </p>

      </main>
    </>
  );
}
