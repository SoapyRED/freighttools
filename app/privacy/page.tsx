import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | FreightUtils',
  description: 'FreightUtils privacy policy — no accounts, no personal data collection. Learn how we handle your data.',
  alternates: { canonical: 'https://www.freightutils.com/privacy' },
  robots: 'noindex, follow',
};

const h2 = { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800 as const, color: '#1a2332', margin: '36px 0 12px', letterSpacing: '-0.3px' };
const p = { color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };

export default function PrivacyPage() {
  return (
    <>
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: '#8f9ab0', marginTop: 8 }}>Last updated: April 2026</p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h2 style={h2}>Who We Are</h2>
        <p style={p}>
          FreightUtils (<a href="https://www.freightutils.com" style={{ color: '#e87722' }}>www.freightutils.com</a>) is a free freight tools and API platform operated independently from the United Kingdom. We provide freight calculators, reference data, and open REST APIs for the logistics industry.
        </p>

        <h2 style={h2}>What Data We Collect</h2>
        <p style={p}>
          FreightUtils complies with UK GDPR. We do not require user accounts or intentionally collect personal data. There are no contact forms that store submissions, no user profiles, and no tracking of individual users. However, third-party services integrated into the site (Google AdSense, Vercel hosting, Google Fonts) may process cookies, IP addresses, or access logs as described in their respective privacy policies.
        </p>
        <p style={p}>
          All calculations are performed client-side in your browser. The values you enter into our calculators (dimensions, weights, UN numbers, etc.) are processed locally and are never transmitted to our servers.
        </p>

        <h2 style={h2}>API Usage</h2>
        <p style={p}>
          Our REST API endpoints are free and open. API requests are not logged, stored, or associated with any identifying information. No authentication or API keys are required. Standard HTTP access logs may be retained by our hosting provider (Vercel) for operational purposes such as abuse prevention, but these are not used for tracking or analytics.
        </p>

        <h2 style={h2}>Third-Party Services</h2>
        <p style={p}>
          FreightUtils uses the following third-party services:
        </p>
        <p style={p}>
          <strong>Google AdSense</strong> &mdash; We display advertisements provided by Google AdSense. Google may use cookies and web beacons to serve ads based on your prior visits to this site or other websites. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>Google Ads Settings</a>. For more information, see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>Google&apos;s Privacy Policy</a>.
        </p>
        <p style={p}>
          <strong>Vercel</strong> &mdash; Our site is hosted on Vercel. Vercel may collect standard server access logs (IP addresses, request timestamps, URLs). See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>Vercel&apos;s Privacy Policy</a>.
        </p>
        <p style={p}>
          <strong>Google Fonts</strong> &mdash; We load the Outfit typeface from Google Fonts. Google may collect usage data when fonts are served. See <a href="https://developers.google.com/fonts/faq/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722' }}>Google Fonts Privacy</a>.
        </p>

        <h2 style={h2}>Cookies</h2>
        <p style={p}>
          FreightUtils does not set any first-party cookies. Cookies may be set by third-party services (Google AdSense, Google Fonts) as described above. You can manage or block cookies through your browser settings.
        </p>

        <h2 style={h2}>Data Retention</h2>
        <p style={p}>
          Since we do not collect personal data, there is nothing to retain. Your theme preference (light/dark mode) is stored in your browser&apos;s localStorage and never transmitted to any server.
        </p>

        <h2 style={h2}>Children&apos;s Privacy</h2>
        <p style={p}>
          FreightUtils is a professional reference tool for the freight and logistics industry. We do not knowingly collect information from children under 16.
        </p>

        <h2 style={h2}>Changes to This Policy</h2>
        <p style={p}>
          We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of FreightUtils after changes constitutes acceptance of the revised policy.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

      </main>
    </>
  );
}
