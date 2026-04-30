'use client';

import { useState, type FormEvent } from 'react';

type Variant = 'free' | 'pro';

interface Props {
  variant: Variant;
}

const COPY: Record<Variant, {
  endpoint: string;
  body: (email: string) => Record<string, unknown>;
  cta: string;
  filled: boolean;
  successTitle: string;
  successDetail: string;
  trustSignal?: string;
}> = {
  free: {
    endpoint: '/api/keys/register',
    body: (email) => ({ email }),
    cta: 'Get free API key',
    filled: true,
    successTitle: 'Check your inbox',
    successDetail: "Your API key is on its way. It usually arrives within a minute — check spam if it doesn't.",
  },
  pro: {
    endpoint: '/api/auth/login',
    body: (email) => ({ email, intent: 'upgrade' }),
    cta: 'Subscribe — £19/mo',
    filled: false,
    successTitle: 'Check your inbox',
    successDetail: 'Verify your email to continue to secure Stripe checkout.',
    trustSignal: 'Powered by Stripe — secure checkout',
  },
};

export default function PricingSignupForm({ variant }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const copy = COPY[variant];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === 'submitting') return;
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setErrorMsg('Please enter a valid email address.');
      setState('error');
      return;
    }
    setState('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(copy.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy.body(cleaned)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error ?? 'Something went wrong. Please try again.');
        setState('error');
        return;
      }
      setState('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div role="status" style={{
        padding: '14px 16px',
        background: 'var(--success-tint)',
        border: '1px solid var(--success-border)',
        borderRadius: 8,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success-light)', marginBottom: 4 }}>
          {copy.successTitle}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {copy.successDetail}
        </div>
      </div>
    );
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    cursor: state === 'submitting' ? 'wait' : 'pointer',
    transition: 'opacity 0.15s',
    opacity: state === 'submitting' ? 0.6 : 1,
    border: copy.filled ? 'none' : '1px solid var(--border-strong)',
    background: copy.filled ? 'var(--accent)' : 'transparent',
    color: copy.filled ? 'var(--text-on-orange)' : 'var(--text)',
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={`pricing-email-${variant}`} style={{ position: 'absolute', left: -9999 }}>
        Email address
      </label>
      <input
        id={`pricing-email-${variant}`}
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
        disabled={state === 'submitting'}
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: 14,
          fontFamily: 'inherit',
          background: 'var(--bg-input)',
          color: 'var(--text)',
          border: '1px solid var(--border-input)',
          borderRadius: 8,
          marginBottom: 8,
          outline: 'none',
        }}
      />
      <button type="submit" disabled={state === 'submitting'} style={{ ...buttonStyle, width: '100%' }}>
        {state === 'submitting' ? 'Sending…' : copy.cta}
      </button>
      {state === 'error' && errorMsg && (
        <div role="alert" style={{
          fontSize: 12,
          color: 'var(--error-dark)',
          background: 'var(--error-tint)',
          border: '1px solid var(--error)',
          borderRadius: 6,
          padding: '8px 10px',
          marginTop: 8,
          textAlign: 'center',
        }}>
          {errorMsg}
        </div>
      )}
      {copy.trustSignal && state === 'idle' && (
        <div style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', marginTop: 8 }}>
          {copy.trustSignal}
        </div>
      )}
    </form>
  );
}
