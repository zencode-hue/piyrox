
"use client";
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      
    <div className="ambient-light"></div>
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/products.html">Products</a>
          <a href="/research.html">Research</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/download.html">Download</a>
        </div>
        <div className="nav-actions">
          <a href="/login.html" className="btn btn-secondary">Log in</a>
          <a href="/signup.html" className="btn btn-primary">Sign up</a>
        </div>
      </div>
    </nav>

    <header className="hero">
      <div className="hero-badge">PiyRox OS 2.0 is now available</div>
      <div className="hero-content">
        <h1>Intelligence engineered<br />for the modern era.</h1>
        <p>We build agentic environments. From the world's first AI-native operating system to IDEs that write their own code, PiyRox is the ultimate platform for creators.</p>
        <div className="hero-buttons">
          <a href="/download.html" className="btn btn-primary btn-large">Download PiyRox OS</a>
          <a href="/products.html" className="btn btn-secondary btn-large">Explore Platform</a>
        </div>
      </div>
    </header>

    <div className="mockup-container">
      <div className="mockup-header">
        <div className="mockup-dot" style={{background: '#ff5f56'}}></div>
        <div className="mockup-dot" style={{background: '#ffbd2e'}}></div>
        <div className="mockup-dot" style={{background: '#27c93f'}}></div>
      </div>
      <div className="mockup-body">
        <span style={{color: '#a853ba'}}>jarvis</span> <span style={{color: '#2a8af6'}}>~</span> $ initialize --agent=architect<br /><br />
        <span className="mockup-text-highlight">[PiyRox Engine]</span> Analyzing repository structure...<br />
        <span className="mockup-text-highlight">[PiyRox Engine]</span> Context window loaded (128k tokens).<br />
        <span className="mockup-text-highlight">[Jarvis]</span> I have reviewed your codebase. I can see you are building a full-stack platform. Shall I implement the authentication layer and deploy the backend?<br /><br />
        <span style={{color: '#a853ba'}}>user</span> <span style={{color: '#2a8af6'}}>~</span> $ yes, use JWT and connect to the SQLite instance.<br /><br />
        <span className="mockup-text-highlight">[Jarvis]</span> Generating implementation plan...<span className="mockup-cursor"></span>
      </div>
    </div>

    <section id="features">
      <div className="section-header">
        <h2>A cohesive AI ecosystem.</h2>
        <p>We rejected the concept of fragmented chatbots. PiyRox is a unified platform designed to integrate intelligence directly into the core of your digital workflow.</p>
      </div>
      <div className="premium-grid">
        <div className="premium-card">
          <div className="card-icon">🤖</div>
          <h3>Jarvis OS</h3>
          <p>Your ambient AI assistant. Always available, securely integrated with your local filesystem, and capable of executing complex multi-step workflows directly on your machine.</p>
          <a href="/download.html" className="btn btn-secondary">Download EXE</a>
        </div>
        <div className="premium-card">
          <div className="card-icon">💻</div>
          <h3>PiyRox IDE</h3>
          <p>The first IDE built entirely around agentic capabilities. It doesn't just autocomplete; it reads your entire codebase, plans massive architectural features, and writes the code.</p>
          <a href="/download.html" className="btn btn-secondary">Download EXE</a>
        </div>
        <div className="premium-card">
          <div className="card-icon">💬</div>
          <h3>PiyRox Chat</h3>
          <p>The conversational powerhouse. Powered by our proprietary frontier models, optimized for deep reasoning, long-context analysis, and creative generation.</p>
          <a href="/products.html#chat" className="btn btn-secondary">Learn more</a>
        </div>
      </div>
    </section>

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
            <a href="/products.html#chat">PiyRox Chat</a>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <a href="/research.html">Research</a>
            <a href="/pricing.html">Pricing</a>
            <a href="/about.html">About</a>
            <a href="/download.html">Download</a>
          </div>
          <div className="link-column">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 PiyRox AI Lab. All rights reserved.</p>
      </div>
    </footer>
    <script>
      // Add subtle mouse tracking for premium cards
      document.querySelectorAll('.premium-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });
    </script>
  
    </>
  );
}
