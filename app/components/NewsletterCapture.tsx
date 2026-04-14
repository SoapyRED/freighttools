'use client';

import { useState, useEffect, type FormEvent } from 'react';

const STORAGE_KEY = 'fu_newsletter_subscribed';

export default function NewsletterCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setHidden(true);
    } catch { /* localStorage unavailable — show component */ }
  }, []);

  if (hidden || status === 'success') {
    if (status === 'success') {
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 24px',
          marginTop: 32,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 18, marginRight: 8 }}>&#10003;</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            You&apos;re in! Check your email.
          </span>
        </div>
      );
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      marginTop: 32,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        Stay updated
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
        ADR 2027 changes, new tools, and freight industry updates. No spam, unsubscribe anytime.
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          aria-label="Email address for newsletter"
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: "'Outfit', sans-serif",
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{message}</div>
      )}
    </div>
  );
}
