'use client';

import { useState } from 'react';
import { SITE_STATS } from '@/lib/constants/siteStats';

interface Props {
  email: string;
  plan: 'free' | 'pro';
  apiKey: string;
  usageToday: number;
  usageMonth: number;
  limit: number;
}

export default function DashboardClient({ email, plan, apiKey, usageToday, usageMonth, limit }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const maskedKey = apiKey.slice(0, 10) + '••••••••••••••' + apiKey.slice(-4);

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setUpgrading(false);
    }
  };

  const handleManage = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const s = {
    page: { maxWidth: 700, margin: '40px auto', padding: '0 20px', fontFamily: 'Outfit, system-ui, sans-serif' } as const,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 } as const,
    h1: { fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 } as const,
    logoutBtn: { background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: '#6b7280' } as const,
    card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as const,
    label: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 8 } as const,
    badge: (color: string) => ({
      display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12,
      fontWeight: 700, background: color === 'pro' ? '#e87722' : '#e5e7eb',
      color: color === 'pro' ? '#fff' : '#374151',
    }),
    keyBox: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 } as const,
    keyText: { fontFamily: 'monospace', fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', flex: 1, wordBreak: 'break-all' as const } as const,
    btn: (bg: string) => ({ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: bg, border: 'none', borderRadius: 6, cursor: 'pointer' }),
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 12 } as const,
    stat: { textAlign: 'center' as const } as const,
    statNum: { fontSize: 28, fontWeight: 700, color: 'var(--text)' } as const,
    statLabel: { fontSize: 12, color: 'var(--text-faint)', marginTop: 4 } as const,
    bar: { height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 16, overflow: 'hidden' as const } as const,
  };

  const dailyLimit = plan === 'pro' ? 'unlimited' : limit;
  const usagePct = plan === 'pro'
    ? Math.min(100, (usageMonth / limit) * 100)
    : Math.min(100, (usageToday / limit) * 100);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Dashboard</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>{email}</p>
        </div>
        <button onClick={handleLogout} style={s.logoutBtn}>Sign out</button>
      </div>

      {/* Plan */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={s.label}>Current Plan</div>
            <span style={s.badge(plan)}>{plan === 'pro' ? 'Pro' : 'Free'}</span>
            <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 12 }}>
              {plan === 'pro'
                ? `${SITE_STATS.proMonthlyLimit.toLocaleString()} requests/month`
                : `${SITE_STATS.freeKeyDailyLimit} requests/day`}
            </span>
          </div>
          {plan === 'free' ? (
            <button onClick={handleUpgrade} disabled={upgrading} style={s.btn('#e87722')}>
              {upgrading ? 'Loading...' : 'Upgrade to Pro — \u00a319/mo'}
            </button>
          ) : (
            <button onClick={handleManage} style={s.btn('#374151')}>Manage Subscription</button>
          )}
        </div>
      </div>

      {/* API Key */}
      <div style={s.card}>
        <div style={s.label}>API Key</div>
        <div style={s.keyBox}>
          <code style={s.keyText}>{revealed ? apiKey : maskedKey}</code>
          <button onClick={() => setRevealed(!revealed)} style={s.btn('#374151')}>
            {revealed ? 'Hide' : 'Reveal'}
          </button>
          <button onClick={copyKey} style={s.btn('var(--bg-code)')}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>
          Use as <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>Authorization: Bearer {'{'}your_key{'}'}</code> or <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>?api_key={'{'}your_key{'}'}</code>
        </p>
      </div>

      {/* Usage */}
      <div style={s.card}>
        <div style={s.label}>Usage</div>
        <div style={s.statsGrid}>
          <div style={s.stat}>
            <div style={s.statNum}>{usageToday.toLocaleString()}</div>
            <div style={s.statLabel}>Today</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{usageMonth.toLocaleString()}</div>
            <div style={s.statLabel}>This Month</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{plan === 'pro' ? SITE_STATS.proMonthlyLimit.toLocaleString() : SITE_STATS.freeKeyDailyLimit.toLocaleString()}</div>
            <div style={s.statLabel}>{plan === 'pro' ? 'Monthly Limit' : 'Daily Limit'}</div>
          </div>
        </div>
        <div style={s.bar}>
          <div style={{ height: '100%', width: '100%', transformOrigin: 'left', transform: `scaleX(${usagePct / 100})`, background: usagePct > 80 ? 'var(--error)' : 'var(--accent)', borderRadius: 4, transition: 'transform 0.3s' }} />
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'right' }}>
          {plan === 'pro'
            ? `${usageMonth.toLocaleString()} / ${SITE_STATS.proMonthlyLimit.toLocaleString()} this month`
            : `${usageToday} / ${dailyLimit} today`}
        </p>
      </div>

      {/* Quick Start */}
      <div style={s.card}>
        <div style={s.label}>Quick Start</div>
        <pre style={{ background: 'var(--bg-code)', color: 'var(--text-muted)', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto', margin: 0 }}>
{`curl "https://www.freightutils.com/api/ldm?pallet=euro&qty=12" \\
  -H "Authorization: Bearer ${apiKey.slice(0, 10)}..."`}
        </pre>
      </div>
    </div>
  );
}
