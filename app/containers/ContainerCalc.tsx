'use client';

import { useState } from 'react';
import { calculateContainerLoading, getAllContainerSpecs, type LoadingResult } from '@/lib/calculations/container-capacity';
import ContainerViz from './ContainerViz';

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
  label, id, value, onChange, placeholder, unit, type = 'number',
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; placeholder?: string; unit?: string;
  type?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {unit && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> ({unit})</span>}
      </label>
      <input
        id={id}
        type={type}
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
        }}
      />
    </div>
  );
}

function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '16px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: 'amber' | 'red' | 'green' }) {
  const bg = color === 'amber' ? '#fff7ed' : color === 'red' ? '#fef2f2' : '#f0fdf4';
  const fg = color === 'amber' ? '#9a3412' : color === 'red' ? '#991b1b' : '#166534';
  const border = color === 'amber' ? '#fdba74' : color === 'red' ? '#fca5a5' : '#86efac';
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 12,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 20,
      background: bg,
      color: fg,
      border: `1px solid ${border}`,
    }}>
      {text}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────

export default function ContainerCalc() {
  const specs = getAllContainerSpecs();

  const [slug, setSlug] = useState(specs[0].slug);
  const [itemL, setItemL] = useState('');
  const [itemW, setItemW] = useState('');
  const [itemH, setItemH] = useState('');
  const [itemWt, setItemWt] = useState('');
  const [qty, setQty] = useState('1');
  const [result, setResult] = useState<LoadingResult | null>(null);

  function handleCalculate() {
    const l = parseFloat(itemL);
    const w = parseFloat(itemW);
    const h = parseFloat(itemH);
    const wt = parseFloat(itemWt) || 0;
    const q = parseInt(qty, 10);
    if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0 || q < 1) {
      setResult(null);
      return;
    }
    const r = calculateContainerLoading(slug, l, w, h, wt, q);
    setResult(r);
  }

  return (
    <div>
      {/* Inputs */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
      }}>
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Container Loading Calculator</span>
        </div>
        <div style={{ padding: 24 }}>
          {/* Container selector */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="cc-type" style={labelStyle}>Container Type</label>
            <select
              id="cc-type"
              value={slug}
              onChange={e => { setSlug(e.target.value); setResult(null); }}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'auto',
              }}
            >
              {specs.map(c => (
                <option key={c.slug} value={c.slug}>{c.name} ({c.capacityCbm} CBM)</option>
              ))}
            </select>
          </div>

          {/* Item dimensions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 16 }}>
            <Field label="Length" id="cc-l" value={itemL} onChange={setItemL} placeholder="e.g. 120" unit="cm" />
            <Field label="Width" id="cc-w" value={itemW} onChange={setItemW} placeholder="e.g. 80" unit="cm" />
            <Field label="Height" id="cc-h" value={itemH} onChange={setItemH} placeholder="e.g. 100" unit="cm" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 20 }}>
            <Field label="Item Weight" id="cc-wt" value={itemWt} onChange={setItemWt} placeholder="optional" unit="kg" />
            <Field label="Quantity" id="cc-qty" value={qty} onChange={setQty} placeholder="1" />
          </div>

          {/* Calculate button */}
          <button
            type="button"
            onClick={handleCalculate}
            style={{
              background: '#e87722',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d06a1e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#e87722'; }}
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ background: '#243044', padding: '14px 24px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results &mdash; {result.container.name}</span>
          </div>

          {/* Hero number */}
          <div style={{ padding: '28px 24px 20px', textAlign: 'center', borderBottom: '1px solid #eef0f4' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-faint)', marginBottom: 8 }}>
              Total Items That Fit
            </div>
            <div style={{ fontSize: 'clamp(48px, 12vw, 64px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-2px' }}>
              {result.totalItemsFit.toLocaleString()}
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: 0 }}> items</span>
            </div>
            {result.itemsRequested > 1 && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-faint)' }}>
                {result.allFit
                  ? `All ${result.itemsRequested.toLocaleString()} items fit`
                  : `${result.totalItemsFit.toLocaleString()} of ${result.itemsRequested.toLocaleString()} requested items fit`}
              </div>
            )}
          </div>

          {/* Container visualization */}
          <ContainerViz
            itemsPerRow={result.itemsPerRow}
            itemsPerCol={result.itemsPerCol}
            layers={result.layers}
            totalItemsFit={result.totalItemsFit}
            containerWidthCm={result.container.internalWidthCm}
            containerHeightCm={result.container.internalHeightCm}
            itemWidthCm={parseFloat(itemW) || 0}
            itemHeightCm={parseFloat(itemH) || 0}
            volumeUtilisation={result.volumeUtilisation}
          />

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#eef0f4' }}>
            <StatCell label="Items Per Layer" value={`${result.itemsPerLayer}`} sub={`${result.itemsPerRow} \u00d7 ${result.itemsPerCol} on floor`} />
            <StatCell label="Layers" value={`${result.layers}`} />
            <StatCell label="Volume Utilisation" value={`${result.volumeUtilisation}%`} sub={`${result.volumeUsedCbm} of ${result.container.capacityCbm} m\u00b3`} />
            <StatCell label="Weight Utilisation" value={result.totalWeightKg > 0 ? `${result.weightUtilisation}%` : 'N/A'} sub={result.totalWeightKg > 0 ? `${result.totalWeightKg.toLocaleString()} of ${result.container.maxPayloadKg.toLocaleString()} kg` : 'No weight specified'} />
          </div>

          {/* Limiting factor & warnings */}
          <div style={{ padding: '18px 24px', borderTop: '1px solid #eef0f4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: result.warnings.length > 0 ? 12 : 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-faint)' }}>Limiting Factor:</span>
              {result.limitingFactor === 'volume' && <Badge text="Volume" color="amber" />}
              {result.limitingFactor === 'weight' && <Badge text="Weight" color="red" />}
              {result.limitingFactor === 'none' && <Badge text="All items fit" color="green" />}
            </div>
            {result.warnings.length > 0 && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                padding: '12px 16px',
              }}>
                {result.warnings.map((w, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
                    {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
