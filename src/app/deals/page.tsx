'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Flame, Star, Percent, Zap } from 'lucide-react';

const flashDeals = [
  { id: 'spotify-premium', name: 'Spotify Premium', price: 2.49, originalPrice: 9.99, image: '🎵', discount: 75, endsIn: '2h 34m' },
  { id: 'netflix-uhd', name: 'Netflix UHD', price: 3.99, originalPrice: 15.49, image: '🎬', discount: 74, endsIn: '5h 12m' },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 5.99, originalPrice: 20.00, image: '🤖', discount: 70, endsIn: '1h 45m' },
  { id: 'adobe-cc', name: 'Adobe CC', price: 9.99, originalPrice: 54.99, image: '🎯', discount: 82, endsIn: '3h 20m' },
];

const weeklyDeals = [
  { id: 'nordvpn', name: 'NordVPN Premium', price: 1.49, originalPrice: 11.99, image: '🔐', discount: 88 },
  { id: 'canva-pro', name: 'Canva Pro', price: 2.99, originalPrice: 12.99, image: '🎨', discount: 77 },
  { id: 'youtube-premium', name: 'YouTube Premium', price: 1.99, originalPrice: 13.99, image: '📺', discount: 86 },
  { id: 'discord-nitro', name: 'Discord Nitro', price: 2.99, originalPrice: 9.99, image: '💬', discount: 70 },
  { id: 'windows-11', name: 'Windows 11 Pro', price: 8.99, originalPrice: 199.99, image: '🪟', discount: 96 },
  { id: 'gamepass-ultimate', name: 'Xbox Game Pass', price: 4.49, originalPrice: 16.99, image: '🎮', discount: 74 },
  { id: 'midjourney', name: 'Midjourney Pro', price: 6.99, originalPrice: 30.00, image: '🖼️', discount: 77 },
  { id: 'masterclass', name: 'MasterClass', price: 7.99, originalPrice: 120.00, image: '🌟', discount: 93 },
];

const bundleDeals = [
  { name: 'Streaming Bundle', products: ['Netflix UHD', 'Spotify Premium', 'YouTube Premium', 'Disney+'], price: 12.99, originalPrice: 53.46, image: '📺🎵', discount: 76 },
  { name: 'Productivity Suite', products: ['Microsoft 365', 'Adobe CC', 'Canva Pro', 'Notion AI'], price: 24.99, originalPrice: 112.97, image: '💻📎', discount: 78 },
  { name: 'Security Pack', products: ['NordVPN', 'Malwarebytes', 'Kaspersky', 'Surfshark'], price: 9.99, originalPrice: 119.92, image: '🔐🛡️', discount: 92 },
];

export default function DealsPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,87,34,0.1)', border: '1px solid rgba(255,87,34,0.2)', borderRadius: 100, padding: '8px 20px', marginBottom: 20 }}>
          <Flame size={14} color="#ff5722" />
          <span style={{ fontSize: 13, color: '#ff5722', fontWeight: 600 }}>Hot Deals</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>Today&apos;s Best Deals</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Save up to 96% on premium digital subscriptions. Limited time offers refreshed daily.</p>
      </div>

      {/* Flash Deals */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Zap size={20} color="#ff9100" />
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Flash Deals</h2>
          <span style={{ fontSize: 12, color: '#ff9100', background: 'rgba(255,145,0,0.1)', padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>Limited Time</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {flashDeals.map((deal, i) => (
            <motion.div key={deal.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link href={`/products/${deal.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(255,87,34,0.06), rgba(255,145,0,0.04))', border: '1px solid rgba(255,87,34,0.15)', borderRadius: 16, padding: 24, transition: 'all 0.3s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,87,34,0.15)', padding: '4px 10px', borderRadius: 6 }}>
                    <Clock size={12} color="#ff9100" />
                    <span style={{ fontSize: 11, color: '#ff9100', fontWeight: 600 }}>{deal.endsIn}</span>
                  </div>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>{deal.image}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{deal.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 800 }}>${deal.price.toFixed(2)}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>${deal.originalPrice.toFixed(2)}</span>
                    <span style={{ fontSize: 13, color: '#ff5722', fontWeight: 700 }}>-{deal.discount}%</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Deals */}
      <div style={{ marginBottom: 60 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Weekly Deals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {weeklyDeals.map((deal, i) => (
            <motion.div key={deal.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
              <Link href={`/products/${deal.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                    <span style={{ fontSize: 42 }}>{deal.image}</span>
                    <span style={{ background: '#4caf50', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>-{deal.discount}%</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{deal.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>${deal.price.toFixed(2)}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>${deal.originalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bundle Deals */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Bundle Deals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {bundleDeals.map((bundle, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{bundle.name}</h3>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{bundle.products.length} products included</span>
                  </div>
                  <span style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Save {bundle.discount}%</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  {bundle.products.map((p, j) => (
                    <div key={j} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} /> {p}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 28, fontWeight: 800 }}>${bundle.price.toFixed(2)}</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>${bundle.originalPrice.toFixed(2)}</span>
                </div>
                <button style={{ width: '100%', background: '#fff', color: '#000', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s' }}>
                  Get Bundle
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
