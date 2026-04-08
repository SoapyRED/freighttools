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

export default function TerminalDemo() {
  const [displayedCmd, setDisplayedCmd] = useState('');
  const [displayedResp, setDisplayedResp] = useState('');
  const [phase, setPhase] = useState<'cmd' | 'pause' | 'resp' | 'done'>('cmd');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
