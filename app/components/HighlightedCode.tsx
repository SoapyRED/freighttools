'use client';

import { useState } from 'react';

function highlightCode(code: string, lang: 'javascript' | 'python' | 'n8n'): string {
  if (lang === 'n8n') {
    // Field labels in amber, rest default
    return code.replace(
      /^(\w[\w\s]*?):/gm,
      '<span style="color:#EF9F27;font-weight:600">$1</span>:'
    );
  }

  let html = code
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  if (lang === 'javascript') {
    html = html
      // Comments
      .replace(/(\/\/.*$)/gm, '<span style="color:#6b7280">$1</span>')
      // Strings (single/double/backtick)
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#a5d6a7">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#a5d6a7">$1</span>')
      .replace(/(`.+?`)/gs, '<span style="color:#a5d6a7">$1</span>')
      // Keywords
      .replace(/\b(const|let|var|await|async|function|return|import|from|export|new)\b/g,
        '<span style="color:#ce93d8">$1</span>')
      // Function calls
      .replace(/\b(fetch|console\.log|JSON\.stringify|JSON\.parse|response\.json)\b/g,
        '<span style="color:#90caf9">$1</span>');
  }

  if (lang === 'python') {
    html = html
      // Comments
      .replace(/(#.*$)/gm, '<span style="color:#6b7280">$1</span>')
      // f-strings and regular strings
      .replace(/(f?"(?:[^"\\]|\\.)*")/g, '<span style="color:#a5d6a7">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#a5d6a7">$1</span>')
      // Keywords
      .replace(/\b(import|from|print|def|return|as|if|else|for|in|with)\b/g,
        '<span style="color:#ce93d8">$1</span>')
      // Function calls
      .replace(/\b(requests\.get|response\.json)\b/g,
        '<span style="color:#90caf9">$1</span>');
  }

  return html;
}

interface Props {
  code: string;
  lang: 'javascript' | 'python' | 'n8n';
  style?: React.CSSProperties;
}

export default function HighlightedCode({ code, lang, style }: Props) {
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
      <div dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }} />
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
