"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setName(''); setEmail(''); setSubject('general'); setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Navbar activePage="contact" />

      <div className="page-header">
        <h1>Get in touch</h1>
        <p>Have questions about our products, billing, or research? We&apos;d love to hear from you.</p>
      </div>

      <section style={{ borderTop: 'none', paddingTop: '0' }}>
        <div className="contact-grid">
          <div>
            {status === 'success' && (
              <div className="success-message" style={{ display: 'block' }}>
                ✓ Your message has been sent. We&apos;ll get back to you within 24 hours.
              </div>
            )}
            {status === 'error' && (
              <div className="error-msg" style={{ display: 'block' }}>
                Failed to send message. Please try again or email us directly.
              </div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contactName">Full Name</label>
                <input type="text" id="contactName" placeholder="Your name" required
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="contactEmail">Email</label>
                <input type="email" id="contactEmail" placeholder="you@example.com" required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="contactSubject">Subject</label>
                <select id="contactSubject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="general">General Inquiry</option>
                  <option value="billing">Billing &amp; Payments</option>
                  <option value="technical">Technical Support</option>
                  <option value="enterprise">Enterprise Sales</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div>
                <label htmlFor="contactMessage">Message</label>
                <textarea id="contactMessage" placeholder="Describe your question or issue..." required
                  value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-large" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="contact-info-cards">
            <div className="info-card">
              <h4>📧 Email Support</h4>
              <p>For all inquiries, reach us directly at<br /><a href="mailto:support@piyrox.sbs">support@piyrox.sbs</a></p>
            </div>
            <div className="info-card">
              <h4>💬 Live Chat</h4>
              <p>Pro and Enterprise users get access to priority live chat support during business hours.</p>
            </div>
            <div className="info-card">
              <h4>📚 Documentation</h4>
              <p>Browse our docs for guides, API references, and tutorials.<br /><a href="https://docs.piyrox.sbs">docs.piyrox.sbs</a></p>
            </div>
            <div className="info-card">
              <h4>🐛 Bug Reports</h4>
              <p>Found a bug? Report it on our public issue tracker.<br /><a href="https://github.com/piyrox">github.com/piyrox</a></p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
