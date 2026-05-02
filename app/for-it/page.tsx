import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For IT Departments — FreightUtils',
  description:
    'Reference page for corporate IT teams evaluating freightutils.com for whitelist approval — what the site is, what it does and does not do, and the network endpoints required.',
  alternates: { canonical: 'https://www.freightutils.com/for-it' },
  robots: 'index, follow',
};

const accent = '#7C3AED';

const h2 = {
  fontSize: 'clamp(18px, 4vw, 22px)',
  fontWeight: 800 as const,
  color: 'var(--text)',
  margin: '36px 0 12px',
  letterSpacing: '-0.3px',
};
const p = {
  color: 'var(--text-muted)',
  fontSize: 15,
  lineHeight: 1.7,
  marginBottom: 14,
};
const code = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 13.5,
  background: 'var(--bg-hero)',
  padding: '2px 6px',
  borderRadius: 4,
};

export default function ForItPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' as const }}>
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
        }}>
          For IT departments
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 8 }}>
          A short reference for corporate IT teams evaluating freightutils.com for whitelist approval.
        </p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h2 style={h2}>What this site is</h2>
        <p style={p}>
          FreightUtils is a free reference site for road, sea, and air freight professionals: loading-metre and CBM calculators, chargeable-weight tools, ADR 2025 dangerous-goods lookups, HS 2022 tariff codes, UK import duty estimates, UN/LOCODE search, ISO container specifications, IATA airline and AWB-prefix data, and Incoterms 2020 references. Every tool is either a read-only lookup against publicly licensed reference data or a deterministic calculation performed in the user&apos;s browser. The same data and calculations are also exposed via a public REST API documented at{' '}
          <Link href="/api-docs" style={{ color: accent }}>/api-docs</Link>, used by transport-management systems, n8n and Zapier workflows, and AI agents.
        </p>

        <h2 style={h2}>Who runs it</h2>
        <p style={p}>
          The site is operated by{' '}
          <a href="https://www.linkedin.com/in/marius-cristoiu-a853812a2/" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>Marius Cristoiu</a>, a sole trader based in the United Kingdom and an ADR-certified freight transport planner. Hosting is on Vercel, with edge delivery from the Frankfurt region for EU traffic. The general contact address is{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: accent }}>contact@freightutils.com</a>; security disclosures follow{' '}
          <a href="/.well-known/security.txt" style={{ color: accent }}>RFC 9116</a> at the canonical location.
        </p>

        <h2 style={h2}>What the site does and does not do</h2>
        <p style={p}>
          Pages are statically or server-rendered HTML. The calculator pages run JavaScript locally in the browser to compute results from user-entered dimensions and weights — no calculation inputs are sent to a server unless the user explicitly invokes the REST API with their own API key. The REST API itself serves JSON over HTTPS with rate-limit headers (<span style={code}>X-RateLimit-Limit</span>, <span style={code}>X-RateLimit-Remaining</span>, <span style={code}>X-RateLimit-Reset</span>) so callers can implement back-off cleanly.
        </p>
        <p style={p}>
          The site does not run third-party advertising networks, tracking pixels, cross-site analytics scripts, or social-media trackers. The only telemetry is Vercel&apos;s built-in cookieless analytics (page-view counts and HTTP-error rates) which is served same-origin through the site&apos;s own hostname and stores no personal identifiers. There is no PECR consent banner because there is no PECR-relevant cookie use.
        </p>
        <p style={p}>
          User accounts are optional. When a user signs up for a free or Pro API key, FreightUtils stores their email address, the API key, the plan tier, and rolling request counters. Payment data is never stored on FreightUtils servers — Stripe handles billing directly. The full processing detail, retention windows, and sub-processor list are in the{' '}
          <Link href="/privacy" style={{ color: accent }}>privacy policy</Link> and the{' '}
          <Link href="/dpa" style={{ color: accent }}>UK GDPR Article 28 DPA</Link>.
        </p>

        <h2 style={h2}>Network endpoints to allow</h2>
        <p style={p}>
          For full functionality of the site and API, allow the following hostnames through corporate firewalls and proxy filters. All traffic is HTTPS over port 443.
        </p>
        <p style={p}>
          <span style={code}>freightutils.com</span> &mdash; apex domain. 308-redirects all traffic to the canonical www host.<br />
          <span style={code}>www.freightutils.com</span> &mdash; canonical site host. Serves every HTML page, the REST API at <span style={code}>/api/*</span>, the MCP server at <span style={code}>/api/mcp/mcp</span>, the OpenAPI specification at <span style={code}>/openapi.json</span>, the Postman collection, the ADR Quick-Reference PDF, and all favicon and image assets.<br />
          <span style={code}>fonts.googleapis.com</span> &mdash; Google Fonts stylesheet for the Outfit typeface used across the site.<br />
          <span style={code}>fonts.gstatic.com</span> &mdash; Google Fonts WOFF2 font files referenced from the stylesheet above.
        </p>
        <p style={p}>
          No other third-party hosts are required for the site to render or for the REST API to respond. If your egress filter blocks any subset of these and the site behaves unexpectedly (slow page loads, broken layouts, or specific endpoints returning empty results), the cause is almost certainly proxy-side filtering on one of the four hostnames above rather than anything site-side.
        </p>

        <h2 style={h2}>Privacy and data protection</h2>
        <p style={p}>
          FreightUtils complies with UK GDPR. The processing posture, retention windows, sub-processor list (Vercel, Upstash, Cloudflare, Stripe, Resend, Sentry, UptimeRobot), international-transfer mechanisms, and breach-notification commitments are documented in the{' '}
          <Link href="/privacy" style={{ color: accent }}>privacy policy</Link> and the{' '}
          <Link href="/dpa" style={{ color: accent }}>data processing agreement</Link>. Both are written in plain language and follow the Article-28 structure directly rather than being derived from a third-party SaaS template.
        </p>

        <h2 style={h2}>Security</h2>
        <p style={p}>
          All traffic is served over TLS 1.2+ with HSTS enabled at the edge. Stored credentials and API tokens are encrypted at rest. The site has no inbound user-uploaded content surface (no file uploads, no comment system, no user-generated public pages) so the attack surface is bounded to the API and the static HTML pages. Security disclosures should be sent to{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: accent }}>contact@freightutils.com</a>. The canonical disclosure policy lives at{' '}
          <a href="/.well-known/security.txt" style={{ color: accent }}>/.well-known/security.txt</a>.
        </p>

        <h2 style={h2}>Contact for IT enquiries</h2>
        <p style={p}>
          For whitelist approval, security questionnaires, or any other corporate-IT review:{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: accent }}>contact@freightutils.com</a>. We aim to respond within one UK business day. Reasonable requests for additional documentation (penetration test summary, SOC-2 alignment statement, Article 28 signed copy) are usually answered within the same window.
        </p>

      </main>
    </>
  );
}
