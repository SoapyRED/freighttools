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

      <a href="/ADR-2025-Quick-Reference-Guide.pdf" target="_blank" rel="noopener noreferrer" style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
        background: '#0f1724', borderRadius: 10, padding: '12px 14px',
        textDecoration: 'none', border: '1px solid #1e2a3d',
        transition: 'border-color 0.15s',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 72, background: '#fff', borderRadius: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)', flexShrink: 0, gap: 3,
          border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#e87722' }} />
          <svg width="18" height="22" viewBox="0 0 20 24" fill="none" style={{ marginTop: 4 }}>
            <path d="M12 0H2C0.9 0 0 0.9 0 2v20c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V8l-8-8z" fill="#e5e7eb"/>
            <path d="M12 0v6c0 1.1 0.9 2 2 2h6L12 0z" fill="#d1d5db"/>
            <rect x="3" y="12" width="10" height="1.2" rx="0.6" fill="#9ca3af"/>
            <rect x="3" y="14.5" width="7" height="1.2" rx="0.6" fill="#9ca3af"/>
            <rect x="3" y="17" width="8" height="1.2" rx="0.6" fill="#9ca3af"/>
          </svg>
          <span style={{ fontSize: 8, fontWeight: 800, color: '#e87722', letterSpacing: '0.5px' }}>PDF</span>
        </div>
        <div>
          <p style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
            ADR 2025 Quick Reference Guide
          </p>
          <p style={{ color: '#6b7280', fontSize: 11, margin: '3px 0 0', lineHeight: 1.3 }}>
            2 pages &middot; PDF &middot; No spam, just this guide
          </p>
          <p style={{ color: '#4b5563', fontSize: 10, margin: '3px 0 0', lineHeight: 1.3 }}>
            For transport planners, warehouse teams, trainers, and DGSA revision.
          </p>
        </div>
      </a>

      {submitted ? (
        <div style={{
          background: '#0d2818', border: '1px solid #166534', borderRadius: 8,
          padding: '14px 18px', textAlign: 'center',
        }}>
          <p style={{ color: '#4ade80', fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>
            Thanks! Download your guide now:
          </p>
          <a
            href="/ADR-2025-Quick-Reference-Guide.pdf"
            download
            style={{
              display: 'inline-block', background: '#e87722', color: '#fff',
              borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', fontFamily: "'Outfit', sans-serif",
            }}
          >
            Download ADR 2025 Quick Reference Guide (PDF)
          </a>
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
            {loading ? 'Sending...' : 'Email me the 1-page ADR update'}
          </button>
        </form>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 4 }}>
        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
          Built from official UNECE ADR 2025 data.
        </p>
        {!submitted && (
          <a
            href="/ADR-2025-Quick-Reference-Guide.pdf"
            download
            style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'none' }}
          >
            Or download directly without signing up &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
