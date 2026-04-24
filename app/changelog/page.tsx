import type { Metadata } from 'next';
import PageHero from '@/app/components/PageHero';
import { monthGroups, type Tag } from '@/lib/changelog-data';

export const revalidate = 3600;

const ogUrl = '/api/og?title=Changelog&desc=FreightUtils+data+updates%2C+new+tools%2C+and+API+changes&badge=UPDATES';

export const metadata: Metadata = {
  title: 'Changelog — FreightUtils Updates & Releases',
  description: 'Actively maintained freight data and APIs. Data updates, new tools, API changes, and MCP releases. Subscribe via RSS at /changelog.xml.',
  alternates: {
    canonical: 'https://www.freightutils.com/changelog',
    types: { 'application/rss+xml': 'https://www.freightutils.com/changelog.xml' },
  },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Changelog' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

const TAG_COLORS: Record<Tag, { bg: string; text: string }> = {
  'New Tool':    { bg: '#dcfce7', text: '#166534' },
  'Data Update': { bg: '#dbeafe', text: '#1e40af' },
  'API Change':  { bg: '#ffedd5', text: '#9a3412' },
  'Bug Fix':     { bg: '#f3f4f6', text: '#374151' },
  'MCP Update':  { bg: '#f3e8ff', text: '#6b21a8' },
  'Security':    { bg: '#fee2e2', text: '#991b1b' },
};

export default function ChangelogPage() {
  const groups = monthGroups();

  return (
    <>
      <PageHero
        title="Change"
        titleAccent="log"
        subtitle="Data updates, new tools, and API changes. FreightUtils is actively maintained — source of truth at CHANGELOG.md in the repo."
        category="ref"
        differentiators={['RSS feed', 'Machine-readable source', 'Categorised entries']}
      />

      <main data-category="ref" style={{ maxWidth: 740, margin: '0 auto', padding: '32px 16px 64px' }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '16px 20px', marginBottom: 32, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6,
          display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div>
            <strong style={{ color: 'var(--text)' }}>Data freshness:</strong>{' '}
            ADR: UNECE ADR 2025. HS codes: WCO HS 2022. Next updates: ADR 2027 (Sep 2026), HS 2027 (Nov 2026).
          </div>
          <a href="/changelog.xml" style={{
            fontSize: 12, fontWeight: 700, color: 'var(--page-cat, var(--accent))',
            textDecoration: 'none', padding: '4px 10px', border: '1px solid currentColor',
            borderRadius: 4, letterSpacing: '0.5px',
          }}>
            RSS →
          </a>
        </div>

        {groups.map(group => (
          <div key={group.month} style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 800, color: 'var(--text)',
              marginBottom: 16, letterSpacing: '-0.3px',
              paddingBottom: 8, borderBottom: '2px solid var(--border)',
            }}>
              {group.month}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.items.map((entry, i) => {
                const tag = TAG_COLORS[entry.tag];
                return (
                  <div key={`${entry.isoDate}-${i}`} style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr', gap: 16, alignItems: 'start',
                    padding: '14px 0',
                    borderBottom: i < group.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 500, paddingTop: 2 }}>
                      {entry.date}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                          fontSize: 11, fontWeight: 700, background: tag.bg, color: tag.text,
                          letterSpacing: '0.3px',
                        }}>
                          {entry.tag}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                          {entry.link ? (
                            <a href={entry.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {entry.title}
                            </a>
                          ) : entry.title}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                        {entry.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 32, lineHeight: 1.6 }}>
          Dates are approximate. Data sourced from UNECE, WCO, ICC, IATA. ADR data licensed from Labeline.com.
          For corrections or data issues contact{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: 'var(--page-cat, var(--accent))' }}>contact@freightutils.com</a>.
        </p>
      </main>
    </>
  );
}
