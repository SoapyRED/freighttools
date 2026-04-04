'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COMMON_CODES = [
  { code: '0901', desc: 'Coffee', dg: false },
  { code: '2710', desc: 'Petroleum oils', dg: true },
  { code: '3604', desc: 'Fireworks', dg: true },
  { code: '8507', desc: 'Electric accumulators (batteries)', dg: true },
  { code: '8471', desc: 'Computers/laptops', dg: false },
  { code: '8517', desc: 'Telephones/smartphones', dg: false },
  { code: '8528', desc: 'Monitors/TVs', dg: false },
  { code: '6110', desc: 'Knitted garments', dg: false },
  { code: '9403', desc: 'Furniture', dg: false },
  { code: '8703', desc: 'Motor vehicles', dg: false },
  { code: '7308', desc: 'Steel structures', dg: false },
  { code: '2204', desc: 'Wine', dg: false },
];

export default function CommonHsCodes() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: '1px solid var(--border)', borderRadius: 10,
          padding: '12px 16px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', flex: 1, textAlign: 'left' }}>
          Common freight HS codes
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          &#9660;
        </span>
      </button>

      {open && (
        <div style={{ overflowX: 'auto', borderRadius: '0 0 10px 10px', border: '1px solid var(--border)', borderTop: 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fc' }}>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>Code</th>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>Description</th>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.3px' }}></th>
              </tr>
            </thead>
            <tbody>
              {COMMON_CODES.map(({ code, desc, dg }) => (
                <tr key={code} style={{ borderBottom: '1px solid #eef0f4' }}>
                  <td style={{ padding: '8px 14px' }}>
                    <Link href={`/hs?code=${code}`} style={{ color: '#e87722', fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none' }}>
                      {code}
                    </Link>
                  </td>
                  <td style={{ padding: '8px 14px', color: 'var(--text)' }}>
                    {desc}
                    {dg && (
                      <Link href="/adr" className="dg-badge">
                        DG
                      </Link>
                    )}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <Link href={`/hs?code=${code}`} style={{ color: 'var(--text-faint)', fontSize: 12, textDecoration: 'none' }}>
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
