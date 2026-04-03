'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }

      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { maxWidth: 460, margin: '80px auto', padding: '0 20px', fontFamily: 'Outfit, system-ui, sans-serif' } as const,
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as const,
    h1: { fontSize: 24, fontWeight: 700, color: '#1a2332', margin: '0 0 8px' } as const,
    sub: { fontSize: 15, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 } as const,
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 } as const,
    input: { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const } as const,
    btn: { width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#fff', background: '#e87722', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 16 } as const,
    error: { color: '#dc2626', fontSize: 14, marginTop: 12 } as const,
    success: { textAlign: 'center' as const, padding: '40px 0' } as const,
    checkmark: { fontSize: 48, marginBottom: 16 } as const,
  };

  if (sent) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, ...s.success }}>
          <div style={s.checkmark}>&#9993;</div>
          <h1 style={{ ...s.h1, marginBottom: 12 }}>Check your email</h1>
          <p style={s.sub}>
            We sent a magic link to <strong>{email}</strong>.<br />
            Click it to sign in to your dashboard.
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            Link expires in 15 minutes. Check spam if you don't see it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.h1}>Sign in to FreightUtils</h1>
        <p style={s.sub}>
          Get your free API key (200 requests/day) or manage your Pro subscription.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            style={s.input}
          />
          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
          {error && <p style={s.error}>{error}</p>}
        </form>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 20, textAlign: 'center' }}>
          No password needed. We'll email you a one-time sign-in link.
        </p>
      </div>
    </div>
  );
}
