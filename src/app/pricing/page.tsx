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

      <div className="page-header">
        <h1>Simple, transparent pricing</h1>
        <p>Start free. Scale as you grow. No hidden fees.</p>
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
            <Link href="/signup" className="price-btn price-btn-secondary">Get Started</Link>
          </div>

          <div className="price-card featured">
            <h3>Pro</h3>
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
            <Link href="/checkout?plan=pro" className="price-btn price-btn-primary">Subscribe Now</Link>
          </div>

          <div className="price-card">
            <h3>Enterprise</h3>
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
            <Link href="/contact" className="price-btn price-btn-secondary">Contact Sales</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
