'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/ldm', label: 'LDM' },
  { href: '/cbm', label: 'CBM' },
  { href: '/chargeable-weight', label: 'Ch. Weight' },
  { href: '/pallet', label: 'Pallets' },
  { href: '/adr', label: 'ADR' },
  { href: '/adr-calculator', label: 'ADR Calc' },
  { href: '/airlines', label: 'Airlines' },
  { href: '/incoterms', label: 'INCOTERMS' },
  { href: '/containers', label: 'Containers' },
  { href: '/convert', label: 'Converter' },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/about', label: 'About' },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color: isActive ? '#EF9F27' : 'var(--text-faint)',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    padding: '6px 10px',
    borderRadius: 6,
    whiteSpace: 'nowrap',
    borderBottom: isActive ? '2px solid #EF9F27' : '2px solid transparent',
  });

  return (
    <>
      {/* Desktop nav */}
      <nav className="nav-desktop" style={{ display: 'flex', gap: 2 }}>
        {navLinks.map(l => {
          const isActive = pathname === l.href || pathname.startsWith(l.href + '/');
          return (
            <Link key={l.href} href={l.href} style={linkStyle(isActive)}>
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="nav-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation menu"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--text-faint)',
          fontSize: 24,
          cursor: 'pointer',
          padding: '4px 8px',
          lineHeight: 1,
        }}
      >
        {open ? '\u2715' : '\u2630'}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="nav-mobile"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            background: 'var(--bg, #fff)',
            borderBottom: '1px solid var(--grey-100, #d8dce6)',
            padding: '8px 16px 12px',
            zIndex: 50,
            display: 'none',
            flexDirection: 'column',
            gap: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {navLinks.map(l => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  color: isActive ? '#EF9F27' : 'var(--text, #1e2535)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: isActive ? 'rgba(239,159,39,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #EF9F27' : '3px solid transparent',
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
