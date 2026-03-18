'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot?: string;
  format?: 'horizontal' | 'vertical' | 'auto';
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export default function AdUnit({ slot, format = 'auto' }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded or blocked — fail silently
    }
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      style={{
        marginTop: 40,
        marginBottom: 16,
        padding: '16px 0',
        borderTop: '1px solid var(--border, #d8dce6)',
        borderBottom: '1px solid var(--border, #d8dce6)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'var(--text-faint, #8f9ab0)',
          marginBottom: 8,
        }}
      >
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3441075477232453"
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format === 'auto' ? 'auto' : format === 'horizontal' ? 'horizontal' : 'vertical'}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
