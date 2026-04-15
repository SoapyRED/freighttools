import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  titleAccent?: string;
  subtitle: string;
  badge?: string;
  /** Short differentiator phrases shown as a dot-separated strip below the subtitle */
  differentiators?: string[];
  children?: ReactNode;
}

/**
 * Consistent hero/header for all tool pages.
 * White/card background, large title with optional accent word,
 * subtitle, differentiator strip, and optional badge pill.
 */
export default function PageHero({ title, titleAccent, subtitle, badge, differentiators, children }: PageHeroProps) {
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
            <span style={{ color: 'var(--accent)' }}>
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
            color: 'var(--accent)',
            background: 'rgba(239, 159, 39, 0.1)',
            border: '1px solid rgba(239, 159, 39, 0.2)',
            padding: '4px 14px',
            borderRadius: 100,
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
