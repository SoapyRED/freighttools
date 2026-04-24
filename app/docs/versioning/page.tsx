import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';

const ogUrl = '/api/og?title=Versioning+Policy&desc=API+and+MCP+versioning+and+stability&badge=POLICY';

export const metadata: Metadata = {
  title: 'Versioning Policy — FreightUtils',
  description: 'How FreightUtils versions its REST API, MCP server, and tool contracts. Semantic versioning for the npm MCP package; stability commitments for REST endpoints.',
  alternates: { canonical: 'https://www.freightutils.com/docs/versioning' },
  openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Versioning Policy' }] },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

const h2 = { fontSize: 'clamp(20px, 4vw, 24px)' as const, fontWeight: 800, color: 'var(--text)', margin: '40px 0 14px', letterSpacing: '-0.3px' };
const h3 = { fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '24px 0 10px' };
const p  = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };
const li = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 6 };
const code: React.CSSProperties = { background: 'var(--bg-card-hover)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' };

export default function VersioningPage() {
  return (
    <>
      <PageHero
        title="Versioning"
        titleAccent="Policy"
        subtitle="How FreightUtils versions its REST API, MCP server, and tool contracts — and what you can rely on."
        category="ref"
        differentiators={['Semantic versioning', 'Stability contract', '3-month breaking-change notice']}
      />

      <main data-category="ref" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        <p style={p}>
          FreightUtils ships three things developers version against: a public <strong>REST API</strong>, an <strong>MCP server</strong> for agent use, and a <strong>tool contract</strong> — the input/output shape of each individual tool. This page explains how each is versioned and what stability means in practice.
        </p>

        <h2 style={h2}>REST API stability contract</h2>
        <p style={p}>
          The REST API at <code style={code}>www.freightutils.com/api/*</code> is the primary integration surface. It&apos;s unversioned in the URL (no <code style={code}>/v1/</code>) because all changes follow the stability contract below — a change that would break clients doesn&apos;t ship without notice.
        </p>

        <h3 style={h3}>What counts as a breaking change</h3>
        <ul>
          <li style={li}>Removing or renaming a response field</li>
          <li style={li}>Changing a field&apos;s type (string → number, etc.)</li>
          <li style={li}>Removing or renaming a query/path parameter</li>
          <li style={li}>Changing a default that alters response shape</li>
          <li style={li}>Retiring an endpoint URL</li>
        </ul>

        <h3 style={h3}>What counts as additive (anytime)</h3>
        <ul>
          <li style={li}>Adding a new endpoint</li>
          <li style={li}>Adding a new optional query parameter</li>
          <li style={li}>Adding a new field to a response</li>
          <li style={li}>Widening an enum (adding new accepted values)</li>
          <li style={li}>Bug fixes that restore documented behaviour</li>
        </ul>

        <h3 style={h3}>Breaking-change notice</h3>
        <p style={p}>
          Breaking REST changes get at minimum <strong>3 months notice</strong> via: (a) a <Link href="/changelog" style={{ color: 'var(--page-cat, var(--accent))' }}>changelog</Link> entry tagged <code style={code}>API Change</code>, (b) a <Link href="/docs/deprecation" style={{ color: 'var(--page-cat, var(--accent))' }}>deprecation</Link> entry, (c) <code style={code}>Deprecation</code> and <code style={code}>Sunset</code> response headers on affected endpoints, and (d) an email to holders of affected API keys.
        </p>

        <h2 style={h2}>MCP server — semantic versioning</h2>
        <p style={p}>
          The MCP server ships as <code style={code}>freightutils-mcp</code> on npm and follows <strong>semantic versioning</strong>:
        </p>
        <ul>
          <li style={li}><strong>Major (x.0.0)</strong> — a breaking change to tool names, tool input schemas, or server transport. Rare.</li>
          <li style={li}><strong>Minor (1.x.0)</strong> — a new tool added, or a new optional argument on an existing tool. Safe upgrades.</li>
          <li style={li}><strong>Patch (1.0.x)</strong> — bug fix, data refresh, or output accuracy improvement. Always safe to upgrade.</li>
        </ul>
        <p style={p}>
          The hosted Streamable-HTTP endpoint at <code style={code}>www.freightutils.com/api/mcp/mcp</code> mirrors the latest minor of the npm package within 24 hours of release. If you need a pinned version, use the npm package via <code style={code}>npx freightutils-mcp</code> directly.
        </p>

        <h2 style={h2}>Tool contract stability</h2>
        <p style={p}>
          Each tool — whether called via REST, MCP, or the npm package — has its own contract: a stable set of inputs and a stable shape of outputs. Tools reach stability in stages.
        </p>

        <h3 style={h3}>Stability tiers</h3>
        <ul>
          <li style={li}><strong>Stable</strong> — the tool is in general availability. Its inputs, outputs, and semantics follow the contract above. This is the default.</li>
          <li style={li}><strong>Preview</strong> — shape is likely to change based on feedback; use at your own risk. Marked with <code style={code}>&quot;stability&quot;: &quot;preview&quot;</code> on the tool&apos;s <Link href="/api-docs" style={{ color: 'var(--page-cat, var(--accent))' }}>API docs</Link> entry and in the MCP tool description.</li>
          <li style={li}><strong>Deprecated</strong> — still functional but scheduled for removal; see <Link href="/docs/deprecation" style={{ color: 'var(--page-cat, var(--accent))' }}>deprecation policy</Link>.</li>
        </ul>

        <h2 style={h2}>Subscribing to breaking-change notifications</h2>
        <p style={p}>Three channels, in order of recommended coverage:</p>
        <ul>
          <li style={li}><strong>Changelog RSS</strong> — subscribe to <a href="/changelog.xml" style={{ color: 'var(--page-cat, var(--accent))' }}>/changelog.xml</a>. Every API Change and Deprecation entry lands here first. This is the most reliable channel.</li>
          <li style={li}><strong>Email to API key holders</strong> — if you&apos;ve registered an API key, you&apos;ll receive an email for any breaking change to an endpoint your key has hit in the last 90 days. Register at <Link href="/api-docs" style={{ color: 'var(--page-cat, var(--accent))' }}>/api-docs</Link>.</li>
          <li style={li}><strong>Roadmap page</strong> — see <Link href="/roadmap" style={{ color: 'var(--page-cat, var(--accent))' }}>/roadmap</Link> for what&apos;s planned. In-progress items often ship behind a preview flag before becoming stable.</li>
        </ul>

        <h2 style={h2}>Data versioning</h2>
        <p style={p}>
          Reference datasets (ADR, HS, Incoterms, UN/LOCODE, airlines) are versioned against their upstream source edition. The current edition is shown on each tool&apos;s page and in the <code style={code}>/api/health</code> response under <code style={code}>data_versions</code>. Dataset refreshes are additive unless the upstream body itself removes entries (rare, signalled the same way as an API breaking change).
        </p>

        <h2 style={h2}>Questions</h2>
        <p style={p}>
          Contract unclear, spec ambiguous, or a change surprised you? Email <a href="mailto:contact@freightutils.com" style={{ color: 'var(--page-cat, var(--accent))' }}>contact@freightutils.com</a> — that&apos;s always faster than guessing.
        </p>
      </main>
    </>
  );
}
