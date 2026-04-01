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
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        transition: 'border-color 0.12s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e87722'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d8dce6'; }}
      >
        <div style={{
          background: '#1a2332', color: '#fff', fontFamily: 'monospace',
          fontSize: 14, fontWeight: 700, padding: '4px 12px', borderRadius: 6, flexShrink: 0,
        }}>
          {code}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2332', flex: 1 }}>
          {description}
        </div>
        {arrow && <div style={{ color: '#d8dce6', fontSize: 16, flexShrink: 0 }}>&rarr;</div>}
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
        background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #d8dce6)', borderRadius: 10,
        padding: '14px 18px', transition: 'border-color 0.12s, box-shadow 0.12s',
        cursor: 'pointer', minHeight: 80, display: 'flex', flexDirection: 'column',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#e87722';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(232,119,34,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #d8dce6)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#e87722', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Section {numeral.toUpperCase()}
        </div>
        <div className="line-clamp-2" style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text, #1a2332)', lineHeight: 1.4,
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
        background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        transition: 'border-color 0.12s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e87722'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d8dce6'; }}
      >
        <div style={{
          background: '#1a2332', color: '#fff', fontFamily: 'monospace',
          fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 6, flexShrink: 0,
        }}>
          {code}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2332', flex: 1 }}>
          {description}
        </div>
        <div style={{ color: '#d8dce6', fontSize: 14, flexShrink: 0 }}>&rarr;</div>
      </div>
    </Link>
  );
}
