'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show on API routes (shouldn't render there anyway, but guard)
    if (window.location.pathname.startsWith('/api')) return;
    if (localStorage.getItem(STORAGE_KEY) === 'accepted') return;
    // Small delay so it doesn't compete with initial page load
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'var(--navy, #1a2332)',
      borderTop: '1px solid var(--navy-border, #2e3d55)',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      flexWrap: 'wrap',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.25)',
    }}>
      <p style={{
        fontSize: 13,
        color: 'var(--text-faint, #8f9ab0)',
        margin: 0,
        lineHeight: 1.5,
        maxWidth: 600,
      }}>
        This site uses cookies for analytics and advertising.
        By continuing, you consent to our use of cookies.
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={accept}
          style={{
            background: '#e87722',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Accept All
        </button>
        <Link
          href="/privacy"
          style={{
            color: 'var(--text-faint, #8f9ab0)',
            fontSize: 13,
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
          }}
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
