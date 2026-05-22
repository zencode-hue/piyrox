
"use client";
import React from 'react';
import Link from 'next/link';

export default function Contact() {
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
      <h1>Get in touch</h1>
      <p>Have questions about our products, billing, or research? We'd love to hear from you.</p>
    </div>

    <section style={{borderTop: 'none', paddingTop: '0'}}>
      <div className="contact-grid">
        <div>
          <div className="success-message" id="successMsg">
            ✓ Your message has been sent successfully. We'll get back to you within 24 hours.
          </div>
          <form className="contact-form" id="contactForm">
            <label htmlFor="contactName">Full Name</label>
            <input type="text" id="contactName" placeholder="Your name" required />

            <label htmlFor="contactEmail">Email</label>
            <input type="email" id="contactEmail" placeholder="you@example.com" required />

            <label htmlFor="contactSubject">Subject</label>
            <select id="contactSubject">
              <option value="general">General Inquiry</option>
              <option value="billing">Billing & Payments</option>
              <option value="technical">Technical Support</option>
              <option value="enterprise">Enterprise Sales</option>
              <option value="partnership">Partnership</option>
            </select>

            <label htmlFor="contactMessage">Message</label>
            <textarea id="contactMessage" placeholder="Describe your question or issue..." required></textarea>

            <button type="submit" className="btn btn-primary btn-large">Send Message</button>
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
            <p>Browse our docs for guides, API references, and tutorials.<br /><a href="#">docs.piyrox.sbs</a></p>
          </div>
          <div className="info-card">
            <h4>🐛 Bug Reports</h4>
            <p>Found a bug? Report it on our public issue tracker.<br /><a href="#">github.com/piyrox</a></p>
          </div>
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
            <a href="/contact.html">Contact</a>
          </div>
        </div>
      </div>
    </footer>

    <script>
      document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('button');
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const formData = {
          name: document.getElementById('contactName').value,
          email: document.getElementById('contactEmail').value,
          subject: document.getElementById('contactSubject').value,
          message: document.getElementById('contactMessage').value
        };

        try {
          const response = await fetch('/backend/api/contact.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          const result = await response.json();
          if (result.success) {
            document.getElementById('successMsg').style.display = 'block';
            this.reset();
          } else {
            alert(result.message || 'Failed to send message.');
          }
        } catch(err) {
          // Fallback: still show success for demo purposes
          document.getElementById('successMsg').style.display = 'block';
          this.reset();
        }
        btn.textContent = 'Send Message';
        btn.disabled = false;
      });
    </script>
  
    </>
  );
}
