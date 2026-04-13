import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 80, fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Page not found</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 24,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          fontSize: 14, color: 'var(--text-muted)', textAlign: 'left',
        }}>
          Looking for a UN number? <Link href="/adr" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Try our ADR Lookup &rarr;</Link>
          <br />
          Need an HS code? <Link href="/hs" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Search HS codes &rarr;</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {[
            { href: '/ldm', label: 'LDM Calculator — loading metres for road freight' },
            { href: '/cbm', label: 'CBM Calculator — cubic metres for shipping' },
            { href: '/adr', label: 'ADR Dangerous Goods — lookup & exemption calculator' },
            { href: '/hs', label: 'HS Code Lookup — tariff code search' },
            { href: '/api-docs', label: 'API Documentation — all endpoints' },
          ].map(t => (
            <Link key={t.href} href={t.href} style={{
              padding: '10px 16px', borderRadius: 8, fontSize: 14,
              color: 'var(--text)', textDecoration: 'none',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              textAlign: 'left',
            }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{t.href}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{t.label.split(' — ')[1]}</span>
            </Link>
          ))}
        </div>
        <Link href="/" style={{
          display: 'inline-block', padding: '12px 24px', borderRadius: 8,
          background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15,
          textDecoration: 'none',
        }}>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
