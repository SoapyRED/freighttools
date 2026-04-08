'use client';

import { useState, useEffect, useRef } from 'react';

const COMMAND = '$ curl "https://www.freightutils.com/api/cbm?l=120&w=80&h=100"';

const RESPONSE = `{
  "total_cbm": 0.96,
  "cubic_feet": 33.9021,
  "litres": 960,
  "pieces": 1
}`;

const CMD_SPEED = 30;
const PAUSE = 600;
const RESP_SPEED = 12;
const RESTART_DELAY = 4000;

// The raw curl command (without $ prefix) for clipboard
const CURL_TEXT = 'curl "https://www.freightutils.com/api/cbm?l=120&w=80&h=100"';

export default function TerminalDemo() {
  const [displayedCmd, setDisplayedCmd] = useState('');
  const [displayedResp, setDisplayedResp] = useState('');
  const [phase, setPhase] = useState<'cmd' | 'pause' | 'resp' | 'done'>('cmd');
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleCopy() {
    navigator.clipboard.writeText(CURL_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedCmd(COMMAND);
      setDisplayedResp(RESPONSE);
      setPhase('done');
      return;
    }

    if (phase === 'cmd') {
      if (displayedCmd.length < COMMAND.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedCmd(COMMAND.slice(0, displayedCmd.length + 1));
        }, CMD_SPEED);
      } else {
        setPhase('pause');
      }
    } else if (phase === 'pause') {
      timeoutRef.current = setTimeout(() => setPhase('resp'), PAUSE);
    } else if (phase === 'resp') {
      if (displayedResp.length < RESPONSE.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedResp(RESPONSE.slice(0, displayedResp.length + 1));
        }, RESP_SPEED);
      } else {
        setPhase('done');
      }
    } else if (phase === 'done') {
      timeoutRef.current = setTimeout(() => {
        setDisplayedCmd('');
        setDisplayedResp('');
        setPhase('cmd');
      }, RESTART_DELAY);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayedCmd, displayedResp, phase]);

  function highlightCmd(text: string) {
    if (!text) return '';
    const parts: string[] = [];
    const dollarEnd = text.indexOf(' ');
    if (dollarEnd > 0) {
      parts.push('<span class="terminal-prompt">' + text.slice(0, dollarEnd) + '</span> ');
      const rest = text.slice(dollarEnd + 1);
      const quoteStart = rest.indexOf('"');
      if (quoteStart >= 0) {
        parts.push(rest.slice(0, quoteStart));
        parts.push('<span class="terminal-url">' + rest.slice(quoteStart) + '</span>');
      } else {
        parts.push(rest);
      }
    } else {
      parts.push(text);
    }
    return parts.join('');
  }

  function highlightJson(text: string) {
    return text
      .replace(/"([^"]+)"(\s*:)/g, '<span class="terminal-json-key">"$1"</span>$2')
      .replace(/:\s*([\d.]+)/g, ': <span class="terminal-json-num">$1</span>');
  }

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="terminal-title">Terminal — FreightUtils API</span>
        <button
          onClick={handleCopy}
          style={{
            marginLeft: 'auto',
            background: copied ? 'rgba(40, 200, 64, 0.15)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: copied ? '#7ee787' : '#6e7681',
            cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="terminal-body">
        <div>
          <span dangerouslySetInnerHTML={{ __html: highlightCmd(displayedCmd) }} />
          {phase === 'cmd' && <span className="terminal-cursor" />}
        </div>
        {displayedResp && (
          <div style={{ marginTop: 8 }}>
            <span dangerouslySetInnerHTML={{ __html: highlightJson(displayedResp) }} />
            {phase === 'resp' && <span className="terminal-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}
