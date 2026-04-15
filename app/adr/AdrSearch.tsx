'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { AdrEntrySlim } from '@/lib/calculations/adr';

// ─────────────────────────────────────────────────────────────────
//  Hazard class colour coding
// ─────────────────────────────────────────────────────────────────

const CLASS_COLOURS: Record<string, { bg: string; text: string; label: string; tint: string }> = {
  '1':   { bg: '#fef9c3', text: '#854d0e', label: 'Explosives',        tint: 'rgba(239,159,39,0.15)' },
  '2':   { bg: '#dbeafe', text: '#1e40af', label: 'Gases',             tint: 'rgba(34,197,94,0.15)' },
  '3':   { bg: '#fee2e2', text: '#991b1b', label: 'Flammable liquids', tint: 'rgba(239,68,68,0.15)' },
  '4':   { bg: '#ffedd5', text: '#9a3412', label: 'Flammable solids',  tint: 'rgba(239,68,68,0.12)' },
  '5':   { bg: '#ede9fe', text: '#5b21b6', label: 'Oxidising',         tint: 'rgba(234,179,8,0.15)' },
  '6':   { bg: '#f0fdf4', text: '#166534', label: 'Toxic',             tint: 'rgba(156,163,175,0.15)' },
  '7':   { bg: '#fef3c7', text: '#92400e', label: 'Radioactive',       tint: 'rgba(234,179,8,0.12)' },
  '8':   { bg: '#f1f5f9', text: '#334155', label: 'Corrosive',         tint: 'rgba(100,116,139,0.2)' },
  '9':   { bg: '#f8fafc', text: '#475569', label: 'Misc. dangerous',   tint: 'rgba(148,163,184,0.12)' },
};

const ALL_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function getClassStyle(cls: string) {
  const key = cls.split('.')[0];
  return CLASS_COLOURS[key] ?? { bg: '#f1f5f9', text: '#334155', label: `Class ${cls}` };
}

// ─────────────────────────────────────────────────────────────────
//  Pagination bar
// ─────────────────────────────────────────────────────────────────

function PaginationBar({ currentPage, totalPages, setPage }: {
  currentPage: number; totalPages: number; setPage: (fn: (p: number) => number) => void;
}) {
  const base: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", cursor: 'pointer', minWidth: 34, textAlign: 'center',
    border: '1.5px solid var(--border-strong)', background: 'var(--bg, #fff)',
    color: 'var(--text, #1e2535)', transition: 'all 0.1s',
  };
  const active: React.CSSProperties = { ...base, background: '#EF9F27', color: '#1a1a1a', border: '1.5px solid #EF9F27', cursor: 'default' };
  const disabled: React.CSSProperties = { ...base, color: 'var(--text-faint)', cursor: 'not-allowed', background: 'var(--grey-50, #f8f9fb)' };
  const ellipsis = <span key="ell" style={{ fontSize: 13, color: 'var(--text-faint)', padding: '0 2px' }}>&hellip;</span>;

  // Build page numbers: first, last, and 2 around current
  const pages: (number | 'ellipsis')[] = [];
  const add = (n: number) => { if (n >= 0 && n < totalPages && !pages.includes(n)) pages.push(n); };
  add(0);
  for (let i = currentPage - 2; i <= currentPage + 2; i++) add(i);
  add(totalPages - 1);
  pages.sort((a, b) => (a as number) - (b as number));

  // Insert ellipses
  const withGaps: (number | 'ellipsis')[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && (pages[i] as number) - (pages[i - 1] as number) > 1) withGaps.push('ellipsis');
    withGaps.push(pages[i]);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '12px 0', flexWrap: 'wrap' }}>
      <button onClick={() => setPage(() => Math.max(0, currentPage - 1))} disabled={currentPage === 0}
        style={currentPage === 0 ? disabled : base}>&laquo;</button>
      {withGaps.map((item, i) =>
        item === 'ellipsis'
          ? <span key={`e${i}`} style={{ fontSize: 13, color: 'var(--text-faint)', padding: '0 2px' }}>&hellip;</span>
          : <button key={item} onClick={() => setPage(() => item as number)}
              style={item === currentPage ? active : base}>{(item as number) + 1}</button>
      )}
      <button onClick={() => setPage(() => Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}
        style={currentPage >= totalPages - 1 ? disabled : base}>&raquo;</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Entry card (shared by search and browse)
// ─────────────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: AdrEntrySlim }) {
  const cs = getClassStyle(entry.class);
  const variantLabel = entry.variant_count > 1
    ? ` (variant ${entry.variant_index + 1} of ${entry.variant_count})`
    : '';
  return (
    <Link
      key={`${entry.un_number}_${entry.variant_index}`}
      href={`/adr/un/${entry.un_number}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        background: 'var(--bg, #fff)',
        border: '1px solid var(--border-strong)',
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
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <div style={{
          background: 'var(--bg)', color: 'var(--text-secondary)', fontFamily: 'monospace',
          fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
          flexShrink: 0, letterSpacing: 0.5,
        }}>
          UN{entry.un_number}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 14, color: 'var(--text, #1e2535)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {entry.proper_shipping_name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
            {entry.packing_group ? `PG ${entry.packing_group}` : ''}
            {entry.packing_group && variantLabel ? ' · ' : ''}
            {variantLabel && (
              <span style={{ color: '#e87722', fontWeight: 600 }}>
                {variantLabel.trim()}
              </span>
            )}
          </div>
        </div>
        <div style={{
          background: cs.bg, color: cs.text, fontSize: 12, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          Class {entry.class}
        </div>
        <div style={{ color: 'var(--border-strong)', fontSize: 16, flexShrink: 0 }}>&rarr;</div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────

interface Props {
  index: AdrEntrySlim[];
}

const MAX_SEARCH = 60;
const PAGE_SIZE = 50;

export default function AdrSearch({ index }: Props) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'browse'>('search');
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const matched: AdrEntrySlim[] = [];
    for (const entry of index) {
      if (
        entry.un_number.includes(q) ||
        entry.proper_shipping_name.toLowerCase().includes(q)
      ) {
        matched.push(entry);
        if (matched.length >= MAX_SEARCH + 1) break;
      }
    }
    return matched;
  }, [query, index]);

  const searchShown = searchResults.slice(0, MAX_SEARCH);
  const searchHasMore = searchResults.length > MAX_SEARCH;
  const searchEmpty = query.trim().length >= 2 && searchResults.length === 0;

  // Browse data
  const browseData = useMemo(() => {
    if (mode !== 'browse') return [];
    if (classFilter) {
      return index.filter(e => e.class.split('.')[0] === classFilter);
    }
    return index;
  }, [mode, classFilter, index]);

  const browseTotalPages = Math.ceil(browseData.length / PAGE_SIZE);
  const browseCurrentPage = Math.min(page, Math.max(0, browseTotalPages - 1));
  const browsePageItems = browseData.slice(browseCurrentPage * PAGE_SIZE, (browseCurrentPage + 1) * PAGE_SIZE);

  const handleModeChange = (m: 'search' | 'browse') => {
    setMode(m);
    setPage(0);
    setClassFilter(null);
  };

  const handleClassChange = (cls: string | null) => {
    setClassFilter(cls);
    setPage(0);
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
    border: active ? '1.5px solid #EF9F27' : '1.5px solid var(--border-strong)',
    background: active ? '#EF9F27' : 'var(--bg, #fff)',
    color: active ? '#1a1a1a' : 'var(--text-secondary, #5a6478)',
    transition: 'all 0.15s',
  });

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none',
        }}>
          🔍
        </div>
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); if (mode === 'browse') setMode('search'); }}
          placeholder="UN number or substance name — e.g. 1203 or gasoline"
          autoFocus
          aria-label="Search by UN number or substance name"
          style={{
            width: '100%', padding: '14px 16px 14px 46px', fontSize: 16,
            fontFamily: "'Outfit', sans-serif", fontWeight: 500,
            color: 'var(--text, #1e2535)', background: 'var(--bg, #fff)',
            border: '2px solid var(--border-strong)', borderRadius: 10,
            outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#e87722';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,119,34,0.12)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => handleModeChange('search')} style={toggleBtnStyle(mode === 'search')}>
          Search
        </button>
        <button onClick={() => handleModeChange('browse')} style={toggleBtnStyle(mode === 'browse')}>
          Browse all {index.length.toLocaleString()} entries
        </button>
      </div>

      {/* ── SEARCH MODE ── */}
      {mode === 'search' && (
        <>
          {query.trim().length < 2 && (
            <p style={{ color: 'var(--text-faint)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Type at least 2 characters to search {index.length.toLocaleString()} ADR 2025 dangerous goods entries
            </p>
          )}

          {searchEmpty && (
            <div style={{
              background: 'var(--bg, #fff)', border: '1px solid var(--border-strong)',
              borderRadius: 10, padding: '24px', textAlign: 'center',
            }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                No results for <strong>&ldquo;{query}&rdquo;</strong>
              </p>
              <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
                Try a UN number (e.g. 1203) or part of the substance name (e.g. petrol, acid, gas)
              </p>
            </div>
          )}

          {searchShown.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchShown.map(entry => (
                <EntryCard key={`${entry.un_number}_${entry.variant_index}`} entry={entry} />
              ))}
              {searchHasMore && (
                <p style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
                  Showing first {MAX_SEARCH} results &mdash; refine your search to narrow down
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── BROWSE MODE ── */}
      {mode === 'browse' && (
        <>
          {/* Class filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleClassChange(null)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                border: classFilter === null ? '1.5px solid #EF9F27' : '1.5px solid var(--border-strong)',
                background: classFilter === null ? '#EF9F27' : 'var(--bg, #fff)',
                color: classFilter === null ? '#1a1a1a' : 'var(--text-secondary, #5a6478)',
                transition: 'all 0.15s',
              }}
            >
              All classes
            </button>
            {ALL_CLASSES.map(cls => {
              const cs = CLASS_COLOURS[cls];
              const active = classFilter === cls;
              return (
                <button
                  key={cls}
                  onClick={() => handleClassChange(cls)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                    border: active ? `1.5px solid ${cs.text}` : '1.5px solid var(--border-strong)',
                    background: active ? cs.bg : cs.tint,
                    color: active ? cs.text : 'var(--text-secondary, #5a6478)',
                    transition: 'all 0.15s',
                  }}
                >
                  {cls}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 12 }}>
            {browseData.length.toLocaleString()} entries
            {classFilter ? ` in Class ${classFilter}` : ''}
            {browseTotalPages > 1 ? ` — page ${browseCurrentPage + 1} of ${browseTotalPages}` : ''}
          </p>

          {/* Pagination top */}
          {browseTotalPages > 1 && <PaginationBar currentPage={browseCurrentPage} totalPages={browseTotalPages} setPage={setPage} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 600 }}>
            {browsePageItems.map(entry => (
              <EntryCard key={`${entry.un_number}_${entry.variant_index}`} entry={entry} />
            ))}
          </div>

          {/* Pagination bottom */}
          {browseTotalPages > 1 && <PaginationBar currentPage={browseCurrentPage} totalPages={browseTotalPages} setPage={setPage} />}

          {/* Class filter — bottom (mirror of top) */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleClassChange(null)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                border: classFilter === null ? '1.5px solid #EF9F27' : '1.5px solid var(--border-strong)',
                background: classFilter === null ? '#EF9F27' : 'var(--bg, #fff)',
                color: classFilter === null ? '#1a1a1a' : 'var(--text-secondary, #5a6478)',
                transition: 'all 0.15s',
              }}
            >
              All classes
            </button>
            {ALL_CLASSES.map(cls => {
              const cs = CLASS_COLOURS[cls];
              const active = classFilter === cls;
              return (
                <button
                  key={`btm-${cls}`}
                  onClick={() => handleClassChange(cls)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                    border: active ? `1.5px solid ${cs.text}` : '1.5px solid var(--border-strong)',
                    background: active ? cs.bg : cs.tint,
                    color: active ? cs.text : 'var(--text-secondary, #5a6478)',
                    transition: 'all 0.15s',
                  }}
                >
                  {cls}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
