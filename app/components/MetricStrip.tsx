interface Metric {
  value: string;
  unit?: string;
  label: string;
  accent?: boolean;
}

interface MetricStripProps {
  metrics: Metric[];
}

/**
 * Display key results prominently — large primary metric with
 * smaller secondary metrics in a horizontal strip.
 */
export default function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 48,
      flexWrap: 'wrap',
      padding: '8px 0',
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{ minWidth: 0 }}>
          <div style={{
            fontSize: m.accent ? 'clamp(2rem, 5vw, 2.5rem)' : 'clamp(1.2rem, 3vw, 1.5rem)',
            fontWeight: 700,
            color: m.accent ? 'var(--accent)' : 'var(--text)',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}>
            {m.value}
            {m.unit && (
              <span style={{
                fontSize: m.accent ? '1.2rem' : '0.9rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginLeft: 6,
              }}>
                {m.unit}
              </span>
            )}
          </div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 4,
          }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
