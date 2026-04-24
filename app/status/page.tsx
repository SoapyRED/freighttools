import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';
import { getUptimeRobotStats, type UptimeRobotData, type UptimeRobotMonitor, type UptimeRobotState } from '@/lib/uptimerobot';
import { getRecentSamples, computeStats, type StatusStats } from '@/lib/status';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

const ogUrl = '/api/og?title=Status&desc=System+health+and+uptime+for+freightutils.com&badge=STATUS';

export const metadata: Metadata = {
  title: 'Status — FreightUtils',
  description: 'Live system status and uptime history for FreightUtils APIs and calculators. External uptime monitoring via UptimeRobot, 24h/7d/30d uptime %, last incident, average response time.',
  alternates: { canonical: 'https://www.freightutils.com/status' },
  openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Status' }] },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

function StateIndicator({ state }: { state: UptimeRobotState }) {
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
  if (n >= 99.99) return '100%';
  return `${n.toFixed(2)}%`;
}

function fmtMs(n: number | null): string {
  if (n === null) return '—';
  return `${Math.round(n)}ms`;
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

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

function stateColor(s: UptimeRobotState): string {
  return s === 'ok' ? '#15803D' : s === 'degraded' ? '#B45309' : s === 'down' ? '#B91C1C' : '#6B7280';
}

function MonitorRow({ m }: { m: UptimeRobotMonitor }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '14px 1fr auto auto', gap: 12, alignItems: 'center',
      padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: '50%', background: stateColor(m.state),
        boxShadow: `0 0 0 3px ${stateColor(m.state)}22`,
      }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {m.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {m.url}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {fmtUptime(m.uptime30d)} <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 500 }}>30d</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {fmtMs(m.avgResponseMs)}
      </div>
    </div>
  );
}

function UptimeRobotView({ ur }: { ur: UptimeRobotData }) {
  return (
    <>
      <StateIndicator state={ur.aggregate.state} />

      <div className="status-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 18,
      }}>
        <MetricCard label="Uptime · 24h" value={fmtUptime(ur.aggregate.uptime24h)} sub={ur.monitors.length > 1 ? `Across ${ur.monitors.length} monitors` : 'External probe'} />
        <MetricCard label="Uptime · 7d"  value={fmtUptime(ur.aggregate.uptime7d)}  sub={ur.monitors.length > 1 ? `Across ${ur.monitors.length} monitors` : 'External probe'} />
        <MetricCard label="Uptime · 30d" value={fmtUptime(ur.aggregate.uptime30d)} sub={ur.monitors.length > 1 ? `Across ${ur.monitors.length} monitors` : 'External probe'} />
        <MetricCard label="Avg response" value={fmtMs(ur.aggregate.avgResponseMs)} sub="30-day mean" />
      </div>

      <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {ur.aggregate.lastIncident ? (
          <>
            Last incident: <strong style={{ color: 'var(--text)' }}>{fmtRelative(ur.aggregate.lastIncident.at)}</strong>
            {' '}— lasted {fmtDuration(ur.aggregate.lastIncident.durationSec)}
            {ur.aggregate.lastIncident.reason ? ` (${ur.aggregate.lastIncident.reason})` : ''}
          </>
        ) : (
          <>No incidents recorded in the last 10 events.</>
        )}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: '28px 0 10px', letterSpacing: '-0.2px' }}>
        Monitors
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ur.monitors.map(m => <MonitorRow key={m.id} m={m} />)}
      </div>

      <div style={{
        marginTop: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
        padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
      }}>
        <strong style={{ color: 'var(--text)' }}>Monitored by UptimeRobot.</strong>{' '}
        {ur.monitors.length === 1
          ? <>External probe of <code style={{ background: 'var(--bg-card-hover)', padding: '1px 6px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace' }}>{ur.monitors[0].url}</code> every {ur.monitors[0].intervalSec ? `${Math.round(ur.monitors[0].intervalSec / 60)} min` : '5 min'} from multiple regions.</>
          : <>External probe across {ur.monitors.length} monitors from multiple regions.</>
        }
        {' '}Uptime % and incident logs are UptimeRobot&apos;s ground truth.
      </div>
    </>
  );
}

function SelfReportView({ stats, sampleCount, reason }: { stats: StatusStats; sampleCount: number; reason: string | null }) {
  return (
    <>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid #B45309',
        padding: '12px 16px',
        borderRadius: 8,
        marginBottom: 18,
        fontSize: 13,
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text)' }}>Fallback — {reason || 'UptimeRobot unreachable'}.</strong>{' '}
        External monitor is temporarily not responding; showing an internal self-report instead. Figures may lag and come from a single region.
      </div>
      <StateIndicator state={stats.current === 'ok' ? 'ok' : stats.current === 'degraded' ? 'degraded' : stats.current === 'down' ? 'down' : 'unknown'} />
      <div className="status-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18,
      }}>
        <MetricCard label="Uptime · 24h" value={fmtUptime(stats.uptime24h)} sub={stats.uptime24h === null ? 'No samples yet' : `${sampleCount} samples total`} />
        <MetricCard label="Uptime · 7d"  value={fmtUptime(stats.uptime7d)}  sub={stats.uptime7d === null ? 'No samples yet' : `${sampleCount} samples total`} />
        <MetricCard
          label="Last incident"
          value={stats.lastIncident ? fmtRelative(stats.lastIncident.t) : 'None'}
          sub={stats.lastIncident ? `HTTP ${stats.lastIncident.status || 'no response'}` : 'in the last 7 days'}
        />
      </div>
      <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {stats.latestSample ? (
          <>Last self-report check: <strong style={{ color: 'var(--text)' }}>{fmtRelative(stats.latestSample.t)}</strong> — HTTP {stats.latestSample.status || '—'} in {stats.latestSample.ms}ms</>
        ) : (
          <>No samples yet. Internal cron runs every 5 minutes.</>
        )}
      </div>
    </>
  );
}

export default async function StatusPage() {
  const [ur, selfReportSamples] = await Promise.all([
    getUptimeRobotStats(),
    getRecentSamples(7).catch(() => []),
  ]);
  const selfReportStats = computeStats(selfReportSamples);

  return (
    <>
      <PageHero
        title="Status"
        titleAccent="Page"
        subtitle="Live system health and uptime history — externally monitored."
        category="ops"
        differentiators={['External UptimeRobot probe', '24h / 7d / 30d uptime', 'Multi-region checks']}
      />

      <main data-category="ops" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {ur.available
          ? <UptimeRobotView ur={ur} />
          : <SelfReportView stats={selfReportStats} sampleCount={selfReportSamples.length} reason={ur.reason} />
        }

        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '36px 0 10px' }}>
          How this page works
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
          Primary source is <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--page-cat, var(--accent))' }}>UptimeRobot</a>: an external HTTP probe of <code style={{ background: 'var(--bg-card-hover)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' }}>www.freightutils.com/</code> every 5 minutes from multiple regions. That covers end-to-end path (DNS → CDN → edge → serverless → data) and is independent of our own infrastructure.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
          A fallback internal self-report (<code style={{ background: 'var(--bg-card-hover)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' }}>/api/cron/status-ping</code>) runs every 5 minutes and writes to Vercel KV with 30-day retention. It only renders if UptimeRobot&apos;s API is unreachable — the banner names the concrete reason so regressions aren&apos;t opaque.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
          Page cache is 60 seconds.
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
