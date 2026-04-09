import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCalcIndex } from '@/lib/calculations/adr';
import { SITE_STATS } from '@/lib/constants/siteStats';
import AdrExemptionCalc from './AdrExemptionCalc';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';

const ogUrl = '/api/og?title=ADR+Points+Calculator&desc=Free+1.1.3.6+exemption+check+for+mixed+DG+loads&api=GET+/api/adr-calculator';

export const metadata: Metadata = {
  title: 'ADR Points Calculator — Free 1.1.3.6 Exemption Check',
  description: 'Calculate ADR 1.1.3.6 exemption points for mixed dangerous goods loads. Enter UN numbers and quantities — instant pass/fail result. Free tool, no signup, ADR 2025 data.',
  alternates: { canonical: 'https://www.freightutils.com/adr-calculator' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR Points Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrCalculatorPage() {
  const calcIndex = getCalcIndex();

  return (
    <>
      <PageHero title="ADR 1.1.3.6" titleAccent="Exemption Calculator" subtitle="Check if your mixed dangerous goods load qualifies for the small load exemption" badge="ADR 2025" />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Calculator */}
        <ErrorBoundary><AdrExemptionCalc index={calcIndex} /></ErrorBoundary>

        {/* Data provenance */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12, lineHeight: 1.6 }}>
          Data: {SITE_STATS.adrEdition}, licensed from Labeline.com. {SITE_STATS.adrEntries.toLocaleString()} entries covering all hazard classes. Last verified {SITE_STATS.lastUpdated}.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, lineHeight: 1.6 }}>
          For operational use, always verify against the{' '}
          <a href="https://unece.org/transport/dangerous-goods/adr-2025" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-faint)', textDecoration: 'underline' }}>
            current ADR in force
          </a>.
        </p>

        <ApiCallout endpoint="/api/adr-calculator" />

        {/* ── AUTHORITY CONTENT ── */}
        <div style={{ marginTop: 56 }}>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What Is the ADR 1.1.3.6 Exemption?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>ADR 1.1.3.6</strong> provides a small load exemption that allows the transport of limited amounts of dangerous goods without full ADR compliance. If the total quantity of dangerous goods on a vehicle stays below a calculated threshold, the shipment is exempt from most ADR requirements &mdash; including placarding, vehicle marking, written instructions, and the need for an ADR-trained driver.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            The exemption works on a <strong>points system</strong>. Every dangerous goods substance is assigned a <strong>transport category</strong> (0 through 4) based on its hazard level. Each category has a multiplier: category 1 substances score 50 points per unit, category 2 scores 3 points, category 3 scores 1 point, and category 4 scores 0 (effectively unlimited). If the total points across all substances on the vehicle stay at or below <strong>1,000 points</strong>, the 1.1.3.6 exemption applies.
          </p>

          <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, marginTop: 32, letterSpacing: '-0.3px' }}>
            How the Points Calculator Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Enter each substance by <strong>UN number</strong> and the quantity you are carrying (in kilograms for solids or litres for liquids). The calculator looks up the transport category and multiplier from the ADR 2025 Table A, multiplies <code style={{ fontSize: 13, background: 'var(--bg-code)', padding: '2px 6px', borderRadius: 4 }}>quantity &times; multiplier</code> for each substance, and sums the total. If the total is &le; 1,000 and no transport category 0 substances are present, you qualify for the exemption.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>Transport category 0</strong> substances (the most hazardous, including explosives and certain toxic gases) are <em>never</em> eligible for the 1.1.3.6 exemption, regardless of quantity. If any category 0 substance appears in your load, full ADR compliance is required for the entire vehicle.
          </p>

          <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, marginTop: 32, letterSpacing: '-0.3px' }}>
            Per-Substance Quantity Limits
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Beyond the 1,000-point threshold, ADR 1.1.3.6 also imposes maximum quantities per transport category on a single transport unit. Category 1 substances are limited to 20 kg/L, category 2 to 333 kg/L, and category 3 to 1,000 kg/L. The calculator checks these per-category limits automatically and warns you if any substance exceeds its individual maximum, even if the overall points total is below 1,000.
          </p>

          <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, marginTop: 32, letterSpacing: '-0.3px' }}>
            What the Exemption Means in Practice
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            When a shipment qualifies under 1.1.3.6, the driver does not need an ADR driver training certificate, the vehicle does not need orange plates or placards, and there is no requirement to carry written instructions (formerly &ldquo;Tremcards&rdquo;). The goods must still be properly packaged and labelled at the package level, and the vehicle must carry a 2 kg fire extinguisher. This exemption is widely used in the UK and Europe for small consignments of chemicals, aerosols, paints, and other everyday hazardous goods.
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginTop: 24 }}>
            See also: <Link href="/adr" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>ADR Dangerous Goods Lookup</Link> &middot;{' '}
            <Link href="/adr/lq-eq-checker" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>LQ/EQ Checker</Link> &middot;{' '}
            <Link href="/adr/tunnel-codes" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>ADR Tunnel Codes</Link>
          </p>
        </div>

      </main>
    </>
  );
}
