'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function BrandLogo() {
  const [wasSpinning, setWasSpinning] = useState(false);

  const handleMouseEnter = useCallback(() => setWasSpinning(true), []);

  return (
    <Link href="/" className="brand-link" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      textDecoration: 'none', color: 'var(--text-on-dark)', flexShrink: 0,
    }}
      onMouseEnter={handleMouseEnter}
    >
      <div className={`brand-slash${wasSpinning ? ' was-spinning' : ''}`} style={{
        width: 32, height: 32, background: '#EF9F27', borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: '#412402',
      }}>
        /
      </div>
      <span style={{ fontWeight: 700, fontSize: 15 }}>
        <span style={{ color: 'var(--text-faint)' }}>Freight</span><span style={{ color: '#EF9F27' }}>Utils</span>
        <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>.com</span>
      </span>
    </Link>
  );
}
