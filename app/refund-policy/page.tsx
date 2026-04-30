import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy — FreightUtils',
  description: 'Refund and cancellation terms for FreightUtils Pro API subscriptions.',
  alternates: { canonical: 'https://www.freightutils.com/refund-policy' },
  robots: 'noindex, follow',
};

const h2 = { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800 as const, color: 'var(--text)', margin: '36px 0 12px', letterSpacing: '-0.3px' };
const p = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };
const ul = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14, paddingLeft: 24 };

export default function RefundPolicyPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Refund and Cancellation Policy
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 8 }}>Last updated: May 2026</p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h2 style={h2}>Cancellation</h2>
        <p style={p}>
          You can cancel your Pro subscription at any time via the Manage Subscription button on your dashboard. Your Pro tier remains active until the end of your current billing period. After that, your account automatically reverts to the Free tier (100 requests per day). No further charges are made.
        </p>

        <h2 style={h2}>Refunds</h2>
        <p style={p}>
          Subscriptions are non-refundable for partial billing periods. If you cancel mid-month, you keep Pro access until the period you&apos;ve paid for ends.
        </p>
        <p style={p}>
          Refunds for the current billing period may be issued at our discretion in cases of:
        </p>
        <ul style={ul}>
          <li>Service unavailability lasting more than 24 consecutive hours</li>
          <li>Billing errors or unauthorised charges</li>
          <li>Goodwill resolution at our discretion</li>
        </ul>
        <p style={p}>
          To request a refund, email{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>{' '}
          with your account email and the reason for the request. We respond within 2 business days.
        </p>

        <h2 style={h2}>UK 14-Day Cooling-Off Right</h2>
        <p style={p}>
          Under UK consumer law, digital service subscriptions normally include a 14-day cooling-off period during which you can cancel for a full refund. By starting to use the API after subscribing (sending any request with your Pro-tier API key), you waive this right. This is standard practice for instantly-delivered digital services and is disclosed at checkout.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          For all billing, refund, or cancellation enquiries:{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

      </main>
    </>
  );
}
