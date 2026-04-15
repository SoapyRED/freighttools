'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface VehicleSpec {
  slug: string;
  name: string;
  category: 'articulated' | 'rigid' | 'van';
  region: 'EU' | 'US' | 'both';
  internalDimensions: { length: number; width: number; height: number };
  doorDimensions: { width: number; height: number } | null;
  maxPayload: number;
  grossVehicleWeight: number;
  euroPallets: number | null;
  ukPallets: number | null;
  usPallets: number | null;
  axleConfig: string;
  features: string[];
  notes: string;
}

interface Props {
  vehicles: VehicleSpec[];
}

const CATEGORY_LABELS: Record<string, string> = {
  articulated: 'Articulated',
  rigid: 'Rigid',
  van: 'Van',
};

const FEATURE_LABELS: Record<string, string> = {
  curtainside: 'Curtainside',
  mega: 'Mega/Jumbo',
  box: 'Box Body',
  refrigerated: 'Refrigerated',
  double_deck: 'Double Deck',
  flatbed: 'Flatbed',
  low_loader: 'Low Loader',
  tail_lift: 'Tail Lift',
};

function formatDimM(mm: number): string {
  return (mm / 1000).toFixed(2);
}

function formatWeight(kg: number): string {
  return kg.toLocaleString() + ' kg';
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    articulated: { bg: 'var(--bg)', color: 'var(--text-secondary)' },
    rigid: { bg: '#e87722', color: '#fff' },
    van: { bg: '#2563eb', color: '#fff' },
  };
  const c = colors[category] || { bg: 'var(--border)', color: 'var(--text)' };
  return (
    <span style={{
      background: c.bg, color: c.color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.3px',
    }}>
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

function RegionBadge({ region }: { region: string }) {
  return (
    <span style={{
      background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
      padding: '3px 8px', borderRadius: 20, border: '1px solid var(--border)',
    }}>
      {region}
    </span>
  );
}

export default function VehicleSearch({ vehicles }: Props) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return vehicles.filter(v => {
      if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
      if (regionFilter !== 'all') {
        if (regionFilter === 'EU' && v.region !== 'EU' && v.region !== 'both') return false;
        if (regionFilter === 'US' && v.region !== 'US' && v.region !== 'both') return false;
      }
      if (ql.length > 0) {
        const haystack = (v.name + ' ' + v.category + ' ' + v.features.join(' ') + ' ' + v.notes).toLowerCase();
        return haystack.includes(ql);
      }
      return true;
    });
  }, [vehicles, query, categoryFilter, regionFilter]);

  const btnBase: React.CSSProperties = {
    padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
    border: '1.5px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text-muted)', transition: 'all 0.15s',
  };
  const btnActive: React.CSSProperties = {
    ...btnBase, border: '1.5px solid #e87722', background: '#e87722', color: '#fff',
  };

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search vehicles — e.g. curtainsider, 7.5t, refrigerated..."
          aria-label="Search vehicle and trailer types"
          style={{
            width: '100%', padding: '14px 16px', fontSize: 16,
            fontFamily: "'Outfit', sans-serif", fontWeight: 500,
            color: 'var(--text)', background: 'var(--bg-card)',
            border: '2px solid var(--border)', borderRadius: 10,
            outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
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

      {/* Category filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type:</span>
        {['all', 'articulated', 'rigid', 'van'].map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            style={categoryFilter === cat ? btnActive : btnBase}>
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Region filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Region:</span>
        {['all', 'EU', 'US'].map(r => (
          <button key={r} onClick={() => setRegionFilter(r)}
            style={regionFilter === r ? btnActive : btnBase}>
            {r === 'all' ? 'All' : r === 'EU' ? 'EU / UK' : 'US'}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 16 }}>
        {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}
        {categoryFilter !== 'all' ? ` in ${CATEGORY_LABELS[categoryFilter]}` : ''}
        {regionFilter !== 'all' ? ` (${regionFilter})` : ''}
      </p>

      {/* No results */}
      {filtered.length === 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
          padding: 24, textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            No vehicles match your search.
          </p>
          <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
            Try a different search term or adjust the filters.
          </p>
        </div>
      )}

      {/* Vehicle cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(v => {
          const isExpanded = expandedSlug === v.slug;
          const dimL = formatDimM(v.internalDimensions.length);
          const dimW = formatDimM(v.internalDimensions.width);
          const dimH = v.internalDimensions.height > 0 ? formatDimM(v.internalDimensions.height) : null;

          // Primary pallet count display
          let palletStr = '';
          if (v.euroPallets !== null) palletStr += `${v.euroPallets} EUR`;
          if (v.ukPallets !== null) palletStr += (palletStr ? ' / ' : '') + `${v.ukPallets} UK`;
          if (v.usPallets !== null) palletStr += (palletStr ? ' / ' : '') + `${v.usPallets} US`;
          if (!palletStr) palletStr = 'N/A';

          return (
            <div key={v.slug} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
              overflow: 'hidden', transition: 'box-shadow 0.15s',
            }}>
              {/* Card header — always visible */}
              <button
                onClick={() => setExpandedSlug(isExpanded ? null : v.slug)}
                style={{
                  width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit', sans-serif",
                  display: 'block',
                }}
              >
                {/* Top row: name + badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{v.name}</span>
                  <CategoryBadge category={v.category} />
                  <RegionBadge region={v.region} />
                  <span style={{
                    marginLeft: 'auto', fontSize: 18, color: 'var(--text-faint)',
                    transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>&#9662;</span>
                </div>

                {/* Summary stats row */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
                  <span>
                    <strong style={{ color: 'var(--text)' }}>
                      {dimL} &times; {dimW}{dimH ? ` \u00d7 ${dimH}` : ''} m
                    </strong>
                  </span>
                  <span>Payload: <strong style={{ color: 'var(--text)' }}>{formatWeight(v.maxPayload)}</strong></span>
                  <span>Pallets: <strong style={{ color: 'var(--text)' }}>{palletStr}</strong></span>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 16, marginTop: 16,
                  }}>
                    {/* Internal Dimensions */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Internal Dimensions</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                        {dimL} &times; {dimW}{dimH ? ` \u00d7 ${dimH}` : ''} m
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {v.internalDimensions.length} &times; {v.internalDimensions.width}
                        {v.internalDimensions.height > 0 ? ` \u00d7 ${v.internalDimensions.height}` : ''} mm
                      </div>
                    </div>

                    {/* Door Dimensions */}
                    {v.doorDimensions && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Door Opening</div>
                        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                          {formatDimM(v.doorDimensions.width)} &times; {formatDimM(v.doorDimensions.height)} m
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                          {v.doorDimensions.width} &times; {v.doorDimensions.height} mm
                        </div>
                      </div>
                    )}

                    {/* Payload */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Max Payload</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{formatWeight(v.maxPayload)}</div>
                    </div>

                    {/* GVW */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Gross Vehicle Weight</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{formatWeight(v.grossVehicleWeight)}</div>
                    </div>

                    {/* Pallet Capacity */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Pallet Capacity</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                        {v.euroPallets !== null && <span>{v.euroPallets} Euro (1200&times;800)</span>}
                        {v.ukPallets !== null && <span style={{ display: 'block' }}>{v.ukPallets} UK (1200&times;1000)</span>}
                        {v.usPallets !== null && <span style={{ display: 'block' }}>{v.usPallets} US (48&times;40in)</span>}
                        {v.euroPallets === null && v.ukPallets === null && v.usPallets === null && (
                          <span style={{ color: 'var(--text-faint)' }}>N/A</span>
                        )}
                      </div>
                    </div>

                    {/* Axle Config */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Axle Configuration</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{v.axleConfig}</div>
                    </div>

                    {/* Features */}
                    {v.features.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Features</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {v.features.map(f => (
                            <span key={f} style={{
                              background: 'var(--bg)', border: '1px solid var(--border)',
                              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                              color: 'var(--text-muted)',
                            }}>
                              {FEATURE_LABELS[f] || f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {v.notes && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 12 }}>
                      {v.notes}
                    </p>
                  )}

                  {/* Cross-link to LDM calculator */}
                  <Link href="/ldm" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 700, color: '#e87722',
                    textDecoration: 'none', marginTop: 4,
                  }}>
                    Calculate loading metres &rarr;
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
