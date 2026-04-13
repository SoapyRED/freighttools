import type { Metadata } from 'next';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import RelatedTools from '@/app/components/RelatedTools';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import ApiCtaBanner from '@/app/components/ApiCtaBanner';
import LqEqChecker from './LqEqChecker';

const ogUrl = '/api/og?title=ADR+LQ/EQ+Checker&desc=Check+Limited+and+Excepted+Quantity+eligibility&api=POST+/api/adr/lq-check';

export const metadata: Metadata = {
  title: 'ADR LQ/EQ Checker — Limited & Excepted Quantity',
  description: 'Check if your dangerous goods qualify for ADR Limited Quantity (LQ) or Excepted Quantity (EQ) exemptions. Enter multiple UN numbers — instant batch eligibility check. Free, ADR 2025.',
  alternates: { canonical: 'https://www.freightutils.com/adr/lq-eq-checker' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR LQ/EQ Checker — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function LqEqCheckerPage() {
  return (
    <>
      <PageHero
        title="LQ/EQ"
        titleAccent="Checker"
        subtitle="Check Limited & Excepted Quantity eligibility for mixed dangerous goods consignments"
        badge="ADR 2025"
      />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 80px' }}>
        <ErrorBoundary>
          <LqEqChecker />
        </ErrorBoundary>

        {/* Educational content */}
        <div style={{ maxWidth: 700, margin: '48px auto 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            What are Limited Quantities?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            ADR Chapter 3.4 allows dangerous goods to be transported with reduced requirements
            when packaged in small quantities. Each UN number has a maximum quantity per inner
            packaging (Column 7a of Table A). If the quantity per inner packaging is within
            the limit, the goods qualify for Limited Quantity status &mdash; meaning simplified
            labelling, no Tremcard required, and reduced driver training requirements.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>
            What are Excepted Quantities?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            ADR Chapter 3.5 provides even more relaxed requirements for very small quantities.
            Each substance has an EQ code (E1&ndash;E5) that defines maximum quantities per inner
            and outer packaging. E0 means excepted quantities are not permitted. EQ transport
            is exempt from most ADR requirements except basic packaging and labelling rules.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>
            How to Use This Checker
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            Enter the UN number, quantity, and unit (ml, L, g, or kg) for each dangerous good in your
            consignment. The checker compares your quantity against the LQ threshold from ADR Table A
            Column 7a (or the EQ code limits from Column 7b). Each item gets a green tick if it&apos;s
            within the limit, a red cross if it exceeds, or a dash if LQ/EQ isn&apos;t permitted for
            that substance. The overall verdict tells you whether the entire consignment qualifies.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>
            LQ vs EQ &mdash; Key Differences
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            <strong>Limited Quantities (ADR 3.4)</strong> are designed for retail-chain distribution &mdash;
            think supermarket deliveries of cleaning products, aerosols, and paints. The limits are relatively
            generous (typically 1&ndash;5 litres or kg per inner packaging), and there&apos;s no inner packaging
            drop test requirement. LQ packages are marked with the diamond-shaped LQ mark. The vehicle doesn&apos;t
            need orange plates, and the driver needs only basic awareness training rather than a full ADR certificate.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            <strong>Excepted Quantities (ADR 3.5)</strong> cover much smaller amounts &mdash; laboratory samples,
            quality control specimens, and small diagnostic kits. Inner packaging limits are typically 1&ndash;30 ml
            or grams, with outer packaging limits of 300&ndash;1000 ml or grams depending on the EQ code (E1&ndash;E5).
            EQ packages must pass a drop test and have their own specific marking. The transport is almost
            entirely exempt from ADR, but the packaging requirements are stricter than LQ.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>
            Common Examples
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
            <strong>UN 1203 &mdash; Petrol (Gasoline)</strong>: LQ limit is 1 litre per inner packaging,
            EQ code E2 (max 30 ml inner, 500 ml outer). In practice, petrol almost never ships as LQ &mdash;
            the 1 litre limit is too small for most commercial purposes. A 5-litre jerry can exceeds the limit
            and requires full ADR compliance.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
            <strong>UN 1950 &mdash; Aerosols</strong>: one of the most common LQ items. With an LQ limit of
            1 litre per aerosol can, most consumer aerosols (deodorants, spray paints, air fresheners) qualify.
            This is why your supermarket delivery van doesn&apos;t need orange plates &mdash; the aerosols ship
            as Limited Quantities under the diamond LQ mark.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            <strong>UN 3082 &mdash; Environmentally Hazardous Substance (liquid)</strong>: Packing Group III
            with a generous LQ limit of 5 litres. Many cleaning products, pesticides, and industrial chemicals
            fall under this UN number. The 5-litre allowance means most standard retail packaging qualifies
            for LQ without any special transport arrangements.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>
            When LQ/EQ Doesn&apos;t Apply
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            Some substances have &ldquo;0&rdquo; as their LQ limit or &ldquo;E0&rdquo; as their EQ code &mdash;
            meaning no exemption is available at any quantity. This typically applies to the most dangerous materials:
            Class 1 explosives (most divisions), Class 6.2 infectious substances, and Class 7 radioactive materials
            are generally excluded or heavily restricted. Transport category 0 substances (the highest-risk items
            like organic peroxides Type A) also cannot use the 1.1.3.6 small load exemption. For these materials,
            full ADR compliance is always required regardless of quantity.
          </p>

          <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 24 }}>
            References: ADR 2025 Chapter 3.4 (Limited Quantities), Chapter 3.5 (Excepted Quantities),
            Table A Column 7a/7b. Always verify classifications with a certified DGSA for operational use.
          </p>
        </div>

        <ApiCallout method="POST" endpoint="/api/adr/lq-check" example='POST /api/adr/lq-check { "mode": "lq", "items": [{ "un_number": "1203", "quantity": 0.5, "unit": "L" }] }' />

        <div style={{ marginTop: 24 }}>
          <RelatedTools tools={[
            { href: '/adr', label: 'ADR Dangerous Goods Lookup' },
            { href: '/adr?tab=exemption', label: 'ADR 1.1.3.6 Exemption Calculator' },
            { href: '/adr/limited-quantities', label: 'Limited Quantities Guide' },
          ]} />
        </div>

        <ApiCtaBanner />
        <ToolDisclaimer text="This tool is for reference only. Always verify dangerous goods classifications with a certified DGSA for operational transport." />
      </main>
    </>
  );
}
