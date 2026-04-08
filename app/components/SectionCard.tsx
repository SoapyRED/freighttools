import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  variant?: 'default' | 'accent' | 'results';
}

/**
 * Consistent card wrapper for content sections on tool pages.
 * - default: standard card
 * - accent: left orange border accent
 * - results: top orange border accent
 */
export default function SectionCard({ title, children, variant = 'default' }: SectionCardProps) {
  const borderLeft = variant === 'accent' ? '3px solid var(--accent)' : undefined;
  const borderTop = variant === 'results' ? '3px solid var(--accent)' : undefined;

  return (
    <div className="section-card" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 24,
      borderLeft,
      borderTop,
    }}>
      {title && (
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-faint)',
          marginBottom: 16,
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
