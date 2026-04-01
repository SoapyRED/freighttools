'use client';

import { useState, FormEvent } from 'react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: '#1a2332', borderRadius: 12, padding: '28px 28px 24px',
      marginTop: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>&#128196;</span>
        <div>
          <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>
            ADR 2025 Quick Reference Guide
          </p>
          <p style={{ color: '#c4cad6', fontSize: 13, margin: '6px 0 0', lineHeight: 1.5 }}>
            Everything that changed in ADR 2025, on one page:
          </p>
        </div>
      </div>

      <ul style={{
        color: '#c4cad6', fontSize: 13, lineHeight: 1.7, margin: '0 0 16px 16px',
        paddingLeft: 16, listStyleType: 'disc',
      }}>
        <li>New UN numbers (sodium-ion batteries, vehicle classes)</li>
        <li>Documentation changes (July 2025 cab requirement)</li>
        <li>LQ training mandate + tunnel code quick reference</li>
      </ul>

      <p style={{ color: '#8f9ab0', fontSize: 12, margin: '0 0 16px', lineHeight: 1.5 }}>
        1-page PDF. Instant delivery. No spam — just this guide.
      </p>

      {submitted ? (
        <div style={{
          background: '#0d2818', border: '1px solid #166534', borderRadius: 8,
          padding: '14px 18px', textAlign: 'center',
        }}>
          <p style={{ color: '#4ade80', fontSize: 14, fontWeight: 600, margin: 0 }}>
            Thanks! We&apos;ll send the guide to your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              padding: '10px 16px', borderRadius: 8, border: '1px solid #374151',
              background: '#0f1724', color: '#fff', fontSize: 14, minWidth: 240,
              outline: 'none', flex: 1,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#e87722', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Get the Guide'}
          </button>
        </form>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>
      )}

      <p style={{ fontSize: 11, color: '#6b7280', marginTop: 10 }}>
        Built from official UNECE ADR 2025 data.
      </p>
    </div>
  );
}
