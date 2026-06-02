'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Heart, User, ChevronDown, Zap, Globe } from 'lucide-react';

/* ── Currency Context ── */
type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN';
const rates: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550 };
const symbols: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' };

interface CurrencyCtx { currency: Currency; setCurrency: (c: Currency) => void; convert: (usd: number) => string; }
const CurrencyContext = createContext<CurrencyCtx>({ currency: 'USD', setCurrency: () => {}, convert: (v) => `$${v.toFixed(2)}` });
export const useCurrency = () => useContext(CurrencyContext);

function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const convert = (usd: number) => `${symbols[currency]}${(usd * rates[currency]).toFixed(2)}`;
  return <CurrencyContext.Provider value={{ currency, setCurrency, convert }}>{children}</CurrencyContext.Provider>;
}

/* ── Cart Context ── */
export interface CartItem { id: string; name: string; price: number; image: string; quantity: number; variant?: string; }
interface CartCtx { items: CartItem[]; addItem: (item: CartItem) => void; removeItem: (id: string) => void; updateQty: (id: string, qty: number) => void; clearCart: () => void; total: number; count: number; }
const CartContext = createContext<CartCtx>({ items: [], addItem: () => {}, removeItem: () => {}, updateQty: () => {}, clearCart: () => {}, total: 0, count: 0 });
export const useCart = () => useContext(CartContext);

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => { const s = localStorage.getItem('piyrox_cart'); if (s) setItems(JSON.parse(s)); }, []);
  useEffect(() => { localStorage.setItem('piyrox_cart', JSON.stringify(items)); }, [items]);
  const addItem = (item: CartItem) => {
    setItems(prev => { const ex = prev.find(i => i.id === item.id && i.variant === item.variant); if (ex) return prev.map(i => i.id === item.id && i.variant === item.variant ? { ...i, quantity: i.quantity + item.quantity } : i); return [...prev, item]; });
  };
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => setItems(prev => qty < 1 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  const clearCart = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>{children}</CartContext.Provider>;
}

/* ── Navbar ── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: scrolled ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
    transition: 'all 0.3s ease',
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/deals', label: 'Deals' },
    { href: '/blog', label: 'Blog' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #fff, #888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#000" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>PIYROX</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
            <option value="USD" style={{ background: '#111' }}>USD</option>
            <option value="EUR" style={{ background: '#111' }}>EUR</option>
            <option value="GBP" style={{ background: '#111' }}>GBP</option>
            <option value="NGN" style={{ background: '#111' }}>NGN</option>
          </select>
          <Link href="/search" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}>
            <Search size={18} />
          </Link>
          <Link href="/wishlist" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}>
            <Heart size={18} />
          </Link>
          <Link href="/cart" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 8, borderRadius: 8, position: 'relative', transition: 'all 0.2s' }}>
            <ShoppingCart size={18} />
            {count > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
          </Link>
          <Link href="/auth/login" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: '#fff', transition: 'all 0.2s', textDecoration: 'none' }}>
            Sign In
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', color: '#fff', padding: 4 }} className="mobile-menu-btn">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.95)' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '12px 0', color: 'rgba(255,255,255,0.8)', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ── Footer ── */
function Footer() {
  const footerSections = [
    { title: 'Products', links: [{ label: 'All Products', href: '/products' }, { label: 'Deals', href: '/deals' }, { label: 'New Arrivals', href: '/products?sort=newest' }, { label: 'Best Sellers', href: '/products?sort=popular' }] },
    { title: 'Support', links: [{ label: 'Help Center', href: '/support' }, { label: 'Track Order', href: '/track' }, { label: 'FAQ', href: '/support#faq' }, { label: 'Contact Us', href: '/support#contact' }] },
    { title: 'Company', links: [{ label: 'About Us', href: '/about' }, { label: 'Blog', href: '/blog' }, { label: 'Affiliate Program', href: '/affiliate' }, { label: 'Careers', href: '/about#careers' }] },
    { title: 'Legal', links: [{ label: 'Terms of Service', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Refund Policy', href: '/terms#refund' }, { label: 'Cookie Policy', href: '/privacy#cookies' }] },
  ];

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.9)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 50 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #fff, #888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#000" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>PIYROX</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 260 }}>
              The most trusted marketplace for premium digital subscriptions. Instant delivery, unbeatable prices, 24/7 support.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>piyrox.sbs</p>
          </div>
          {footerSections.map(s => (
            <div key={s.title}>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{s.title}</h4>
              {s.links.map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '5px 0', transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2024 PIYROX Market. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Stripe</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Crypto</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Storefront Layout ── */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, paddingTop: 64 }}>
            {children}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </CurrencyProvider>
  );
}
