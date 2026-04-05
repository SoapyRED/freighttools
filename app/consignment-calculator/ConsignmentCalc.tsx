'use client';

import { useState, useCallback } from 'react';
import { calculateConsignment, ConsignmentItemInput, ConsignmentResult, ConsignmentMode } from '@/lib/calculations/consignment';

// ─── Types ──────────────────────────────────────────────────────

interface Row {
  id: number;
  description: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  quantity: string;
  grossWeightKg: string;
  stackable: boolean;
  palletType: string;
}

const emptyRow = (id: number): Row => ({
  id, description: '', lengthCm: '', widthCm: '', heightCm: '',
  quantity: '1', grossWeightKg: '', stackable: false, palletType: 'none',
});

// ─── Component ──────────────────────────────────────────────────

export default function ConsignmentCalc() {
  const [rows, setRows] = useState<Row[]>([emptyRow(1), emptyRow(2), emptyRow(3)]);
  const [nextId, setNextId] = useState(4);
  const [mode, setMode] = useState<ConsignmentMode>('road');

  const updateRow = useCallback((id: number, field: keyof Row, value: string | boolean) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const addRow = () => {
    setRows(prev => [...prev, emptyRow(nextId)]);
    setNextId(n => n + 1);
  };

  const removeRow = (id: number) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
  };

  // Build valid inputs and calculate
  const validInputs: ConsignmentItemInput[] = rows
    .filter(r => Number(r.lengthCm) > 0 && Number(r.widthCm) > 0 && Number(r.heightCm) > 0)
    .map(r => ({
      description: r.description,
      lengthCm: Number(r.lengthCm),
      widthCm: Number(r.widthCm),
      heightCm: Number(r.heightCm),
      quantity: Math.max(1, Math.round(Number(r.quantity) || 1)),
      grossWeightKg: Number(r.grossWeightKg) || 0,
      stackable: r.stackable,
      palletType: r.palletType,
    }));

  const result: ConsignmentResult | null = validInputs.length > 0 ? calculateConsignment(validInputs, mode) : null;

  // ── Styles ──────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 20,
  };
  const cardHead: React.CSSProperties = {
    background: 'var(--navy)', padding: '12px 18px',
    fontSize: 14, fontWeight: 700, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };
  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 10px', fontSize: 14,
    border: '1px solid var(--border)', borderRadius: 6,
    background: 'var(--bg)', color: 'var(--text)',
    fontFamily: 'inherit',
  };
  const lbl: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4,
  };
  const statBox: React.CSSProperties = {
    textAlign: 'center', padding: '16px 8px',
    background: 'var(--bg)', borderRadius: 8,
  };
  const statNum: React.CSSProperties = {
    fontSize: 24, fontWeight: 800, color: 'var(--text)',
  };
  const statLabel: React.CSSProperties = {
    fontSize: 11, color: 'var(--text-faint)', marginTop: 4,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };
  const btn: React.CSSProperties = {
    padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff',
    background: '#e87722', border: 'none', borderRadius: 8,
    cursor: 'pointer',
  };
  const removeBtn: React.CSSProperties = {
    background: 'none', border: 'none', color: 'var(--text-faint)',
    cursor: 'pointer', fontSize: 18, padding: '4px 8px', lineHeight: 1,
  };

  const modeBtn = (m: ConsignmentMode, label: string) => ({
    padding: '8px 20px', fontSize: 13, fontWeight: mode === m ? 700 : 500,
    color: mode === m ? '#fff' : 'var(--text-faint)',
    background: mode === m ? '#e87722' : 'transparent',
    border: mode === m ? '1px solid #e87722' : '1px solid var(--border)',
    borderRadius: 6, cursor: 'pointer' as const, fontFamily: 'inherit',
  });

  return (
    <>
      {/* ── Mode Selector ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMode('road')} style={modeBtn('road', 'Road')}>Road</button>
        <button onClick={() => setMode('air')} style={modeBtn('air', 'Air')}>Air</button>
        <button onClick={() => setMode('sea')} style={modeBtn('sea', 'Sea')}>Sea</button>
      </div>

      {/* ── Item Rows ── */}
      <div style={card}>
        <div style={cardHead}>
          <span>Consignment Items</span>
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-faint)' }}>{rows.length} item{rows.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ padding: 16 }}>
          {rows.map((row, idx) => (
            <div key={row.id} style={{
              marginBottom: 16, paddingBottom: 16,
              borderBottom: idx < rows.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)' }}>Item {idx + 1}</span>
                <button style={removeBtn} onClick={() => removeRow(row.id)} title="Remove item">&times;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={lbl}>Description</div>
                  <input style={inp} placeholder="e.g. Pallet A" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} />
                </div>
                <div>
                  <div style={lbl}>L (cm)</div>
                  <input style={inp} type="number" placeholder="120" value={row.lengthCm} onChange={e => updateRow(row.id, 'lengthCm', e.target.value)} />
                </div>
                <div>
                  <div style={lbl}>W (cm)</div>
                  <input style={inp} type="number" placeholder="80" value={row.widthCm} onChange={e => updateRow(row.id, 'widthCm', e.target.value)} />
                </div>
                <div>
                  <div style={lbl}>H (cm)</div>
                  <input style={inp} type="number" placeholder="150" value={row.heightCm} onChange={e => updateRow(row.id, 'heightCm', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={lbl}>Qty</div>
                  <input style={inp} type="number" placeholder="1" min="1" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} />
                </div>
                <div>
                  <div style={lbl}>Weight (kg)</div>
                  <input style={inp} type="number" placeholder="450" value={row.grossWeightKg} onChange={e => updateRow(row.id, 'grossWeightKg', e.target.value)} />
                </div>
                <div>
                  <div style={lbl}>Stackable</div>
                  <button
                    onClick={() => updateRow(row.id, 'stackable', !row.stackable)}
                    style={{
                      ...inp, cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 600,
                      background: row.stackable ? 'rgba(232,119,34,0.12)' : 'var(--bg)',
                      color: row.stackable ? '#e87722' : 'var(--text-faint)',
                      border: row.stackable ? '1px solid #e87722' : '1px solid var(--border)',
                    }}
                  >
                    {row.stackable ? 'Yes' : 'No'}
                  </button>
                </div>
                <div>
                  <div style={lbl}>Pallet</div>
                  <select style={{ ...inp, fontSize: 13 }} value={row.palletType} onChange={e => updateRow(row.id, 'palletType', e.target.value)}>
                    <option value="none">None</option>
                    <option value="euro">Euro</option>
                    <option value="uk">UK</option>
                    <option value="us">US</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addRow} style={btn}>+ Add Item</button>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <>
          {/* Grand Totals */}
          <div style={card}>
            <div style={cardHead}>
              <span>Consignment Totals</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-faint)' }}>
                {result.totals.itemCount} line{result.totals.itemCount !== 1 ? 's' : ''} &middot; {result.totals.pieceCount} piece{result.totals.pieceCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div style={statBox}>
                  <div style={statNum}>{result.totals.cbm.toFixed(2)}</div>
                  <div style={statLabel}>Total CBM</div>
                </div>
                <div style={statBox}>
                  <div style={statNum}>{result.totals.grossWeightKg.toLocaleString()}</div>
                  <div style={statLabel}>Gross Weight (kg)</div>
                </div>
                {mode === 'road' && (
                  <>
                    <div style={statBox}>
                      <div style={statNum}>{result.totals.ldm.toFixed(2)}</div>
                      <div style={statLabel}>Loading Metres</div>
                    </div>
                    <div style={statBox}>
                      <div style={statNum}>{result.totals.chargeableWeightRoad.toLocaleString()}</div>
                      <div style={statLabel}>Chargeable Weight</div>
                    </div>
                    <div style={statBox}>
                      <div style={statNum}>{result.totals.palletSpaces}</div>
                      <div style={statLabel}>Pallet Spaces</div>
                    </div>
                  </>
                )}
                {mode === 'air' && (
                  <>
                    <div style={statBox}>
                      <div style={statNum}>{result.totals.chargeableWeightAir.toLocaleString()}</div>
                      <div style={statLabel}>Chargeable Weight</div>
                    </div>
                    <div style={statBox}>
                      <div style={statNum}>{result.billingBasis === 'volume' ? 'Volume' : 'Weight'}</div>
                      <div style={statLabel}>Billing Basis</div>
                    </div>
                  </>
                )}
                {mode === 'sea' && (
                  <>
                    <div style={statBox}>
                      <div style={statNum}>{result.totals.revenueTonnes.toFixed(2)}</div>
                      <div style={statLabel}>Revenue Tonnes</div>
                    </div>
                    <div style={statBox}>
                      <div style={statNum}>{result.totals.chargeableWeightSea.toLocaleString()}</div>
                      <div style={statLabel}>Chargeable Weight</div>
                    </div>
                    <div style={statBox}>
                      <div style={statNum}>{result.sea.containerCount}&times; {result.sea.suggestedContainer.split(' ')[0]}</div>
                      <div style={statLabel}>Container</div>
                    </div>
                  </>
                )}
              </div>

              {/* Mode-specific details */}
              {mode === 'road' && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>
                      <span>Trailer Utilisation (13.6m artic)</span>
                      <span>{result.trailer.utilisationPercent.toFixed(1)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${result.trailer.utilisationPercent > 100 ? 'danger' : result.trailer.utilisationPercent > 85 ? 'high' : ''}`}
                        style={{ width: `${Math.min(100, result.trailer.utilisationPercent)}%` }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>
                      <span>Weight Utilisation (24T payload)</span>
                      <span>{result.trailer.weightUtilisationPercent.toFixed(1)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${result.trailer.weightUtilisationPercent > 100 ? 'danger' : result.trailer.weightUtilisationPercent > 85 ? 'high' : ''}`}
                        style={{ width: `${Math.min(100, result.trailer.weightUtilisationPercent)}%` }} />
                    </div>
                  </div>
                  <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, background: 'rgba(232,119,34,0.1)', border: '1px solid rgba(232,119,34,0.3)', fontSize: 14, fontWeight: 600, color: '#e87722' }}>
                    Suggested vehicle: {result.suggestedVehicle}
                  </div>
                </>
              )}
              {mode === 'air' && (
                <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, background: 'rgba(232,119,34,0.1)', border: '1px solid rgba(232,119,34,0.3)', fontSize: 14, fontWeight: 600, color: '#e87722' }}>
                  Billing basis: {result.billingBasis === 'volume' ? 'Volumetric (CBM \u00d7 167)' : 'Actual weight'}
                </div>
              )}
              {mode === 'sea' && (
                <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, background: 'rgba(232,119,34,0.1)', border: '1px solid rgba(232,119,34,0.3)', fontSize: 14, fontWeight: 600, color: '#e87722' }}>
                  Container: {result.sea.containerCount}&times; {result.sea.suggestedContainer} &middot; Billing: {result.billingBasis === 'volume' ? 'Measure (CBM)' : 'Weight (tonnes)'}
                </div>
              )}
            </div>
          </div>

          {/* Per-item breakdown */}
          <div style={card}>
            <div style={cardHead}>
              <span>Per-Item Breakdown</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    {['Item', 'Dims (cm)', 'Qty', 'CBM', 'Weight', 'LDM', 'CW Air', 'CW Road', 'Pallets'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{item.description}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {item.dimensions.lengthCm}&times;{item.dimensions.widthCm}&times;{item.dimensions.heightCm}
                        {item.stackable && <span style={{ color: '#e87722', marginLeft: 4, fontSize: 10 }}>STACK</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.cbm.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.grossWeightKg.toLocaleString()} kg</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.ldm.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.chargeableWeightAir.toLocaleString()} kg</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.chargeableWeightRoad.toLocaleString()} kg</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.palletSpaces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.warnings.map((w, i) => (
                <div key={i} className={`warning-badge ${w.type}`}>{w.message}</div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"],
          div[style*="grid-template-columns: 1fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
