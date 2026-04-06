'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { calculateChargeableWeight, calculateSeaChargeableWeight, VOLUMETRIC_FACTORS } from '@/lib/calculations/chargeable-weight';
import { useUrlSync, getUrlParams } from '@/app/hooks/useUrlState';

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

function fmt(n: number, dp = 2) {
  return n.toLocaleString('en-GB', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: 15,
  fontWeight: 500,
  color: 'var(--text)',
  background: 'var(--bg-card)',
  border: '1.5px solid var(--border)',
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'block',
};

function Field({
  label, id, value, onChange, placeholder, unit,
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; placeholder?: string; unit?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor={id} style={labelStyle}>{label}{unit && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> ({unit})</span>}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#e87722';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,119,34,0.12)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = 'none';
          const v = e.target.value;
          if (v) {
            const n = parseFloat(v);
            if (n < 0) onChange('0');
            else if (v !== String(n) && !isNaN(n)) onChange(String(n));
          }
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────────────

interface Props {
  defaultFactor?: number;
}

// ─────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────

export default function ChargeableWeightCalc({ defaultFactor = 6000 }: Props) {
  const [length, setLength] = useState('');
  const [width,  setWidth]  = useState('');
  const [height, setHeight] = useState('');
  const [gw,     setGw]     = useState('');
  const [pcs,    setPcs]    = useState('1');
  const [factor, setFactor] = useState(String(defaultFactor));
  const [freightMode, setFreightMode] = useState<'air' | 'sea'>('air');

  // Update page title when mode changes
  useEffect(() => {
    document.title = freightMode === 'sea'
      ? 'Sea Freight (W/M) Chargeable Weight Calculator | FreightUtils.com'
      : 'Air Freight Chargeable Weight Calculator | FreightUtils.com';
  }, [freightMode]);

  // Load from URL params on mount
  useEffect(() => {
    const p = getUrlParams();
    if (p.l) setLength(p.l);
    if (p.w) setWidth(p.w);
    if (p.h) setHeight(p.h);
    if (p.gw) setGw(p.gw);
    if (p.pcs) setPcs(p.pcs);
    if (p.factor) setFactor(p.factor);
    if (p.mode === 'sea') setFreightMode('sea');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL
  useUrlSync({
    l: length || undefined,
    w: width || undefined,
    h: height || undefined,
    gw: gw || undefined,
    pcs: pcs !== '1' ? pcs : undefined,
    factor: factor !== '6000' ? factor : undefined,
  });

  const result = useMemo(() => {
    const l  = parseFloat(length);
    const w  = parseFloat(width);
    const h  = parseFloat(height);
    const g  = parseFloat(gw);
    const p  = parseInt(pcs, 10);
    const f  = parseInt(factor, 10);

    if (!l || !w || !h || !g || l <= 0 || w <= 0 || h <= 0 || g <= 0 || p < 1 || f <= 0) {
      return null;
    }

    return calculateChargeableWeight({
      lengthCm: l, widthCm: w, heightCm: h,
      grossWeightKg: g, pieces: p, factor: f,
    });
  }, [length, width, height, gw, pcs, factor]);

  const seaResult = useMemo(() => {
    const l  = parseFloat(length);
    const w  = parseFloat(width);
    const h  = parseFloat(height);
    const g  = parseFloat(gw);
    const p  = parseInt(pcs, 10);
    if (!l || !w || !h || !g || l <= 0 || w <= 0 || h <= 0 || g <= 0 || p < 1) return null;
    return calculateSeaChargeableWeight({ lengthCm: l, widthCm: w, heightCm: h, grossWeightKg: g, pieces: p });
  }, [length, width, height, gw, pcs]);

  const isVol = result?.basis === 'volumetric';

  const modeBtnStyle = (m: 'air' | 'sea') => ({
    padding: '8px 20px', fontSize: 13, fontWeight: freightMode === m ? 700 : 500,
    color: freightMode === m ? '#fff' : 'var(--text-faint)',
    background: freightMode === m ? '#e87722' : 'transparent',
    border: freightMode === m ? '1px solid #e87722' : '1px solid var(--border)',
    borderRadius: 6, cursor: 'pointer' as const, fontFamily: 'inherit',
  });

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setFreightMode('air')} style={modeBtnStyle('air')}>Air Freight</button>
        <button onClick={() => setFreightMode('sea')} style={modeBtnStyle('sea')}>Sea Freight (W/M)</button>
      </div>

      {/* Input card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: 20,
      }}>
        <div style={{ background: '#1a2332', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inputs</span>
          <span style={{ background: '#e87722', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Real-time</span>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}>
            <Field label="Length" id="cw-length" value={length} onChange={setLength} placeholder="e.g. 120" unit="cm" />
            <Field label="Width"  id="cw-width"  value={width}  onChange={setWidth}  placeholder="e.g. 80"  unit="cm" />
            <Field label="Height" id="cw-height" value={height} onChange={setHeight} placeholder="e.g. 100" unit="cm" />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}>
            <Field label="Gross Weight" id="cw-gw"  value={gw}  onChange={setGw}  placeholder="e.g. 500" unit="kg" />
            <Field label="Pieces"       id="cw-pcs" value={pcs} onChange={setPcs} placeholder="1" />
          </div>

          {freightMode === 'air' && <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="cw-factor" style={labelStyle}>Volumetric Factor</label>
            <select
              id="cw-factor"
              value={factor}
              onChange={e => setFactor(e.target.value)}
              style={{
                ...inputStyle,
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235a6478' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: 36,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {VOLUMETRIC_FACTORS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>}
          {freightMode === 'sea' && <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Formula</label>
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              W/M: 1 CBM = 1 revenue tonne (1,000 kg)
            </div>
          </div>}
        </div>
      </div>

      {/* Results */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ background: '#243044', padding: '14px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results</span>
        </div>

        {freightMode === 'sea' && seaResult ? (
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#e87722', lineHeight: 1.1, marginBottom: 4 }}>
              {seaResult.revenueTonnes.toFixed(2)} <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-faint)' }}>RT</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Revenue Tonnes (W/M) &mdash; Billing basis: <strong>{seaResult.billingBasis === 'measure' ? 'Measure (volume)' : 'Weight'}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'CBM', value: seaResult.cbm.toFixed(2), unit: 'm\u00B3' },
                { label: 'Gross Weight', value: seaResult.grossWeightTonnes.toFixed(2), unit: 'tonnes' },
                { label: 'Chargeable', value: seaResult.chargeableWeightKg.toLocaleString(), unit: 'kg' },
                { label: 'Stowage Factor', value: seaResult.ratio?.toFixed(2) ?? '\u2014', unit: 'CBM/t' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg)', padding: '12px 8px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{s.label} ({s.unit})</div>
                </div>
              ))}
            </div>
          </div>
        ) : !result ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
            Enter dimensions, weight, and pieces above to calculate
          </div>
        ) : (
          <>
            {/* Chargeable weight hero */}
            <div style={{
              padding: '28px 24px 20px',
              textAlign: 'center',
              borderBottom: '1px solid #eef0f4',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-faint)', marginBottom: 8 }}>
                Chargeable Weight
              </div>
              <div style={{ fontSize: 'clamp(52px, 12vw, 72px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-2px' }}>
                {fmt(result.chargeableWeightKg, 1)}
                <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: 0 }}> kg</span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                background: isVol ? '#fee2e2' : '#dcfce7',
                color: isVol ? '#991b1b' : '#166534',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
              }}>
                {isVol
                  ? `Volumetric wins — cargo is light for its size`
                  : `Actual weight wins — cargo is dense`}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              background: '#eef0f4',
              borderBottom: '1px solid #eef0f4',
            }}>
              {[
                {
                  label: 'Volumetric Weight',
                  value: `${fmt(result.volumetricWeightTotalKg)} kg`,
                  sub: `${fmt(result.volumetricWeightPerPieceKg)} kg × ${result.pieces} pc${result.pieces !== 1 ? 's' : ''}`,
                  highlight: isVol,
                },
                {
                  label: 'Gross Weight',
                  value: `${fmt(result.grossWeightKg)} kg`,
                  sub: `actual shipment weight`,
                  highlight: !isVol,
                },
                {
                  label: 'Total CBM',
                  value: `${fmt(result.cbm, 3)} m³`,
                  sub: `${result.pieces} × ${(result.cbm / result.pieces).toFixed(3)} m³/pc`,
                  highlight: false,
                },
                {
                  label: 'Stowage Ratio',
                  value: result.ratio !== null ? `${fmt(result.ratio, 2)} m³/t` : '—',
                  sub: result.ratio !== null
                    ? result.ratio > 6 ? 'Light / voluminous cargo' : result.ratio < 2 ? 'Dense / heavy cargo' : 'General cargo'
                    : '',
                  highlight: false,
                },
              ].map(cell => (
                <div key={cell.label} style={{
                  background: cell.highlight ? 'rgba(232,119,34,0.06)' : 'var(--bg-card)',
                  padding: '16px 20px',
                  borderLeft: cell.highlight ? '3px solid #e87722' : '3px solid transparent',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>
                    {cell.label}
                    {cell.highlight && <span style={{ marginLeft: 6, background: '#e87722', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10 }}>WINS</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{cell.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{cell.sub}</div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div style={{ padding: '14px 20px', background: 'var(--bg)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {isVol
                ? <>Your shipment is <strong>light for its size</strong>. The volumetric weight ({fmt(result.volumetricWeightTotalKg)} kg) exceeds the actual gross weight ({fmt(result.grossWeightKg)} kg), so airlines charge based on the space it occupies — not how much it weighs. Denser packing or smaller outer dimensions would reduce the chargeable weight.</>
                : <>Your shipment is <strong>dense for its size</strong>. The actual gross weight ({fmt(result.grossWeightKg)} kg) exceeds the volumetric weight ({fmt(result.volumetricWeightTotalKg)} kg), so the actual weight determines the charge. This is typical for heavy goods like machinery, metals, or liquids.</>
              }
            </div>
          </>
        )}
      </div>

      {/* API callout */}
      <div style={{
        marginTop: 32,
        background: '#1a2332',
        borderRadius: 12,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>
            Automate this with the API
          </div>
          <code style={{ color: '#e87722', fontSize: 12 }}>
            GET /api/chargeable-weight?l=120&amp;w=80&amp;h=100&amp;gw=500{freightMode === 'sea' ? '&mode=sea' : ''}
          </code>
        </div>
        <Link href="/api-docs#chargeable-weight" style={{
          background: '#e87722', color: '#fff', textDecoration: 'none',
          padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          View API Docs →
        </Link>
      </div>

      {/* ── AUTHORITY CONTENT ── */}
      <div style={{ marginTop: 56 }}>

        {/* What Is Chargeable Weight? */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          What Is Chargeable Weight?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
          Chargeable weight is the figure airlines use to price your air freight shipment. It is always the greater of two values: the <strong>actual gross weight</strong> (what the shipment weighs on a scale) or the <strong>volumetric weight</strong> (a calculated figure based on the shipment&apos;s dimensions). This principle — known in the industry as &ldquo;weight or measure&rdquo; — ensures carriers are compensated fairly for both the mass and the space a shipment occupies in the aircraft.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
          A heavy, compact shipment (like machine parts) will typically be charged on actual weight. A light, bulky shipment (like clothing or plastic goods) will be charged on volumetric weight — often significantly more than the actual weight.
        </p>

        {/* The Volumetric Weight Formula */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
          The Volumetric Weight Formula
        </h2>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>Metric (cm/kg) — IATA standard</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Volumetric Weight (kg) = (L × W × H in cm) ÷ 6,000</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>Imperial (in/lb)</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Volumetric Weight (lb) = (L × W × H in inches) ÷ 166</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>From CBM</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Volumetric Weight (kg) = Total CBM × 167</div>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
          The divisor of 6,000 is the IATA standard used by most international air freight carriers. It assumes a density ratio where 1 cubic metre of cargo should weigh at least approximately 167 kg.
        </p>

        {/* Divisor Variations */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
          Divisor Variations by Carrier Type
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1a2332', color: '#fff' }}>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Carrier Type</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Typical Divisor</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Effect</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['International air freight (IATA standard)', '6,000', 'Standard — used by most airlines'],
                ['Express couriers (DHL, FedEx, UPS)', '5,000', 'Results in higher volumetric weight'],
                ['Some regional/budget carriers', '4,000', 'Results in even higher volumetric weight'],
                ['Sea freight (LCL)', 'Different model', 'Uses 1 CBM = 1,000 kg (W/M rule)'],
              ].map(([carrier, divisor, effect]) => (
                <tr key={carrier} style={{ borderBottom: '1px solid #eef0f4' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600 }}>{carrier}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{divisor}</td>
                  <td style={{ padding: '11px 16px', lineHeight: 1.5 }}>{effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: 'var(--text-faint)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
          Always confirm the divisor with your carrier before quoting. A shipment quoted at divisor 6,000 will have a different chargeable weight than the same shipment at 5,000. The difference can be significant on bulky cargo.
        </p>

        {/* Worked Examples */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
          Worked Examples
        </h2>

        {/* Example 1 */}
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Example 1 — Actual weight wins
          </div>
          <p style={{ fontSize: 14, color: '#166534', lineHeight: 1.6, marginBottom: 10 }}>
            A shipment of automotive parts: 5 boxes, each 50 × 40 × 40 cm, weighing 30 kg each.
          </p>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#166534', lineHeight: 1.8 }}>
            Actual weight: 150 kg<br />
            Volumetric weight: (50 × 40 × 40) × 5 ÷ 6,000 = <strong>67 kg</strong><br />
            Chargeable weight: <strong>150 kg</strong> (actual wins)
          </div>
        </div>

        {/* Example 2 */}
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Example 2 — Volumetric weight wins
          </div>
          <p style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.6, marginBottom: 10 }}>
            A shipment of textile goods: 3 boxes, each 80 × 60 × 60 cm, weighing 10 kg each.
          </p>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#991b1b', lineHeight: 1.8 }}>
            Actual weight: 30 kg<br />
            Volumetric weight: (80 × 60 × 60) × 3 ÷ 6,000 = <strong>144 kg</strong><br />
            Chargeable weight: <strong>144 kg</strong> (volumetric wins — nearly 5× the actual weight)
          </div>
        </div>

        {/* How to Reduce Chargeable Weight */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
          How to Reduce Chargeable Weight
        </h2>
        <ul style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.8, paddingLeft: 20, marginBottom: 14 }}>
          <li><strong>Use right-sized packaging</strong> — every centimetre of empty space increases volumetric weight at your expense</li>
          <li>Avoid oversized boxes for small items</li>
          <li>Consider flat-packing or vacuum compression for textiles and soft goods</li>
          <li>For multi-piece shipments, measure each piece separately — the sum of individual volumetric weights may be less than measuring the shipment as one block</li>
          <li>Compare carriers: a carrier using divisor 6,000 will be cheaper for bulky goods than one using 5,000</li>
        </ul>

        {/* FAQ */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <details className="faq-item">
            <summary>What divisor do most airlines use?</summary>
            <div className="faq-answer">
              The IATA standard divisor is <strong>6,000</strong> (cm/kg). Most international air freight carriers follow this. Express couriers like DHL, FedEx, and UPS typically use <strong>5,000</strong>, which results in a higher volumetric weight for the same dimensions.
            </div>
          </details>
          <details className="faq-item">
            <summary>Can I negotiate the volumetric divisor?</summary>
            <div className="faq-answer">
              Large-volume shippers can sometimes negotiate custom divisors with carriers based on their cargo profile. If you consistently ship high-density goods, a higher divisor (or waived volumetric charges) may be negotiable.
            </div>
          </details>
          <details className="faq-item">
            <summary>What is the &ldquo;pivot weight&rdquo; or density break-even?</summary>
            <div className="faq-answer">
              The break-even density for the IATA 6,000 divisor is approximately <strong>167 kg per cubic metre</strong>. If your cargo density exceeds this, you&apos;ll be charged on actual weight. Below it, volumetric weight applies. Knowing your typical cargo density helps predict which weight will apply.
            </div>
          </details>
          <details className="faq-item">
            <summary>How does chargeable weight differ for sea freight?</summary>
            <div className="faq-answer">
              Sea freight (LCL) uses the <strong>&ldquo;W/M&rdquo; rule</strong>: 1 CBM = 1,000 kg. The carrier charges whichever is greater — the volume in CBM or the weight in tonnes. This is a much more generous ratio than air freight, which is why bulky goods are typically shipped by sea.
            </div>
          </details>
          <details className="faq-item">
            <summary>Does chargeable weight include pallet weight?</summary>
            <div className="faq-answer">
              Yes. Actual gross weight includes all packaging, pallets, crates, and wrapping. Airlines weigh the complete shipment as tendered. For dimensions, measure the outermost points including any protrusions, handles, or irregular shapes.
            </div>
          </details>
        </div>

        {/* Attribution */}
        <p style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6 }}>
          Formulas and divisors based on IATA Cargo Tariff standards. Carrier-specific divisors may vary — always confirm with your carrier.
        </p>
      </div>

    </div>
  );
}
