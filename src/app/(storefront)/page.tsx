'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Users, Star, ArrowRight, Sparkles, ChevronRight, Gift, Headphones, CreditCard, Lock, TrendingUp, Mail } from 'lucide-react';

const featuredProducts = [
  { id: 'spotify-premium', name: 'Spotify Premium', price: 3.99, originalPrice: 9.99, image: '🎵', category: 'Streaming', badge: 'Best Seller' },
  { id: 'netflix-uhd', name: 'Netflix UHD', price: 5.99, originalPrice: 15.49, image: '🎬', category: 'Streaming', badge: 'Popular' },
  { id: 'discord-nitro', name: 'Discord Nitro', price: 4.99, originalPrice: 9.99, image: '💬', category: 'Social', badge: 'Hot' },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 8.99, originalPrice: 20.00, image: '🤖', category: 'AI Tools', badge: 'Trending' },
  { id: 'nordvpn', name: 'NordVPN Premium', price: 2.99, originalPrice: 11.99, image: '🔐', category: 'Security', badge: 'Sale' },
  { id: 'canva-pro', name: 'Canva Pro', price: 4.49, originalPrice: 12.99, image: '🎨', category: 'Design', badge: 'New' },
  { id: 'windows-11', name: 'Windows 11 Pro', price: 12.99, originalPrice: 199.99, image: '🪟', category: 'Software', badge: 'Deal' },
  { id: 'youtube-premium', name: 'YouTube Premium', price: 3.49, originalPrice: 13.99, image: '📺', category: 'Streaming', badge: 'Popular' },
];

const categories = [
  { name: 'Streaming', icon: '🎬', count: 24, color: 'rgba(229,57,53,0.15)' },
  { name: 'Gaming', icon: '🎮', count: 18, color: 'rgba(76,175,80,0.15)' },
  { name: 'Software', icon: '💻', count: 15, color: 'rgba(33,150,243,0.15)' },
  { name: 'Security', icon: '🔐', count: 8, color: 'rgba(255,193,7,0.15)' },
  { name: 'AI Tools', icon: '🤖', count: 12, color: 'rgba(156,39,176,0.15)' },
  { name: 'Social', icon: '💬', count: 6, color: 'rgba(0,188,212,0.15)' },
  { name: 'Design', icon: '🎨', count: 9, color: 'rgba(255,87,34,0.15)' },
  { name: 'Education', icon: '📚', count: 7, color: 'rgba(121,85,72,0.15)' },
];

const stats = [
  { value: '10K+', label: 'Orders Delivered' },
  { value: '1000+', label: 'Happy Customers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function HomePage() {
  const [email, setEmail] = useState('');

  return (
    <div>
      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 20px', marginBottom: 32 }}>
              <Sparkles size={14} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Trusted by 1,000+ customers worldwide</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            Start Winning With<br />
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PIYROX
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Premium digital subscriptions at unbeatable prices. Instant delivery, bank-grade security, and 24/7 customer support.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#000', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, transition: 'all 0.3s', textDecoration: 'none' }}>
              Browse Products <ArrowRight size={16} />
            </Link>
            <Link href="/deals" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: 15, transition: 'all 0.3s', textDecoration: 'none' }}>
              <Gift size={16} /> View Deals
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: <Clock size={14} />, text: 'Instant Delivery' },
              { icon: <Shield size={14} />, text: 'Secure & Undetected' },
              { icon: <Users size={14} />, text: '1000+ Customers' },
              { icon: <Headphones size={14} />, text: '24/7 Support' },
            ].map((pill, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {pill.icon} {pill.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32 }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Featured Products</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Hand-picked premium subscriptions at the best prices</p>
          </div>
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500, textDecoration: 'none' }}>
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {featuredProducts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.3s', cursor: 'pointer', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {p.badge && (
                    <span style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{p.badge}</span>
                  )}
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{p.image}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{p.category}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{p.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800 }}>${p.price.toFixed(2)}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>${p.originalPrice.toFixed(2)}</span>
                    <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 600 }}>-{Math.round((1 - p.price / p.originalPrice) * 100)}%</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Browse Categories</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Find exactly what you need from our curated collections</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {categories.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={`/products?category=${cat.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: cat.color, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 20px', textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{cat.count} products</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Why Choose PIYROX?</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>We go above and beyond to make your experience exceptional</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {[
            { icon: <Clock size={24} />, title: 'Instant Delivery', desc: 'Products delivered to your email within seconds of payment. No waiting, no hassle.' },
            { icon: <Shield size={24} />, title: 'Secure & Private', desc: 'Bank-grade encryption protects your data. We never share your information with third parties.' },
            { icon: <CreditCard size={24} />, title: 'Multiple Payment Methods', desc: 'Pay with Stripe, cryptocurrency, or account balance. Whatever works best for you.' },
            { icon: <Lock size={24} />, title: 'Warranty Included', desc: 'All products come with a replacement warranty. If something goes wrong, we replace it free.' },
            { icon: <Headphones size={24} />, title: '24/7 Live Support', desc: 'Our support team is available around the clock via Discord and email. Average response: 5 minutes.' },
            { icon: <TrendingUp size={24} />, title: 'Best Prices Guaranteed', desc: 'We monitor competitor prices to ensure you always get the best deal on the market.' },
          ].map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'rgba(255,255,255,0.7)' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <Mail size={32} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Stay in the Loop</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Subscribe to get exclusive deals, early access to new products, and insider updates delivered straight to your inbox.</p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 440, margin: '0 auto' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14 }} />
            <button style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, transition: 'all 0.3s', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Community */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '60px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Join Our Community</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, maxWidth: 500, margin: '0 auto 32px' }}>
            Connect with thousands of PIYROX users. Get exclusive deals, support, and be the first to know about new drops.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://discord.gg/piyrox" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(88,101,242,0.2)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da', padding: '12px 28px', borderRadius: 12, fontWeight: 600, fontSize: 14, transition: 'all 0.3s', textDecoration: 'none' }}>
              Join Discord
            </a>
            <a href="https://t.me/piyrox" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,136,204,0.15)', border: '1px solid rgba(0,136,204,0.25)', color: '#0088cc', padding: '12px 28px', borderRadius: 12, fontWeight: 600, fontSize: 14, transition: 'all 0.3s', textDecoration: 'none' }}>
              Telegram Channel
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
