'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface AirlineSlim {
  slug: string;
  airline_name: string;
  iata_code: string | null;
  icao_code: string | null;
  awb_prefix: string[] | null;
  country: string | null;
  has_cargo: boolean;
  aliases?: string[];
}

interface Props {
  index: AirlineSlim[];
}

const PAGE_SIZE = 50;

function PaginationBar({ currentPage, totalPages, setPage }: {
  currentPage: number; totalPages: number; setPage: (fn: (p: number) => number) => void;
}) {
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1.5px solid var(--grey-100, #d8dce6)',
    background: disabled ? 'var(--grey-50, #f8f9fb)' : 'var(--bg, #fff)',
    color: disabled ? '#8f9ab0' : 'var(--text, #1e2535)',
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 0' }}>
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} style={btnStyle(currentPage === 0)}>
        &larr; Previous
      </button>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #5a6478)' }}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} style={btnStyle(currentPage >= totalPages - 1)}>
        Next &rarr;
      </button>
    </div>
  );
}

export default function AirlineSearch({ index }: Props) {
  const [query, setQuery] = useState('');
  const [cargoOnly, setCargoOnly] = useState(false);
  const [page, setPage] = useState(0);

  const cargoAirlines = useMemo(() => {
    return index
      .filter(a => a.has_cargo)
      .sort((a, b) => a.airline_name.localeCompare(b.airline_name));
  }, [index]);

  const allSorted = useMemo(() => {
    return [...index].sort((a, b) => a.airline_name.localeCompare(b.airline_name));
  }, [index]);

  // Reset page when query or filter changes
  const handleQueryChange = (val: string) => { setQuery(val); setPage(0); };
  const handleCargoToggle = (val: boolean) => { setCargoOnly(val); setPage(0); };

  const filtered = useMemo(() => {
    const q = query.trim();
    const ql = q.toLowerCase();
    const source = cargoOnly ? cargoAirlines : allSorted;

    if (q.length < 1) {
      return { items: source, isSearch: false };
    }

    const isShortNumeric = /^\d{2,3}$/.test(q);
    const isShortAlpha = /^[A-Za-z]{2,3}$/.test(q);
    const qu = q.toUpperCase();

    const matched: AirlineSlim[] = [];
    for (const a of source) {
      let match = false;

      if (isShortNumeric) {
        match = (a.awb_prefix !== null && a.awb_prefix.includes(q)) ||
                (a.iata_code !== null && a.iata_code === q);
      } else if (isShortAlpha) {
        match = (a.iata_code !== null && a.iata_code === qu) ||
                (a.icao_code !== null && a.icao_code === qu);
      } else {
        match = a.airline_name.toLowerCase().includes(ql) ||
                (a.aliases && a.aliases.some(al => al.toLowerCase().includes(ql))) ||
                (a.iata_code !== null && a.iata_code.toLowerCase() === ql) ||
                (a.icao_code !== null && a.icao_code.toLowerCase() === ql) ||
                (a.awb_prefix !== null && a.awb_prefix.includes(q)) ||
                (a.country !== null && a.country.toLowerCase().includes(ql));
      }

      if (match) matched.push(a);
    }
    return { items: matched, isSearch: true };
  }, [query, cargoOnly, allSorted, cargoAirlines]);

  const totalItems = filtered.items.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const pageItems = filtered.items.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const isEmpty = query.trim().length >= 1 && totalItems === 0;

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: '#8f9ab0', fontSize: 18, pointerEvents: 'none',
        }}>
          {'\u{1F50D}'}
        </div>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, code, or AWB prefix — e.g. Emirates, EK, or 176"
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

      {/* Toggle: All airlines / Cargo only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {[
          { label: 'All airlines', val: false },
          { label: 'Cargo only', val: true },
        ].map(opt => {
          const active = cargoOnly === opt.val;
          return (
            <button
              key={opt.label}
              onClick={() => { setCargoOnly(opt.val); setPage(p => 0); }}
              style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                border: active ? '1.5px solid #EF9F27' : '1.5px solid var(--grey-100, #d8dce6)',
                background: active ? '#EF9F27' : 'var(--bg, #fff)',
                color: active ? '#1a1a1a' : 'var(--text-secondary, #5a6478)',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Missing airline prompt */}
      <p style={{ fontSize: 12, color: '#8f9ab0', marginBottom: 16, textAlign: 'center' }}>
        Can&apos;t find an airline?{' '}
        <a href="mailto:contact@freightutils.com" style={{ color: '#EF9F27', textDecoration: 'underline' }}>
          Email contact@freightutils.com
        </a>{' '}
        and we&apos;ll add it.
      </p>

      {/* Heading / result count */}
      {!filtered.isSearch && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', marginBottom: 4 }}>
            {cargoOnly ? 'Cargo Airlines' : 'All Airlines'}
          </h2>
          <p style={{ fontSize: 13, color: '#8f9ab0' }}>
            {totalItems.toLocaleString()} {cargoOnly ? 'cargo ' : ''}airlines — page {currentPage + 1} of {totalPages}
          </p>
        </div>
      )}

      {filtered.isSearch && totalItems > 0 && (
        <p style={{ fontSize: 13, color: '#8f9ab0', marginBottom: 12 }}>
          {totalItems.toLocaleString()} result{totalItems !== 1 ? 's' : ''}
          {cargoOnly ? ' (cargo airlines only)' : ''}
          {totalPages > 1 ? ` — page ${currentPage + 1} of ${totalPages}` : ''}
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
            {cargoOnly ? ' in cargo airlines' : ''}
          </p>
          <p style={{ color: '#8f9ab0', fontSize: 13 }}>
            Try an airline name (e.g. Emirates), IATA code (EK), ICAO code (UAE), or AWB prefix (176)
          </p>
        </div>
      )}

      {/* Pagination — top */}
      {totalPages > 1 && pageItems.length > 0 && <PaginationBar currentPage={currentPage} totalPages={totalPages} setPage={setPage} />}

      {/* Results table */}
      {pageItems.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1a2332', color: '#fff' }}>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Airline</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>IATA</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>ICAO</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>AWB Prefix</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Country</th>
                <th style={{ padding: '11px 16px', textAlign: 'center', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(airline => (
                <tr key={airline.slug} style={{ borderBottom: '1px solid #eef0f4' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600 }}>
                    {airline.has_cargo ? (
                      <Link
                        href={`/airlines/${airline.slug}`}
                        className="airline-name-link"
                        style={{ textDecoration: 'none' }}
                      >
                        {airline.airline_name}
                      </Link>
                    ) : (
                      <span>{airline.airline_name}</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    {airline.iata_code ? (
                      <span style={{
                        background: '#1a2332',
                        color: '#fff',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 5,
                        letterSpacing: 0.5,
                      }}>
                        {airline.iata_code}
                      </span>
                    ) : (
                      <span style={{ color: '#c4c9d4' }}>&mdash;</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 13 }}>
                    {airline.icao_code || <span style={{ color: '#c4c9d4' }}>&mdash;</span>}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    {airline.awb_prefix && airline.awb_prefix.length > 0 ? (
                      <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {airline.awb_prefix.map(p => (
                          <span key={p} style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 5,
                          }}>
                            {p}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span style={{ color: '#c4c9d4' }}>&mdash;</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13 }}>
                    {airline.country || <span style={{ color: '#c4c9d4' }}>&mdash;</span>}
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                    {airline.has_cargo ? (
                      <span style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 20,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                      }}>
                        Cargo
                      </span>
                    ) : (
                      <span style={{ color: '#c4c9d4', fontSize: 12 }}>Pax</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination — bottom */}
      {totalPages > 1 && pageItems.length > 0 && <PaginationBar currentPage={currentPage} totalPages={totalPages} setPage={setPage} />}
    </div>
  );
}
