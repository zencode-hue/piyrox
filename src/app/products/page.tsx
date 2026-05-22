
"use client";
import React from 'react';
import Link from 'next/link';

export default function Products() {
  return (
    <>
      
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/products.html" className="active">Products</a>
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

    <div className="product-hero">
      <h1>Three products.<br />One platform.</h1>
      <p>The PiyRox ecosystem brings voice AI, an intelligent code editor, and conversational AI together — built for developers and teams who ship fast.</p>
    </div>

    <div className="product-section" id="jarvis">
      <div className="product-text">
        <h2>🤖 Jarvis OS</h2>
        <p>Jarvis is not a chatbot. It is an ambient intelligence layer that lives on your operating system. It sees your screen, listens for your voice, and acts on your behalf — securely and locally.</p>
        <ul className="feature-bullets">
          <li>Voice-activated natural language commands</li>
          <li>Real-time screen awareness and context reading</li>
          <li>Local filesystem access and task automation</li>
          <li>Multi-step workflow execution</li>
          <li>Desktop overlay UI with pulsating voice orb</li>
          <li>Runs entirely on your machine — no cloud required</li>
        </ul>
        <a href="/download.html" className="btn btn-primary btn-large">Download Jarvis OS</a>
      </div>
      <div className="product-visual">🤖</div>
    </div>

    <hr className="section-divider" />

    <div className="product-section reverse" id="ide">
      <div className="product-text">
        <h2>💻 PiyRox IDE</h2>
        <p>The first IDE built entirely around agentic AI. PiyRox IDE doesn't just autocomplete — it reads your entire codebase, plans architectural changes, and writes production-ready code across multiple files.</p>
        <ul className="feature-bullets">
          <li>Full codebase context awareness (128k+ tokens)</li>
          <li>Multi-file agentic code generation</li>
          <li>Automatic bug detection and fixing</li>
          <li>Integrated terminal with AI command suggestions</li>
          <li>Seamless Jarvis OS integration</li>
          <li>Built-in version control and deployment tools</li>
        </ul>
        <a href="/download.html" className="btn btn-primary btn-large">Download PiyRox IDE</a>
      </div>
      <div className="product-visual">💻</div>
    </div>

    <hr className="section-divider" />

    <div className="product-section" id="chat">
      <div className="product-text">
        <h2>💬 PiyRox Chat</h2>
        <p>Our flagship conversational AI — powered by PiyRox-4, our proprietary frontier model. Optimized for complex reasoning, deep analysis, creative generation, and code writing.</p>
        <ul className="feature-bullets">
          <li>128k token context window for long conversations</li>
          <li>Multi-model selection (PiyRox-4, PiyRox-3.5, Jarvis V3)</li>
          <li>Web browsing and real-time data access</li>
          <li>File upload and data analysis</li>
          <li>Code execution in sandboxed environment</li>
          <li>Available on the web at chat.piyrox.sbs</li>
        </ul>
        <a href="https://chat.piyrox.sbs" className="btn btn-primary btn-large">Launch PiyRox Chat</a>
      </div>
      <div className="product-visual">💬</div>
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
            <a href="/pricing.html">Pricing</a>
            <a href="/about.html">About</a>
            <a href="/contact.html">Contact</a>
          </div>
          <div className="link-column">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  
    </>
  );
}
