import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Products() {
  return (
    <>
      <Navbar activePage="products" />

      <div className="page-header">
        <h1>The PiyRox Platform</h1>
        <p>Three products. One unified AI ecosystem built for the modern era.</p>
      </div>

      <section id="jarvis" style={{ borderTop: 'none', paddingTop: '0' }}>
        <div className="section-header">
          <h2><span style={{ color: 'var(--accent-blue)' }}>Jarvis OS</span></h2>
          <p>
            Your ambient AI assistant. Always available, securely integrated with your local filesystem,
            and capable of executing complex multi-step workflows directly on your machine. Jarvis OS
            is the first AI that truly lives on your computer — not in a browser tab.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {['Local filesystem access', 'Multi-step workflow execution', 'Voice command support', 'Offline capability', 'System automation', 'Secure sandboxed environment'].map((f) => (
            <div key={f} style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>✓</span> {f}
            </div>
          ))}
        </div>
        <Link href="/download" className="btn btn-primary btn-large">Download Jarvis OS</Link>
      </section>

      <section id="ide" style={{ marginTop: '120px' }}>
        <div className="section-header">
          <h2><span style={{ color: 'var(--accent-purple)' }}>PiyRox IDE</span></h2>
          <p>
            The first IDE built entirely around agentic capabilities. It doesn&apos;t just autocomplete;
            it reads your entire codebase, plans massive architectural features, and writes the code.
            PiyRox IDE is what coding looks like in 2026.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {['Full codebase context (128k tokens)', 'Agentic multi-file editing', 'Architectural planning', 'Automated testing', 'Git integration', 'All languages supported'].map((f) => (
            <div key={f} style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-purple)', marginRight: '8px' }}>✓</span> {f}
            </div>
          ))}
        </div>
        <Link href="/download" className="btn btn-primary btn-large">Download PiyRox IDE</Link>
      </section>

      <section id="chat" style={{ marginTop: '120px' }}>
        <div className="section-header">
          <h2><span style={{ color: 'var(--accent-pink)' }}>PiyRox Chat</span></h2>
          <p>
            The conversational powerhouse. Powered by our proprietary frontier models, optimized for
            deep reasoning, long-context analysis, and creative generation. Access PiyRox Chat from
            any browser, anywhere.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {['PiyRox-4 frontier model', 'Jarvis V3 reasoning model', '200k token context window', 'Code execution sandbox', 'Image & file analysis', 'API access'].map((f) => (
            <div key={f} style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-pink)', marginRight: '8px' }}>✓</span> {f}
            </div>
          ))}
        </div>
        <a href="https://chat.piyrox.sbs" className="btn btn-primary btn-large" target="_blank" rel="noopener noreferrer">
          Open PiyRox Chat
        </a>
      </section>

      <Footer />
    </>
  );
}
