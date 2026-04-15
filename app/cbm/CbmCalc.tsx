'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { calculateCbm } from '@/lib/calculations/cbm';
import MetricStrip from '@/app/components/MetricStrip';
import { useUrlSync, getUrlParams } from '@/app/hooks/useUrlState';

// ─── shared micro-styles ──────────────────────────────────────────
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
  label, id, value, onChange, placeholder, unit, readOnly,
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; placeholder?: string; unit?: string;
  readOnly?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {unit && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> ({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          ...inputStyle,
          background: readOnly ? 'var(--bg)' : 'var(--bg-card)',
          cursor: readOnly ? 'default' : 'text',
        }}
        onFocus={e => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = '#e87722';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,119,34,0.12)';
          }
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = 'none';
          // Strip leading zeros and clamp negatives
          const v = e.target.value;
          if (v && !readOnly) {
            const n = parseFloat(v);
            if (n < 0) onChange('0');
            else if (v !== String(n) && !isNaN(n)) onChange(String(n));
          }
        }}
      />
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────

interface Props {
  /** Pre-fill with container dimensions */
  defaultL?: string;
  defaultW?: string;
  defaultH?: string;
  /** When true the dimension fields are read-only (container pages) */
  lockedDims?: boolean;
  /** Max CBM capacity of the container — shown as a utilisation bar */
  capacityCbm?: number;
}

// ─── Component ───────────────────────────────────────────────────

export default function CbmCalc({
  defaultL = '',
  defaultW = '',
  defaultH = '',
  lockedDims = false,
  capacityCbm,
}: Props) {
  const [length, setLength] = useState(defaultL);
  const [width,  setWidth]  = useState(defaultW);
  const [height, setHeight] = useState(defaultH);
  const [pcs,    setPcs]    = useState('1');

  // Load from URL params on mount
  useEffect(() => {
    if (lockedDims) return; // Don't override container-page defaults
    const p = getUrlParams();
    if (p.l) setLength(p.l);
    if (p.w) setWidth(p.w);
    if (p.h) setHeight(p.h);
    if (p.pcs) setPcs(p.pcs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL (only on the main /cbm page, not container sub-pages)
  useUrlSync({
    l: length || undefined,
    w: width || undefined,
    h: height || undefined,
    pcs: pcs !== '1' ? pcs : undefined,
  }, !lockedDims);

  const result = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);
    const p = parseInt(pcs, 10);
    if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0 || p < 1) return null;
    return calculateCbm({ lengthCm: l, widthCm: w, heightCm: h, pieces: p });
  }, [length, width, height, pcs]);

  const utilisationPct = capacityCbm && result
    ? Math.min((result.totalCbm / capacityCbm) * 100, 100)
    : null;

  return (
    <div>
      {/* Inputs */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
      }}>
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inputs</span>
          <span style={{ background: '#e87722', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Real-time</span>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
            <Field label="Length" id="cbm-l" value={length} onChange={setLength} placeholder="e.g. 120" unit="cm" readOnly={lockedDims} />
            <Field label="Width"  id="cbm-w" value={width}  onChange={setWidth}  placeholder="e.g. 80"  unit="cm" readOnly={lockedDims} />
            <Field label="Height" id="cbm-h" value={height} onChange={setHeight} placeholder="e.g. 100" unit="cm" readOnly={lockedDims} />
            <Field label="Pieces" id="cbm-p" value={pcs}    onChange={setPcs}    placeholder="1" />
          </div>
          {lockedDims && (
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
              Dimensions are pre-filled from the container spec. Adjust <strong>Pieces</strong> to calculate how many units fill this container.
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results</span>
        </div>

        {!result ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
            Enter dimensions and pieces above to calculate
          </div>
        ) : (
          <>
            {/* Total CBM hero */}
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <MetricStrip metrics={[
                { value: result.totalCbm.toFixed(4), unit: 'm\u00B3', label: 'Cubic Metres', accent: true },
                { value: result.cubicFeet.toFixed(1), unit: 'ft\u00B3', label: 'Cubic Feet' },
                { value: result.litres.toFixed(0), unit: 'L', label: 'Litres' },
              ]} />
              {result.pieces > 1 && (
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-faint)' }}>
                  {result.cbmPerPiece.toFixed(4)} m³ per piece × {result.pieces} pieces
                </div>
              )}
            </div>

            {/* Container utilisation bar (container pages only) */}
            {capacityCbm && utilisationPct !== null && (
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #eef0f4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-faint)' }}>Container Fill</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                    {utilisationPct.toFixed(1)}%
                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-faint)', marginLeft: 4 }}>of {capacityCbm} m³</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: 20, background: '#eef0f4', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${utilisationPct}%`,
                    borderRadius: 10,
                    background: utilisationPct > 95
                      ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                      : utilisationPct > 80
                        ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                        : 'linear-gradient(90deg, #e87722, #f9913a)',
                    transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}>
                  {utilisationPct >= 100
                    ? 'Exceeds container capacity — reduce pieces or use a larger container.'
                    : utilisationPct >= 80
                      ? 'Nearly full — allow room for packing materials and load securing.'
                      : `${(capacityCbm - result.totalCbm).toFixed(4)} m³ remaining capacity.`}
                </p>
              </div>
            )}

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#eef0f4' }}>
              {[
                { label: 'CBM per Piece',  value: `${result.cbmPerPiece.toFixed(4)} m³`,        sub: 'cubic metres' },
                { label: 'Cubic Feet',     value: `${result.cubicFeet.toFixed(2)} ft³`,          sub: '1 m³ = 35.3147 ft³' },
                { label: 'Litres',         value: `${result.litres.toLocaleString('en-GB')} L`,  sub: '1 m³ = 1,000 litres' },
                { label: 'Cubic Inches',   value: `${result.cubicInches.toLocaleString('en-GB')} in³`, sub: '1 m³ = 61,023.7 in³' },
              ].map(cell => (
                <div key={cell.label} style={{ background: 'var(--bg-card)', padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>{cell.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{cell.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{cell.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cross-links */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/chargeable-weight" style={{
          flex: 1, minWidth: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '14px 18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722' }}>Air Freight?</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Calculate Chargeable Weight →</span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Volumetric vs actual weight for air cargo</span>
        </Link>
        <Link href="/ldm" style={{
          flex: 1, minWidth: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '14px 18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722' }}>Road Freight?</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Calculate Loading Metres →</span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>LDM calculator for UK/EU trailers</span>
        </Link>
      </div>

      {/* API callout */}
      <div style={{
        marginTop: 16, background: '#1a2332', borderRadius: 12, padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>Automate this with the API</div>
          <code style={{ color: '#e87722', fontSize: 12 }}>GET /api/cbm?l=120&amp;w=80&amp;h=100&amp;pcs=5</code>
        </div>
        <Link href="/api-docs#cbm" style={{
          background: '#e87722', color: '#fff', textDecoration: 'none',
          padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          View API Docs →
        </Link>
      </div>

      {/* Ad unit */}

    </div>
  );
}
