import Link from 'next/link';

interface ApiCalloutProps {
  method?: 'GET' | 'POST';
  endpoint: string;
  example?: string;
}

/**
 * "Building something? Use the API" banner for tool pages.
 * Shows the endpoint, optional example, and link to API docs.
 */
export default function ApiCallout({ method = 'GET', endpoint, example }: ApiCalloutProps) {
  const methodColor = method === 'GET' ? '#16a34a' : '#2563eb';

  return (
    <div className="section-card" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--accent)',
      borderRadius: 12,
      padding: '20px 24px',
      marginTop: 32,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--text-faint)',
        marginBottom: 12,
      }}>
        REST API
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: example ? 12 : 16, flexWrap: 'wrap' }}>
        <span style={{
          background: methodColor,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 4,
          fontFamily: 'monospace',
        }}>
          {method}
        </span>
        <code style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          fontFamily: "'Courier New', monospace",
        }}>
          {endpoint}
        </code>
      </div>
      {example && (
        <div className="code-block" style={{ marginBottom: 16, fontSize: 12, padding: '14px 18px' }}>
          {example}
        </div>
      )}
      <Link href="/api-docs" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--accent)',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 600,
        transition: 'opacity 0.15s',
      }}>
        View API documentation &rarr;
      </Link>
    </div>
  );
}
