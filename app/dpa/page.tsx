import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Processing Agreement — FreightUtils',
  description: 'FreightUtils data processing agreement — UK GDPR Article 28 terms covering Pro API and authenticated free-tier accounts.',
  alternates: { canonical: 'https://www.freightutils.com/dpa' },
  robots: 'noindex, follow',
};

const h2 = { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800 as const, color: 'var(--text)', margin: '36px 0 12px', letterSpacing: '-0.3px' };
const p = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };
const ul = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14, paddingLeft: 24 };

export default function DpaPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Data Processing Agreement
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 8 }}>Last updated: May 2026 &middot; Effective on Pro signup</p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <p style={p}>
          This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the agreement between you (&ldquo;Customer&rdquo;, the data controller) and Marius Cristoiu trading as FreightUtils (&ldquo;FreightUtils&rdquo;, the data processor) governing FreightUtils&apos;s processing of personal data on the Customer&apos;s behalf in the course of providing the FreightUtils API service.
        </p>
        <p style={p}>
          This DPA takes effect automatically when you create a FreightUtils account or upgrade to a Pro subscription &mdash; no separate signature flow is required. The structure follows UK GDPR Article 28(3); a separate signed copy is available on request to{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

        <h2 style={h2}>1. Subject Matter and Duration</h2>
        <p style={p}>
          FreightUtils processes Customer personal data only to provide the API service to the Customer. Processing continues for as long as the Customer maintains an active account, plus the retention windows set out in our{' '}
          <a href="/privacy" style={{ color: '#e87722' }}>privacy policy</a>.
        </p>

        <h2 style={h2}>2. Nature and Purpose of Processing</h2>
        <p style={p}>
          To deliver authenticated API access, billing for Pro subscriptions, transactional email (API key delivery, magic-link sign-in, billing), rate-limit enforcement, and account self-service via the dashboard.
        </p>

        <h2 style={h2}>3. Categories of Personal Data and Data Subjects</h2>
        <ul style={ul}>
          <li><strong>Data subjects:</strong> Customer end-users who sign up for a FreightUtils account or whose details the Customer submits in the course of using the service.</li>
          <li><strong>Categories of data:</strong> email address, API key, plan tier, signup timestamp, request counters, IP address (transient, for rate limiting), Stripe customer ID and billing metadata.</li>
        </ul>

        <h2 style={h2}>4. Customer (Controller) Obligations</h2>
        <p style={p}>
          The Customer warrants that it has a lawful basis under UK GDPR Article 6 for any personal data it submits, and that the data has been collected and disclosed to FreightUtils in compliance with applicable data protection law.
        </p>

        <h2 style={h2}>5. FreightUtils (Processor) Obligations</h2>
        <p style={p}>
          FreightUtils shall:
        </p>
        <ul style={ul}>
          <li>Process personal data only on documented instructions from the Customer (including those set out in the Customer&apos;s use of the API and account features).</li>
          <li>Ensure that personnel authorised to process the personal data are bound by confidentiality obligations.</li>
          <li>Implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk &mdash; including encryption in transit (TLS 1.2+), encryption at rest for stored credentials and tokens, access logging, and least-privilege access controls.</li>
          <li>Assist the Customer, taking into account the nature of processing, in responding to data subject requests under UK GDPR Articles 15&ndash;22.</li>
          <li>Assist the Customer with data protection impact assessments and prior consultations with the ICO where applicable.</li>
          <li>Notify the Customer without undue delay (and in any event within 72 hours of becoming aware) if a personal data breach affects the Customer&apos;s data.</li>
          <li>At the Customer&apos;s choice, delete or return all personal data after the end of the provision of services, except where retention is required by law.</li>
          <li>Make available to the Customer all information necessary to demonstrate compliance with this clause and allow for and contribute to audits.</li>
        </ul>

        <h2 style={h2}>6. Sub-processors</h2>
        <p style={p}>
          The Customer provides general written authorisation for FreightUtils to engage the sub-processors listed in our{' '}
          <a href="/privacy" style={{ color: '#e87722' }}>privacy policy</a>. Current sub-processors: Vercel, Upstash (via Vercel KV), Cloudflare, Stripe, Resend, Sentry, UptimeRobot.
        </p>
        <p style={p}>
          FreightUtils will give the Customer at least 30 days&apos; notice via email of any new or replaced sub-processor. The Customer may object on reasonable data-protection grounds; if the parties cannot agree on a remedy, the Customer may terminate the Pro subscription with a pro-rata refund of unused subscription time.
        </p>

        <h2 style={h2}>7. International Transfers</h2>
        <p style={p}>
          FreightUtils is operated from the United Kingdom. Sub-processors may store and process data in the United States, European Union, or other regions. Where personal data is transferred outside the UK, transfers are protected by the UK addendum to the EU Standard Contractual Clauses, the UK International Data Transfer Agreement, or another lawful transfer mechanism recognised under UK data protection law.
        </p>

        <h2 style={h2}>8. Data Subject Rights</h2>
        <p style={p}>
          FreightUtils will, on request, assist the Customer in fulfilling its obligations to respond to data subject access, rectification, erasure, restriction, portability, and objection requests. Direct requests from data subjects may also be sent to{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

        <h2 style={h2}>9. Personal Data Breach</h2>
        <p style={p}>
          FreightUtils will notify the Customer at the email on file without undue delay, and within 72 hours of becoming aware, of a personal data breach affecting the Customer&apos;s data. Notification will include the nature of the breach, categories and approximate number of data subjects affected, likely consequences, and measures taken or proposed.
        </p>

        <h2 style={h2}>10. Audit</h2>
        <p style={p}>
          The Customer may request, no more than once per twelve-month period, a written summary of the technical and organisational measures FreightUtils has implemented. Where the Customer can demonstrate that this summary is insufficient, the parties will agree on a more detailed audit at the Customer&apos;s reasonable cost.
        </p>

        <h2 style={h2}>11. Return or Deletion of Data</h2>
        <p style={p}>
          On termination of the FreightUtils account, the Customer may request return or deletion of the Customer&apos;s personal data within 30 days. Backups containing the data will be overwritten on the standard backup rotation cycle (no longer than 90 days).
        </p>

        <h2 style={h2}>12. Liability</h2>
        <p style={p}>
          Liability under this DPA is governed by the limitation of liability set out in our{' '}
          <a href="/terms" style={{ color: '#e87722' }}>Terms of Service</a>, save where a higher cap is required by law (for example, fines imposed under UK GDPR for which the parties are jointly liable).
        </p>

        <h2 style={h2}>13. Governing Law</h2>
        <p style={p}>
          This DPA is governed by the laws of England and Wales. Any disputes are subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          For all DPA enquiries:{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

        <p style={{ ...p, fontSize: 12, color: 'var(--text-faint)', marginTop: 32 }}>
          This DPA is structured to follow UK GDPR Article 28(3) directly. It is not derived from any other SaaS company&apos;s template.
        </p>

      </main>
    </>
  );
}
