import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'FreightUtils privacy policy — data controller, sub-processors, retention, your UK GDPR rights, and ICO complaint route.',
  alternates: { canonical: 'https://www.freightutils.com/privacy' },
  robots: 'noindex, follow',
};

const h2 = { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800 as const, color: 'var(--text)', margin: '36px 0 12px', letterSpacing: '-0.3px', scrollMarginTop: 80 };
const p = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };
const ul = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14, paddingLeft: 24 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 14 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 12px', background: 'var(--bg-card-info)', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)' };
const tdStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid var(--border-light)', verticalAlign: 'top', color: 'var(--text-muted)' };

export default function PrivacyPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 8 }}>Last updated: May 2026</p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h2 style={h2}>Data Controller</h2>
        <p style={p}>
          FreightUtils (<a href="https://www.freightutils.com" style={{ color: '#e87722' }}>www.freightutils.com</a>) is operated by <strong>Marius Cristoiu</strong>, a sole trader based in the United Kingdom. For privacy enquiries, contact{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

        <h2 style={h2}>What Data We Collect</h2>
        <p style={p}>
          FreightUtils is designed to minimise data collection. Most of the site &mdash; calculators, lookups, reference pages, and the unauthenticated portion of the public REST API &mdash; can be used without giving us anything other than your IP address (used transiently for rate limiting).
        </p>
        <p style={p}>
          When you choose to do more, we collect:
        </p>
        <ul style={ul}>
          <li><strong>Email address</strong> &mdash; if you sign up for a free API key on /pricing or /api-docs, or if you upgrade to Pro. Used to deliver the key, the magic-link sign-in email, and (for Pro) billing-related notifications.</li>
          <li><strong>API key + plan tier + signup timestamp</strong> &mdash; stored against your email so you can manage your account.</li>
          <li><strong>Per-key request counts (daily and monthly)</strong> &mdash; aggregated counters to enforce rate limits. We do not log the URL paths or request bodies of authenticated calls beyond what the audit privacy contract permits (no bodies, no API key values, no IPs, no emails &mdash; see <a href="https://github.com/SoapyRED/freighttools/blob/main/docs/observability.md" style={{ color: '#e87722' }} target="_blank" rel="noopener noreferrer">our observability doc</a>).</li>
          <li><strong>Payment metadata</strong> &mdash; if you upgrade to Pro, Stripe processes your payment. We never see or store your card details. We retain only the Stripe customer ID and subscription status linked to your email.</li>
          <li><strong>IP address</strong> &mdash; used transiently by our edge for abuse prevention and rate limiting on anonymous tiers. Hashed and not retained beyond the rate-limit window.</li>
        </ul>
        <p style={p}>
          Calculator inputs (dimensions, weights, UN numbers, HS codes, etc.) are processed in your browser or on the edge and are not associated with any identifying information.
        </p>

        <h2 style={h2}>Sub-processors</h2>
        <p style={p}>
          We rely on the following sub-processors to operate the service. Each is a UK GDPR Article 28 processor; none of them receive data for purposes beyond delivering their function to FreightUtils.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Processor</th>
              <th style={thStyle}>Purpose</th>
              <th style={thStyle}>Data shared</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}><strong>Vercel</strong></td>
              <td style={tdStyle}>Hosting, edge runtime, request logs</td>
              <td style={tdStyle}>HTTP request metadata (IP, path, status, UA)</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Upstash</strong> (via Vercel KV)</td>
              <td style={tdStyle}>Key&ndash;value store for user accounts, API keys, rate-limit counters, magic-link tokens</td>
              <td style={tdStyle}>Email, API key, plan tier, Stripe customer ID, ephemeral magic tokens</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Cloudflare</strong></td>
              <td style={tdStyle}>DNS, edge CDN for static assets</td>
              <td style={tdStyle}>HTTP request metadata only; cookieless</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Stripe</strong></td>
              <td style={tdStyle}>Payment processing for Pro subscriptions</td>
              <td style={tdStyle}>Email, billing details, card data (collected and held by Stripe directly &mdash; we never see card numbers)</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Resend</strong></td>
              <td style={tdStyle}>Transactional email (API-key delivery, magic links, billing notices)</td>
              <td style={tdStyle}>Email address, message content</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Sentry</strong></td>
              <td style={tdStyle}>Error monitoring</td>
              <td style={tdStyle}>Error stack traces, request metadata; user-supplied data is scrubbed before send</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>UptimeRobot</strong></td>
              <td style={tdStyle}>Uptime monitoring (probes our public endpoints)</td>
              <td style={tdStyle}>None of your data &mdash; only synthetic probe traffic</td>
            </tr>
          </tbody>
        </table>
        <p style={p}>
          A more formal data-processing agreement is available at{' '}
          <a href="/dpa" style={{ color: '#e87722' }}>/dpa</a>.
        </p>

        <h2 style={h2}>Retention</h2>
        <ul style={ul}>
          <li><strong>User accounts and API keys:</strong> retained while your account is active. Deleted within 30 days of account closure on request.</li>
          <li><strong>Daily / monthly request counters:</strong> 48 hours (daily) and end-of-month (monthly).</li>
          <li><strong>Magic-link tokens:</strong> 15 minutes &mdash; one-time use.</li>
          <li><strong>Sessions:</strong> 7 days from last sign-in.</li>
          <li><strong>Payment records (held by Stripe):</strong> per Stripe&apos;s retention policy &mdash; typically 7 years for tax/regulatory reasons.</li>
          <li><strong>Audit and error logs:</strong> 30 days.</li>
        </ul>

        <h2 style={h2}>Your Rights Under UK GDPR</h2>
        <p style={p}>
          You have the right to:
        </p>
        <ul style={ul}>
          <li>Access the personal data we hold about you (Article 15)</li>
          <li>Request correction of inaccurate data (Article 16)</li>
          <li>Request erasure of your data (Article 17 &mdash; &ldquo;right to be forgotten&rdquo;)</li>
          <li>Request a portable copy of your data (Article 20)</li>
          <li>Object to processing or withdraw consent at any time (Article 21)</li>
        </ul>
        <p style={p}>
          To exercise any of these rights, email{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>{' '}
          from the address linked to your account. We respond within 30 days, usually within 2 business days.
        </p>
        <p style={p}>
          If you believe we have not handled your data correctly, you have the right to lodge a complaint with the UK&apos;s Information Commissioner&apos;s Office (ICO):{' '}
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>https://ico.org.uk/make-a-complaint/</a>.
        </p>

        <h2 style={h2} id="cookies">Cookies</h2>
        <p style={p}>
          FreightUtils uses cookies sparingly and only where strictly necessary:
        </p>
        <ul style={ul}>
          <li><strong>Authentication session cookie</strong> &mdash; set only when you sign in to your dashboard. HttpOnly, Secure, SameSite=Lax. 7-day expiry. PECR-exempt as &ldquo;strictly necessary for a service explicitly requested by the user&rdquo;.</li>
        </ul>
        <p style={p}>
          We do <strong>not</strong> use first-party analytics cookies. Vercel Web Analytics (anonymous performance metrics) and Cloudflare Web Analytics (if used at the CDN edge) are cookieless. We do not use Google Analytics, advertising pixels, or any cross-site tracking. There is no cookie consent banner because there is nothing requiring consent under PECR.
        </p>
        <p style={p}>
          Your theme preference (light/dark mode) is stored in your browser&apos;s localStorage and never transmitted.
        </p>

        <h2 style={h2}>Children&apos;s Privacy</h2>
        <p style={p}>
          FreightUtils is a professional reference tool for the freight and logistics industry. We do not knowingly collect information from anyone under 16.
        </p>

        <h2 style={h2}>Changes to This Policy</h2>
        <p style={p}>
          We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. Material changes affecting Pro subscribers will be notified by email at least 30 days before they take effect.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          For privacy enquiries, data subject access requests, or to flag a concern:{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

      </main>
    </>
  );
}
