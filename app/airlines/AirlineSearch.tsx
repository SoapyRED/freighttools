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
}

interface Props {
  index: AirlineSlim[];
}

const MAX_SHOWN = 100;

export default function AirlineSearch({ index }: Props) {
  const [query, setQuery] = useState('');
  const [cargoOnly, setCargoOnly] = useState(false);

  const cargoAirlines = useMemo(() => {
    return index
      .filter(a => a.has_cargo)
      .sort((a, b) => a.airline_name.localeCompare(b.airline_name));
  }, [index]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = cargoOnly ? cargoAirlines : index;

    if (q.length < 1) {
      return { items: cargoAirlines.slice(0, 50), total: cargoAirlines.length, isFeatured: true };
    }

    const matched: AirlineSlim[] = [];
    for (const a of source) {
      if (
        a.airline_name.toLowerCase().includes(q) ||
        (a.iata_code && a.iata_code.toLowerCase() === q) ||
        (a.icao_code && a.icao_code.toLowerCase() === q) ||
        (a.awb_prefix && a.awb_prefix.some(p => p.includes(q))) ||
        (a.country && a.country.toLowerCase().includes(q))
      ) {
        matched.push(a);
        if (matched.length >= MAX_SHOWN + 1) break;
      }
    }
    return { items: matched.slice(0, MAX_SHOWN), total: matched.length, isFeatured: false };
  }, [query, cargoOnly, index, cargoAirlines]);

  const hasMore = results.total > MAX_SHOWN;
  const isEmpty = query.trim().length >= 1 && results.items.length === 0;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setCargoOnly(false)}
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            border: '2px solid',
            borderColor: !cargoOnly ? '#1a2332' : '#d8dce6',
            background: !cargoOnly ? '#1a2332' : '#fff',
            color: !cargoOnly ? '#fff' : '#5a6478',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          All airlines
        </button>
        <button
          onClick={() => setCargoOnly(true)}
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            border: '2px solid',
            borderColor: cargoOnly ? '#e87722' : '#d8dce6',
            background: cargoOnly ? '#e87722' : '#fff',
            color: cargoOnly ? '#fff' : '#5a6478',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Cargo only
        </button>
      </div>

      {/* Featured heading or result count */}
      {results.isFeatured && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', marginBottom: 4 }}>
            Featured Cargo Airlines
          </h2>
          <p style={{ fontSize: 13, color: '#8f9ab0' }}>
            Showing 50 of {cargoAirlines.length} cargo airlines — search to find any of {index.length.toLocaleString()} airlines
          </p>
        </div>
      )}

      {!results.isFeatured && results.items.length > 0 && (
        <p style={{ fontSize: 13, color: '#8f9ab0', marginBottom: 12 }}>
          Showing {results.items.length}{hasMore ? '+' : ''} of {results.total > MAX_SHOWN ? `${MAX_SHOWN}+` : results.total} results
          {cargoOnly ? ' (cargo airlines only)' : ''}
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

      {/* Results table */}
      {results.items.length > 0 && (
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
              {results.items.map(airline => (
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

      {hasMore && (
        <p style={{ color: '#8f9ab0', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
          Showing first {MAX_SHOWN} results — refine your search to see more
        </p>
      )}
    </div>
  );
}
