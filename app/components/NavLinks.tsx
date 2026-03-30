'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─── Nav structure ───────────────────────────────────────────────

interface NavItem { href: string; label: string }
interface NavGroup { label: string; items: NavItem[] }
type NavEntry = NavItem | NavGroup;

const isGroup = (e: NavEntry): e is NavGroup => 'items' in e;

const nav: NavEntry[] = [
  {
    label: 'Calculators',
    items: [
      { href: '/ldm', label: 'LDM Calculator' },
      { href: '/cbm', label: 'CBM Calculator' },
      { href: '/chargeable-weight', label: 'Chargeable Weight' },
      { href: '/pallet', label: 'Pallet Fitting' },
      { href: '/containers', label: 'Container Capacity' },
      { href: '/convert', label: 'Unit Converter' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { href: '/adr', label: 'ADR Lookup' },
      { href: '/adr-calculator', label: 'ADR Exemption Calc' },
      { href: '/airlines', label: 'Airline Codes' },
      { href: '/incoterms', label: 'INCOTERMS 2020' },
      { href: '/hs', label: 'HS Code Lookup' },
    ],
  },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/about', label: 'About' },
];

// Flat list for mobile + route matching
const allLinks: NavItem[] = nav.flatMap(e => isGroup(e) ? e.items : [e]);

// ─── Dropdown component ──────────────────────────────────────────

function Dropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasActive = group.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'));

  const enter = () => { clearTimeout(timeout.current); setOpen(true); };
  const leave = () => { timeout.current = setTimeout(() => setOpen(false), 120); };

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div ref={ref} onMouseEnter={enter} onMouseLeave={leave} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: hasActive ? '#EF9F27' : 'var(--text-faint)',
          fontSize: 13, fontWeight: hasActive ? 600 : 500,
          padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap',
          borderBottom: hasActive ? '2px solid #EF9F27' : '2px solid transparent',
          fontFamily: "'Outfit', sans-serif",
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {group.label}
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0,
          background: '#1a2332', border: '1px solid #2d3a4d',
          borderRadius: 8, padding: '6px 0', minWidth: 200,
          zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          marginTop: 2,
        }}>
          {group.items.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '8px 16px',
                  color: active ? '#EF9F27' : '#c9cdd6',
                  textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(239,159,39,0.08)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main NavLinks component ─────────────────────────────────────

export default function NavLinks() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const topLinkStyle = (isActive: boolean): React.CSSProperties => ({
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
      <nav className="nav-desktop" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {nav.map((entry, i) => {
          if (isGroup(entry)) {
            return <Dropdown key={i} group={entry} pathname={pathname} />;
          }
          const active = pathname === entry.href || pathname.startsWith(entry.href + '/');
          return (
            <Link key={entry.href} href={entry.href} style={topLinkStyle(active)}>
              {entry.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="nav-hamburger"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle navigation menu"
        style={{
          display: 'none',
          background: 'none', border: 'none',
          color: 'var(--text-faint)', fontSize: 24,
          cursor: 'pointer', padding: '4px 8px', lineHeight: 1,
        }}
      >
        {mobileOpen ? '\u2715' : '\u2630'}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="nav-mobile"
          style={{
            position: 'absolute', top: '100%', right: 0, left: 0,
            background: 'var(--bg, #fff)',
            borderBottom: '1px solid var(--grey-100, #d8dce6)',
            padding: '8px 16px 12px', zIndex: 50,
            display: 'none', flexDirection: 'column', gap: 0,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {nav.map((entry, i) => {
            if (isGroup(entry)) {
              return (
                <div key={i}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: 'var(--text-faint, #8f9ab0)',
                    padding: '12px 12px 4px', marginTop: i > 0 ? 4 : 0,
                  }}>
                    {entry.label}
                  </div>
                  {entry.items.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href} href={item.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          color: active ? '#EF9F27' : 'var(--text, #1e2535)',
                          textDecoration: 'none', fontSize: 14,
                          fontWeight: active ? 700 : 500,
                          padding: '10px 12px', borderRadius: 8,
                          background: active ? 'rgba(239,159,39,0.08)' : 'transparent',
                          borderLeft: active ? '3px solid #EF9F27' : '3px solid transparent',
                          display: 'block',
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              );
            }
            const active = pathname === entry.href || pathname.startsWith(entry.href + '/');
            return (
              <Link
                key={entry.href} href={entry.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: active ? '#EF9F27' : 'var(--text, #1e2535)',
                  textDecoration: 'none', fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  padding: '10px 12px', borderRadius: 8,
                  background: active ? 'rgba(239,159,39,0.08)' : 'transparent',
                  borderLeft: active ? '3px solid #EF9F27' : '3px solid transparent',
                  display: 'block', marginTop: 4,
                }}
              >
                {entry.label}
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
