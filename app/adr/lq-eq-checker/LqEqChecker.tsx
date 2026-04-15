'use client';

import { useState } from 'react';
import SectionCard from '@/app/components/SectionCard';

interface Item {
  un: string;
  qty: string;
  unit: 'ml' | 'L' | 'g' | 'kg';
  innerQty: string;
}

interface ResultItem {
  un_number: string;
  substance: string;
  class: string;
  packing_group: string;
  lq_limit: string;
  eq_code: string;
  quantity_entered: number;
  unit_entered: string;
  status: 'within_limit' | 'exceeds_limit' | 'not_permitted';
  reason: string;
}

interface Result {
  mode: string;
  overall_status: 'qualifies' | 'does_not_qualify' | 'partial';
  items: ResultItem[];
  summary: { total_items: number; qualifying: number; exceeding: number; not_permitted: number };
  references: { adr_chapter: string; table: string };
}

const EMPTY_ITEM = (): Item => ({ un: '', qty: '', unit: 'L', innerQty: '1' });

const UNITS: Item['unit'][] = ['ml', 'L', 'g', 'kg'];

const VERDICT_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  qualifies: { bg: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', text: '#22c55e', label: 'QUALIFIES ✓' },
  does_not_qualify: { bg: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', text: '#ef4444', label: 'DOES NOT QUALIFY ✗' },
  partial: { bg: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', text: '#f59e0b', label: 'PARTIALLY QUALIFIES ⚠' },
};

export default function LqEqChecker() {
  const [mode, setMode] = useState<'lq' | 'eq'>('lq');
  const [items, setItems] = useState<Item[]>([EMPTY_ITEM()]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateItem(i: number, field: keyof Item, value: string) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function addItem() {
    if (items.length < 20) setItems(prev => [...prev, EMPTY_ITEM()]);
  }

  function removeItem(i: number) {
    if (items.length > 1) setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleCheck() {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        mode,
        items: items.filter(it => it.un && it.qty).map(it => ({
          un_number: it.un.replace(/^UN/i, ''),
          quantity: parseFloat(it.qty),
          unit: it.unit,
          ...(mode === 'eq' ? { inner_packaging_qty: parseInt(it.innerQty) || 1 } : {}),
        })),
      };

      if (payload.items.length === 0) {
        setError('Add at least one item with a UN number and quantity');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/adr/lq-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    color: 'var(--text-muted)',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Mode selector */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 4,
        alignSelf: 'flex-start',
      }}>
        {(['lq', 'eq'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setResult(null); }}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: mode === m ? 700 : 500,
              fontFamily: "'Outfit', sans-serif",
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {m === 'lq' ? 'Limited Quantity' : 'Excepted Quantity'}
          </button>
        ))}
      </div>

      {/* Items input */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderLeft: '3px solid var(--page-cat, var(--cat-dg))',
          borderBottom: '1px solid var(--border)',
          color: 'var(--text-primary)',
          padding: '12px 18px',
          fontSize: 14,
          fontWeight: 700,
        }}>
          {mode === 'lq' ? 'Check Items (LQ)' : 'Check Items (EQ)'}
        </div>
        <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: mode === 'eq' ? '120px 1fr 80px 80px 36px' : '120px 1fr 80px 36px',
              gap: 10,
              alignItems: 'end',
              padding: '12px 0',
              borderBottom: i < items.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div>
                <label style={labelStyle}>UN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1203"
                  value={item.un}
                  onChange={e => updateItem(i, 'un', e.target.value)}
                  style={inputStyle}
                  maxLength={5}
                />
              </div>
              <div>
                <label style={labelStyle}>Quantity</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.qty}
                    onChange={e => updateItem(i, 'qty', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    min="0"
                    step="any"
                  />
                  <select
                    value={item.unit}
                    onChange={e => updateItem(i, 'unit', e.target.value)}
                    style={{ ...inputStyle, width: 70, flex: 'none', cursor: 'pointer' }}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              {mode === 'eq' && (
                <div>
                  <label style={labelStyle}>Inner Pkgs</label>
                  <input
                    type="number"
                    value={item.innerQty}
                    onChange={e => updateItem(i, 'innerQty', e.target.value)}
                    style={inputStyle}
                    min="1"
                  />
                </div>
              )}
              <div>
                <label style={{ ...labelStyle, visibility: 'hidden' }}>Del</label>
                <button
                  onClick={() => removeItem(i)}
                  disabled={items.length <= 1}
                  style={{
                    width: 36, height: 42, borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-faint)',
                    fontSize: 18, cursor: 'pointer',
                    opacity: items.length <= 1 ? 0.3 : 1,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={addItem}
            disabled={items.length >= 20}
            style={{
              background: 'transparent',
              color: 'var(--accent)',
              border: '1px dashed var(--accent)',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              opacity: items.length >= 20 ? 0.5 : 1,
            }}
          >
            + Add Item
          </button>
          <button
            onClick={handleCheck}
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Checking...' : `Check ${mode === 'lq' ? 'LQ' : 'EQ'} Eligibility`}
          </button>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
        </div>
      </div>

      {/* Results */}
      {result && (
        <SectionCard variant="results" title="Results">
          {/* Verdict badge */}
          <div style={{
            display: 'inline-block',
            ...VERDICT_STYLES[result.overall_status],
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 800,
            marginBottom: 20,
          }}>
            {VERDICT_STYLES[result.overall_status].label}
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{result.summary.total_items}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items Checked</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{result.summary.qualifying}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qualifying</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{result.summary.exceeding + result.summary.not_permitted}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failing</div>
            </div>
          </div>

          {/* Per-item table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>UN</th>
                  <th>Substance</th>
                  <th>{mode === 'lq' ? 'LQ Limit' : 'EQ Code'}</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((ri, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{ri.un_number}</td>
                    <td style={{ fontSize: 13 }}>{ri.substance}</td>
                    <td style={{ fontFamily: 'monospace' }}>{mode === 'lq' ? ri.lq_limit : ri.eq_code}</td>
                    <td>{ri.quantity_entered} {ri.unit_entered}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        ...(ri.status === 'within_limit'
                          ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                          : ri.status === 'exceeds_limit'
                          ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
                          : { background: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)', border: '1px solid var(--border)' }),
                      }}>
                        {ri.status === 'within_limit' ? '✓ OK' : ri.status === 'exceeds_limit' ? '✗ Exceeds' : '— N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reasons */}
          <div style={{ marginTop: 16 }}>
            {result.items.filter(ri => ri.status !== 'within_limit').map((ri, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <strong>UN {ri.un_number}:</strong> {ri.reason}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-faint)' }}>
            ADR 2025, Chapter {result.references.adr_chapter}, Table {result.references.table}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
