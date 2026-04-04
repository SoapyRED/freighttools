'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Entry {
  code: string;
  country: string;
  locationCode: string;
  name: string;
  nameAscii: string;
  subdivision: string | null;
  functions: string[];
  status: string | null;
  coordinates: { lat: number; lon: number } | null;
  iataCode: string | null;
}

const FUNC_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'port', label: 'Ports' },
  { value: 'airport', label: 'Airports' },
  { value: 'rail', label: 'Rail terminals' },
  { value: 'road', label: 'Road terminals' },
  { value: 'icd', label: 'Inland depots (ICD)' },
  { value: 'border', label: 'Border crossings' },
];

const FUNC_BADGE_COLORS: Record<string, string> = {
  port: '#2563eb', airport: '#7c3aed', rail: '#059669',
  road: '#d97706', icd: '#dc2626', border: '#6b7280',
  postal: '#8b5cf6', pipeline: '#64748b',
};

export default function UnlocodeSearch() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [func, setFunc] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [total, setTotal] = useState(116129);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(async (q: string, c: string, f: string) => {
    if (!q && !c && !f) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (c) params.set('country', c);
      if (f) params.set('function', f);
      params.set('limit', '50');
      const res = await fetch(`/api/unlocode?${params}`);
      const data = await res.json();
      setResults(data.results ?? []);
      if (data.meta?.total_entries) setTotal(data.meta.total_entries);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, country, func), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, country, func, doSearch]);

  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 20,
  };
  const cardHead: React.CSSProperties = {
    background: 'var(--navy)', padding: '12px 18px',
    fontSize: 14, fontWeight: 700, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };
  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', fontSize: 16,
    border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit',
  };

  return (
    <>
      {/* Search controls */}
      <div style={card}>
        <div style={cardHead}>
          <span>Search Locations</span>
          <span style={{ fontSize: 12, fontWeight: 400, color: '#8f9ab0' }}>
            {total.toLocaleString()} locations in database
          </span>
        </div>
        <div style={{ padding: 16 }}>
          <input
            style={inp}
            placeholder="Search by name, code, or IATA code (e.g. Rotterdam, GBLHR, LHR)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4, display: 'block' }}>Country</label>
              <input
                style={{ ...inp, fontSize: 14, padding: '10px 14px' }}
                placeholder="e.g. GB, NL, DE"
                value={country}
                onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4, display: 'block' }}>Function</label>
              <select style={{ ...inp, fontSize: 14, padding: '10px 14px' }} value={func} onChange={e => setFunc(e.target.value)}>
                {FUNC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-faint)' }}>Searching...</div>}

      {!loading && results.length > 0 && !selected && (
        <div style={card}>
          <div style={cardHead}>
            <span>Results</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: '#8f9ab0' }}>{results.length} found</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Code', 'Name', 'Country', 'Functions', 'Coords'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(entry => (
                  <tr
                    key={entry.code}
                    onClick={() => setSelected(entry)}
                    style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,119,34,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#e87722' }}>{entry.code}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{entry.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{entry.country}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {entry.functions.map(f => (
                          <span key={f} style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                            background: FUNC_BADGE_COLORS[f] ?? '#6b7280', color: '#fff',
                            textTransform: 'uppercase', letterSpacing: '0.3px',
                          }}>{f}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-faint)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {entry.coordinates ? `${entry.coordinates.lat}, ${entry.coordinates.lon}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail view */}
      {selected && (
        <div style={card}>
          <div style={cardHead}>
            <span>{selected.code} — {selected.name}</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#8f9ab0', cursor: 'pointer', fontSize: 14 }}>&larr; Back to results</button>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['UN/LOCODE', selected.code],
                ['Country', selected.country],
                ['Location Code', selected.locationCode],
                ['Name', selected.name],
                ['ASCII Name', selected.nameAscii],
                ['Subdivision', selected.subdivision ?? '—'],
                ['IATA Code', selected.iataCode ?? '—'],
                ['Status', selected.status ?? '—'],
                ['Coordinates', selected.coordinates ? `${selected.coordinates.lat}, ${selected.coordinates.lon}` : 'Not available'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>Functions</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selected.functions.length > 0 ? selected.functions.map(f => (
                  <span key={f} style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
                    background: FUNC_BADGE_COLORS[f] ?? '#6b7280', color: '#fff',
                    textTransform: 'uppercase',
                  }}>{f}</span>
                )) : <span style={{ color: 'var(--text-faint)' }}>None specified</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (query || country || func) && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-faint)' }}>
          No locations found. Try a different search term or filter.
        </div>
      )}
    </>
  );
}
