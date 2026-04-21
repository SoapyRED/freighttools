import type { MergedShed, CriticalRules, Confidence } from '@/lib/calculations/lhr-sheds';

interface Props {
  sheds: MergedShed[];
  criticalRules: CriticalRules;
  lastVerified: string | null;
  correctionsEmail: string;
}

const CONFIDENCE_ORDER: Confidence[] = [
  'verified',
  'community_contributed',
  'pending_verification',
  'operational_only',
  'hmrc_only',
];

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  verified: 'Verified',
  community_contributed: 'Community-contributed',
  pending_verification: 'Verify on shift',
  operational_only: 'Operational only',
  hmrc_only: 'HMRC-only',
};

/**
 * Print-only layout. Hidden on-screen, rendered only when the browser enters
 * print mode (see `@media print` rules in the page's inline style). The
 * on-screen interactive search/table is hidden in print and replaced by this
 * compact grouped layout.
 */
export default function LhrShedsPrint({ sheds, criticalRules, lastVerified, correctionsEmail }: Props) {
  // Group operational sheds by confidence; put HMRC-only in a trailing table.
  const grouped: Record<Confidence, MergedShed[]> = {
    verified: [],
    community_contributed: [],
    pending_verification: [],
    operational_only: [],
    hmrc_only: [],
  };
  for (const s of sheds) grouped[s.confidence].push(s);

  return (
    <div className="lhr-print-only" aria-hidden="true">
      <header className="lhr-print-head">
        <h1>Heathrow Cargo Shed Codes</h1>
        <p className="lhr-print-sub">
          Operational handler truth × HMRC regulated truth · Last verified {lastVerified ?? '—'} ·{' '}
          freightutils.com/airports/lhr/sheds
        </p>
      </header>

      <section className="lhr-print-rules">
        <h2>Critical operational rules</h2>
        <div className="lhr-print-rule">
          <strong>WFS Horseshoe default:</strong> Sheds {criticalRules.horseshoe_default.sheds_covered.join(', ')} →
          subject <code>{criticalRules.horseshoe_default.subject_code}</code> ·{' '}
          prealert <code>{criticalRules.horseshoe_default.prealert_email}</code>.
          <div className="lhr-print-hmrc-line">HMRC: {criticalRules.horseshoe_default.hmrc_registration}</div>
        </div>
        <div className="lhr-print-rule lhr-print-rule-warn">
          <strong>⚠ AA exception (prefix {criticalRules.horseshoe_aa_exception.awb_prefix}):</strong>{' '}
          Physical {criticalRules.horseshoe_aa_exception.physical_shed} — still uses{' '}
          <code>{criticalRules.horseshoe_aa_exception.subject_code}</code> +{' '}
          <code>{criticalRules.horseshoe_aa_exception.prealert_email}</code>.
          <div className="lhr-print-hmrc-line">{criticalRules.horseshoe_aa_exception.hmrc_registration}</div>
        </div>
      </section>

      {CONFIDENCE_ORDER.map(conf => {
        const group = grouped[conf];
        if (group.length === 0) return null;
        return (
          <section key={conf} className={`lhr-print-group lhr-print-group-${conf}`}>
            <h2>
              {CONFIDENCE_LABELS[conf]} <span className="lhr-print-count">({group.length})</span>
            </h2>
            <table>
              <thead>
                <tr>
                  <th>Shed</th>
                  <th>Handler</th>
                  <th>Airlines / prefixes</th>
                  <th>Prealert email</th>
                  <th>HMRC code</th>
                </tr>
              </thead>
              <tbody>
                {group.map(s => (
                  <tr key={s.key}>
                    <td className="mono">
                      <strong>{s.shed_code || '—'}</strong>
                      {s.subject_code && <div className="dim">{s.subject_code}</div>}
                      {s.is_critical_rule && <div className="rule-flag">RULE</div>}
                    </td>
                    <td>
                      <div>{s.handler_common_name || '—'}</div>
                      {s.handler_legal_name && s.handler_legal_name !== s.handler_common_name && (
                        <div className="dim">{s.handler_legal_name}</div>
                      )}
                      {s.hmrc?.address && <div className="dim">{s.hmrc.address}</div>}
                    </td>
                    <td>
                      {s.airlines.length > 0 && (
                        <div>
                          {s.airlines.map(a => `${a.code}${a.awb_prefix ? ` (${a.awb_prefix})` : ''}`).join(', ')}
                        </div>
                      )}
                      {s.awb_prefixes.length > 0 && (
                        <div className="dim">Prefixes: {s.awb_prefixes.join(', ')}</div>
                      )}
                    </td>
                    <td className="mono">{s.prealert_email || '—'}</td>
                    <td className="mono">{s.hmrc?.code || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      <footer className="lhr-print-foot">
        <p>
          Operational data © FreightUtils (CC BY 4.0). HMRC data: Open Government Licence v3.0, source HM Revenue &amp; Customs.
        </p>
        <p>Corrections: {correctionsEmail} · freightutils.com/airports/lhr/sheds</p>
      </footer>
    </div>
  );
}
