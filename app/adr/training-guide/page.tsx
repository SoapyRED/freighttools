import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import EmailCapture from '@/app/components/EmailCapture';

const ogUrl = '/api/og?title=ADR+Training+Requirements&desc=Who+needs+ADR+training+and+what+it+covers';

export const metadata: Metadata = {
  title: 'ADR Training Requirements — Who Needs It & What It Covers',
  description:
    'Complete guide to ADR training in the UK. Driver training certificates, Chapter 1.3 awareness training, DGSA qualifications, course structures, and typical costs. Use FreightUtils as a free revision tool.',
  alternates: { canonical: 'https://www.freightutils.com/adr/training-guide' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR Training Requirements Guide' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrTrainingGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'ADR Dangerous Goods', path: '/adr' }, { name: 'Training Guide', path: '/adr/training-guide' }]) }} />
      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR Training Requirements — <span style={{ color: '#e87722' }}>Who Needs It & What It Covers</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-faint)', maxWidth: 600, margin: '0 auto' }}>
          Understanding who needs ADR training, what the different qualification levels are, and how to prepare.
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>Last updated: May 2026</p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link href="/adr" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>ADR Lookup</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#e87722' }}>Training Guide</span>
        </nav>

        <article style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 0 }}>
            Who Needs ADR Training?
          </h2>
          <p>
            ADR training requirements apply to everyone involved in the transport of dangerous goods by road — not
            just drivers. The specific level of training depends on your role, but the principle is clear: if you
            handle, pack, load, send, receive, or transport dangerous goods, you need appropriate training.
          </p>
          <p>
            The main groups who need ADR training include:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>Drivers</strong> — who physically transport dangerous goods in vehicles</li>
            <li><strong>Warehouse staff</strong> — who store, pick, or handle dangerous goods</li>
            <li><strong>Packers and loaders</strong> — who prepare dangerous goods for transport or load them onto vehicles</li>
            <li><strong>Office and booking staff</strong> — who classify goods, complete transport documents, or arrange DG shipments</li>
            <li><strong>Managers and supervisors</strong> — responsible for DG operations</li>
            <li><strong>Emergency response personnel</strong> — who may need to deal with DG incidents</li>
          </ul>
          <p>
            From <strong>July 2025</strong>, this extends to all staff handling limited quantity (LQ) dangerous goods — see our{' '}
            <Link href="/adr/limited-quantities" style={{ color: '#e87722', textDecoration: 'underline' }}>
              limited quantities guide
            </Link>{' '}
            and the{' '}
            <Link href="/adr/changes-2025" style={{ color: '#e87722', textDecoration: 'underline' }}>
              ADR 2025 changes summary
            </Link>{' '}
            for details.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Types of ADR Training
          </h2>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10, marginTop: 24 }}>
            1. ADR Driver Training Certificate (DTC)
          </h3>
          <p>
            The ADR Driver Training Certificate (sometimes called the ADR licence or ADR vocational certificate)
            is required for drivers of vehicles carrying dangerous goods above the exemption thresholds. The
            certificate is issued after passing an approved training course and examination.
          </p>
          <p>
            The DTC is valid for <strong>5 years</strong> and must be renewed through a refresher course and examination
            before expiry. The certificate is recognised across all ADR signatory countries.
          </p>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 20 }}>
            Course Structure
          </h4>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>
              <strong>Core module (3.5 days):</strong> Mandatory for all ADR drivers. Covers classification of
              dangerous goods, documentation requirements, vehicle requirements, loading and unloading procedures,
              emergency response, and practical firefighting. Enables the driver to transport packages and IBCs of
              all classes (except explosives and radioactive).
            </li>
            <li>
              <strong>Packages specialisation:</strong> Included in the core module. Covers packaged dangerous goods
              and intermediate bulk containers (IBCs).
            </li>
            <li>
              <strong>Tanks specialisation (additional 2-3 days):</strong> Required for drivers transporting dangerous
              goods in fixed tanks, demountable tanks, tank containers, or battery vehicles. Covers tank construction,
              filling procedures, and tank-specific emergency response.
            </li>
            <li>
              <strong>Class 1 specialisation (additional 1 day):</strong> Required for drivers transporting
              explosives (Class 1). Covers specific requirements for explosive articles and substances.
            </li>
            <li>
              <strong>Class 7 specialisation (additional 1 day):</strong> Required for drivers transporting
              radioactive materials (Class 7). Covers radiation safety, dose limits, and contamination control.
            </li>
          </ul>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10, marginTop: 28 }}>
            2. Chapter 1.3 Awareness Training
          </h3>
          <p>
            Chapter 1.3 of ADR requires that all persons whose duties concern the transport of dangerous goods
            receive training appropriate to their responsibilities. This is not a certificated course — it is
            employer-delivered or arranged training that must be documented and recorded.
          </p>
          <p>
            Chapter 1.3 training has three components:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>General awareness:</strong> What dangerous goods are, why they are regulated, the basic classification system, and the purpose of ADR</li>
            <li><strong>Function-specific:</strong> Training tailored to the person&apos;s specific role — a packer needs different knowledge than a booking clerk</li>
            <li><strong>Safety training:</strong> What to do in an emergency, spill procedures, who to contact, and how to protect yourself and others</li>
          </ul>
          <p>
            There is no set duration or formal exam for Chapter 1.3 training. The employer must ensure it is
            adequate for the role and must keep records of who was trained, when, and what was covered. Training
            must be refreshed periodically and updated when regulations change.
          </p>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10, marginTop: 28 }}>
            3. Dangerous Goods Safety Adviser (DGSA)
          </h3>
          <p>
            Most businesses that consign, transport, or load dangerous goods are required to appoint
            a Dangerous Goods Safety Adviser, subject to exemptions for small quantities and certain ancillary
            activities. The DGSA qualification covers the carriage of dangerous goods by road, rail, and inland
            waterway. Sea (IMDG) and air (IATA DGR) transport have separate competent-person requirements.
          </p>
          <p>
            The DGSA qualification involves a more intensive training programme and examination covering the full
            scope of ADR, including classification, packaging, documentation, vehicle requirements, emergency
            procedures, and regulatory compliance. The DGSA certificate is valid for 5 years.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Typical UK Costs
          </h2>
          <p>
            Training costs vary by provider and location, but typical UK prices (2025\u20132026) are:
          </p>
          <div style={{ marginTop: 16, marginBottom: 24 }}>
            {[
              { course: 'ADR Core (Packages) — Initial', duration: '3.5 days', cost: '£375 – £550' },
              { course: 'ADR Core (Packages) — Renewal', duration: '2 days', cost: '£295 – £400' },
              { course: 'ADR Tanks — Initial', duration: '2.5 days', cost: '£450 – £650' },
              { course: 'ADR Core + Tanks — Combined Initial', duration: '5.5 days', cost: '£650 – £795' },
              { course: 'Class 1 (Explosives) Specialisation', duration: '1 day', cost: '£200 – £350' },
              { course: 'DGSA Qualification', duration: '5 days + exam', cost: '£1,200 – £1,420' },
              { course: 'Chapter 1.3 Awareness', duration: '0.5 – 1 day', cost: '£80 – £200 per person' },
            ].map(row => (
              <div key={row.course} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                gap: 16, padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                fontSize: 14,
              }}>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{row.course}</div>
                <div style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{row.duration}</div>
                <div style={{ color: '#e87722', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>{row.cost}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
            Prices are indicative and vary by training provider. Some providers offer group discounts for in-house
            training at your premises.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Using FreightUtils as a Revision Tool
          </h2>
          <p>
            Whether you are preparing for your ADR driver certificate exam, studying for the DGSA qualification,
            or brushing up on Chapter 1.3 knowledge, FreightUtils can help:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>
              <strong>Practice UN number lookups:</strong> Use the{' '}
              <Link href="/adr" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR lookup</Link> to
              search any UN number and review its classification, packing group, labels, tunnel code, and transport category.
              Bookmark it on your phone during training.
            </li>
            <li>
              <strong>Test your 1.1.3.6 calculations:</strong> The{' '}
              <Link href="/adr-calculator" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR 1.1.3.6 calculator</Link> lets
              you practise mixed-load exemption calculations — a key exam topic.
            </li>
            <li>
              <strong>Learn tunnel codes:</strong> Our{' '}
              <Link href="/adr/tunnel-codes" style={{ color: '#e87722', textDecoration: 'underline' }}>tunnel codes guide</Link> explains
              all five categories with examples.
            </li>
            <li>
              <strong>Understand LQ rules:</strong> The{' '}
              <Link href="/adr/limited-quantities" style={{ color: '#e87722', textDecoration: 'underline' }}>limited quantities guide</Link> covers
              packaging, marking, and exemptions in detail.
            </li>
            <li>
              <strong>Stay current with ADR 2025:</strong> Review the{' '}
              <Link href="/adr/changes-2025" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR 2025 changes summary</Link> to
              know what has changed in the latest edition.
            </li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Official UK Government Guidance
          </h2>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>
              <a href="https://www.gov.uk/government/publications/dangerous-goods-adr-driver-training-syllabus" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>
                GOV.UK: ADR driver training syllabus
              </a>
            </li>
            <li>
              <a href="https://www.gov.uk/guidance/moving-dangerous-goods" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>
                GOV.UK: Moving dangerous goods
              </a>
            </li>
          </ul>
          <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
            Official UK government guidance on ADR training and dangerous goods transport.
          </p>

          {/* Related tools */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: 24, marginTop: 36,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Related Tools
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link href="/adr" style={{ background: 'var(--accent)', color: 'var(--text-on-orange)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                ADR Lookup →
              </Link>
              <Link href="/adr-calculator" style={{ background: 'var(--accent)', color: 'var(--text-on-orange)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                1.1.3.6 Calculator →
              </Link>
              <Link href="/adr/changes-2025" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                ADR 2025 Changes →
              </Link>
              <Link href="/adr/limited-quantities" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Limited Quantities Guide →
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
