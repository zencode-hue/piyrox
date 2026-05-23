import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>PiyRox</h2>
          <p>Advancing artificial intelligence for humanity.</p>
        </div>
        <div className="footer-links">
          <div className="link-column">
            <h4>Products</h4>
            <Link href="/products#jarvis">Jarvis OS</Link>
            <Link href="/products#ide">PiyRox IDE</Link>
            <a href="https://chat.piyrox.sbs" target="_blank" rel="noopener noreferrer">PiyRox Chat</a>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <Link href="/research">Research</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/download">Download</Link>
          </div>
          <div className="link-column">
            <h4>Support</h4>
            <Link href="/contact">Contact</Link>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PiyRox AI Lab. All rights reserved.</p>
      </div>
    </footer>
  );
}
