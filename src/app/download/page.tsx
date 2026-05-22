
"use client";
import React from 'react';
import Link from 'next/link';

export default function Download() {
  return (
    <>
      
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/products.html">Products</a>
          <a href="/research.html">Research</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/download.html" className="active">Download</a>
        </div>
        <div className="nav-actions">
          <a href="/login.html" className="btn btn-secondary">Log in</a>
          <a href="/signup.html" className="btn btn-primary">Sign up</a>
        </div>
      </div>
    </nav>

    <div className="download-hero">
      <h1>Download PiyRox</h1>
      <p>Get the desktop applications and start building with agentic AI on your local machine.</p>
    </div>

    <div className="download-grid">
      <div className="download-card">
        <div className="dl-icon">🤖</div>
        <h3>Jarvis Ultimate</h3>
        <div className="dl-version">v2.0.0 · Windows</div>
        <p>The ambient AI assistant that runs locally on your system. Voice commands, screen awareness, and task automation.</p>
        <a href="/downloads/JarvisUltimate.zip" className="dl-btn" download>⬇ Download .exe</a>
        <div className="dl-meta">~85 MB · Requires Windows 10+</div>
      </div>

      <div className="download-card">
        <div className="dl-icon">💻</div>
        <h3>PiyRox IDE</h3>
        <div className="dl-version">v1.0.0 · Windows</div>
        <p>The AI-native code editor with full codebase context, multi-file editing, and agentic code generation.</p>
        <a href="/downloads/PiyRoxIDE.zip" className="dl-btn" download>⬇ Download .exe</a>
        <div className="dl-meta">~120 MB · Requires Windows 10+</div>
      </div>
    </div>

    <div className="sys-req">
      <h3>System Requirements</h3>
      <div className="req-grid">
        <div className="req-item">
          <h4>Operating System</h4>
          <p>Windows 10 or later (64-bit)</p>
        </div>
        <div className="req-item">
          <h4>RAM</h4>
          <p>8 GB minimum, 16 GB recommended</p>
        </div>
        <div className="req-item">
          <h4>Disk Space</h4>
          <p>500 MB free space per application</p>
        </div>
        <div className="req-item">
          <h4>Internet</h4>
          <p>Required for AI model access & updates</p>
        </div>
      </div>
    </div>

    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>PiyRox</h2>
          <p>Advancing artificial intelligence for humanity.</p>
        </div>
        <div className="footer-links">
          <div className="link-column">
            <h4>Products</h4>
            <a href="/products.html#jarvis">Jarvis OS</a>
            <a href="/products.html#ide">PiyRox IDE</a>
            <a href="https://chat.piyrox.sbs">PiyRox Chat</a>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <a href="/research.html">Research</a>
            <a href="/about.html">About</a>
            <a href="/contact.html">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  
    </>
  );
}
