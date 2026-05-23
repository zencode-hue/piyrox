"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  activePage?: 'products' | 'research' | 'pricing' | 'download' | 'dashboard' | 'about' | 'contact';
}

export default function Navbar({ activePage }: NavbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">PiyRox</Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <Link href="/products" className={activePage === 'products' ? 'active' : ''}>Products</Link>
          <Link href="/research" className={activePage === 'research' ? 'active' : ''}>Research</Link>
          <Link href="/pricing" className={activePage === 'pricing' ? 'active' : ''}>Pricing</Link>
          <Link href="/download" className={activePage === 'download' ? 'active' : ''}>Download</Link>
          <a href="https://chat.piyrox.sbs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>Chat ↗</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary">Dashboard</Link>
              <button className="btn btn-primary" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Log in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button
          className="nav-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
