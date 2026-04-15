import type { ReactNode } from 'react';

type Category = 'ops' | 'dg' | 'customs' | 'ref';

interface PageHeroProps {
  title: string;
  titleAccent?: string;
  subtitle: string;
  badge?: string;
  category?: Category;
  /** Short differentiator phrases shown as a dot-separated strip below the subtitle */
  differentiators?: string[];
  children?: ReactNode;
}

/**
 * Consistent hero/header for all tool pages.
 * White/card background, large title with optional accent word,
 * subtitle, differentiator strip, and optional badge pill.
 * Category prop enables category-coloured badge.
 */
export default function PageHero({ title, titleAccent, subtitle, badge, category, differentiators, children }: PageHeroProps) {
  return (
    <div style={{
      background: 'var(--bg-hero)',
      padding: '40px 20px 48px',
      textAlign: 'center',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 36px)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 12,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
        }}>
          {title}{' '}
          {titleAccent && (
            <span style={{ color: category ? `var(--page-cat, var(--accent))` : 'var(--accent)' }}>
              {titleAccent}
            </span>
          )}
        </h1>
        <p style={{
          fontSize: 16,
          color: 'var(--text-muted)',
          maxWidth: 580,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          {subtitle}
        </p>
        {differentiators && differentiators.length > 0 && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-faint)',
            marginTop: 10,
            letterSpacing: '0.2px',
          }}>
            {differentiators.join(' \u00B7 ')}
          </p>
        )}
        {badge && (
          <div style={{
            display: 'inline-block',
            marginTop: 12,
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            background: category ? 'var(--page-cat, var(--accent))' : 'var(--accent)',
            padding: '3px 10px',
            borderRadius: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {badge}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
