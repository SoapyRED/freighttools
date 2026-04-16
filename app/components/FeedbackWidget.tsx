'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────

type FeedbackType = 'bug' | 'idea' | 'data' | 'other';
type WidgetState = 'idle' | 'open' | 'submitting' | 'success' | 'error';

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: '🐛 Bug' },
  { value: 'idea', label: '💡 Idea' },
  { value: 'data', label: '📊 Data' },
  { value: 'other', label: '💬 Other' },
];

const DRAFT_KEY = 'feedback-draft';

// ── Component ────────────────────────────────────────────────

export default function FeedbackWidget() {
  const [state, setState] = useState<WidgetState>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<FeedbackType>('other');
  const [errorMsg, setErrorMsg] = useState('');
  const [charCount, setCharCount] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = state !== 'idle';

  // ── Draft persistence ──────────────────────────────────

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const d = JSON.parse(draft);
        if (d.message) { setMessage(d.message); setCharCount(d.message.length); }
        if (d.email) setEmail(d.email);
        if (d.type) setType(d.type);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (state === 'open' && (message || email)) {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ message, email, type })); }
      catch { /* ignore */ }
    }
  }, [message, email, type, state]);

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  // ── Open / Close ───────────────────────────────────────

  const open = useCallback(() => {
    setState('open');
    setErrorMsg('');
    // Focus textarea after render
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const close = useCallback(() => {
    setState('idle');
    setMessage('');
    setEmail('');
    setType('other');
    setCharCount(0);
    setErrorMsg('');
    clearDraft();
    buttonRef.current?.focus();
  }, []);

  // ── Body scroll lock ───────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // ── ESC key ────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // ── Submit ─────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setErrorMsg('Please write at least 10 characters.');
      return;
    }

    setState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          type,
          url: window.location.pathname + window.location.search,
          ua: navigator.userAgent,
          theme: document.documentElement.getAttribute('data-theme') || 'light',
        }),
      });

      if (res.ok) {
        setState('success');
        clearDraft();
        setTimeout(() => {
          setState('idle');
          setMessage('');
          setEmail('');
          setType('other');
          setCharCount(0);
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setState('open');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.');
      setState('open');
    }
  }

  // ── Textarea auto-grow ─────────────────────────────────

  function handleMessageChange(val: string) {
    if (val.length <= 2000) {
      setMessage(val);
      setCharCount(val.length);
    }
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <>
      {/* ── Floating button ── */}
      <button
        ref={buttonRef}
        onClick={isOpen ? close : open}
        aria-label={isOpen ? 'Close feedback' : 'Leave feedback'}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--text-on-orange)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 500,
          transition: 'transform 150ms ease, box-shadow 150ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
      >
        {isOpen ? (
          // X icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ── Mobile responsive style ── */}
      <style>{`
        @media (max-width: 767px) {
          button[aria-label="Leave feedback"],
          button[aria-label="Close feedback"] {
            width: 44px !important;
            height: 44px !important;
            bottom: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>

      {/* ── Modal overlay ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 501,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={e => {
            // Close on overlay click (not modal body)
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-heading"
        >
          <div
            ref={modalRef}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: 480,
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              padding: 24,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Success state ── */}
            {state === 'success' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>&#10003;</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Thanks — we read every one.
                </div>
                <button
                  onClick={close}
                  style={{
                    marginTop: 12,
                    background: 'transparent',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <form onSubmit={handleSubmit}>
                {/* Close X */}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    lineHeight: 1,
                    padding: 4,
                  }}
                >
                  &times;
                </button>

                {/* Heading */}
                <h2
                  id="feedback-heading"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: '0 0 4px',
                  }}
                >
                  What&apos;s on your mind?
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                  Bug, idea, data issue, anything.
                </p>

                {/* Honeypot (hidden from humans) */}
                <div style={{ position: 'absolute', left: -9999, opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                  <label htmlFor="feedback-website">Website</label>
                  <input id="feedback-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {/* Message textarea */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={e => handleMessageChange(e.target.value)}
                  placeholder="Type your feedback here..."
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 12,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    color: 'var(--text)',
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: 8,
                    resize: 'vertical',
                    minHeight: 100,
                    maxHeight: 240,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow-accent)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'right', marginTop: 4, marginBottom: 16 }}>
                  {charCount}/2000
                </div>

                {/* Email (optional) */}
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Email <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: 'var(--text)',
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: 8,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow-accent)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '4px 0 16px' }}>
                  Only if you&apos;d like a reply
                </p>

                {/* Type pills */}
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  What type of feedback?
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        border: type === opt.value ? '1.5px solid var(--accent)' : '1.5px solid var(--border-strong)',
                        background: type === opt.value ? 'var(--accent)' : 'transparent',
                        color: type === opt.value ? 'var(--text-on-orange)' : 'var(--text-muted)',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div style={{
                    background: 'var(--error-tint)',
                    border: '1px solid var(--error-border)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 16,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--error)',
                  }}>
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={state === 'submitting' || message.trim().length < 10}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: state === 'submitting' || message.trim().length < 10 ? 'not-allowed' : 'pointer',
                    border: 'none',
                    background: message.trim().length < 10 ? 'var(--border)' : 'var(--accent)',
                    color: message.trim().length < 10 ? 'var(--text-faint)' : 'var(--text-on-orange)',
                    transition: 'opacity 150ms ease',
                    opacity: state === 'submitting' ? 0.7 : 1,
                  }}
                >
                  {state === 'submitting' ? 'Sending...' : 'Send feedback →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
