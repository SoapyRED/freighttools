'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { AdrEntrySlim } from '@/lib/calculations/adr';

// ─────────────────────────────────────────────────────────────────
//  Hazard class colour coding
// ─────────────────────────────────────────────────────────────────

const CLASS_COLOURS: Record<string, { bg: string; text: string; label: string }> = {
  '1':   { bg: '#fef9c3', text: '#854d0e', label: 'Explosives' },
  '2':   { bg: '#dbeafe', text: '#1e40af', label: 'Gases' },
  '3':   { bg: '#fee2e2', text: '#991b1b', label: 'Flammable liquids' },
  '4':   { bg: '#ffedd5', text: '#9a3412', label: 'Flammable solids' },
  '5':   { bg: '#ede9fe', text: '#5b21b6', label: 'Oxidising' },
  '6':   { bg: '#f0fdf4', text: '#166534', label: 'Toxic' },
  '7':   { bg: '#fef3c7', text: '#92400e', label: 'Radioactive' },
  '8':   { bg: '#f1f5f9', text: '#334155', label: 'Corrosive' },
  '9':   { bg: '#f8fafc', text: '#475569', label: 'Misc. dangerous' },
};

function getClassStyle(cls: string) {
  const key = cls.split('.')[0];
  return CLASS_COLOURS[key] ?? { bg: '#f1f5f9', text: '#334155', label: `Class ${cls}` };
}

// ─────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────

interface Props {
  index: AdrEntrySlim[];
}

const MAX_SHOWN = 50;

export default function AdrSearch({ index }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const matched: AdrEntrySlim[] = [];
    for (const entry of index) {
      if (
        entry.un_number.includes(q) ||
        entry.proper_shipping_name.toLowerCase().includes(q)
      ) {
        matched.push(entry);
        if (matched.length >= MAX_SHOWN + 1) break; // fetch one extra to detect overflow
      }
    }
    return matched;
  }, [query, index]);

  const shown   = results.slice(0, MAX_SHOWN);
  const hasMore = results.length > MAX_SHOWN;
  const isEmpty = query.trim().length >= 2 && results.length === 0;

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: '#8f9ab0', fontSize: 18, pointerEvents: 'none',
        }}>
          🔍
        </div>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="UN number or substance name — e.g. 1203 or gasoline"
          autoFocus
          style={{
            width: '100%',
            padding: '14px 16px 14px 46px',
            fontSize: 16,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            color: '#1e2535',
            background: '#fff',
            border: '2px solid #d8dce6',
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
            e.currentTarget.style.borderColor = '#d8dce6';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Empty state */}
      {query.trim().length < 2 && (
        <p style={{ color: '#8f9ab0', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
          Type at least 2 characters to search 2,336 ADR 2025 dangerous goods entries
        </p>
      )}

      {/* No results */}
      {isEmpty && (
        <div style={{
          background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
          padding: '24px', textAlign: 'center',
        }}>
          <p style={{ color: '#5a6478', marginBottom: 8 }}>
            No results for <strong>&ldquo;{query}&rdquo;</strong>
          </p>
          <p style={{ color: '#8f9ab0', fontSize: 13 }}>
            Try a UN number (e.g. 1203) or part of the substance name (e.g. petrol, acid, gas)
          </p>
        </div>
      )}

      {/* Results list */}
      {shown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map(entry => {
            const cs = getClassStyle(entry.class);
            return (
              <Link
                key={entry.un_number}
                href={`/adr/un/${entry.un_number}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#fff',
                  border: '1px solid #d8dce6',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'border-color 0.12s, box-shadow 0.12s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e87722';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(232,119,34,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#d8dce6';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* UN badge */}
                  <div style={{
                    background: '#1a2332',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                    flexShrink: 0,
                    letterSpacing: 0.5,
                  }}>
                    UN{entry.un_number}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#1e2535',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {entry.proper_shipping_name}
                    </div>
                    {entry.packing_group && (
                      <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>
                        Packing Group {entry.packing_group}
                      </div>
                    )}
                  </div>

                  {/* Class badge */}
                  <div style={{
                    background: cs.bg,
                    color: cs.text,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    Class {entry.class}
                  </div>

                  {/* Arrow */}
                  <div style={{ color: '#d8dce6', fontSize: 16, flexShrink: 0 }}>→</div>
                </div>
              </Link>
            );
          })}

          {hasMore && (
            <p style={{ color: '#8f9ab0', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
              Showing first {MAX_SHOWN} results — refine your search to narrow down
            </p>
          )}
        </div>
      )}
    </div>
  );
}
