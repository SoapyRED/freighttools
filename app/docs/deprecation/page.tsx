import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';

const ogUrl = '/api/og?title=Deprecation+Policy&desc=End-of-life+timelines+and+migration+guides&badge=POLICY';

export const metadata: Metadata = {
  title: 'Deprecation Policy — FreightUtils',
  description: 'How FreightUtils deprecates endpoints and tools. 3-month minimum notice, Deprecation/Sunset headers, migration guides. Current deprecated endpoints list.',
  alternates: { canonical: 'https://www.freightutils.com/docs/deprecation' },
  openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Deprecation Policy' }] },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

const h2 = { fontSize: 'clamp(20px, 4vw, 24px)' as const, fontWeight: 800, color: 'var(--text)', margin: '40px 0 14px', letterSpacing: '-0.3px' };
const p  = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };
const li = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 6 };
const code: React.CSSProperties = { background: 'var(--bg-card-hover)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' };

export default function DeprecationPage() {
  return (
    <>
      <PageHero
        title="Deprecation"
        titleAccent="Policy"
        subtitle="How FreightUtils retires endpoints and tools — timeline, signals, and what you can expect when something goes away."
        category="dg"
        differentiators={['3-month minimum notice', 'Deprecation/Sunset headers', 'Migration guide per endpoint']}
      />

      <main data-category="dg" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Empty state — headline */}
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--page-cat, var(--border))',
          borderLeft: '6px solid var(--page-cat, var(--accent))',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
              color: '#fff', background: 'var(--page-cat, var(--accent))',
              padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase',
            }}>
              Current status
            </span>
          </div>
          <p style={{ fontSize: 17, color: 'var(--text)', margin: 0, fontWeight: 600 }}>
            Nothing is currently deprecated.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
            When an endpoint or tool enters deprecation, it will be listed on this page with a sunset date and a migration guide.
          </p>
        </div>

        <h2 style={h2}>Deprecation timeline</h2>
        <p style={p}>
          When FreightUtils deprecates an endpoint, tool, or response field, you get <strong>a minimum of three months</strong> between the deprecation notice and the sunset date. That window covers a typical release cycle for most integrators.
        </p>
        <p style={p}>
          For endpoints with high integration count (measured by unique API keys hitting them in the last 90 days), the window extends to <strong>six months</strong>.
        </p>

        <h2 style={h2}>Deprecation signals</h2>
        <p style={p}>A deprecated endpoint emits four signals you can watch for:</p>
        <ul>
          <li style={li}>
            <strong>Response headers</strong> on every call — <code style={code}>Deprecation: true</code> (per RFC 8594) and <code style={code}>Sunset: &lt;IMF-fixdate&gt;</code> with the removal date. If you&apos;re hitting the endpoint programmatically, log these headers and alert on them.
          </li>
          <li style={li}>
            <strong>Changelog entry</strong> tagged <code style={code}>API Change</code> on <Link href="/changelog" style={{ color: 'var(--page-cat, var(--accent))' }}>/changelog</Link> (also in the RSS feed at <a href="/changelog.xml" style={{ color: 'var(--page-cat, var(--accent))' }}>/changelog.xml</a>).
          </li>
          <li style={li}>
            <strong>This page</strong> lists the endpoint with its deprecation date, sunset date, recommended replacement, and a migration guide link.
          </li>
          <li style={li}>
            <strong>Email notice</strong> to holders of any API key that has called the affected endpoint in the last 90 days. Sent once on deprecation announcement, once 30 days before sunset, once 7 days before sunset.
          </li>
        </ul>

        <h2 style={h2}>Migration guides</h2>
        <p style={p}>
          Every deprecated endpoint ships with a migration guide linked from this page before the deprecation date. The guide covers:
        </p>
        <ul>
          <li style={li}>What&apos;s replacing it (recommended target endpoint or pattern)</li>
          <li style={li}>Before/after request + response examples</li>
          <li style={li}>Field-level mapping (old name → new name, type changes)</li>
          <li style={li}>Any behavioural differences that aren&apos;t apparent from the schema</li>
          <li style={li}>Known edge cases surfaced during migration</li>
        </ul>

        <h2 style={h2}>Currently deprecated endpoints</h2>
        <div style={{
          background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: 8,
          padding: '24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14,
        }}>
          No endpoints are currently deprecated. All REST endpoints listed on <Link href="/api-docs" style={{ color: 'var(--page-cat, var(--accent))' }}>/api-docs</Link> are stable.
        </div>

        <h2 style={h2}>Out-of-policy changes</h2>
        <p style={p}>
          Two situations justify a shorter window than 3 months:
        </p>
        <ul>
          <li style={li}>
            <strong>Security fix</strong> — a vulnerability or data-integrity issue that cannot be patched without changing behaviour. Fix ships as soon as ready; changelog tagged <code style={code}>Security</code>, affected key holders notified within 24 hours.
          </li>
          <li style={li}>
            <strong>Upstream retraction</strong> — a regulatory body (UNECE, WCO, HMRC, etc.) withdraws or corrects source data. Affected endpoints continue to serve but return corrected data; a changelog entry notes the change.
          </li>
        </ul>

        <h2 style={h2}>Related policies</h2>
        <ul>
          <li style={li}><Link href="/docs/versioning" style={{ color: 'var(--page-cat, var(--accent))' }}>Versioning policy</Link> — what counts as breaking, how the MCP package is semver&apos;d, tool stability tiers.</li>
          <li style={li}><Link href="/changelog" style={{ color: 'var(--page-cat, var(--accent))' }}>Changelog</Link> — every released change, including deprecations.</li>
          <li style={li}><Link href="/roadmap" style={{ color: 'var(--page-cat, var(--accent))' }}>Roadmap</Link> — what&apos;s coming (and by implication, what current things it may replace).</li>
        </ul>

        <p style={{ ...p, marginTop: 32, fontSize: 13, color: 'var(--text-faint)' }}>
          Questions about a planned deprecation or migration? Email <a href="mailto:contact@freightutils.com" style={{ color: 'var(--page-cat, var(--accent))' }}>contact@freightutils.com</a>.
        </p>
      </main>
    </>
  );
}
