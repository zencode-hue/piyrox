"use client";
import React, { useEffect, useState } from 'react';

const LINES = [
  { prefix: 'jarvis', color: '#a853ba', text: ' ~ $ initialize --agent=architect' },
  { prefix: '', color: '', text: '' },
  { prefix: '[PiyRox Engine]', color: '#fff', text: ' Analyzing repository structure...' },
  { prefix: '[PiyRox Engine]', color: '#fff', text: ' Context window loaded (128k tokens).' },
  { prefix: '[Jarvis]', color: '#fff', text: ' I have reviewed your codebase. I can see you are building a full-stack platform. Shall I implement the authentication layer and deploy the backend?' },
  { prefix: '', color: '', text: '' },
  { prefix: 'user', color: '#a853ba', text: ' ~ $ yes, use JWT and connect to the Supabase instance.' },
  { prefix: '', color: '', text: '' },
  { prefix: '[Jarvis]', color: '#fff', text: ' Generating implementation plan...' },
];

export default function TerminalMockup() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    const timer = setTimeout(() => {
      setVisibleLines((v) => v + 1);
    }, visibleLines === 0 ? 600 : 280);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  return (
    <div className="mockup-container">
      <div className="mockup-header">
        <div className="mockup-dot" style={{ background: '#ff5f56' }} />
        <div className="mockup-dot" style={{ background: '#ffbd2e' }} />
        <div className="mockup-dot" style={{ background: '#27c93f' }} />
        <span className="mockup-title">jarvis — bash</span>
      </div>
      <div className="mockup-body">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="mockup-line">
            {line.prefix && (
              <span style={{ color: line.color }}>{line.prefix}</span>
            )}
            <span style={{ color: '#a1a1aa' }}>{line.text}</span>
          </div>
        ))}
        {visibleLines < LINES.length && (
          <span className="mockup-cursor" />
        )}
        {visibleLines >= LINES.length && (
          <span className="mockup-cursor" />
        )}
      </div>
    </div>
  );
}
