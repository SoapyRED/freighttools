'use client';

import { useState, useMemo } from 'react';
import { UNITS, convert, FREIGHT_CONVERSIONS, type UnitDef } from '@/lib/calculations/converter';

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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'auto',
};

// ─── Freight-specific virtual units for the "To" dropdown ────────
const FREIGHT_UNITS: UnitDef[] = [
  { code: 'chargeable_kg', name: 'Chargeable Weight', group: 'freight', symbol: 'kg' },
  { code: 'freight_tonnes', name: 'Freight Tonnes (W/M)', group: 'freight', symbol: 'FT' },
];

// ─── Unit groups for <optgroup> ───────────────────────────────────
const GROUPS: { label: string; group: string }[] = [
  { label: 'Freight', group: 'freight' },
  { label: 'Weight', group: 'weight' },
  { label: 'Volume', group: 'volume' },
  { label: 'Length', group: 'length' },
];

function unitsByGroup(group: string): UnitDef[] {
  if (group === 'freight') return FREIGHT_UNITS;
  return Object.values(UNITS).filter(u => u.group === group);
}

function isFreightConversion(from: string, to: string): boolean {
  return `${from}->${to}` in FREIGHT_CONVERSIONS;
}

// ─── Props ────────────────────────────────────────────────────────
interface Props {
  defaultFrom?: string;
  defaultTo?: string;
}

// ─── Component ────────────────────────────────────────────────────
export default function ConvertTool({ defaultFrom = 'kg', defaultTo = 'lbs' }: Props) {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  // Keep "to" in the same group when "from" changes (unless freight cross-group)
  function handleFromChange(newFrom: string) {
    const newUnit = UNITS[newFrom];
    const toUnit = UNITS[to] || FREIGHT_UNITS.find(u => u.code === to);
    setFrom(newFrom);
    // Allow freight conversions (cbm -> chargeable_kg/freight_tonnes)
    if (toUnit && toUnit.group === 'freight') {
      if (!isFreightConversion(newFrom, to)) {
        // Switch to first valid freight target or same-group unit
        const sameGroup = Object.values(UNITS).filter(u => u.group === newUnit?.group && u.code !== newFrom);
        if (sameGroup.length > 0) setTo(sameGroup[0].code);
      }
      return;
    }
    if (newUnit && toUnit && newUnit.group !== toUnit.group) {
      const sameGroup = Object.values(UNITS).filter(u => u.group === newUnit.group && u.code !== newFrom);
      if (sameGroup.length > 0) setTo(sameGroup[0].code);
    }
  }

  function handleToChange(newTo: string) {
    const newUnit = UNITS[newTo] || FREIGHT_UNITS.find(u => u.code === newTo);
    const fromUnit = UNITS[from];
    setTo(newTo);
    // Freight target selected — ensure from=cbm
    if (newUnit && newUnit.group === 'freight') {
      if (from !== 'cbm') setFrom('cbm');
      return;
    }
    if (newUnit && fromUnit && newUnit.group !== fromUnit.group) {
      const sameGroup = Object.values(UNITS).filter(u => u.group === newUnit.group && u.code !== newTo);
      if (sameGroup.length > 0) setFrom(sameGroup[0].code);
    }
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const { result, convertError } = useMemo(() => {
    const v = parseFloat(value);
    if (!v && v !== 0) return { result: null, convertError: null };
    const r = convert(v, from, to);
    if ('error' in r) return { result: null, convertError: String(r.error) };
    return { result: r, convertError: null };
  }, [value, from, to]);

  // Format large/small numbers nicely
  function formatResult(n: number): string {
    if (Math.abs(n) >= 1_000_000) return n.toLocaleString('en-GB', { maximumFractionDigits: 2 });
    if (Math.abs(n) >= 100) return n.toLocaleString('en-GB', { maximumFractionDigits: 4 });
    if (Math.abs(n) >= 1) return n.toLocaleString('en-GB', { maximumFractionDigits: 6 });
    return n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }

  return (
    <div>
      {/* Inputs card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
      }}>
        <div style={{ background: 'var(--bg-card)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Convert</span>
          <span style={{ background: '#e87722', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Real-time</span>
        </div>

        <div style={{ padding: 24 }}>
          {/* Value input */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="conv-val" style={labelStyle}>Value</label>
            <input
              id="conv-val"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. 100"
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

          {/* From / Swap / To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end' }}>
            {/* From */}
            <div>
              <label htmlFor="conv-from" style={labelStyle}>From</label>
              <select
                id="conv-from"
                value={from}
                onChange={e => handleFromChange(e.target.value)}
                style={selectStyle}
              >
                {GROUPS.map(g => (
                  <optgroup key={g.group} label={g.label}>
                    {unitsByGroup(g.group).map(u => (
                      <option key={u.code} value={u.code}>{u.name} ({u.symbol})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <button
              type="button"
              onClick={swap}
              aria-label="Swap units"
              style={{
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 8,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 20,
                color: 'var(--text-muted)',
                transition: 'border-color 0.15s, background 0.15s',
                flexShrink: 0,
                marginBottom: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#e87722';
                e.currentTarget.style.background = '#fff7ed';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '#f7f8fa';
              }}
            >
              &#8596;
            </button>

            {/* To */}
            <div>
              <label htmlFor="conv-to" style={labelStyle}>To</label>
              <select
                id="conv-to"
                value={to}
                onChange={e => handleToChange(e.target.value)}
                style={selectStyle}
              >
                {GROUPS.map(g => (
                  <optgroup key={g.group} label={g.label}>
                    {unitsByGroup(g.group).map(u => (
                      <option key={u.code} value={u.code}>{u.name} ({u.symbol})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Result card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', borderLeft: '3px solid var(--page-cat, var(--cat-ops))', padding: '14px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Result</span>
        </div>

        {!result ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: convertError ? '#dc2626' : '#8f9ab0', fontSize: 14 }}>
            {convertError ? 'These units cannot be converted directly. Choose units from the same category.' : 'Enter a value above to convert'}
          </div>
        ) : (
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-faint)', marginBottom: 8 }}>
              {result.input.name} &rarr; {result.result.name}
            </div>
            <div style={{ fontSize: 'clamp(40px, 10vw, 64px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-2px' }}>
              {formatResult(result.result.value)}
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: 0 }}> {UNITS[to]?.symbol ?? FREIGHT_UNITS.find(u => u.code === to)?.symbol ?? ''}</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 14, color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg)', display: 'inline-block', padding: '6px 14px', borderRadius: 6 }}>
              {result.formula}
            </div>
            {(() => {
              const r = result as unknown as Record<string, unknown>;
              return 'note' in r && r.note ? (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
                  {String(r.note)}
                </p>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
