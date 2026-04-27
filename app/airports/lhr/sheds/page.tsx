import type { Metadata } from 'next';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import PageHero from '@/app/components/PageHero';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import {
  getAllSheds,
  getCriticalRules,
  getAirlinePrefixOverrides,
  getMeta,
  SHED_COUNT,
  OPERATIONAL_COUNT,
  HMRC_COUNT,
  CONFIDENCE_COUNTS,
  LAST_VERIFIED,
} from '@/lib/calculations/lhr-sheds';
import LhrShedsSearch from './LhrShedsSearch';
import LhrShedsPrint from './LhrShedsPrint';

const ogUrl =
  '/api/og?title=Heathrow+Cargo+Shed+Codes&desc=Official+HMRC+codes,+handlers,+prealert+emails&api=GET+/api/locations/lhr/sheds';

export const metadata: Metadata = {
  title: 'Heathrow Cargo Shed Codes — Official HMRC Codes, Handlers, Emails | FreightUtils',
  description:
    'Complete Heathrow (LHR) cargo shed reference — HMRC ITSF/ETSF codes, handler names, prealert emails, airline allocations. Cross-referenced with HMRC Appendix 16D/16F.',
  alternates: { canonical: 'https://www.freightutils.com/airports/lhr/sheds' },
  openGraph: {
    title: 'Heathrow Cargo Shed Codes — FreightUtils',
    description:
      'Operational handler truth × HMRC regulated truth for every Heathrow cargo shed.',
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Heathrow Cargo Shed Codes — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

const faqEntries: { q: string; a: string }[] = [
  {
    q: 'What does the WFS Horseshoe default rule mean?',
    a: 'All cargo delivered to WFS sheds 549, 550A, 550B, 551 and 552 at Heathrow uses the same subject line (LHRWXS) and prealert email address (549.spxra.alerts@wfs.aero). The only documented exception is American Airlines (AWB prefix 001), which still routes to LHRAAS and 552.spxra.alerts@wfs.aero even though the cargo is physically received in 550B.',
  },
  {
    q: 'Why is LHRAAS not in the current HMRC ITSF list?',
    a: 'HMRC removed GBAULHRLHRAAS from the Appendix 16D list on 12 November 2024. The code is still actively used operationally for American Airlines prealerts across forwarders and handlers at Heathrow — this is the clearest current example of operational truth diverging from regulated truth.',
  },
  {
    q: 'How do I know which email to use for a BA shipment?',
    a: 'British Airways uses three different handlers at Heathrow. General cargo (MAIN / M class) goes to IAG Ascentis (Ascentis.Deliveries@iagcargo.com). Express cargo (Premia / F class) goes to IAG Premia (Premia.Deliveries@iagcargo.com). BA AWB prefix 125 is handled by Dunwoody 875 BARC under WFS (bbs.spxra.alerts@wfs.aero). Always check the slip header for MAIN/EXPRESS/125 markers.',
  },
  {
    q: 'What is the difference between an ITSF and an ETSF?',
    a: 'ITSF stands for Internal Temporary Storage Facility — locations listed in HMRC Appendix 16D, typically inside the airport customs boundary. ETSF stands for External Temporary Storage Facility — HMRC Appendix 16F, off-airport warehouses approved to handle customs-controlled cargo. Both are referenced in CDS Data Element 5/23.',
  },
  {
    q: 'Why does AMI (Air Menzies International) show "community contributed"?',
    a: 'AMI is HMRC-registered as an ETSF at Polar Park under the WRX suffix, but its operational prealert email (ami.lhrcsd@airmenzies.com) was sourced from industry peers rather than an official AMI communication channel. We publish it because it is the address in active use, but flag it for transparency.',
  },
  {
    q: 'What handler operates at Swissport Horton Road (FRX)?',
    a: 'The HMRC ETSF registration names Heathrow Cargo Handling Limited at HCH House, Horton Road, Colnbrook SL3 0AT. Operationally it is staffed by Swissport — HCH appears to be a Swissport-related legal entity that holds the ETSF approval.',
  },
];

const faqSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqEntries.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export default function LhrShedsPage() {
  const sheds = getAllSheds();
  const critical = getCriticalRules();
  const prefixOverrides = getAirlinePrefixOverrides();
  const meta = getMeta();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbSchema([
            { name: 'Airports', path: '/airports' },
            { name: 'London Heathrow', path: '/airports/lhr' },
            { name: 'Cargo Shed Codes', path: '/airports/lhr/sheds' },
          ]),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

      <PageHero
        title="Heathrow Cargo"
        titleAccent="Shed Codes"
        subtitle="Operational handler truth × HMRC regulated truth for every Heathrow (LHR) cargo shed"
        differentiators={[
          `${OPERATIONAL_COUNT} operational sheds`,
          `${HMRC_COUNT} HMRC-registered`,
          `Updated ${LAST_VERIFIED ?? '2026-04-21'}`,
        ]}
        category="customs"
      />

      <main
        data-category="customs"
        style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}
        className="lhr-sheds-main"
      >
        {/* ── Draft banner ── */}
        <aside
          role="note"
          aria-label="Draft notice"
          style={{
            marginBottom: 24,
            padding: '14px 18px',
            background: 'var(--bg-card)',
            borderLeft: '4px solid var(--accent)',
            border: '1px solid var(--border)',
            borderLeftWidth: 4,
            borderRadius: 8,
            color: 'var(--text-primary)',
            lineHeight: 1.55,
          }}
          className="lhr-draft-banner"
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            DRAFT — under expert review
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            This document is under curation. Data is not yet consolidated across overlapping HMRC codes (some records may appear twice under old and new codes). Not for operational use. Expected publish: later April 2026.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Review comments welcome via{' '}
            <a
              href="mailto:contact@freightutils.com"
              style={{ color: 'var(--page-cat, var(--accent))', fontWeight: 600 }}
            >
              contact@freightutils.com
            </a>
            .
          </p>
        </aside>

        {/* ── Critical rules panel ── */}
        <section aria-labelledby="critical-rules-heading" style={{ marginBottom: 28 }}>
          <h2
            id="critical-rules-heading"
            style={{
              fontSize: 'clamp(18px, 3.5vw, 22px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 12px',
              letterSpacing: '-0.3px',
            }}
          >
            Critical operational rules
          </h2>

          {/* Horseshoe default — info */}
          <div
            style={{
              background: 'var(--cat-customs-tint)',
              border: '1px solid var(--cat-customs)',
              borderLeft: '4px solid var(--cat-customs)',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 10,
            }}
            className="lhr-critical-rule lhr-critical-rule-info"
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cat-customs)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              WFS Horseshoe default
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 6 }}>
              Sheds {critical.horseshoe_default.sheds_covered.join(', ')} → subject{' '}
              <code
                style={{
                  fontFamily: 'monospace',
                  background: 'var(--bg-card)',
                  padding: '1px 5px',
                  borderRadius: 3,
                }}
              >
                {critical.horseshoe_default.subject_code}
              </code>
              {' '}· prealert{' '}
              <code
                style={{
                  fontFamily: 'monospace',
                  background: 'var(--bg-card)',
                  padding: '1px 5px',
                  borderRadius: 3,
                  wordBreak: 'break-all',
                }}
              >
                {critical.horseshoe_default.prealert_email}
              </code>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
              {critical.horseshoe_default.description}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0', lineHeight: 1.5 }}>
              HMRC: {critical.horseshoe_default.hmrc_registration}
            </p>
          </div>

          {/* AA exception — warning */}
          <div
            style={{
              background: 'rgba(234,179,8,0.12)',
              border: '1px solid #B45309',
              borderLeft: '4px solid #B45309',
              borderRadius: 10,
              padding: '14px 18px',
            }}
            className="lhr-critical-rule lhr-critical-rule-warn"
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              ⚠ Horseshoe AA exception
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 6 }}>
              AA (prefix {critical.horseshoe_aa_exception.awb_prefix}) physically at{' '}
              {critical.horseshoe_aa_exception.physical_shed} — still uses{' '}
              <code style={{ fontFamily: 'monospace', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 3 }}>
                {critical.horseshoe_aa_exception.subject_code}
              </code>{' '}
              +{' '}
              <code style={{ fontFamily: 'monospace', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 3, wordBreak: 'break-all' }}>
                {critical.horseshoe_aa_exception.prealert_email}
              </code>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
              {critical.horseshoe_aa_exception.description}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0', lineHeight: 1.5 }}>
              HMRC: {critical.horseshoe_aa_exception.hmrc_registration}
            </p>
          </div>
        </section>

        {/* ── Airline prefix overrides ── */}
        <section aria-labelledby="prefix-overrides-heading" style={{ marginBottom: 28 }}>
          <h2
            id="prefix-overrides-heading"
            style={{
              fontSize: 'clamp(18px, 3.5vw, 22px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 10px',
              letterSpacing: '-0.3px',
            }}
          >
            Airline prefix overrides
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.55 }}>
            When an AWB begins with these prefixes the routing is determined by the airline, not the named shed on the slip.
          </p>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    <th style={{ ...thSmall, width: 72 }}>Prefix</th>
                    <th style={thSmall}>Airline</th>
                    <th style={thSmall}>Shed</th>
                    <th style={thSmall}>Subject</th>
                    <th style={thSmall}>Prealert email</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(prefixOverrides).map(([prefix, row]) => (
                    <tr key={prefix} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ ...tdSmall, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{prefix}</td>
                      <td style={tdSmall}>
                        <strong>{row.airline_code}</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>{row.airline_name}</span>
                      </td>
                      <td style={tdSmall}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.shed_code}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{row.shed_common_name}</div>
                      </td>
                      <td style={{ ...tdSmall, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{row.subject_code}</td>
                      <td style={{ ...tdSmall, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{row.prealert_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Search + table ── */}
        <ErrorBoundary>
          <LhrShedsSearch sheds={sheds} />
        </ErrorBoundary>

        {/* Confidence legend */}
        <div
          style={{
            marginTop: 20,
            padding: 14,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.65,
          }}
        >
          <strong style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
            Confidence tiers
          </strong>
          <div><strong>Verified</strong> — operational record matches an active HMRC ITSF/ETSF registration.</div>
          <div><strong>Community</strong> — email or detail was contributed by an industry peer (not an official handler channel).</div>
          <div><strong>Pending verification</strong> — operational data flagged as partial, uncertain HMRC mapping, or pending on-site confirmation.</div>
          <div><strong>Operational only</strong> — shed is in active operational use but has no current HMRC registration (includes HMRC-deregistered codes).</div>
          <div><strong>HMRC only</strong> — an HMRC-registered Heathrow location without an operational record in our dataset.</div>
        </div>

        {/* ── FAQ ── */}
        <section aria-labelledby="faq-heading" style={{ marginTop: 48 }}>
          <h2
            id="faq-heading"
            style={{
              fontSize: 'clamp(20px, 4vw, 26px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 16px',
              letterSpacing: '-0.3px',
            }}
          >
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqEntries.map(f => (
              <details className="faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <div className="faq-answer">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Reviewers placeholder ── */}
        <section aria-labelledby="reviewers-heading" style={{ marginTop: 40 }}>
          <h2
            id="reviewers-heading"
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
              letterSpacing: '-0.2px',
            }}
          >
            Expert reviewers
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
            Reviewer credits pending contributor confirmation. If you have reviewed or contributed data to this dataset and wish to be credited, please contact{' '}
            <a
              href="mailto:contact@freightutils.com"
              style={{ color: 'var(--page-cat, var(--accent))', fontWeight: 600 }}
            >
              contact@freightutils.com
            </a>{' '}
            with your preferred attribution (display name, job title, and optional LinkedIn profile URL).
          </p>

          {/* Reviewer credit slot — populate after on-shift confirmation. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
            <article style={{ padding: 14, border: '1px dashed var(--border)', borderRadius: 8, background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
                Reviewer slot 1
              </div>
              <dl style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <dt style={{ minWidth: 110, fontWeight: 600, color: 'var(--text-muted)' }}>Name:</dt>
                  <dd style={{ margin: 0, color: 'var(--text-faint)', fontStyle: 'italic' }}>&lt;pending&gt;</dd>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <dt style={{ minWidth: 110, fontWeight: 600, color: 'var(--text-muted)' }}>Role:</dt>
                  <dd style={{ margin: 0, color: 'var(--text-faint)', fontStyle: 'italic' }}>&lt;pending&gt;</dd>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <dt style={{ minWidth: 110, fontWeight: 600, color: 'var(--text-muted)' }}>Years freight ops:</dt>
                  <dd style={{ margin: 0, color: 'var(--text-faint)', fontStyle: 'italic' }}>&lt;pending&gt;</dd>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <dt style={{ minWidth: 110, fontWeight: 600, color: 'var(--text-muted)' }}>Verified sections:</dt>
                  <dd style={{ margin: 0, color: 'var(--text-faint)', fontStyle: 'italic' }}>&lt;pending&gt;</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        {/* ── Corrections / licence ── */}
        <section style={{ marginTop: 32, padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 8px' }}>
            Spot something wrong? Email corrections to{' '}
            <a href={`mailto:${meta.corrections_email}`} style={{ color: 'var(--page-cat, var(--accent))', fontWeight: 600 }}>
              {meta.corrections_email}
            </a>{' '}
            — include the shed code and what you know to be accurate.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.55, margin: 0 }}>
            {meta.licence}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.55, margin: '4px 0 0' }}>
            HMRC data retrieved from the{' '}
            <a
              href={meta.hmrc_sources.itsf.source_url}
              target="_blank"
              rel="noopener"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              ITSF list (Appendix 16D)
            </a>{' '}
            and{' '}
            <a
              href={meta.hmrc_sources.etsf.source_url}
              target="_blank"
              rel="noopener"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              ETSF list (Appendix 16F)
            </a>
            . Distribution of confidence tiers:{' '}
            {Object.entries(CONFIDENCE_COUNTS).map(([k, v], i, arr) => (
              <span key={k}>
                {v} {k.replace(/_/g, ' ')}{i < arr.length - 1 ? ' · ' : ''}
              </span>
            ))}
            {' '}(total {SHED_COUNT}).
          </p>
        </section>

        <LhrShedsPrint sheds={sheds} criticalRules={critical} lastVerified={LAST_VERIFIED} correctionsEmail={meta.corrections_email} />
      </main>
    </>
  );
}

const thSmall: React.CSSProperties = {
  padding: '9px 12px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  color: 'var(--text-secondary)',
};

const tdSmall: React.CSSProperties = {
  padding: '9px 12px',
  verticalAlign: 'top',
  lineHeight: 1.45,
};
