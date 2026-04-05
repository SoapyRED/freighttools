'use client';

import { useEffect, useRef } from 'react';
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

// ─── Dropdown component — CSS :hover baseline ───────────────────

function Dropdown({ group, pathname }: {
  group: NavGroup; pathname: string;
}) {
  const hasActive = group.items.some(i => {
    if (pathname === i.href) return true;
    if (i.href === '/adr' && pathname.startsWith('/adr/')) return false;
    return pathname.startsWith(i.href + '/');
  });

  return (
    <div className="nav-dropdown">
      <button
        className="nav-dropdown-trigger"
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
        <svg className="nav-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2, opacity: 0.5 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="nav-dropdown-panel">
        {group.items.map(item => {
          const active = pathname === item.href || (item.href !== '/adr' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-dropdown-item${active ? ' nav-dropdown-item-active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile menu item (closes menu on click via JS enhancement) ──

function MobileLink({ href, active, label, checkboxRef }: {
  href: string; active: boolean; label: string; checkboxRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <Link
      href={href}
      onClick={() => { if (checkboxRef.current) checkboxRef.current.checked = false; }}
      className={`nav-mobile-link${active ? ' nav-mobile-link-active' : ''}`}
    >
      {label}
    </Link>
  );
}

// ─── Main NavLinks component ─────────────────────────────────────

export default function NavLinks() {
  const pathname = usePathname();
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Close mobile menu on route change (JS enhancement)
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.checked = false;
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
      <nav className="nav-desktop" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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

      {/* ── Mobile: CSS-only checkbox toggle pattern ── */}
      {/* Hidden checkbox controls the menu via CSS :checked ~ .nav-mobile */}
      <input
        ref={checkboxRef}
        type="checkbox"
        id="nav-toggle"
        className="nav-toggle-checkbox"
        aria-hidden="true"
      />
      <label htmlFor="nav-toggle" className="nav-hamburger" aria-label="Toggle navigation menu">
        <span className="nav-hamburger-icon"></span>
      </label>

      {/* Mobile menu — ALWAYS in DOM, shown/hidden via CSS :checked */}
      <div className="nav-mobile">
        {nav.map((entry, i) => {
          if (isGroup(entry)) {
            return (
              <div key={i}>
                <div className="nav-mobile-group-label">
                  {entry.label}
                </div>
                {entry.items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <MobileLink
                      key={item.href}
                      href={item.href}
                      active={active}
                      label={item.label}
                      checkboxRef={checkboxRef}
                    />
                  );
                })}
              </div>
            );
          }
          const active = pathname === entry.href || pathname.startsWith(entry.href + '/');
          return (
            <MobileLink
              key={entry.href}
              href={entry.href}
              active={active}
              label={entry.label}
              checkboxRef={checkboxRef}
            />
          );
        })}
      </div>

      <style>{`
        /* ── Desktop dropdown — CSS-only hover baseline ── */
        .nav-dropdown {
          position: relative;
        }

        .nav-dropdown-panel {
          position: absolute;
          top: 100%;
          left: 0;
          background: var(--navy, #1a2332);
          border: 1px solid var(--navy-border, #2e3d55);
          border-radius: 8px;
          padding: 6px 0;
          min-width: 210px;
          z-index: 100;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0s linear 0.15s;
        }

        /* Only show the panel for the DIRECTLY hovered dropdown */
        .nav-dropdown:hover > .nav-dropdown-panel,
        .nav-dropdown:focus-within > .nav-dropdown-panel {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0s linear 0s;
        }

        /* When ANY dropdown in the nav is hovered, immediately hide all OTHER panels */
        .nav-desktop:hover .nav-dropdown:not(:hover) > .nav-dropdown-panel {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.08s ease, transform 0.08s ease, visibility 0s linear 0.08s;
        }

        .nav-dropdown:hover > .nav-dropdown-chevron,
        .nav-dropdown:focus-within > .nav-dropdown-chevron {
          transform: rotate(180deg);
        }

        .nav-dropdown-chevron {
          transition: transform 0.2s ease;
        }

        .nav-dropdown-item {
          display: block;
          padding: 9px 18px;
          /* Fixed light color — dropdown bg is always dark navy in both modes */
          color: #c9cdd6;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          background: transparent;
          transition: background 0.1s, color 0.1s;
        }

        .nav-dropdown-item:hover {
          background: rgba(255,255,255,0.06);
          color: #EF9F27;
        }

        .nav-dropdown-item-active {
          color: #EF9F27 !important;
          font-weight: 600;
          background: rgba(239,159,39,0.08);
        }

        /* ── Mobile hamburger — CSS checkbox toggle (NO JS NEEDED) ── */
        .nav-toggle-checkbox {
          display: none; /* hidden checkbox */
        }

        .nav-hamburger {
          display: none; /* hidden on desktop */
          cursor: pointer;
          padding: 4px 8px;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-hamburger-icon {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text-faint, #8f9ab0);
          position: relative;
          transition: background 0.2s;
        }

        .nav-hamburger-icon::before,
        .nav-hamburger-icon::after {
          content: '';
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text-faint, #8f9ab0);
          position: absolute;
          left: 0;
          transition: transform 0.2s ease;
        }

        .nav-hamburger-icon::before { top: -7px; }
        .nav-hamburger-icon::after { top: 7px; }

        /* Animate hamburger to X when checked */
        .nav-toggle-checkbox:checked ~ .nav-hamburger .nav-hamburger-icon {
          background: transparent;
        }
        .nav-toggle-checkbox:checked ~ .nav-hamburger .nav-hamburger-icon::before {
          transform: rotate(45deg);
          top: 0;
        }
        .nav-toggle-checkbox:checked ~ .nav-hamburger .nav-hamburger-icon::after {
          transform: rotate(-45deg);
          top: 0;
        }

        /* Mobile menu panel — always in DOM, hidden by default */
        .nav-mobile {
          display: none;
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          background: var(--bg, #fff);
          border-bottom: 1px solid var(--border, #d8dce6);
          padding: 8px 16px 12px;
          z-index: 99;
          flex-direction: column;
          gap: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          max-height: calc(100vh - 56px);
          overflow-y: auto;
          transition: opacity 0.2s ease;
        }

        /* CSS :checked shows the mobile menu — works without JS */
        .nav-toggle-checkbox:checked ~ .nav-mobile {
          display: flex;
        }

        .nav-mobile-group-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-faint, #8f9ab0);
          padding: 12px 12px 4px;
        }

        .nav-mobile-link {
          color: var(--text, #1e2535);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border-left: 3px solid transparent;
          display: block;
        }

        .nav-mobile-link:active {
          background: rgba(239,159,39,0.08);
        }

        .nav-mobile-link-active {
          color: var(--accent, #EF9F27) !important;
          font-weight: 700;
          background: rgba(239,159,39,0.08);
          border-left-color: var(--accent, #EF9F27);
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }

        /* On desktop, hide mobile elements completely */
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-mobile { display: none !important; }
          .nav-toggle-checkbox { display: none !important; }
        }
      `}</style>
    </>
  );
}
