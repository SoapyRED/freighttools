import Link from 'next/link';

/**
 * Subtle one-line CTA for API key signup.
 * Only placed on high-traffic tool pages.
 */
export default function ApiCtaBanner() {
  return (
    <div style={{
      marginTop: 32,
      padding: '10px 16px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      fontSize: 13,
      color: 'var(--text-muted)',
      textAlign: 'center',
    }}>
      Using this tool in your own software?{' '}
      <Link href="/api-docs#signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
        Get a free API key &rarr;
      </Link>
    </div>
  );
}
