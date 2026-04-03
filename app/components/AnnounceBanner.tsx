'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'fu_dismiss_mcp_banner';

export default function AnnounceBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="announce-banner">
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
