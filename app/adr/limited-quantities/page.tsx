import type { Metadata } from 'next';
import Link from 'next/link';
import EmailCapture from '@/app/components/EmailCapture';

const ogUrl = '/api/og?title=ADR+Limited+Quantities&desc=LQ+rules,+packaging+and+exemptions+explained';

export const metadata: Metadata = {
  title: 'ADR Limited Quantities (LQ) — Rules, Packaging & Exemptions | FreightUtils',
  description:
    'Complete guide to ADR limited quantities. LQ packaging requirements, the LQ diamond marking, exemptions from orange plates and Tremcards, and the July 2025 mandatory training change.',
  alternates: { canonical: 'https://www.freightutils.com/adr/limited-quantities' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR Limited Quantities Guide' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrLimitedQuantitiesPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR Limited Quantities (LQ) — <span style={{ color: '#e87722' }}>Rules, Packaging & Exemptions</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 600, margin: '0 auto' }}>
          Limited quantities allow dangerous goods to be transported with reduced requirements — but the rules changed significantly in July 2025.
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>Last updated: April 2026</p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link href="/adr" style={{ color: '#8f9ab0', textDecoration: 'none' }}>ADR Lookup</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#e87722' }}>Limited Quantities</span>
        </nav>

        <article style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 0 }}>
            What Are Limited Quantities?
          </h2>
          <p>
            Limited quantities (LQ) is an ADR provision that allows dangerous goods to be transported with
            significantly reduced regulatory requirements, provided the goods are packed in small inner packagings
            within strong outer packaging. The principle is simple: small quantities of dangerous goods in robust
            consumer-style packaging present a lower risk during transport than bulk or industrial quantities.
          </p>
          <p>
            LQ is one of the most widely used ADR exemptions in practice. It covers everything from household
            cleaning products and aerosol sprays to perfumes, paint samples, adhesives, and nail polish. If your
            business ships any consumer products that happen to be classified as dangerous goods, there is a good
            chance you are (or should be) using the LQ provisions.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            The LQ Column in the Dangerous Goods List
          </h2>
          <p>
            Every entry in the ADR dangerous goods list (Table A) has a limited quantity value in Column 7a. This
            value specifies the maximum quantity of dangerous goods permitted per inner packaging. Common LQ values
            include:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>0</strong> — LQ not permitted for this entry (e.g., most Class 1 explosives, some highly toxic substances)</li>
            <li><strong>1 L</strong> — Maximum 1 litre per inner packaging (common for Class 3 flammable liquids)</li>
            <li><strong>5 L</strong> — Maximum 5 litres per inner packaging (common for lower-risk flammable liquids, PG III)</li>
            <li><strong>1 kg</strong> — Maximum 1 kg per inner packaging (common for some solid dangerous goods)</li>
            <li><strong>5 kg</strong> — Maximum 5 kg per inner packaging</li>
          </ul>
          <p>
            You can check the LQ value for any UN number using the{' '}
            <Link href="/adr" style={{ color: '#e87722', textDecoration: 'underline' }}>FreightUtils ADR lookup</Link> —
            the limited quantity value is displayed on every detail page.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Packaging Requirements
          </h2>
          <p>
            LQ packaging follows a specific structure defined in ADR 3.4:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>
              <strong>Inner packagings:</strong> Each inner packaging must not exceed the LQ value specified for that
              UN number. Inner packagings are bottles, cans, tubes, sachets, or other containers that hold the product.
            </li>
            <li>
              <strong>Outer packaging:</strong> Inner packagings must be placed inside a strong outer packaging. The
              outer packaging can be a cardboard box, shrink-wrapped tray, or other packaging that meets general
              packaging standards. The combined gross mass of the completed package must not exceed 30 kg.
            </li>
            <li>
              <strong>Trays:</strong> Shrink-wrapped or stretch-wrapped trays are acceptable as outer packaging for
              LQ, provided the goods are secured and the tray is robust enough to withstand normal transport conditions.
              The gross mass limit for tray packaging is 20 kg.
            </li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            The LQ Diamond Marking
          </h2>
          <p>
            Packages containing limited quantities must be marked with the LQ diamond — a square-on-point (diamond shape)
            with a black outline and white or contrasting background. The diamond must be at least 100mm x 100mm, or
            50mm x 50mm if the package is too small for the larger version. No UN number, class label, or hazard
            pictogram is required on the outer package — just the LQ diamond.
          </p>
          <p>
            For air transport, the LQ diamond must additionally include the letter &quot;Y&quot; inside the diamond,
            indicating it meets the IATA Dangerous Goods Regulations requirements for limited quantities by air.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            What Exemptions Does LQ Provide?
          </h2>
          <p>
            When dangerous goods are correctly packed and marked as limited quantities, the following ADR requirements
            are <strong>exempt</strong>:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>No orange plates</strong> — The vehicle does not need to display orange plates (unless also carrying non-LQ dangerous goods)</li>
            <li><strong>No Tremcard / safety data sheet in cab</strong> — Instructions in writing (safety cards) are not required for LQ-only loads</li>
            <li><strong>Simplified documentation</strong> — The transport document can use simplified wording, or in some cases, no dangerous goods transport document is required at all</li>
            <li><strong>No vehicle marking</strong> — No placards or hazard signs on the vehicle for LQ-only loads</li>
            <li><strong>No ADR driver training certificate</strong> — The driver does not need an ADR DTC for LQ-only loads</li>
            <li><strong>No equipment requirements</strong> — The additional vehicle equipment (fire extinguishers beyond the standard, wheel chocks, etc.) is not required for LQ-only loads</li>
            <li><strong>Tunnel passage</strong> — LQ loads can pass through all tunnel categories, including Category E</li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            July 2025 Change: Mandatory Chapter 1.3 Training
          </h2>
          <div className="warning-badge warn" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>&#9888;</span>
            <div>
              <strong>ADR 2025 closes a long-standing gap:</strong> From 1 July 2025, all staff handling
              limited quantity dangerous goods must have completed Chapter 1.3 awareness training.
              Previously, broad LQ exemptions meant many handlers received no formal DG training.
            </div>
          </div>
          <p>
            This is one of the most impactful changes in ADR 2025. Previously, the extensive exemptions for LQ
            meant that many warehouse workers, pickers, loaders, and drivers handled LQ goods without any formal
            dangerous goods awareness. The new requirement closes this gap.
          </p>
          <p>
            Chapter 1.3 training covers three components: general awareness (what dangerous goods are and why they
            are regulated), function-specific training (relevant to the person&apos;s role), and safety training
            (emergency response procedures). Training must be documented and refreshed periodically.
          </p>
          <p>
            Read more about the full scope of ADR 2025 changes in our{' '}
            <Link href="/adr/changes-2025" style={{ color: '#e87722', textDecoration: 'underline' }}>
              ADR 2025 changes summary
            </Link>.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Common LQ Shipments
          </h2>
          <p>
            Many everyday products are classified as dangerous goods but are routinely shipped under LQ provisions.
            Common examples include:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>Perfumes and fragrances</strong> — Class 3 flammable liquids (alcohol-based)</li>
            <li><strong>Aerosol sprays</strong> — Class 2.1 flammable gases (deodorants, hairsprays, air fresheners)</li>
            <li><strong>Paint samples and tester pots</strong> — Class 3 flammable liquids (solvent-based paints)</li>
            <li><strong>Cleaning products</strong> — Class 8 corrosives (bleach, drain cleaners, descalers)</li>
            <li><strong>Nail polish and remover</strong> — Class 3 flammable liquids (acetone-based)</li>
            <li><strong>Hand sanitiser</strong> — Class 3 flammable liquids (alcohol-based)</li>
            <li><strong>Adhesives and sealants</strong> — Class 3 or Class 4 (solvent-based adhesives)</li>
            <li><strong>Lighters and lighter refills</strong> — Class 2.1 flammable gases</li>
          </ul>

          {/* Related tools */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: 24, marginTop: 36,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Related Tools
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link href="/adr" style={{ background: '#1a2332', color: '#EF9F27', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                ADR Lookup →
              </Link>
              <Link href="/adr-calculator" style={{ background: '#1a2332', color: '#EF9F27', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                1.1.3.6 Calculator →
              </Link>
              <Link href="/adr/changes-2025" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                ADR 2025 Changes →
              </Link>
              <Link href="/adr/training-guide" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Training Guide →
              </Link>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 36, lineHeight: 1.6, fontStyle: 'italic' }}>
            ADR reference information only. Classification and compliance are the consignor&apos;s and carrier&apos;s
            legal responsibility. Always verify against the current ADR in force and consult a qualified DGSA where required.
          </p>

        </article>

        <EmailCapture />

      </main>
    </>
  );
}
