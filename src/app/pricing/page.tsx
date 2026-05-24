"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      <Navbar activePage="pricing" />

      <div className="page-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '4.5rem', background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simple, transparent pricing</h1>
        <p style={{ fontSize: '1.4rem' }}>Start free. Scale as you grow. No hidden fees.</p>
      </div>

      <section style={{ borderTop: 'none', paddingTop: '0' }}>
        <div className="pricing-toggle">
          <span className={!isAnnual ? 'active' : ''}>Monthly</span>
          <button
            className={`toggle-switch${isAnnual ? ' annual' : ''}`}
            onClick={() => setIsAnnual((v) => !v)}
            aria-label="Toggle billing period"
          />
          <span className={isAnnual ? 'active' : ''}>Annual</span>
          <span className="save-badge">Save 20%</span>
        </div>

        <div className="pricing-grid-3">
          <div className="price-card" style={{ background: 'rgba(10,10,12,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.4)', borderRadius: '20px' }}>
            <h3 style={{ color: '#aaa' }}>Starter</h3>
            <div className="price">Free</div>
            <div className="price-desc">For individuals exploring AI.</div>
            <ul className="price-features">
              <li>50 chat messages per day</li>
              <li>Basic model access (PiyRox-3.5)</li>
              <li>Limited IDE completions</li>
              <li>Community support</li>
              <li>1 project workspace</li>
            </ul>
            <Link href="https://chat.piyrox.sbs" className="price-btn price-btn-secondary" style={{ borderRadius: '12px' }}>Open Web Chat</Link>
          </div>

          <div className="price-card featured" style={{ background: 'rgba(42,138,246,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(42,138,246,0.5)', boxShadow: '0 0 40px rgba(42,138,246,0.2)', borderRadius: '20px', transform: 'scale(1.05)' }}>
            <h3 style={{ color: 'var(--accent-blue)' }}>Pro</h3>
            <div className="price">
              {isAnnual ? '$16' : '$20'}<span>/mo</span>
            </div>
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
            <Link href="/download" className="price-btn btn-gradient" style={{ borderRadius: '12px', color: '#fff' }}>Download IDE</Link>
          </div>

          <div className="price-card" style={{ background: 'rgba(10,10,12,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.4)', borderRadius: '20px' }}>
            <h3 style={{ color: '#aaa' }}>Enterprise</h3>
            <div className="price">Custom</div>
            <div className="price-desc">For teams and organizations.</div>
            <ul className="price-features">
              <li>Everything in Pro</li>
              <li>Custom model fine-tuning</li>
              <li>SSO &amp; SAML authentication</li>
              <li>Dedicated account manager</li>
              <li>On-premise deployment option</li>
              <li>99.99% SLA guarantee</li>
              <li>Unlimited API calls</li>
              <li>Custom contracts &amp; invoicing</li>
            </ul>
            <Link href="/contact" className="price-btn price-btn-secondary" style={{ borderRadius: '12px' }}>Contact Sales</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
