import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Download() {
  return (
    <>
      <Navbar activePage="download" />

      <div className="page-header">
        <h1>Download PiyRox</h1>
        <p>Get the desktop apps. Windows support available now. macOS and Linux coming soon.</p>
      </div>

      <section style={{ borderTop: 'none', paddingTop: '0' }}>
        <div className="premium-grid">
          <div className="premium-card" style={{ animationDelay: '0ms' }}>
            <div className="card-icon">🤖</div>
            <h3>Jarvis OS</h3>
            <p>
              Your ambient AI assistant for Windows. Integrates with your filesystem, runs
              multi-step workflows, and is always one keystroke away.
            </p>
            <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Version 2.0.1 · Windows 10/11 · 64-bit
            </div>
            <a
              href="/downloads/JarvisUltimate.zip"
              className="btn btn-primary"
              download
            >
              ⬇ Download EXE (Windows)
            </a>
          </div>

          <div className="premium-card" style={{ animationDelay: '100ms' }}>
            <div className="card-icon">💻</div>
            <h3>PiyRox IDE</h3>
            <p>
              The agentic IDE. Reads your entire codebase, plans architectural changes,
              and writes production-ready code across multiple files.
            </p>
            <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Version 1.4.0 · Windows 10/11 · 64-bit
            </div>
            <a
              href="/downloads/PiyRoxIDE.zip"
              className="btn btn-primary"
              download
            >
              ⬇ Download EXE (Windows)
            </a>
          </div>

          <div className="premium-card" style={{ animationDelay: '200ms' }}>
            <div className="card-icon">💬</div>
            <h3>PiyRox Chat</h3>
            <p>
              No download needed. PiyRox Chat runs entirely in your browser. Access it
              from any device, anywhere in the world.
            </p>
            <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Web App · No installation required
            </div>
            <a
              href="https://chat.piyrox.sbs"
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Browser →
            </a>
          </div>
        </div>

        <div style={{ marginTop: '80px', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>System Requirements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <div><strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>OS</strong>Windows 10 or 11 (64-bit)</div>
            <div><strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>RAM</strong>8 GB minimum, 16 GB recommended</div>
            <div><strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Storage</strong>500 MB free disk space</div>
            <div><strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Internet</strong>Required for AI features</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
