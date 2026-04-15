'use client';

import Link from 'next/link';

interface Props {
  href: string;
  code: string;
  description: string;
  arrow?: boolean;
}

export default function HsLinkCard({ href, code, description, arrow = true }: Props) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--page-cat, var(--cat-customs))';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border)';
          el.style.transform = 'none';
          el.style.boxShadow = 'none';
        }}
      >
        <div style={{
          background: 'var(--cat-customs-tint)', color: 'var(--cat-customs)', fontFamily: 'monospace',
          fontSize: 14, fontWeight: 700, padding: '4px 12px', borderRadius: 6, flexShrink: 0,
        }}>
          {code}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {description}
        </div>
        {arrow && <div style={{ color: 'var(--text-faint)', fontSize: 16, flexShrink: 0 }}>&rarr;</div>}
      </div>
    </Link>
  );
}

interface SectionCardProps {
  href: string;
  numeral: string;
  name: string;
}

export function HsSectionCard({ href, numeral, name }: SectionCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '14px 18px', transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
        cursor: 'pointer', minHeight: 80, display: 'flex', flexDirection: 'column',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--page-cat, var(--cat-customs))';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border)';
          el.style.transform = 'none';
          el.style.boxShadow = 'none';
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cat-customs)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Section {numeral.toUpperCase()}
        </div>
        <div className="line-clamp-2" style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4,
        }}>
          {name}
        </div>
      </div>
    </Link>
  );
}

interface SmallCardProps {
  href: string;
  code: string;
  description: string;
}

export function HsSmallCard({ href, code, description }: SmallCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--page-cat, var(--cat-customs))';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border)';
          el.style.transform = 'none';
          el.style.boxShadow = 'none';
        }}
      >
        <div style={{
          background: 'var(--cat-customs-tint)', color: 'var(--cat-customs)', fontFamily: 'monospace',
          fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 6, flexShrink: 0,
        }}>
          {code}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {description}
        </div>
        <div style={{ color: 'var(--text-faint)', fontSize: 14, flexShrink: 0 }}>&rarr;</div>
      </div>
    </Link>
  );
}
