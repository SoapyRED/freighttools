import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';
import { getRoadmapIssues, type RoadmapIssue } from '@/lib/roadmap';
import { entries } from '@/lib/changelog-data';

export const revalidate = 3600;

const ogUrl = '/api/og?title=Roadmap&desc=Shipped%2C+in+progress%2C+and+next+at+FreightUtils&badge=ROADMAP';

export const metadata: Metadata = {
  title: 'Roadmap — FreightUtils',
  description: 'What we\'ve shipped recently, what we\'re working on now, and what\'s next. Live from the FreightUtils changelog and GitHub issues.',
  alternates: { canonical: 'https://www.freightutils.com/roadmap' },
  openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Roadmap' }] },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

function Column({
  title, tint, accent, children, empty,
}: {
  title: string; tint: string; accent: string; children: React.ReactNode; empty?: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${accent}`,
      borderRadius: 10,
      padding: '18px 18px 22px',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
        color: accent, marginBottom: 14,
        display: 'inline-block', background: tint, padding: '4px 10px', borderRadius: 4, alignSelf: 'flex-start',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
        {/* Empty state handled via children being empty; show placeholder if children is the string */}
        {!children && empty && (
          <div style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>{empty}</div>
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: RoadmapIssue }) {
  const summary = issue.body.split('\n').filter(Boolean).slice(0, 2).join(' ').slice(0, 180);
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        display: 'block',
        padding: '12px 14px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        transition: 'border-color 0.15s',
      }}
      className="roadmap-card"
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.35 }}>
        {issue.title}
      </div>
      {summary && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
          {summary}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>
        #{issue.number} ↗
      </div>
    </a>
  );
}

function ShippedCard({ title, desc, link, date }: { title: string; desc: string; link?: string; date: string }) {
  const body = (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.35 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
        {desc.slice(0, 160)}{desc.length > 160 ? '…' : ''}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
        Shipped {date}
      </div>
    </>
  );
  const style: React.CSSProperties = {
    padding: '12px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    textDecoration: 'none',
    display: 'block',
  };
  return link
    ? <Link href={link} style={style} className="roadmap-card">{body}</Link>
    : <div style={style}>{body}</div>;
}

export default async function RoadmapPage() {
  const [inProgress, next] = await Promise.all([
    getRoadmapIssues('roadmap-in-progress'),
    getRoadmapIssues('roadmap-next'),
  ]);
  const shipped = entries.slice(0, 10);

  return (
    <>
      <PageHero
        title="Road"
        titleAccent="map"
        subtitle="What we've shipped, what's in motion, and what's next. Live from the changelog and GitHub issues."
        category="customs"
        differentiators={['Updated hourly', 'GitHub-sourced', 'Public commitments']}
      />

      <main data-category="customs" style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 20px 80px' }}>
        <div className="roadmap-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
        }}>
          <Column title="Shipped" tint="#dcfce7" accent="#15803D">
            {shipped.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>
                No recent releases.
              </div>
            ) : shipped.map((e, i) => (
              <ShippedCard
                key={`${e.isoDate}-${i}`}
                title={e.title}
                desc={e.desc}
                link={e.link}
                date={e.date + ' ' + e.isoDate.slice(0, 4)}
              />
            ))}
          </Column>

          <Column title="In Progress" tint="#fef3c7" accent="#B45309">
            {inProgress.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>
                Nothing in motion right now.
              </div>
            ) : inProgress.map((i) => <IssueCard key={i.number} issue={i} />)}
          </Column>

          <Column title="Next" tint="#dbeafe" accent="#2563EB">
            {next.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>
                Queue is clear.
              </div>
            ) : next.map((i) => <IssueCard key={i.number} issue={i} />)}
          </Column>
        </div>

        <div style={{
          marginTop: 40, padding: '18px 22px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text)' }}>How this page works.</strong>{' '}
          Shipped pulls the last 10 entries from the <Link href="/changelog" style={{ color: 'var(--page-cat, var(--accent))' }}>changelog</Link>.
          In Progress and Next pull issues from <a href="https://github.com/SoapyRED/freighttools/issues" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--page-cat, var(--accent))' }}>SoapyRED/freighttools</a> with labels <code style={{ background: 'var(--bg-card-hover)', padding: '1px 6px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace' }}>roadmap-in-progress</code> and <code style={{ background: 'var(--bg-card-hover)', padding: '1px 6px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace' }}>roadmap-next</code>. Cached for one hour.
          <br/><br/>
          See <Link href="/docs/versioning" style={{ color: 'var(--page-cat, var(--accent))' }}>versioning</Link> and <Link href="/docs/deprecation" style={{ color: 'var(--page-cat, var(--accent))' }}>deprecation</Link> policies for what &quot;shipped&quot; means as a commitment.
        </div>

        <style>{`
          .roadmap-card:hover { border-color: var(--page-cat, var(--accent)) !important; }
          @media (max-width: 820px) {
            .roadmap-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
    </>
  );
}
