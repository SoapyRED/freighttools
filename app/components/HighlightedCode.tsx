'use client';

import { useState, useMemo } from 'react';

interface Token { text: string; color?: string }

function tokenizeLine(line: string, lang: 'javascript' | 'python'): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // JS comments
    if (lang === 'javascript' && line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: '#6b7280' });
      return tokens;
    }
    // Python comments
    if (lang === 'python' && line[i] === '#') {
      tokens.push({ text: line.slice(i), color: '#6b7280' });
      return tokens;
    }
    // Strings: single, double, or backtick
    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const q = line[i];
      // Check for f-string prefix
      const fPrefix = (lang === 'python' && i > 0 && line[i - 1] === 'f');
      let j = i + 1;
      while (j < line.length && line[j] !== q) {
        if (line[j] === '\\') j++; // skip escaped char
        j++;
      }
      j++; // include closing quote
      const strText = fPrefix ? line.slice(i - 1, j) : line.slice(i, j);
      if (fPrefix && tokens.length > 0) {
        // Remove the trailing 'f' from previous token
        const prev = tokens[tokens.length - 1];
        if (prev.text.endsWith('f')) {
          prev.text = prev.text.slice(0, -1);
          if (prev.text === '') tokens.pop();
        }
      }
      tokens.push({ text: strText, color: '#a5d6a7' });
      i = j;
      continue;
    }
    // Word boundary: keywords, functions, identifiers
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z_0-9.]/.test(line[j])) j++;
      const word = line.slice(i, j);

      const jsKeywords = ['const', 'let', 'var', 'await', 'async', 'function', 'return', 'import', 'from', 'export', 'new'];
      const pyKeywords = ['import', 'from', 'print', 'def', 'return', 'as', 'if', 'else', 'for', 'in', 'with'];
      const jsFuncs = ['fetch', 'console.log', 'JSON.stringify', 'JSON.parse', 'response.json'];
      const pyFuncs = ['requests.get', 'response.json'];

      const keywords = lang === 'javascript' ? jsKeywords : pyKeywords;
      const funcs = lang === 'javascript' ? jsFuncs : pyFuncs;

      if (keywords.includes(word)) {
        tokens.push({ text: word, color: '#ce93d8' });
      } else if (funcs.includes(word)) {
        tokens.push({ text: word, color: '#90caf9' });
      } else {
        tokens.push({ text: word });
      }
      i = j;
      continue;
    }
    // Default: accumulate plain chars
    let j = i;
    while (j < line.length && !/[a-zA-Z_'"` #]/.test(line[j]) && !(lang === 'javascript' && line[j] === '/' && line[j + 1] === '/')) {
      j++;
    }
    if (j === i) j = i + 1; // advance at least 1
    tokens.push({ text: line.slice(i, j) });
    i = j;
  }
  return tokens;
}

function tokenizeN8n(code: string): Token[][] {
  return code.split('\n').map(line => {
    const match = line.match(/^(\w[\w\s]*?):(.*)/);
    if (match) {
      return [
        { text: match[1], color: '#EF9F27' },
        { text: ':' + match[2] },
      ];
    }
    return [{ text: line }];
  });
}

interface Props {
  code: string;
  lang: 'javascript' | 'python' | 'n8n';
  style?: React.CSSProperties;
}

export default function HighlightedCode({ code, lang, style }: Props) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    if (lang === 'n8n') return tokenizeN8n(code);
    return code.split('\n').map(line => tokenizeLine(line, lang));
  }, [code, lang]);

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
      <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {lines.map((lineTokens, li) => (
          <span key={li}>
            {li > 0 && '\n'}
            {lineTokens.map((t, ti) => (
              t.color
                ? <span key={ti} style={{ color: t.color }}>{t.text}</span>
                : <span key={ti}>{t.text}</span>
            ))}
          </span>
        ))}
      </pre>
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
