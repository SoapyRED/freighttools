import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';
import HsSearch from './HsSearch';
import CommonHsCodes from './CommonHsCodes';
import { HsSectionCard } from './HsLinkCard';
import { getSlimIndex, getAllSections, TOTAL_CODES, CHAPTER_COUNT, HEADING_COUNT, SUBHEADING_COUNT, SECTION_COUNT } from '@/lib/calculations/hs';
import { SITE_STATS } from '@/lib/constants/siteStats';

const ogUrl = '/api/og?title=HS+Code+Lookup&desc=Search+6%2C940+Harmonized+System+codes&api=GET+/api/hs';

// Title: keyword "HS Code Lookup" in first 14 chars; dataset size signals depth.
// Meta: "free" + "no login" both included; ≤ 155 chars; mentions tariff/duty.
export const metadata: Metadata = {
  title: { absolute: `Free HS Code Lookup — ${SITE_STATS.hsCodeCount.toLocaleString()} Tariff Codes & Duty Rates` },
  description: `Free HS code lookup across ${SITE_STATS.hsCodeCount.toLocaleString()} Harmonized System codes. Browse by section, chapter, heading. Tariff descriptions, duty rates. REST API, no login.`,
  alternates: { canonical: 'https://www.freightutils.com/hs' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'HS Code Lookup — FreightUtils' }],
    title: `Free HS Code Lookup — ${SITE_STATS.hsCodeCount.toLocaleString()} Tariff Codes & Duty Rates`,
    description: `Free HS code lookup across ${SITE_STATS.hsCodeCount.toLocaleString()} Harmonized System codes. Tariff descriptions, duty rates, REST API. No login.`,
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function HsPage() {
  const index = getSlimIndex();
  const sections = getAllSections();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'HS Code Lookup', path: '/hs' }]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is an HS code?","acceptedAnswer":{"@type":"Answer","text":"A Harmonized System code is a standardised 6-digit number used internationally to classify traded goods. The first 2 digits = chapter, next 2 = heading, final 2 = subheading."}},{"@type":"Question","name":"How many HS codes are there?","acceptedAnswer":{"@type":"Answer","text":"The WCO HS 2022 contains approximately 5,600 6-digit subheadings across 97 chapters and 21 sections. FreightUtils indexes 6,940 codes including all levels."}}]}) }} />
      <PageHero title="HS Code" titleAccent="Lookup" subtitle="Search and browse Harmonized System commodity codes across 21 sections" differentiators={['6,940 HS 2022 codes', 'Section browser', 'Free API']} category="customs" />

      <main data-category="customs" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Common codes quick reference */}
        <CommonHsCodes />

        {/* Search */}
        <ErrorBoundary><HsSearch index={index} /></ErrorBoundary>

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, marginBottom: -32, lineHeight: 1.6 }}>
          HS code reference data (WCO HS 2022). For customs declarations, always verify the correct commodity code with your national tariff authority or customs broker.
        </p>

        {/* ── Section Browser ── */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, marginTop: 48, letterSpacing: '-0.3px' }}>
          Browse by Section
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 48 }}>
          {sections.map(s => (
            <HsSectionCard key={s.numeral} href={`/hs/section/${s.numeral}`} numeral={s.numeral} name={s.name} />
          ))}
        </div>

        {/* ── Authority Content ── */}
        <div style={{ marginTop: 16 }}>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Are HS Codes?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The Harmonized System (HS) is a standardised numerical system for classifying internationally traded products, maintained by the <strong>World Customs Organization (WCO)</strong>. Over 200 countries use the HS as the basis for their customs tariffs and trade statistics.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The system classifies approximately {SUBHEADING_COUNT.toLocaleString()} commodity groups using 6-digit codes, organised into {SECTION_COUNT} sections and {CHAPTER_COUNT} chapters. The first 6 digits are internationally harmonised &mdash; meaning code 090111 refers to the same product (unroasted, non-decaffeinated coffee) in every country in the world.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How HS Codes Are Structured
          </h2>
          <div style={{
            background: 'var(--bg)', border: '1px solid #eef0f4', borderRadius: 10,
            padding: '20px 24px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{item.label}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 8 }}>&mdash; {item.desc}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Sections</strong> ({SECTION_COUNT}, Roman numerals) &rarr; <strong>Chapters</strong> ({CHAPTER_COUNT}, 2-digit) &rarr; <strong>Headings</strong> ({HEADING_COUNT.toLocaleString()}, 4-digit) &rarr; <strong>Subheadings</strong> ({SUBHEADING_COUNT.toLocaleString()}, 6-digit). Countries add digits beyond 6 for their own tariff schedules (UK uses 10 digits, US uses 10 digits, EU uses 8&ndash;10 digits).
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            Why HS Codes Matter
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            HS codes determine: <strong>customs duty rates</strong>, <strong>import/export restrictions</strong>, <strong>trade statistics</strong>, and <strong>regulatory compliance</strong>. Incorrect classification can result in wrong duty payments, customs delays, seized goods, or fines. Every commercial invoice for international trade must include the correct HS code.
          </p>

          {/* FAQ */}
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
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

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            HS Codes and Customs Classification
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Customs classification is the process of assigning the correct HS code to a product before it crosses an international border. This classification determines the rate of customs duty, whether any import or export licences are required, and which trade agreements or preferential tariff rates may apply. Getting the classification wrong can result in overpayment of duty, underpayment (leading to penalties and back-charges), or delays at the border while customs authorities verify the goods.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The classification process follows the <strong>General Rules for the Interpretation of the Harmonized System (GRI)</strong>, a set of six rules published by the WCO. The most important rule is GRI 1, which states that classification should be determined by the terms of the headings and any relevant section or chapter notes. When a product could fall under multiple headings, GRI 3 provides tie-breaking rules based on specificity, essential character, and numerical order.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            In practice, classification can be straightforward for commodity goods (raw coffee beans are clearly 0901) but complex for composite or novel products. A smartphone, for example, could theoretically be classified as a telephone, a camera, a computer, or a radio receiver. The correct classification (8517 — telephone apparatus) is determined by its principal function. For products where the classification is genuinely uncertain, importers can apply for a <strong>Binding Tariff Information (BTI)</strong> ruling from their national customs authority, which provides legal certainty for up to three years.
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            National Tariff Extensions Beyond 6 Digits
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            While the first 6 digits of an HS code are internationally standardised, every country adds its own digits for national tariff and statistical purposes. The <strong>European Union</strong> uses the Combined Nomenclature (CN) with 8 digits, adding two digits to the HS subheading for tariff differentiation. The <strong>United States</strong> uses the Harmonized Tariff Schedule (HTS) with 10 digits. The <strong>United Kingdom</strong> uses a 10-digit commodity code that was based on the EU CN but has diverged since Brexit. China, Japan, India, and other major trading nations each maintain their own extensions.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            This means that while the international 6-digit code is sufficient for identifying the product category, you need the full national code to determine the actual duty rate. For example, HS 090111 (unroasted, non-decaffeinated coffee) has the same 6-digit code worldwide, but the duty rate varies from 0% in the UK to 7.5% in the EU for non-preferential imports. The national extension digits determine which specific tariff rate applies.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            When preparing commercial invoices and customs declarations, always use the full national commodity code — not just the 6-digit HS code. Use this tool to identify the correct HS heading and subheading, then consult your national customs authority for the full code and applicable duty rates.
          </p>
        </div>

        <ApiCallout endpoint="/api/hs" />

        <DataTimestamp text="HS 2022 data from UN Comtrade, last updated May 2026" />
        <ToolDisclaimer text="HS code reference only. For customs declarations, verify with your national tariff authority." />
        <NewsletterCapture />
        <RelatedTools tools={[
          { href: '/chargeable-weight', label: 'Calculate chargeable weight' },
          { href: '/incoterms', label: 'Check INCOTERMS for this shipment' },
          { href: '/adr', label: 'Is this a dangerous good? Check ADR' },
        ]} />

        {/* Ad unit */}
        <div style={{ marginTop: 32 }}>
        </div>

        {/* Data attribution */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          HS code data sourced from UN Comtrade (HS 2022). Published under the Public Domain Dedication and License (PDDL). For official tariff classifications, always consult your national customs authority.
        </p>

      </main>
    </>
  );
}
