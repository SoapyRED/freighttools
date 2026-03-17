'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculatePalletFitting, type BoxLayout } from '@/lib/calculations/pallet-fitting';

// ─── Shared micro-styles ──────────────────────────────────────────
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

// ─── SVG layer diagram ────────────────────────────────────────────

function PalletSvg({
  palletL, palletW, layout,
}: {
  palletL: number;
  palletW: number;
  layout: BoxLayout;
}) {
  const { boxesPerRow, boxesPerCol, usedBoxLengthCm, usedBoxWidthCm } = layout;

  // Build box rects
  const boxes: React.ReactNode[] = [];
  for (let row = 0; row < boxesPerCol; row++) {
    for (let col = 0; col < boxesPerRow; col++) {
      const x = col * usedBoxLengthCm + 1.5;
      const y = row * usedBoxWidthCm + 1.5;
      const w = usedBoxLengthCm - 3;
      const h = usedBoxWidthCm - 3;
      if (w > 0 && h > 0) {
        boxes.push(
          <rect
            key={`${col}-${row}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="#e87722"
            opacity={0.82}
            rx={Math.min(2, w * 0.05, h * 0.05)}
          />,
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${palletL} ${palletW}`}
      style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block', margin: '0 auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Top-down pallet layer diagram"
    >
      {/* Pallet background */}
      <rect x={0} y={0} width={palletL} height={palletW} fill="#d8dce6" rx={3} />
      {/* Pallet border */}
      <rect x={0} y={0} width={palletL} height={palletW} fill="none" stroke="#8f9ab0" strokeWidth={palletL * 0.008} rx={3} />
      {/* Boxes */}
      {boxes}
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────

interface Props {
  defaultPL?: string;
  defaultPW?: string;
  defaultPMH?: string;
  defaultPH?: string;
  defaultMaxW?: string;
  lockedDims?: boolean;
}

// ─── Component ───────────────────────────────────────────────────

export default function PalletFittingCalc({
  defaultPL = '',
  defaultPW = '',
  defaultPMH = '',
  defaultPH = '15',
  defaultMaxW = '',
  lockedDims = false,
}: Props) {
  // Pallet state
  const [palletL,   setPalletL]   = useState(defaultPL);
  const [palletW,   setPalletW]   = useState(defaultPW);
  const [palletMH,  setPalletMH]  = useState(defaultPMH);
  const [palletH,   setPalletH]   = useState(defaultPH);
  const [maxWeight, setMaxWeight] = useState(defaultMaxW);

  // Box state
  const [boxL,   setBoxL]   = useState('');
  const [boxW,   setBoxW]   = useState('');
  const [boxH,   setBoxH]   = useState('');
  const [boxWt,  setBoxWt]  = useState('');
  const [rotate, setRotate] = useState(true);

  const result = useMemo(() => {
    const pl  = parseFloat(palletL);
    const pw  = parseFloat(palletW);
    const pmh = parseFloat(palletMH);
    const ph  = parseFloat(palletH) || 15;
    const bl  = parseFloat(boxL);
    const bw  = parseFloat(boxW);
    const bh  = parseFloat(boxH);

    if (!pl || !pw || !pmh || !bl || !bw || !bh) return null;
    if (pl <= 0 || pw <= 0 || pmh <= 0 || bl <= 0 || bw <= 0 || bh <= 0) return null;

    const bwt = parseFloat(boxWt) || undefined;
    const mpw = parseFloat(maxWeight) || undefined;

    return calculatePalletFitting({
      palletLengthCm:    pl,
      palletWidthCm:     pw,
      palletMaxHeightCm: pmh,
      palletHeightCm:    ph,
      boxLengthCm:       bl,
      boxWidthCm:        bw,
      boxHeightCm:       bh,
      boxWeightKg:       bwt,
      maxPayloadWeightKg: mpw,
      allowRotation:     rotate,
    });
  }, [palletL, palletW, palletMH, palletH, maxWeight, boxL, boxW, boxH, boxWt, rotate]);

  return (
    <div>
      {/* ── Pallet Dimensions ── */}
      <div style={{
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
      }}>
        <div style={{ background: '#1a2332', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pallet Dimensions</span>
          {lockedDims && (
            <span style={{ background: '#2e3d55', color: '#8f9ab0', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pre-filled</span>
          )}
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: lockedDims ? 12 : 0 }}>
            <Field label="Length"     id="pl-l"  value={palletL}   onChange={setPalletL}  placeholder="e.g. 120" unit="cm" readOnly={lockedDims} />
            <Field label="Width"      id="pl-w"  value={palletW}   onChange={setPalletW}  placeholder="e.g. 80"  unit="cm" readOnly={lockedDims} />
            <Field label="Typical max loaded height — road freight" id="pl-mh" value={palletMH}  onChange={setPalletMH} placeholder="e.g. 220" unit="cm" readOnly={lockedDims} />
            <Field label="Board Ht"   id="pl-h"  value={palletH}   onChange={setPalletH}  placeholder="15"       unit="cm" readOnly={lockedDims} />
            <Field label="Max Weight" id="pl-mw" value={maxWeight} onChange={setMaxWeight} placeholder="optional" unit="kg" readOnly={lockedDims} />
          </div>
          {lockedDims && (
            <p style={{ fontSize: 13, color: '#8f9ab0', margin: 0 }}>
              Pallet dimensions are pre-filled from the selected pallet type. Adjust <strong>Box Dimensions</strong> below.
            </p>
          )}
        </div>
      </div>

      {/* ── Box Dimensions ── */}
      <div style={{
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
      }}>
        <div style={{ background: '#1a2332', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Box / Carton Dimensions</span>
          <span style={{ background: '#e87722', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Real-time</span>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 16 }}>
            <Field label="Length"     id="bx-l"  value={boxL}  onChange={setBoxL}  placeholder="e.g. 40" unit="cm" />
            <Field label="Width"      id="bx-w"  value={boxW}  onChange={setBoxW}  placeholder="e.g. 30" unit="cm" />
            <Field label="Height"     id="bx-h"  value={boxH}  onChange={setBoxH}  placeholder="e.g. 25" unit="cm" />
            <Field label="Wt / box"   id="bx-wt" value={boxWt} onChange={setBoxWt} placeholder="optional" unit="kg" />
          </div>
          {/* Rotation toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => setRotate(r => !r)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: rotate ? '#e87722' : '#d8dce6',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                padding: 0,
              }}
              aria-checked={rotate}
              role="switch"
              aria-label="Allow rotation"
            >
              <span style={{
                position: 'absolute', top: 3, left: rotate ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
            <span style={{ fontSize: 13, color: '#5a6478', fontWeight: 500 }}>
              Allow 90° rotation of boxes on pallet
              <span style={{ marginLeft: 6, fontSize: 11, color: '#8f9ab0' }}>
                ({rotate ? 'on — best orientation selected automatically' : 'off — input orientation only'})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ background: '#243044', padding: '14px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results</span>
        </div>

        {!result ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#8f9ab0', fontSize: 14 }}>
            Enter pallet and box dimensions above to calculate
          </div>
        ) : result.totalBoxes === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>No boxes fit</div>
            <div style={{ fontSize: 13, color: '#8f9ab0' }}>
              The box is too large for the pallet footprint or height. Try smaller box dimensions.
            </div>
          </div>
        ) : (
          <>
            {/* SVG diagram */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #eef0f4' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#8f9ab0', marginBottom: 12, textAlign: 'center' }}>
                Top-Down Layer View (1 of {result.layers} layer{result.layers !== 1 ? 's' : ''})
              </div>
              <PalletSvg
                palletL={parseFloat(palletL)}
                palletW={parseFloat(palletW)}
                layout={result.layout}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5a6478' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: '#e87722', display: 'inline-block', opacity: 0.82 }} />
                  Boxes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5a6478' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: '#d8dce6', display: 'inline-block' }} />
                  Unused space
                </span>
                {result.orientation === 'rotated' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#e87722' }}>
                    ↻ rotated for best fit
                  </span>
                )}
              </div>
            </div>

            {/* Hero stats */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #eef0f4', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#8f9ab0', marginBottom: 8 }}>
                Total Boxes on Pallet
              </div>
              <div style={{ fontSize: 'clamp(52px, 12vw, 72px)', fontWeight: 800, color: '#1a2332', lineHeight: 1, letterSpacing: '-2px' }}>
                {result.totalBoxes.toLocaleString('en-GB')}
              </div>
              <div style={{ marginTop: 10, fontSize: 14, color: '#8f9ab0' }}>
                {result.boxesPerLayer} per layer × {result.layers} layer{result.layers !== 1 ? 's' : ''}
                {result.weightLimited && (
                  <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    weight-limited
                  </span>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#eef0f4' }}>
              {[
                {
                  label: 'Footprint Utilisation',
                  value: `${result.utilisationPercent}%`,
                  sub: `${result.layout.boxesPerRow} × ${result.layout.boxesPerCol} arrangement`,
                },
                {
                  label: 'Usable Height',
                  value: `${result.usableHeightCm} cm`,
                  sub: `above pallet board`,
                },
                {
                  label: 'Total Box Volume',
                  value: `${result.totalBoxVolumeCbm} m³`,
                  sub: `of ${result.palletVolumeCbm} m³ envelope`,
                },
                {
                  label: 'Wasted Space',
                  value: `${result.wastedSpaceCbm} m³`,
                  sub: `${result.palletVolumeCbm > 0 ? ((result.wastedSpaceCbm / result.palletVolumeCbm) * 100).toFixed(1) : 0}% of envelope`,
                },
              ].map(cell => (
                <div key={cell.label} style={{ background: '#fff', padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 4 }}>{cell.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2332' }}>{cell.value}</div>
                  <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>{cell.sub}</div>
                </div>
              ))}
            </div>

            {/* Weight row (conditional) */}
            {result.totalWeightKg != null && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#eef0f4', marginTop: 1 }}>
                <div style={{ background: '#fff', padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 4 }}>Total Weight</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2332' }}>{result.totalWeightKg.toLocaleString('en-GB')} kg</div>
                  <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>
                    {result.weightLimited ? 'Weight-limited result' : 'Within pallet capacity'}
                  </div>
                </div>
                {result.remainingWeightCapacityKg != null && (
                  <div style={{ background: '#fff', padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 4 }}>Remaining Capacity</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: result.remainingWeightCapacityKg < 0 ? '#dc2626' : '#1a2332' }}>
                      {result.remainingWeightCapacityKg.toLocaleString('en-GB')} kg
                    </div>
                    <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>
                      {result.remainingWeightCapacityKg < 0 ? 'Exceeds max weight' : 'before max payload'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Cross-links ── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/cbm" style={{
          flex: 1, minWidth: 200,
          background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
          padding: '14px 18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722' }}>Volume?</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2332' }}>Calculate CBM →</span>
          <span style={{ fontSize: 12, color: '#8f9ab0' }}>Cubic metres for sea and air freight</span>
        </Link>
        <Link href="/" style={{
          flex: 1, minWidth: 200,
          background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
          padding: '14px 18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#e87722' }}>Road Freight?</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2332' }}>Calculate Loading Metres →</span>
          <span style={{ fontSize: 12, color: '#8f9ab0' }}>LDM calculator for UK/EU trailers</span>
        </Link>
      </div>

      {/* ── API callout ── */}
      <div style={{
        marginTop: 16, background: '#1a2332', borderRadius: 12, padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>Automate this with the API</div>
          <code style={{ color: '#e87722', fontSize: 12 }}>GET /api/pallet?pl=120&amp;pw=80&amp;pmh=220&amp;bl=40&amp;bw=30&amp;bh=25</code>
        </div>
        <Link href="/api-docs#pallet" style={{
          background: '#e87722', color: '#fff', textDecoration: 'none',
          padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          View API Docs →
        </Link>
      </div>
    </div>
  );
}
