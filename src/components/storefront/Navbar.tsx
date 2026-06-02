"use client";

import React from 'react';
import { Home, Package, Star, Activity, FileText, Search, ShoppingCart, User, Menu } from 'lucide-react';
import PiyroxLogo from '../PiyroxLogo';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiyroxLogo size={28} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px' }}>PIYROX</span>
        </Link>
      </div>
      
      <ul className="nav-links" style={{ display: 'none', gap: '2rem' }}>
        <li><Link href="/" className="nav-link"><Home size={16}/> Home</Link></li>
        <li><Link href="/products" className="nav-link"><Package size={16}/> Products</Link></li>
        <li><Link href="/reviews" className="nav-link"><Star size={16}/> Reviews</Link></li>
        <li><Link href="/status" className="nav-link"><Activity size={16}/> Status</Link></li>
        <li><Link href="/blog" className="nav-link"><FileText size={16}/> Blog</Link></li>
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="search-bar" style={{ display: 'none', width: '250px' }}>
          <Search size={16} color="#888" />
          <input type="text" placeholder="Search..." />
        </div>
        <Link href="/cart" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={18} />
        </Link>
        <Link href="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} /> Login
        </Link>
        <button style={{ display: 'flex', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="mobile-menu-btn">
          <Menu size={20} />
        </button>
      </div>
      
      <style>{`
        @media (min-width: 768px) {
          .nav-links { display: flex !important; }
          .search-bar { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
