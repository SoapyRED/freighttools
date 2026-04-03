'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'fu_dismiss_mcp_banner';

export default function AnnounceBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [scrolledDown, setScrolledDown] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    setDismissed(false);

    const onScroll = () => setScrolledDown(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      className="announce-banner"
      style={{
        transform: scrolledDown ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      <span>
        NEW: FreightUtils MCP Server — give your AI agent freight superpowers{' '}
        <Link href="/api-docs#mcp">Learn more &rarr;</Link>
      </span>
      <button className="announce-banner-close" onClick={dismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
