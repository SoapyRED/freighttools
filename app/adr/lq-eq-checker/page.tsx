import type { Metadata } from 'next';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import RelatedTools from '@/app/components/RelatedTools';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
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

        <ToolDisclaimer text="This tool is for reference only. Always verify dangerous goods classifications with a certified DGSA for operational transport." />
      </main>
    </>
  );
}
