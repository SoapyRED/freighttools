'use client';

import { useState } from 'react';
import type { AdrEntrySlim, AdrCalcEntry } from '@/lib/calculations/adr';
import AdrSearch from './AdrSearch';
import AdrExemptionCalc from '../adr-calculator/AdrExemptionCalc';

interface Props {
  searchIndex: AdrEntrySlim[];
  calcIndex: AdrCalcEntry[];
}

export default function AdrTabs({ searchIndex, calcIndex }: Props) {
  const [tab, setTab] = useState<'lookup' | 'exemption'>('lookup');

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    border: 'none',
    background: active ? '#EF9F27' : 'var(--bg-card, #fff)',
    color: active ? '#1a1a1a' : 'var(--text-secondary, #5a6478)',
    boxShadow: active ? '0 2px 8px rgba(239,159,39,0.2)' : 'none',
    transition: 'background 0.1s, color 0.1s',
  });

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('lookup')} style={btnStyle(tab === 'lookup')}>
          Lookup
        </button>
        <button onClick={() => setTab('exemption')} style={btnStyle(tab === 'exemption')}>
          1.1.3.6 Exemption Calculator
        </button>
      </div>

      {/* Tab content */}
      {tab === 'lookup' && <AdrSearch index={searchIndex} />}
      {tab === 'exemption' && <AdrExemptionCalc index={calcIndex} />}
    </div>
  );
}
