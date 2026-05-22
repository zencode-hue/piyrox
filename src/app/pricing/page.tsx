
"use client";
import React from 'react';
import Link from 'next/link';

export default function Pricing() {
  return (
    <>
      
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/products.html">Products</a>
          <a href="/research.html">Research</a>
          <a href="/pricing.html" className="active">Pricing</a>
          <a href="/download.html">Download</a>
        </div>
        <div className="nav-actions">
          <a href="/login.html" className="btn btn-secondary">Log in</a>
          <a href="/signup.html" className="btn btn-primary">Sign up</a>
        </div>
      </div>
    </nav>

    <div className="page-header" style={{paddingTop: 'calc(var(--nav-height) + 80px)'}}>
      <h1 style={{fontSize: '3.5rem', background: 'linear-gradient(180deg, #fff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.04em'}}>Simple, transparent pricing</h1>
      <p>Start free. Scale as you grow. No hidden fees.</p>
    </div>

    <section style={{borderTop: 'none', paddingTop: '0'}}>
      <div className="pricing-toggle">
        <span className="active" id="monthlyLabel">Monthly</span>
        <div className="toggle-switch" id="billingToggle" onClick="toggleBilling()"></div>
        <span id="annualLabel">Annual</span>
        <span className="save-badge">Save 20%</span>
      </div>

      <div className="pricing-grid-3">
        <div className="price-card">
          <h3>Starter</h3>
          <div className="price">Free</div>
          <div className="price-desc">For individuals exploring AI.</div>
          <ul className="price-features">
            <li>50 chat messages per day</li>
            <li>Basic model access (PiyRox-3.5)</li>
            <li>Limited IDE completions</li>
            <li>Community support</li>
            <li>1 project workspace</li>
          </ul>
          <a href="/signup.html" className="price-btn price-btn-secondary">Get Started</a>
        </div>

        <div className="price-card featured">
          <h3>Pro</h3>
          <div className="price" id="proPrice">$20<span>/mo</span></div>
          <div className="price-desc">For professionals and daily users.</div>
          <ul className="price-features">
            <li>Unlimited chat messages</li>
            <li>All models (PiyRox-4, Jarvis V3)</li>
            <li>Unlimited IDE agentic coding</li>
            <li>Full Jarvis OS capabilities</li>
            <li>Priority support</li>
            <li>API access (10K calls/mo)</li>
            <li>Unlimited workspaces</li>
            <li>Early access to new features</li>
          </ul>
          <a href="/checkout.html?plan=pro" className="price-btn price-btn-primary">Subscribe Now</a>
        </div>

        <div className="price-card">
          <h3>Enterprise</h3>
          <div className="price">Custom</div>
          <div className="price-desc">For teams and organizations.</div>
          <ul className="price-features">
            <li>Everything in Pro</li>
            <li>Custom model fine-tuning</li>
            <li>SSO & SAML authentication</li>
            <li>Dedicated account manager</li>
            <li>On-premise deployment option</li>
            <li>99.99% SLA guarantee</li>
            <li>Unlimited API calls</li>
            <li>Custom contracts & invoicing</li>
          </ul>
          <a href="/contact.html" className="price-btn price-btn-secondary">Contact Sales</a>
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

    <script>
      let isAnnual = false;
      function toggleBilling() {
        isAnnual = !isAnnual;
        document.getElementById('billingToggle').classList.toggle('annual', isAnnual);
        document.getElementById('monthlyLabel').classList.toggle('active', !isAnnual);
        document.getElementById('annualLabel').classList.toggle('active', isAnnual);
        document.getElementById('proPrice').innerHTML = isAnnual ? '$16<span>/mo</span>' : '$20<span>/mo</span>';
      }
    </script>
  
    </>
  );
}
