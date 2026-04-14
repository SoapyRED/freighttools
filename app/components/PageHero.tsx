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
 * Navy background with gradient glow, large title with optional
 * gradient accent word, subtitle, and optional badge pill.
 */
export default function PageHero({ title, titleAccent, subtitle, badge, differentiators, children }: PageHeroProps) {
  return (
    <div style={{
      background: 'var(--navy)',
      padding: '40px 20px 48px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--gradient-hero)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 36px)',
          fontWeight: 800,
          color: '#fff',
          marginBottom: 12,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
        }}>
          {title}{' '}
          {titleAccent && (
            <span style={{
              background: 'linear-gradient(135deg, #EF9F27, #f9913a, #EF9F27)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {titleAccent}
            </span>
          )}
        </h1>
        <p style={{
          fontSize: 16,
          color: 'var(--text-hero)',
          maxWidth: 580,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          {subtitle}
        </p>
        {differentiators && differentiators.length > 0 && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
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
