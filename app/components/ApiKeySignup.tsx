'use client';

import { useState, type FormEvent } from 'react';

export default function ApiKeySignup() {
  const [email, setEmail] = useState('');
  const [useCase, setUseCase] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/keys/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...(useCase ? { use_case: useCase } : {}) }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'API key sent to your email.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div id="signup" style={{
        background: 'rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: 12,
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>&#10003;</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Check your inbox
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {message}
        </div>
      </div>
    );
  }

  return (
    <div id="signup" className="section-card" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--accent)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--accent)', marginBottom: 8,
      }}>
        Free API Key
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        Get 100 requests/day — no credit card required
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Enter your email and we&apos;ll send you an API key instantly.
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            style={{
              flex: 1,
              minWidth: 240,
              padding: '10px 16px',
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
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? 'Sending...' : 'Get API Key'}
        </button>
        </div>
        <input
          type="text"
          value={useCase}
          onChange={e => setUseCase(e.target.value)}
          placeholder="What are you building? (optional) e.g. TMS integration, freight quoting tool..."
          maxLength={200}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 8,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            outline: 'none',
          }}
        />
      </form>

      {status === 'error' && (
        <div style={{ fontSize: 13, color: '#ef4444', marginTop: 8 }}>{message}</div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 10 }}>
        Anonymous: 25/day &middot; Free key: 100/day &middot; Pro: 50,000/month
      </div>
    </div>
  );
}
