import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — FreightUtils',
  description: 'Get in touch with FreightUtils — Pro support, data corrections, security disclosure, and general enquiries.',
  alternates: { canonical: 'https://www.freightutils.com/contact' },
};

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '20px 24px',
  marginBottom: 14,
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.1px' };
const detailStyle: React.CSSProperties = { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 };
const linkStyle: React.CSSProperties = { color: '#e87722', textDecoration: 'none', fontWeight: 600 };

export default function ContactPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Contact
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 12, maxWidth: 640, margin: '12px auto 0', lineHeight: 1.6 }}>
          FreightUtils is operated by <strong>Marius Cristoiu</strong>, a sole trader based in the United Kingdom.
        </p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <div style={sectionStyle}>
          <div style={labelStyle}>General enquiries</div>
          <div style={detailStyle}>
            <a href="mailto:contact@freightutils.com" style={linkStyle}>contact@freightutils.com</a>
            <br />
            We aim to respond within 1 business day.
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Pro API support</div>
          <div style={detailStyle}>
            <a href="mailto:contact@freightutils.com?subject=Pro%20support" style={linkStyle}>contact@freightutils.com</a>
            <br />
            Pro subscribers receive priority handling. We aim to respond within 24 hours, Monday to Friday UK business hours.
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Data corrections &amp; regulatory questions</div>
          <div style={detailStyle}>
            <a href="mailto:contact@freightutils.com?subject=Data%20correction" style={linkStyle}>contact@freightutils.com</a>
            <br />
            Spotted incorrect ADR data, an outdated HS code, or a calculator that doesn&apos;t match the regulation? Send the URL, what you expected, and the authoritative source.
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Security disclosure</div>
          <div style={detailStyle}>
            <a href="mailto:contact@freightutils.com?subject=Security%20disclosure" style={linkStyle}>contact@freightutils.com</a>
            <br />
            For security or vulnerability reports. Please include reproduction steps and avoid testing against live customer data. We acknowledge reports within 1 business day.
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Abuse / takedown</div>
          <div style={detailStyle}>
            <a href="mailto:contact@freightutils.com?subject=Abuse" style={linkStyle}>contact@freightutils.com</a>
            <br />
            Misuse of the API, scraping, or content concerns.
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 24, lineHeight: 1.6 }}>
          We do not run a phone line or live chat. Email is the only supported channel. This keeps things simple, gives us a written record, and lets us respond properly to nuanced freight and compliance questions.
        </p>

      </main>
    </>
  );
}
