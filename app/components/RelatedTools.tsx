import Link from 'next/link';

interface RelatedTool {
  href: string;
  label: string;
}

interface Props {
  tools: RelatedTool[];
}

export default function RelatedTools({ tools }: Props) {
  return (
    <div style={{ marginTop: 48, marginBottom: 24 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--text-faint, #8f9ab0)', marginBottom: 12,
      }}>
        Related Tools
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tools.map(t => (
          <Link key={t.href} href={t.href} style={{
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border, #d8dce6)',
            borderRadius: 8,
            padding: '8px 14px',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text, #1e2535)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'border-color 0.12s',
          }}>
            {t.label} <span style={{ color: 'var(--accent)', fontSize: 14 }}>&rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
