'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { HsSlimEntry } from '@/lib/calculations/hs';

// ─── Level badge styles ──────────────────────────────────────────

const LEVEL_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  2: { bg: '#dbeafe', text: '#1e40af', label: 'Chapter' },
  4: { bg: '#fef3c7', text: '#92400e', label: 'Heading' },
  6: { bg: '#f0fdf4', text: '#166534', label: 'Subheading' },
};

function levelBadge(level: number) {
  const s = LEVEL_STYLES[level] ?? { bg: '#f1f5f9', text: '#334155', label: 'Code' };
  return s;
}

function codeUrl(code: string, level: number): string {
  if (level === 2) return `/hs/chapter/${code}`;
  if (level === 4) return `/hs/heading/${code}`;
  return `/hs/code/${code}`;
}

function formatCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4, 6)}`;
  if (code.length === 4) return `${code.slice(0, 2)}.${code.slice(2, 4)}`;
  return code;
}

// ─── Pagination ──────────────────────────────────────────────────

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

  const pages: (number | 'ellipsis')[] = [];
  const add = (n: number) => { if (n >= 0 && n < totalPages && !pages.includes(n)) pages.push(n); };
  add(0);
  for (let i = currentPage - 2; i <= currentPage + 2; i++) add(i);
  add(totalPages - 1);
  pages.sort((a, b) => (a as number) - (b as number));

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

// ─── Entry card ──────────────────────────────────────────────────

function EntryCard({ entry }: { entry: HsSlimEntry }) {
  const badge = levelBadge(entry.level);
  return (
    <Link href={codeUrl(entry.hscode, entry.level)} style={{ textDecoration: 'none' }}>
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
          background: '#1a2332', color: '#fff', fontFamily: 'monospace',
          fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
          flexShrink: 0, letterSpacing: 0.5,
        }}>
          {formatCode(entry.hscode)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 14, color: 'var(--text, #1e2535)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {entry.description}
          </div>
        </div>
        <div style={{
          background: badge.bg, color: badge.text, fontSize: 12, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {badge.label}
        </div>
        <div style={{ color: 'var(--border-strong)', fontSize: 16, flexShrink: 0 }}>&rarr;</div>
      </div>
    </Link>
  );
}

// ─── Main component ──────────────────────────────────────────────

interface Props {
  index: HsSlimEntry[];
}

const MAX_SEARCH = 60;
const PAGE_SIZE = 50;

export default function HsSearch({ index }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const matched: HsSlimEntry[] = [];
    for (const entry of index) {
      if (
        entry.hscode.includes(q) ||
        entry.description.toLowerCase().includes(q)
      ) {
        matched.push(entry);
        if (matched.length >= MAX_SEARCH + 1) break;
      }
    }
    return matched;
  }, [query, index]);

  const shown = results.slice(0, MAX_SEARCH);
  const hasMore = results.length > MAX_SEARCH;
  const isEmpty = query.trim().length >= 2 && results.length === 0;

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none',
        }}>
          &#128269;
        </div>
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
          placeholder="Search by product description or HS code — e.g. coffee, 0901, steel"
          autoFocus
          aria-label="Search HS codes by product description"
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

      {query.trim().length < 2 && (
        <p style={{ color: 'var(--text-faint)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
          Type at least 2 characters to search {index.length.toLocaleString()} HS codes
        </p>
      )}

      {isEmpty && (
        <div style={{
          background: 'var(--bg, #fff)', border: '1px solid var(--border-strong)',
          borderRadius: 10, padding: '24px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            No results for <strong>&ldquo;{query}&rdquo;</strong>
          </p>
          <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
            Try a product description (e.g. coffee, steel, cotton) or an HS code (e.g. 0901, 72)
          </p>
        </div>
      )}

      {shown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map(entry => (
            <EntryCard key={entry.hscode} entry={entry} />
          ))}
          {hasMore && (
            <p style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
              Showing first {MAX_SEARCH} results &mdash; refine your search to narrow down
            </p>
          )}
        </div>
      )}
    </div>
  );
}
