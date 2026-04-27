'use client';

import { useMemo, useState, useCallback } from 'react';
import type { MergedShed, Confidence } from '@/lib/calculations/lhr-sheds';

interface Props {
  sheds: MergedShed[];
}

const CONFIDENCE_FILTERS: { value: Confidence | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'operationally_verified', label: 'Operationally verified' },
  { value: 'publicly_verified', label: 'Publicly verified' },
  { value: 'verified', label: 'Verified' },
  { value: 'community_contributed', label: 'Community' },
  { value: 'pending_verification', label: 'Pending verification' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'operational_only', label: 'Operational only' },
  { value: 'hmrc_only', label: 'HMRC only' },
];

const CONFIDENCE_STYLES: Record<Confidence, { bg: string; color: string; label: string }> = {
  // v2 (2026-04-27)
  operationally_verified: { bg: 'rgba(34,197,94,0.18)',   color: '#14532D', label: 'Operationally verified' },
  publicly_verified:      { bg: 'rgba(59,130,246,0.18)',  color: '#1E3A8A', label: 'Publicly verified' },
  needs_review:           { bg: 'rgba(234,179,8,0.18)',   color: '#92400E', label: 'Needs review' },
  // v1 (legacy values, kept for any unmigrated entries)
  verified:              { bg: 'rgba(34,197,94,0.12)',   color: '#15803D', label: 'Verified' },
  community_contributed: { bg: 'rgba(168,85,247,0.12)',  color: '#7C3AED', label: 'Community' },
  pending_verification:  { bg: 'rgba(234,179,8,0.15)',   color: '#B45309', label: 'Pending verification' },
  operational_only:      { bg: 'rgba(59,130,246,0.12)',  color: '#1D4ED8', label: 'Operational only' },
  hmrc_only:             { bg: 'rgba(100,116,139,0.12)', color: '#475569', label: 'HMRC only' },
};

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const s = CONFIDENCE_STYLES[confidence];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
      }}
      className="lhr-confidence-badge"
    >
      {s.label}
    </span>
  );
}

export default function LhrShedsSearch({ sheds }: Props) {
  const [query, setQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<Confidence | 'all'>('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = useCallback((key: string) => {
    setExpandedKey(prev => (prev === key ? null : key));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sheds.filter(s => {
      if (confidenceFilter !== 'all' && s.confidence !== confidenceFilter) return false;
      if (!q) return true;
      const hay = [
        s.key,
        s.shed_code,
        s.subject_code,
        s.handler_legal_name,
        s.handler_common_name,
        s.prealert_email,
        s.routing_notes,
        s.hmrc?.code,
        s.hmrc?.address,
        s.hmrc?.legal_name,
        ...s.airlines.flatMap(a => [a.code, a.name]),
        ...s.awb_prefixes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [sheds, query, confidenceFilter]);

  return (
    <section className="lhr-sheds-search">
      {/* Search + filters */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderLeft: '3px solid var(--page-cat, var(--cat-customs))',
        }}
      >
        <label
          htmlFor="lhr-sheds-query"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          Search sheds
        </label>
        <input
          id="lhr-sheds-query"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Airline, shed code, handler, HMRC code, email…"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 15,
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            marginBottom: 12,
            fontFamily: 'inherit',
          }}
          autoComplete="off"
        />

        <div
          className="lhr-filter-chips"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
          role="tablist"
          aria-label="Filter by confidence"
        >
          {CONFIDENCE_FILTERS.map(f => {
            const active = confidenceFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setConfidenceFilter(f.value)}
                aria-pressed={active}
                style={{
                  padding: '6px 11px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  border: `1px solid ${active ? 'var(--page-cat, var(--cat-customs))' : 'var(--border)'}`,
                  borderRadius: 16,
                  background: active
                    ? 'var(--page-cat-tint, var(--cat-customs-tint))'
                    : 'var(--bg)',
                  color: active
                    ? 'var(--page-cat, var(--cat-customs))'
                    : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.1s, border-color 0.1s, color 0.1s',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-faint)',
          margin: '0 0 10px',
        }}
      >
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {sheds.length} sheds
      </p>

      {/* Results table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
        className="lhr-sheds-table-wrap"
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
              minWidth: 720,
            }}
            className="lhr-sheds-table"
          >
            <thead>
              <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                <th style={th}>Shed</th>
                <th style={th}>Handler</th>
                <th style={th}>Airlines</th>
                <th style={th}>Prealert email</th>
                <th style={th}>Confidence</th>
                <th style={{ ...th, textAlign: 'right' }}>HMRC code</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 32,
                      textAlign: 'center',
                      color: 'var(--text-faint)',
                      fontSize: 14,
                    }}
                  >
                    No sheds match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(s => {
                  const isOpen = expandedKey === s.key;
                  return (
                    <ShedRow
                      key={s.key}
                      shed={s}
                      isOpen={isOpen}
                      onToggle={() => toggleExpand(s.key)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const th: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid var(--border)',
};

const td: React.CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'top',
  lineHeight: 1.45,
};

function ShedRow({
  shed,
  isOpen,
  onToggle,
}: {
  shed: MergedShed;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderTop: '1px solid var(--border)',
          cursor: 'pointer',
          background: isOpen ? 'var(--page-cat-tint, var(--cat-customs-tint))' : 'transparent',
        }}
        className="lhr-shed-row"
      >
        <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
          <span aria-hidden="true" style={{ display: 'inline-block', width: 14, color: 'var(--text-faint)' }}>
            {isOpen ? '▾' : '▸'}
          </span>
          {shed.shed_code || '—'}
          {shed.is_critical_rule && (
            <span
              title="Critical operational rule"
              style={{
                display: 'inline-block',
                marginLeft: 6,
                padding: '1px 5px',
                fontSize: 10,
                fontWeight: 700,
                background: 'var(--cat-dg-tint)',
                color: 'var(--cat-dg)',
                borderRadius: 3,
              }}
            >
              RULE
            </span>
          )}
          {shed.subject_code && (
            <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 400, color: 'var(--text-faint)', marginTop: 2 }}>
              {shed.subject_code}
            </div>
          )}
        </td>
        <td style={{ ...td, color: 'var(--text-primary)', fontWeight: 500 }}>
          {shed.handler_common_name || shed.handler_legal_name || '—'}
        </td>
        <td style={td}>
          {shed.airlines.length === 0 ? (
            <span style={{ color: 'var(--text-faint)' }}>—</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {shed.airlines.slice(0, 4).map((a, i) => (
                <span
                  key={`${a.code}-${i}`}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 6px',
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                  }}
                  title={a.name}
                >
                  {a.code}
                </span>
              ))}
              {shed.airlines.length > 4 && (
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                  +{shed.airlines.length - 4}
                </span>
              )}
            </div>
          )}
        </td>
        <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {shed.prealert_email || <span style={{ color: 'var(--text-faint)' }}>—</span>}
        </td>
        <td style={td}>
          <ConfidenceBadge confidence={shed.confidence} />
        </td>
        <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-faint)' }}>
          {shed.hmrc?.code || '—'}
        </td>
      </tr>

      {isOpen && (
        <tr className="lhr-shed-detail" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <td colSpan={6} style={{ padding: '16px 20px 22px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <DetailBlock label="Handler legal name" value={shed.handler_legal_name} />
              <DetailBlock label="Subject code" value={shed.subject_code} mono />
              <DetailBlock label="HMRC code" value={shed.hmrc?.code || null} mono />
              <DetailBlock
                label={shed.hmrc?.source === 'etsf' ? 'HMRC ETSF (Appendix 16F)' : shed.hmrc?.source === 'itsf' ? 'HMRC ITSF (Appendix 16D)' : 'HMRC status'}
                value={shed.hmrc?.status || null}
              />
              {shed.hmrc?.address && (
                <DetailBlock
                  label="HMRC address"
                  value={shed.hmrc.address}
                  fullWidth
                />
              )}
              {shed.hmrc?.registered_date && (
                <DetailBlock label="HMRC registered" value={shed.hmrc.registered_date} />
              )}
              {shed.hmrc?.deregistered_date && (
                <DetailBlock label="HMRC deregistered" value={shed.hmrc.deregistered_date} />
              )}
              {shed.awb_prefixes.length > 0 && (
                <DetailBlock
                  label="AWB prefixes"
                  value={shed.awb_prefixes.join(', ')}
                  mono
                />
              )}
              {shed.airlines.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Airlines</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {shed.airlines.map((a, i) => (
                      <span
                        key={`${a.code}-${i}`}
                        style={{
                          padding: '3px 9px',
                          fontSize: 12,
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: 999,
                        }}
                      >
                        <strong style={{ fontFamily: 'monospace' }}>{a.code}</strong>
                        {' '}
                        <span style={{ color: 'var(--text-muted)' }}>{a.name}</span>
                        {a.awb_prefix && (
                          <span style={{ color: 'var(--text-faint)', marginLeft: 6, fontFamily: 'monospace' }}>
                            ({a.awb_prefix})
                          </span>
                        )}
                        {a.variant && (
                          <span style={{ color: 'var(--text-faint)', marginLeft: 6 }}>
                            · {a.variant}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {shed.legal_vs_operational && (
                <div style={{ gridColumn: '1 / -1', padding: 10, background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid #1D4ED8', borderRadius: 4 }}>
                  <div style={labelStyle}>Legal vs operational</div>
                  <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    <div><strong>Legal holder (HMRC):</strong> {shed.legal_vs_operational.legal_holder}</div>
                    <div><strong>Operational brand:</strong> {shed.legal_vs_operational.operational_brand} ({shed.legal_vs_operational.relationship} since {shed.legal_vs_operational.since})</div>
                  </div>
                </div>
              )}
              {shed.former_operator && (
                <div style={{ gridColumn: '1 / -1', padding: 10, background: 'rgba(168,85,247,0.08)', borderLeft: '3px solid #7C3AED', borderRadius: 4 }}>
                  <div style={labelStyle}>Operator history</div>
                  <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    <div><strong>Former operator:</strong> {shed.former_operator.common_name || shed.former_operator.legal_name}{shed.former_operator.operated_until && ` — until ${shed.former_operator.operated_until}`}</div>
                    {shed.former_operator.absorbed_by && (
                      <div><strong>Absorbed by:</strong> {shed.former_operator.absorbed_by}</div>
                    )}
                  </div>
                </div>
              )}
              {shed.absorbed_by && (
                <div style={{ gridColumn: '1 / -1', padding: 10, background: 'rgba(168,85,247,0.08)', borderLeft: '3px solid #7C3AED', borderRadius: 4 }}>
                  <div style={labelStyle}>Operator history</div>
                  <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    <div><strong>Absorbed by:</strong> {shed.absorbed_by.legal_name} ({shed.absorbed_by.absorbed_date})</div>
                    <div><strong>Operational shed code now:</strong> {shed.absorbed_by.operational_shed_code}</div>
                  </div>
                </div>
              )}
              {shed.email_routing && (
                <div style={{ gridColumn: '1 / -1', padding: 10, background: 'rgba(234,179,8,0.10)', borderLeft: '3px solid #B45309', borderRadius: 4 }}>
                  <div style={labelStyle}>Email / code divergence</div>
                  <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    <div><strong>Prealert email:</strong> <span style={{ fontFamily: 'monospace' }}>{shed.email_routing.prealert_email}</span></div>
                    {shed.email_routing.routing_code_on_email && (
                      <div><strong>Email envelope routing code:</strong> {shed.email_routing.routing_code_on_email}</div>
                    )}
                    <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>{shed.email_routing.note}</div>
                  </div>
                </div>
              )}
              {shed.routing_notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Routing notes</div>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                    {shed.routing_notes}
                  </p>
                </div>
              )}
              {shed.hmrc?.note && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>HMRC note</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {shed.hmrc.note}
                  </p>
                </div>
              )}
              {shed.citations && shed.citations.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Sources / citations</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                    {shed.citations.map((c, i) => (
                      <li key={i} style={{ margin: '4px 0' }}>
                        <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', wordBreak: 'break-word' }}>
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {shed.last_verified && (
                <DetailBlock label="Last verified" value={shed.last_verified} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--text-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.7px',
};

function DetailBlock({
  label,
  value,
  mono,
  fullWidth,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  fullWidth?: boolean;
}) {
  if (!value) return null;
  return (
    <div style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          marginTop: 3,
          fontSize: mono ? 13 : 14,
          fontFamily: mono ? 'monospace' : 'inherit',
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          wordBreak: mono ? 'break-all' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}
