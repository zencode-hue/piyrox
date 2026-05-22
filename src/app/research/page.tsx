
"use client";
import React from 'react';
import Link from 'next/link';

export default function Research() {
  return (
    <>
      
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/products.html">Products</a>
          <a href="/research.html" className="active">Research</a>
          <a href="/pricing.html">Pricing</a>
        </div>
        <div className="nav-actions">
          <a href="/login.html" className="btn btn-secondary">Log in</a>
          <a href="/signup.html" className="btn btn-primary">Sign up</a>
        </div>
      </div>
    </nav>

    <div className="page-header">
      <h1>Research at PiyRox</h1>
      <p>Building the foundation for safe, steerable, and highly capable AI systems.</p>
    </div>

    <section id="papers" style={{borderTop: 'none', paddingTop: '0'}}>
      <div className="content-block">
        <div className="content-text">
          <h3>Constitutional AI Alignment</h3>
          <p>Our recent paper details how we use AI to align AI. By providing our models with a constitutional document, we can train them to be helpful and harmless with minimal human intervention.</p>
          <a href="#" className="btn btn-secondary">Read Paper</a>
        </div>
        <div className="content-image">📄</div>
      </div>
      
      <div className="content-block reverse">
        <div className="content-text">
          <h3>Multi-Agent Orchestration</h3>
          <p>Jarvis and our IDE rely heavily on multi-agent architectures. This research explores how subagents can seamlessly delegate tasks to one another while maintaining context and adhering to user constraints.</p>
          <a href="#" className="btn btn-secondary">Read Paper</a>
        </div>
        <div className="content-image">🧠</div>
      </div>
    </section>

    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>PiyRox</h2>
          <p>Advancing artificial intelligence for humanity.</p>
        </div>
      </div>
    </footer>
    <script type="module" src="./main.js"></script>
  
    </>
  );
}
