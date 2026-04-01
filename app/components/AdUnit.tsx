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
      aria-label="Sponsored"
      suppressHydrationWarning
      style={{
        marginTop: 40,
        marginBottom: 16,
        padding: '16px 0',
        minHeight: 0,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3441075477232453"
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format === 'auto' ? 'auto' : format === 'horizontal' ? 'horizontal' : 'vertical'}
        data-full-width-responsive="true"
        suppressHydrationWarning
      />
    </aside>
  );
}
