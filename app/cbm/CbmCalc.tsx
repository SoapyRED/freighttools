'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateCbm } from '@/lib/calculations/cbm';

// ─── shared micro-styles ──────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: 15,
  fontWeight: 500,
  color: '#1e2535',
  background: '#fff',
  border: '1.5px solid #d8dce6',
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
  color: '#5a6478',
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
          background: readOnly ? '#f7f8fa' : '#fff',
          cursor: readOnly ? 'default' : 'text',
        }}
        onFocus={e => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = '#e87722';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,119,34,0.12)';
          }
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#d8dce6';
          e.currentTarget.style.boxShadow = 'none';
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
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
      }}>
        <div style={{ background: '#1a2332', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inputs</span>
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
            <p style={{ fontSize: 13, color: '#8f9ab0', margin: 0 }}>
              Dimensions are pre-filled from the container spec. Adjust <strong>Pieces</strong> to calculate how many units fill this container.
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ background: '#243044', padding: '14px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results</span>
        </div>

        {!result ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#8f9ab0', fontSize: 14 }}>
            Enter dimensions and pieces above to calculate
          </div>
        ) : (
          <>
            {/* Total CBM hero */}
            <div style={{ padding: '28px 24px 20px', textAlign: 'center', borderBottom: '1px solid #eef0f4' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#8f9ab0', marginBottom: 8 }}>
                Total Volume
              </div>
              <div style={{ fontSize: 'clamp(52px, 12vw, 72px)', fontWeight: 800, color: '#1a2332', lineHeight: 1, letterSpacing: '-2px' }}>
                {result.totalCbm.toFixed(4)}
                <span style={{ fontSize: 22, fontWeight: 600, color: '#8f9ab0', letterSpacing: 0 }}> m³</span>
              </div>
              {result.pieces > 1 && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#8f9ab0' }}>
                  {result.cbmPerPiece.toFixed(4)} m³ per piece × {result.pieces} pieces
                </div>
              )}
            </div>

            {/* Container utilisation bar (container pages only) */}
            {capacityCbm && utilisationPct !== null && (
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #eef0f4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#8f9ab0' }}>Container Fill</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#1a2332' }}>
                    {utilisationPct.toFixed(1)}%
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#8f9ab0', marginLeft: 4 }}>of {capacityCbm} m³</span>
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
                <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 6 }}>
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
                <div key={cell.label} style={{ background: '#fff', padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 4 }}>{cell.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2332' }}>{cell.value}</div>
                  <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>{cell.sub}</div>
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
          background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
          padding: '14px 18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722' }}>Air Freight?</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2332' }}>Calculate Chargeable Weight →</span>
          <span style={{ fontSize: 12, color: '#8f9ab0' }}>Volumetric vs actual weight for air cargo</span>
        </Link>
        <Link href="/ldm" style={{
          flex: 1, minWidth: 200,
          background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
          padding: '14px 18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722' }}>Road Freight?</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2332' }}>Calculate Loading Metres →</span>
          <span style={{ fontSize: 12, color: '#8f9ab0' }}>LDM calculator for UK/EU trailers</span>
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
    </div>
  );
}
