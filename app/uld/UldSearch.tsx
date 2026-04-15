'use client';

import { useState, useMemo } from 'react';

interface Dims { length: number; width: number; height: number }
interface DoorDims { width: number; height: number }

interface ULD {
  code: string;
  name: string;
  slug: string;
  category: 'container' | 'pallet' | 'special';
  deckPosition: 'lower' | 'main' | 'both';
  externalDimensions: Dims;
  internalDimensions: Dims | null;
  doorDimensions: DoorDims | null;
  maxGrossWeight: number;
  tareWeight: number;
  usableVolume: number;
  compatibleAircraft: string[];
  notes: string;
}

interface Props { data: ULD[] }

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  container: 'Containers',
  pallet: 'Pallets',
  special: 'Special',
};

const DECK_LABELS: Record<string, string> = {
  all: 'All Decks',
  lower: 'Lower Deck',
  main: 'Main Deck',
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  container: { bg: '#e0f2fe', color: '#0369a1' },
  pallet:    { bg: '#fef3c7', color: '#92400e' },
  special:   { bg: '#fce7f3', color: '#9d174d' },
};

function fmt(n: number): string { return n.toLocaleString(); }

function DimLabel({ d, label }: { d: Dims | DoorDims | null; label: string }) {
  if (!d) return null;
  const parts = 'length' in d
    ? `${d.length} x ${d.width} x ${d.height} cm`
    : `${d.width} x ${d.height} cm`;
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-faint)' }}>
        {label}
      </span>
      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{parts}</div>
    </div>
  );
}

export default function UldSearch({ data }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [deck, setDeck] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = data;

    if (category !== 'all') {
      items = items.filter(u => u.category === category);
    }

    if (deck !== 'all') {
      items = items.filter(u => u.deckPosition === deck || u.deckPosition === 'both');
    }

    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      items = items.filter(u =>
        u.code.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.slug.toLowerCase().includes(q) ||
        u.notes.toLowerCase().includes(q) ||
        u.compatibleAircraft.some(a => a.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [data, query, category, deck]);

  const toggleExpand = (code: string) => {
    setExpanded(prev => prev === code ? null : code);
  };

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none',
        }}>
          {'\u{1F50D}'}
        </div>
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); }}
          placeholder="Search by code, name, or aircraft — e.g. AKE, LD3, B777"
          autoFocus
          aria-label="Search ULD types by code, name, or aircraft"
          style={{
            width: '100%',
            padding: '14px 16px 14px 46px',
            fontSize: 16,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            color: 'var(--text)',
            background: 'var(--bg-card)',
            border: '2px solid var(--border)',
            borderRadius: 10,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#e87722';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,119,34,0.12)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const active = category === key;
          return (
            <button
              key={key}
              onClick={() => setCategory(key)}
              style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                border: active ? '1.5px solid #EF9F27' : '1.5px solid var(--border)',
                background: active ? '#EF9F27' : 'var(--bg-card)',
                color: active ? '#1a1a1a' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Deck filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(DECK_LABELS).map(([key, label]) => {
          const active = deck === key;
          return (
            <button
              key={key}
              onClick={() => setDeck(key)}
              style={{
                padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                border: active ? '1.5px solid var(--text-muted)' : '1.5px solid var(--border)',
                background: active ? 'var(--text-muted)' : 'var(--bg-card)',
                color: active ? 'var(--bg-card)' : 'var(--text-faint)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 16, fontWeight: 600 }}>
        {filtered.length} ULD{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'var(--text-faint)', fontSize: 15,
            background: 'var(--bg-card)', borderRadius: 12,
            border: '1px solid var(--border)',
          }}>
            No ULDs match your search. Try a different code or filter.
          </div>
        )}

        {filtered.map(uld => {
          const isOpen = expanded === uld.code;
          const catStyle = CATEGORY_COLORS[uld.category] || { bg: '#f3f4f6', color: '#6b7280' };
          const payload = uld.maxGrossWeight - uld.tareWeight;
          const ext = uld.externalDimensions;

          return (
            <div
              key={uld.code}
              onClick={() => toggleExpand(uld.code)}
              style={{
                background: 'var(--bg-card)',
                border: isOpen ? '1.5px solid #e87722' : '1px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: isOpen ? '0 0 0 3px rgba(232,119,34,0.08)' : 'none',
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                {/* Code block */}
                <div style={{
                  background: 'var(--bg)', color: '#e87722',
                  fontWeight: 800, fontSize: 18, fontFamily: 'monospace',
                  padding: '8px 14px', borderRadius: 8, letterSpacing: '1px',
                  flexShrink: 0, textAlign: 'center', minWidth: 60,
                }}>
                  {uld.code}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{uld.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: catStyle.bg, color: catStyle.color, textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}>
                      {uld.category}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      background: 'var(--bg)', color: 'var(--text-faint)',
                      border: '1px solid var(--border)',
                    }}>
                      {uld.deckPosition === 'both' ? 'Lower + Main' : uld.deckPosition === 'lower' ? 'Lower deck' : 'Main deck'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                    <span>{ext.length} x {ext.width} x {ext.height} cm</span>
                    <span>{fmt(payload)} kg payload</span>
                    {uld.usableVolume > 0 && <span>{uld.usableVolume} m&sup3;</span>}
                  </div>
                </div>

                {/* Expand indicator */}
                <div style={{
                  fontSize: 18, color: 'var(--text-faint)', transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0,
                  lineHeight: 1, marginTop: 4,
                }}>
                  &#9662;
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{
                  padding: '0 20px 20px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 16,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                    <DimLabel d={uld.externalDimensions} label="External dimensions" />
                    <DimLabel d={uld.internalDimensions} label="Internal dimensions" />
                    <DimLabel d={uld.doorDimensions} label="Door opening" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-faint)' }}>
                        Max gross weight
                      </span>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{fmt(uld.maxGrossWeight)} kg</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-faint)' }}>
                        Tare weight
                      </span>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{fmt(uld.tareWeight)} kg</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-faint)' }}>
                        Max payload
                      </span>
                      <div style={{ fontSize: 14, color: '#e87722', fontWeight: 700 }}>{fmt(payload)} kg</div>
                    </div>
                    {uld.usableVolume > 0 && (
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-faint)' }}>
                          Usable volume
                        </span>
                        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{uld.usableVolume} m&sup3;</div>
                      </div>
                    )}
                  </div>

                  {/* Compatible aircraft */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-faint)' }}>
                      Compatible aircraft
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {uld.compatibleAircraft.map(ac => (
                        <span key={ac} style={{
                          fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                          background: 'var(--bg)', color: 'var(--text-muted)',
                          border: '1px solid var(--border)', fontFamily: 'monospace',
                        }}>
                          {ac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {uld.notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
