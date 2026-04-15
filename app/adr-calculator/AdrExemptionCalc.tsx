'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

interface CalcEntry {
  un_number: string;
  proper_shipping_name: string;
  class: string;
  transport_category: string | null;
}

interface LoadItem {
  id: number;
  un_number: string;
  proper_shipping_name: string;
  class: string;
  transport_category: string | null;
  quantity: number;
  multiplier: number;
  points: number;
}

interface Props {
  index: CalcEntry[];
}

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

function getMultiplier(cat: string | null): number | null {
  switch (cat) {
    case '0': return null; // no exemption
    case '1': return 50;
    case '2': return 3;
    case '3': return 1;
    case '4': return 0;
    default: return null;
  }
}

// Per-substance maximum quantities per ADR 1.1.3.6.3
function getMaxQuantity(cat: string | null): number | null {
  switch (cat) {
    case '0': return 0;
    case '1': return 20;
    case '2': return 333;
    case '3': return 1000;
    case '4': return Infinity;
    default: return null;
  }
}

function getCategoryLabel(cat: string | null): string {
  switch (cat) {
    case '0': return 'Cat 0 — No exemption';
    case '1': return 'Cat 1 — ×50';
    case '2': return 'Cat 2 — ×3';
    case '3': return 'Cat 3 — ×1';
    case '4': return 'Cat 4 — ×0';
    default: return 'Unknown';
  }
}

let nextId = 1;

// ─────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────

export default function AdrExemptionCalc({ index }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<CalcEntry | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [loadItems, setLoadItems] = useState<LoadItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const matched: CalcEntry[] = [];
    for (const entry of index) {
      if (
        entry.un_number.includes(q) ||
        entry.proper_shipping_name.toLowerCase().includes(q)
      ) {
        matched.push(entry);
        if (matched.length >= 8) break;
      }
    }
    return matched;
  }, [searchQuery, index]);

  // Total points
  const totalPoints = useMemo(() => {
    return loadItems.reduce((sum, item) => sum + item.points, 0);
  }, [loadItems]);

  // Has category 0
  const hasCatZero = useMemo(() => {
    return loadItems.some(item => item.transport_category === '0');
  }, [loadItems]);

  // Per-substance quantity limit exceedances
  const quantityWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (const item of loadItems) {
      const maxQty = getMaxQuantity(item.transport_category);
      if (maxQty !== null && item.quantity > maxQty) {
        warnings.push(
          `UN${item.un_number} (Category ${item.transport_category}): ${item.quantity} exceeds the ${maxQty} kg/L maximum for Transport Category ${item.transport_category}`
        );
      }
    }
    return warnings;
  }, [loadItems]);

  const hasQuantityExceedance = quantityWarnings.length > 0;

  // Progress bar
  const progressPct = Math.min((totalPoints / 1000) * 100, 100);
  const progressColour = (hasQuantityExceedance || totalPoints >= 1000) ? 'var(--error)' : totalPoints > 750 ? 'var(--warning)' : 'var(--success)';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectEntry = useCallback((entry: CalcEntry) => {
    setSelectedEntry(entry);
    setSearchQuery(`UN${entry.un_number} — ${entry.proper_shipping_name}`);
    setShowDropdown(false);
    setHighlightIdx(-1);
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      selectEntry(searchResults[highlightIdx]);
    }
  }, [showDropdown, searchResults, highlightIdx, selectEntry]);

  const addToLoad = useCallback(() => {
    if (!selectedEntry) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    const mult = getMultiplier(selectedEntry.transport_category);
    const points = mult !== null ? qty * mult : 0;

    setLoadItems(prev => [...prev, {
      id: nextId++,
      un_number: selectedEntry.un_number,
      proper_shipping_name: selectedEntry.proper_shipping_name,
      class: selectedEntry.class,
      transport_category: selectedEntry.transport_category,
      quantity: qty,
      multiplier: mult ?? 0,
      points,
    }]);

    // Reset form
    setSelectedEntry(null);
    setSearchQuery('');
    setQuantity('');
  }, [selectedEntry, quantity]);

  const removeItem = useCallback((id: number) => {
    setLoadItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setLoadItems([]);
  }, []);

  // Category warnings
  const isCatZeroSelected = selectedEntry?.transport_category === '0';
  const isCatUnknown = selectedEntry && (
    selectedEntry.transport_category === null ||
    selectedEntry.transport_category === '-' ||
    selectedEntry.transport_category === '' ||
    (selectedEntry.transport_category?.toLowerCase().includes('see'))
  );

  // Shared styles
  const cardStyle: React.CSSProperties = {
    borderRadius: 8,
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--page-cat, var(--cat-dg))',
    overflow: 'hidden',
    marginBottom: 24,
  };
  const cardHeaderStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 700,
    borderBottom: '1px solid var(--border)',
  };
  const cardBodyStyle: React.CSSProperties = {
    padding: '20px 16px',
    background: 'var(--bg, #fff)',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid var(--border-strong)',
    fontSize: 15,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary, #5a6478)',
    marginBottom: 6,
  };
  const badgeStyle: React.CSSProperties = {
    background: 'var(--cat-dg-tint)',
    color: 'var(--cat-dg)',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
  };

  return (
    <div>

      {/* ── SEARCH / ADD SECTION ── */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <span>Add Substances to Load</span>
          <span style={badgeStyle}>UN Lookup</span>
        </div>
        <div style={cardBodyStyle}>

          {/* UN Search */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <label style={labelStyle}>Search UN number or substance name</label>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSelectedEntry(null);
                setShowDropdown(true);
                setHighlightIdx(-1);
              }}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              onKeyDown={handleSearchKeyDown}
              placeholder="e.g. 1203 or petrol"
              style={inputStyle}
            />

            {/* Autocomplete dropdown */}
            {showDropdown && searchResults.length > 0 && !selectedEntry && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-strong)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 10,
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((entry, idx) => (
                  <button
                    key={`${entry.un_number}-${idx}`}
                    onClick={() => selectEntry(entry)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '10px 14px',
                      background: idx === highlightIdx ? 'var(--grey-50, #f8f9fb)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--grey-100, #eef0f4)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 14,
                      color: 'var(--text, #1e2535)',
                    }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 13,
                      background: 'var(--cat-dg-tint)',
                      color: 'var(--cat-dg)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}>
                      UN{entry.un_number}
                    </span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {entry.proper_shipping_name}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-faint)',
                      flexShrink: 0,
                    }}>
                      {entry.transport_category !== null ? `Cat ${entry.transport_category}` : '—'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected substance details */}
          {selectedEntry && (
            <div style={{
              background: 'var(--grey-50, #f8f9fb)',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 16,
              border: '1px solid var(--grey-100, #eef0f4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 14,
                  background: 'var(--cat-dg-tint)',
                  color: 'var(--cat-dg)',
                  padding: '3px 10px',
                  borderRadius: 5,
                }}>
                  UN{selectedEntry.un_number}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-faint)' }}>
                  Class {selectedEntry.class}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: selectedEntry.transport_category === '0' ? 'var(--error)' : 'var(--text-primary)',
                  background: selectedEntry.transport_category === '0' ? 'var(--error-tint)' : 'var(--glow-accent)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>
                  {getCategoryLabel(selectedEntry.transport_category)}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text, #1e2535)', lineHeight: 1.4 }}>
                {selectedEntry.proper_shipping_name}
              </div>
            </div>
          )}

          {/* Category 0 warning */}
          {isCatZeroSelected && (
            <div style={{
              background: 'var(--error-tint)',
              border: '1px solid var(--error-border)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--error)',
              lineHeight: 1.5,
            }}>
              Category 0 &mdash; this substance cannot use the 1.1.3.6 exemption. Adding it to the load will flag full ADR compliance.
            </div>
          )}

          {/* Unknown category warning */}
          {isCatUnknown && (
            <div style={{
              background: 'var(--warning-tint)',
              border: '1px solid var(--warning-border)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--warning-dark)',
              lineHeight: 1.5,
            }}>
              Transport category not available for this substance. Points cannot be calculated &mdash; check ADR Table A directly.
            </div>
          )}

          {/* Quantity input */}
          {selectedEntry && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Quantity (kg or litres)</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="0"
                step="any"
                style={inputStyle}
                onKeyDown={e => { if (e.key === 'Enter') addToLoad(); }}
              />
            </div>
          )}

          {/* Add button */}
          <button
            onClick={addToLoad}
            disabled={!selectedEntry || !quantity || parseFloat(quantity) <= 0}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: (!selectedEntry || !quantity || parseFloat(quantity) <= 0) ? 'var(--border)' : 'var(--page-cat, var(--cat-dg))',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              cursor: (!selectedEntry || !quantity || parseFloat(quantity) <= 0) ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Add to Load
          </button>
        </div>
      </div>

      {/* ── LOAD LIST SECTION ── */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <span>Current Load</span>
          <span style={badgeStyle}>{loadItems.length} item{loadItems.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ ...cardBodyStyle, padding: loadItems.length === 0 ? '20px 16px' : '0' }}>

          {loadItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-faint)',
              fontSize: 14,
              padding: '24px 16px',
            }}>
              No substances added yet. Search and add items above.
            </div>
          ) : (
            <>
              {/* Item list */}
              <div style={{ overflowX: 'auto' }}>
                {loadItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--grey-100, #eef0f4)',
                      fontSize: 13,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 12,
                      background: 'var(--cat-dg-tint)',
                      color: 'var(--cat-dg)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}>
                      UN{item.un_number}
                    </span>
                    <span style={{
                      flex: 1,
                      minWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text, #1e2535)',
                      fontWeight: 500,
                    }}>
                      {item.proper_shipping_name}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: item.transport_category === '0' ? 'var(--error)' : 'var(--text-faint)',
                      flexShrink: 0,
                    }}>
                      Cat {item.transport_category ?? '?'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #5a6478)', flexShrink: 0 }}>
                      {item.quantity.toLocaleString()} {item.multiplier > 0 ? `× ${item.multiplier}` : '× 0'}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: item.transport_category === '0' ? 'var(--error)' : 'var(--text)',
                      flexShrink: 0,
                      minWidth: 50,
                      textAlign: 'right',
                    }}>
                      {item.transport_category === '0' ? 'N/A' : item.points.toLocaleString(undefined, { maximumFractionDigits: 1 })} pts
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--error)',
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0 4px',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--grey-50, #f8f9fb)',
                borderTop: '2px solid var(--grey-100, #d8dce6)',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text, #1e2535)' }}>
                  Total Points
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: totalPoints > 1000 ? 'var(--error)' : 'var(--text)' }}>
                    {totalPoints.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                  <button
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: '1px solid var(--grey-100, #d8dce6)',
                      borderRadius: 6,
                      color: 'var(--text-faint)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RESULTS SECTION ── */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <span>Exemption Status</span>
          <span style={{
            ...badgeStyle,
            background: loadItems.length === 0 ? 'var(--bg)' :
                         hasCatZero || hasQuantityExceedance || totalPoints > 1000 ? 'var(--error-tint)' :
                         'var(--success-tint)',
            color: loadItems.length === 0 ? 'var(--text-faint)' :
                   hasCatZero || hasQuantityExceedance || totalPoints > 1000 ? 'var(--error)' :
                   'var(--success)',
          }}>
            {loadItems.length === 0 ? 'Awaiting data' :
             hasCatZero || hasQuantityExceedance || totalPoints > 1000 ? 'Full ADR' :
             'Exempt'}
          </span>
        </div>
        <div style={{ ...cardBodyStyle, textAlign: 'center', padding: '28px 16px' }}>

          {loadItems.length === 0 ? (
            <div style={{ color: 'var(--text-faint)', fontSize: 15 }}>
              Add substances above to calculate exemption status.
            </div>
          ) : (
            <>
              {/* Points display */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 'clamp(32px, 6vw, 48px)',
                  fontWeight: 800,
                  color: hasCatZero || hasQuantityExceedance || totalPoints > 1000 ? 'var(--error)' :
                         totalPoints > 750 ? 'var(--warning)' : 'var(--success)',
                  lineHeight: 1,
                  letterSpacing: '-1px',
                }}>
                  {totalPoints.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4, fontWeight: 600 }}>
                  points out of 1,000
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: 12,
                background: 'var(--grey-100, #eef0f4)',
                borderRadius: 6,
                overflow: 'hidden',
                marginBottom: 20,
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: progressColour,
                  borderRadius: 6,
                  transformOrigin: 'left',
                  transform: `scaleX(${progressPct / 100})`,
                  transition: 'transform 0.3s ease, background 0.3s ease',
                }} />
              </div>

              {/* Quantity exceedance warnings */}
              {hasQuantityExceedance && (
                <div style={{
                  background: 'var(--error-tint)',
                  border: '1.5px solid var(--error-border)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  marginBottom: 16,
                  textAlign: 'left',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--error)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Per-substance quantity limit exceeded
                  </div>
                  {quantityWarnings.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--error-dark)', lineHeight: 1.5, marginBottom: 2 }}>
                      &bull; {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Verdict */}
              {hasCatZero ? (
                <div style={{
                  background: 'var(--error-tint)',
                  border: '1.5px solid var(--error-border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--error)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Category 0 Substance in Load
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--error-dark)', lineHeight: 1.5 }}>
                    Full ADR compliance required regardless of points total. Category 0 substances cannot use the 1.1.3.6 exemption.
                  </div>
                </div>
              ) : hasQuantityExceedance ? (
                <div style={{
                  background: 'var(--error-tint)',
                  border: '1.5px solid var(--error-border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--error)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Full ADR Compliance Required
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--error-dark)', lineHeight: 1.5 }}>
                    One or more substances exceed the per-substance quantity limit under ADR 1.1.3.6.3. The exemption cannot apply.
                  </div>
                </div>
              ) : totalPoints <= 1000 ? (
                <div style={{
                  background: 'var(--success-tint)',
                  border: '1.5px solid var(--success-border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--success)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    1.1.3.6 Exemption Applies
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--success-light)', lineHeight: 1.5 }}>
                    Total points: {totalPoints.toLocaleString(undefined, { maximumFractionDigits: 1 })} / 1,000 &mdash; within threshold.
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--error-tint)',
                  border: '1.5px solid var(--error-border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--error)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Full ADR Compliance Required
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--error-dark)', lineHeight: 1.5 }}>
                    Total points: {totalPoints.toLocaleString(undefined, { maximumFractionDigits: 1 })} / 1,000 &mdash; threshold exceeded.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
