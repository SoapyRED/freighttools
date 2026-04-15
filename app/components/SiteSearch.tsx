'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Tool quick links
const TOOLS = [
  { name: 'LDM Calculator', href: '/ldm' },
  { name: 'CBM Calculator', href: '/cbm' },
  { name: 'Chargeable Weight', href: '/chargeable-weight' },
  { name: 'Pallet Fitting', href: '/pallet' },
  { name: 'ADR Dangerous Goods', href: '/adr' },
  { name: 'Airline Codes', href: '/airlines' },
  { name: 'INCOTERMS 2020', href: '/incoterms' },
  { name: 'Container Capacity', href: '/containers' },
  { name: 'Unit Converter', href: '/convert' },
  { name: 'HS Code Lookup', href: '/hs' },
  { name: 'API Documentation', href: '/api-docs' },
];

interface SearchResult {
  label: string;
  href: string;
  type: string;
}

export default function SiteSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Tool matches (instant, client-side)
  const toolMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return TOOLS.filter(t => t.name.toLowerCase().includes(q))
      .map(t => ({ label: t.name, href: t.href, type: 'Tool' }));
  }, [query]);

  // API search (debounced)
  useEffect(() => {
    clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 2) { setApiResults([]); return; }

    debounce.current = setTimeout(async () => {
      const results: SearchResult[] = [];

      try {
        // Search HS codes
        const hsRes = await fetch(`/api/hs?q=${encodeURIComponent(q)}`).then(r => r.json());
        if (hsRes.results) {
          for (const r of hsRes.results.slice(0, 3)) {
            const href = r.level === 2 ? `/hs/chapter/${r.hscode}` : r.level === 4 ? `/hs/heading/${r.hscode}` : `/hs/code/${r.hscode}`;
            results.push({ label: `HS ${r.hscode}: ${r.description}`, href, type: 'HS Code' });
          }
        }
      } catch { /* ignore */ }

      try {
        // Search ADR
        const adrRes = await fetch(`/api/adr?search=${encodeURIComponent(q)}`).then(r => r.json());
        if (adrRes.results) {
          for (const r of adrRes.results.slice(0, 3)) {
            results.push({ label: `UN${r.un_number}: ${r.proper_shipping_name}`, href: `/adr/un/${r.un_number}`, type: 'ADR' });
          }
        }
      } catch { /* ignore */ }

      try {
        // Search airlines
        const airRes = await fetch(`/api/airlines?q=${encodeURIComponent(q)}`).then(r => r.json());
        if (airRes.results) {
          for (const r of airRes.results.slice(0, 3)) {
            results.push({ label: `${r.airline_name} (${r.iata_code || r.icao_code || ''})`, href: `/chargeable-weight/${r.slug}`, type: 'Airline' });
          }
        }
      } catch { /* ignore */ }

      setApiResults(results);
    }, 250);

    return () => clearTimeout(debounce.current);
  }, [query]);

  const allResults = [...toolMatches, ...apiResults];
  const showDropdown = open && query.trim().length >= 2 && allResults.length > 0;

  return (
    <div ref={ref} className="site-search" style={{ position: 'relative' }}>
      <input
        type="search"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search tools, HS codes, UN numbers..."
        aria-label="Search tools, HS codes, and UN numbers"
        style={{
          width: 200,
          padding: '6px 12px 6px 30px',
          fontSize: 12,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 500,
          color: 'var(--text-primary)',
          background: 'var(--bg)',
          border: '1px solid var(--border-strong)',
          borderRadius: 6,
          outline: 'none',
          transition: 'border-color 0.15s, width 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus2-placeholder="true"
      />
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        fontSize: 12, color: 'var(--text-faint)', pointerEvents: 'none',
      }}>
        &#128269;
      </span>

      {showDropdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          minWidth: 320,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 0',
          zIndex: 200, boxShadow: 'var(--shadow-card-hover)',
          maxHeight: 400, overflowY: 'auto',
        }}>
          {allResults.map((r, i) => (
            <Link
              key={`${r.href}-${i}`}
              href={r.href}
              onClick={() => { setOpen(false); setQuery(''); }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 14px', textDecoration: 'none', gap: 8,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{
                color: 'var(--text-muted)', fontSize: 13, fontWeight: 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
              }}>
                {r.label}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-faint)',
                background: 'var(--bg-card-hover)', padding: '2px 6px',
                borderRadius: 4, flexShrink: 0, textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {r.type}
              </span>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .site-search input:focus {
          border-color: var(--accent) !important;
          width: 280px !important;
        }
        @media (max-width: 768px) {
          .site-search { display: none; }
        }
      `}</style>
    </div>
  );
}
