'use client';

import { useState, useEffect } from 'react';
import SegmentedControl from '@/app/components/SegmentedControl';
import type { AdrEntrySlim, AdrCalcEntry } from '@/lib/calculations/adr';
import AdrSearch from './AdrSearch';
import AdrExemptionCalc from '../adr-calculator/AdrExemptionCalc';

interface Props {
  searchIndex: AdrEntrySlim[];
  calcIndex: AdrCalcEntry[];
}

export default function AdrTabs({ searchIndex, calcIndex }: Props) {
  const [tab, setTab] = useState<'lookup' | 'exemption'>('lookup');

  // Read tab from URL on mount (e.g. ?tab=exemption)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'exemption') setTab('exemption');
  }, []);

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ marginBottom: 20 }}>
        <SegmentedControl
          options={[{ label: 'Lookup', value: 'lookup' }, { label: '1.1.3.6 Exemption', value: 'exemption' }]}
          activeValue={tab}
          onChange={(v) => setTab(v as 'lookup' | 'exemption')}
        />
      </div>

      {/* Tab content */}
      {tab === 'lookup' && <AdrSearch index={searchIndex} />}
      {tab === 'exemption' && <AdrExemptionCalc index={calcIndex} />}
    </div>
  );
}
