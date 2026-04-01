'use client';

import { useState } from 'react';

export default function CopyableCode({ code, style }: { code: string; style?: React.CSSProperties }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="code-block" style={{ position: 'relative', ...style }}>
      {code}
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute', top: 8, right: 8,
          background: copied ? '#166534' : '#374151',
          color: copied ? '#4ade80' : '#d1d5db',
          border: 'none', borderRadius: 4,
          padding: '3px 10px', fontSize: 11, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          transition: 'all 0.15s',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
