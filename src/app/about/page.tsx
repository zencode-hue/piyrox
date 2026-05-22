
"use client";
import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <>
      
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

    <div className="page-header">
      <h1>About PiyRox</h1>
      <p>We are a dedicated AI lab focused on bringing frontier intelligence to everyone's local machine safely and securely.</p>
    </div>

    <section style={{borderTop: 'none', paddingTop: '0', maxWidth: '800px'}}>
      <div className="content-text">
        <h3 style={{marginBottom: '24px'}}>Our Mission</h3>
        <p style={{marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '1.125rem'}}>
          PiyRox was founded with a singular vision: to bridge the gap between complex AI models and everyday workflows.
          We believe that artificial intelligence should not just be a chatbot in a browser, but an ambient operating layer
          that assists you proactively.
        </p>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.125rem'}}>
          From our flagship Jarvis OS integration to the PiyRox IDE, we are redefining human-computer interaction
          to be agentic, conversational, and highly context-aware.
        </p>
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
            <a href="/products.html#jarvis">Jarvis</a>
            <a href="/products.html#ide">IDE</a>
            <a href="/products.html#chat">Chat</a>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <a href="/research.html">Research</a>
            <a href="/pricing.html">Pricing</a>
            <a href="/about.html">About</a>
            <a href="/download.html">Download</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 PiyRox AI Lab. All rights reserved.</p>
      </div>
    </footer>
    <script type="module" src="./main.js"></script>
  
    </>
  );
}
