'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/ldm', label: 'LDM Calc' },
  { href: '/cbm', label: 'CBM Calc' },
  { href: '/adr', label: 'ADR Lookup' },
  { href: '/adr-calculator', label: 'ADR Calc' },
  { href: '/chargeable-weight', label: 'Chargeable Wt' },
  { href: '/pallet', label: 'Pallet Fit' },
  { href: '/airlines', label: 'Airlines' },
  { href: '/incoterms', label: 'INCOTERMS' },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/about', label: 'About' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'flex', gap: 2 }}>
      {navLinks.map(l => {
        const isActive = pathname === l.href || pathname.startsWith(l.href + '/');
        return (
          <Link key={l.href} href={l.href} style={{
            color: isActive ? '#EF9F27' : 'var(--text-faint)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            padding: '6px 10px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            borderBottom: isActive ? '2px solid #EF9F27' : '2px solid transparent',
          }}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
