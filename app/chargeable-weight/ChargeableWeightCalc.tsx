'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateChargeableWeight, VOLUMETRIC_FACTORS } from '@/lib/calculations/chargeable-weight';
import AdUnit from '@/app/components/AdUnit';

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
          e.currentTarget.style.borderColor = '#d8dce6';
          e.currentTarget.style.boxShadow = 'none';
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

  const isVol = result?.basis === 'volumetric';

  return (
    <div>
      {/* Input card */}
      <div style={{
        background: '#fff',
        border: '1px solid #d8dce6',
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

          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              <option value="4000">4000 — Charter / specialist carriers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{
        background: '#fff',
        border: '1px solid #d8dce6',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ background: '#243044', padding: '14px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results</span>
        </div>

        {!result ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#8f9ab0', fontSize: 14 }}>
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
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#8f9ab0', marginBottom: 8 }}>
                Chargeable Weight
              </div>
              <div style={{ fontSize: 'clamp(52px, 12vw, 72px)', fontWeight: 800, color: '#1a2332', lineHeight: 1, letterSpacing: '-2px' }}>
                {fmt(result.chargeableWeightKg, 1)}
                <span style={{ fontSize: 22, fontWeight: 600, color: '#8f9ab0', letterSpacing: 0 }}> kg</span>
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
                  background: cell.highlight ? '#fffbeb' : '#fff',
                  padding: '16px 20px',
                  borderLeft: cell.highlight ? '3px solid #e87722' : '3px solid transparent',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 4 }}>
                    {cell.label}
                    {cell.highlight && <span style={{ marginLeft: 6, background: '#e87722', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10 }}>WINS</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a2332' }}>{cell.value}</div>
                  <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>{cell.sub}</div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div style={{ padding: '14px 20px', background: '#f7f8fa', fontSize: 13, color: '#5a6478', lineHeight: 1.6 }}>
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
            GET /api/chargeable-weight?l=120&amp;w=80&amp;h=100&amp;gw=500
          </code>
        </div>
        <Link href="/api-docs#chargeable-weight" style={{
          background: '#e87722', color: '#fff', textDecoration: 'none',
          padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          View API Docs →
        </Link>
      </div>

      {/* Ad unit */}
      <AdUnit format="auto" />

    </div>
  );
}
