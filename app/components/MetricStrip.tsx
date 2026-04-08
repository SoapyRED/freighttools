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
    <div className="results-grid">
      {metrics.map((m, i) => (
        <div key={i}>
          <div className={m.accent ? 'result-primary' : 'result-secondary'}>
            {m.value}
            {m.unit && <span className="result-unit">{m.unit}</span>}
          </div>
          <div className="result-label">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
