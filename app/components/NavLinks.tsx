'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
      { href: '/consignment-calculator', label: 'Consignment Calculator' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { href: '/adr', label: 'ADR Dangerous Goods' },
      { href: '/airlines', label: 'Airline Codes' },
      { href: '/incoterms', label: 'INCOTERMS 2020' },
      { href: '/hs', label: 'HS Code Lookup' },
      { href: '/duty', label: 'UK Import Duty & VAT' },
      { href: '/unlocode', label: 'UN/LOCODE Lookup' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { href: '/adr/changes-2025', label: 'ADR 2025 Changes' },
      { href: '/adr/tunnel-codes', label: 'ADR Tunnel Codes' },
      { href: '/adr/limited-quantities', label: 'ADR Limited Quantities' },
      { href: '/adr/training-guide', label: 'ADR Training Guide' },
    ],
  },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/about', label: 'About' },
];

// ─── Dropdown component (single-container hover) ────────────────

function Dropdown({ group, pathname, openGroup, setOpenGroup }: {
  group: NavGroup; pathname: string; openGroup: string | null; setOpenGroup: (g: string | null) => void;
}) {
  const isOpen = openGroup === group.label;
  const hasActive = group.items.some(i => {
    if (pathname === i.href) return true;
    // For /adr in Reference, don't match /adr/* guide pages (those belong to Guides)
    if (i.href === '/adr' && pathname.startsWith('/adr/')) return false;
    return pathname.startsWith(i.href + '/');
  });

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpenGroup(group.label)}
      onMouseLeave={() => setOpenGroup(null)}
    >
      <button
        onClick={() => setOpenGroup(isOpen ? null : group.label)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: hasActive ? '#EF9F27' : 'var(--text-faint)',
          fontSize: 13, fontWeight: hasActive ? 600 : 500,
          padding: '6px 10px 12px', borderRadius: 6, whiteSpace: 'nowrap',
          borderBottom: hasActive ? '2px solid #EF9F27' : '2px solid transparent',
          fontFamily: "'Outfit', sans-serif",
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {group.label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2, opacity: 0.5, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div style={{
        position: 'absolute', top: '100%', left: 0,
        background: '#1a2332', border: '1px solid var(--navy-border)',
        borderRadius: 8, padding: '6px 0', minWidth: 210,
        zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}>
        {group.items.map(item => {
          const active = pathname === item.href || (item.href !== '/adr' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpenGroup(null)}
              style={{
                display: 'block', padding: '9px 18px',
                color: active ? '#EF9F27' : '#c9cdd6',
                textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? 'rgba(239,159,39,0.08)' : 'transparent',
                transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                if (!active) (e.currentTarget as HTMLElement).style.color = '#EF9F27';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                if (!active) (e.currentTarget as HTMLElement).style.color = '#c9cdd6';
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main NavLinks component ─────────────────────────────────────

export default function NavLinks() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(e.target as Node)) {
      setOpenGroup(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  // Close on route change
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

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
      <nav ref={navRef} className="nav-desktop" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {nav.map((entry, i) => {
          if (isGroup(entry)) {
            return <Dropdown key={i} group={entry} pathname={pathname} openGroup={openGroup} setOpenGroup={setOpenGroup} />;
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

      {/* Mobile dropdown — fixed to viewport so it spans full width */}
      {mobileOpen && (
        <div
          className="nav-mobile"
          style={{
            position: 'fixed', top: 56, left: 0, right: 0,
            background: 'var(--bg, #fff)',
            borderBottom: '1px solid var(--grey-100, #d8dce6)',
            padding: '8px 16px 12px', zIndex: 99,
            display: 'none', flexDirection: 'column', gap: 0,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 'calc(100vh - 56px)', overflowY: 'auto',
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
