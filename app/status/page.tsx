import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';
import { getRecentSamples, computeStats, type StatusStats } from '@/lib/status';

export const revalidate = 60;

const ogUrl = '/api/og?title=Status&desc=System+health+and+uptime+for+freightutils.com&badge=STATUS';

export const metadata: Metadata = {
  title: 'Status — FreightUtils',
  description: 'Live system status and uptime history for FreightUtils APIs and calculators. Current state, 24-hour uptime, 7-day uptime, last incident.',
  alternates: { canonical: 'https://www.freightutils.com/status' },
  openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Status' }] },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

function StateIndicator({ state }: { state: StatusStats['current'] }) {
  const spec = {
    ok:       { color: '#15803D', bg: '#dcfce7', label: 'All systems operational' },
    degraded: { color: '#B45309', bg: '#fef3c7', label: 'Degraded performance' },
    down:     { color: '#B91C1C', bg: '#fee2e2', label: 'Major outage' },
    unknown:  { color: '#6B7280', bg: '#f3f4f6', label: 'No recent data' },
  }[state];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: spec.bg, border: `1px solid ${spec.color}33`,
      padding: '16px 20px', borderRadius: 10,
    }}>
      <span style={{
        width: 12, height: 12, borderRadius: '50%', background: spec.color,
        boxShadow: `0 0 0 4px ${spec.color}22`, flexShrink: 0,
      }} />
      <div style={{ fontSize: 17, fontWeight: 700, color: spec.color }}>{spec.label}</div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '18px 20px', minHeight: 100,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function fmtUptime(n: number | null): string {
  if (n === null) return '—';
  if (n >= 99.99) return '99.99%+';
  return `${n.toFixed(2)}%`;
}

function fmtRelative(t: number): string {
  const delta = Date.now() - t;
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function StatusPage() {
  const samples = await getRecentSamples(7).catch(() => []);
  const stats = computeStats(samples);

  return (
    <>
      <PageHero
        title="Status"
        titleAccent="Page"
        subtitle="Live system health and uptime history."
        category="ops"
        differentiators={['Self-reported pings', 'Uptime over 24h and 7d', 'Last-incident tracking']}
      />

      <main data-category="ops" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Placeholder notice */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid #B45309',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text)' }}>Self-reported, third-party monitor coming.</strong>{' '}
          These figures are from an internal ping that fetches <code style={{ fontSize: 12, fontFamily: 'monospace' }}>/api/health</code> every few minutes — useful as a first signal but not as rigorous as a third-party uptime monitor. UptimeRobot integration is on the <Link href="/roadmap" style={{ color: 'var(--page-cat, var(--accent))' }}>roadmap</Link>.
        </div>

        {/* State */}
        <StateIndicator state={stats.current} />

        {/* Metric grid */}
        <div className="status-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18,
        }}>
          <MetricCard
            label="Uptime · 24h"
            value={fmtUptime(stats.uptime24h)}
            sub={stats.uptime24h === null ? 'No samples yet' : `Samples: ${samples.filter(s => s.t >= Date.now() - 24 * 3600 * 1000).length}`}
          />
          <MetricCard
            label="Uptime · 7d"
            value={fmtUptime(stats.uptime7d)}
            sub={stats.uptime7d === null ? 'No samples yet' : `Samples: ${samples.length}`}
          />
          <MetricCard
            label="Last incident"
            value={stats.lastIncident ? fmtRelative(stats.lastIncident.t) : 'None'}
            sub={stats.lastIncident ? `HTTP ${stats.lastIncident.status || 'no response'}` : 'in the last 7 days'}
          />
        </div>

        {/* Last check */}
        <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {stats.latestSample ? (
            <>
              Last check: <strong style={{ color: 'var(--text)' }}>{fmtRelative(stats.latestSample.t)}</strong>{' '}
              — HTTP {stats.latestSample.status || '—'} in {stats.latestSample.ms}ms
            </>
          ) : (
            <>No samples yet. The status cron runs every 5 minutes; data populates after the first successful run.</>
          )}
        </div>

        {/* What this measures */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '36px 0 10px' }}>
          What this measures
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
          Every 5 minutes a Vercel cron hits <code style={{ background: 'var(--bg-card-hover)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' }}>/api/health</code> and records whether it returned 200 plus the response time. Samples are stored in Vercel KV with 30-day retention, keyed by UTC date. The page recomputes stats on each request with a 60-second cache.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
          This covers the API surface end-to-end (CDN → edge → serverless function → data), but it&apos;s a self-report. For an outside view, a third-party uptime monitor is queued — see <Link href="/roadmap" style={{ color: 'var(--page-cat, var(--accent))' }}>/roadmap</Link>.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '28px 0 10px' }}>
          Something looks wrong?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
          If an endpoint is returning unexpected errors or stale data and the page up here says everything&apos;s fine, email{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: 'var(--page-cat, var(--accent))' }}>contact@freightutils.com</a> with the request URL and a timestamp. That&apos;s the fastest path to getting the monitor fixed as well.
        </p>

        <style>{`
          @media (max-width: 640px) {
            .status-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
    </>
  );
}
