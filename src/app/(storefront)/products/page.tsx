'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Grid, List, Star, ShoppingCart } from 'lucide-react';

const allProducts = [
  { id: 'spotify-premium', name: 'Spotify Premium', price: 3.99, originalPrice: 9.99, category: 'Streaming', image: '🎵', rating: 4.9, reviews: 342, badge: 'Best Seller' },
  { id: 'netflix-uhd', name: 'Netflix UHD', price: 5.99, originalPrice: 15.49, category: 'Streaming', image: '🎬', rating: 4.8, reviews: 287, badge: 'Popular' },
  { id: 'discord-nitro', name: 'Discord Nitro', price: 4.99, originalPrice: 9.99, category: 'Social', image: '💬', rating: 4.7, reviews: 198, badge: 'Hot' },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 8.99, originalPrice: 20.00, category: 'AI Tools', image: '🤖', rating: 4.9, reviews: 456, badge: 'Trending' },
  { id: 'nordvpn', name: 'NordVPN Premium', price: 2.99, originalPrice: 11.99, category: 'Security', image: '🔐', rating: 4.6, reviews: 167, badge: 'Sale' },
  { id: 'canva-pro', name: 'Canva Pro', price: 4.49, originalPrice: 12.99, category: 'Design', image: '🎨', rating: 4.8, reviews: 231, badge: 'New' },
  { id: 'windows-11', name: 'Windows 11 Pro Key', price: 12.99, originalPrice: 199.99, category: 'Software', image: '🪟', rating: 4.7, reviews: 89, badge: 'Deal' },
  { id: 'youtube-premium', name: 'YouTube Premium', price: 3.49, originalPrice: 13.99, category: 'Streaming', image: '📺', rating: 4.8, reviews: 312, badge: 'Popular' },
  { id: 'hbo-max', name: 'HBO Max', price: 4.99, originalPrice: 15.99, category: 'Streaming', image: '🎭', rating: 4.6, reviews: 145 },
  { id: 'disney-plus', name: 'Disney+ Premium', price: 3.99, originalPrice: 13.99, category: 'Streaming', image: '🏰', rating: 4.7, reviews: 201 },
  { id: 'apple-music', name: 'Apple Music', price: 3.49, originalPrice: 10.99, category: 'Streaming', image: '🍎', rating: 4.5, reviews: 134 },
  { id: 'tidal-hifi', name: 'Tidal HiFi Plus', price: 4.99, originalPrice: 19.99, category: 'Streaming', image: '🎶', rating: 4.4, reviews: 78 },
  { id: 'paramount-plus', name: 'Paramount+', price: 2.99, originalPrice: 11.99, category: 'Streaming', image: '⭐', rating: 4.3, reviews: 92 },
  { id: 'crunchyroll', name: 'Crunchyroll Premium', price: 3.49, originalPrice: 14.99, category: 'Streaming', image: '🍥', rating: 4.8, reviews: 256 },
  { id: 'peacock', name: 'Peacock Premium', price: 2.49, originalPrice: 9.99, category: 'Streaming', image: '🦚', rating: 4.2, reviews: 67 },
  { id: 'hulu', name: 'Hulu No Ads', price: 4.49, originalPrice: 17.99, category: 'Streaming', image: '📗', rating: 4.6, reviews: 189 },
  { id: 'expressvpn', name: 'ExpressVPN', price: 3.99, originalPrice: 12.95, category: 'Security', image: '🛡️', rating: 4.7, reviews: 143 },
  { id: 'surfshark', name: 'Surfshark VPN', price: 1.99, originalPrice: 12.95, category: 'Security', image: '🦈', rating: 4.5, reviews: 112 },
  { id: 'malwarebytes', name: 'Malwarebytes Premium', price: 5.99, originalPrice: 44.99, category: 'Security', image: '🔒', rating: 4.6, reviews: 98 },
  { id: 'kaspersky', name: 'Kaspersky Total Security', price: 7.99, originalPrice: 49.99, category: 'Security', image: '🛡️', rating: 4.4, reviews: 76 },
  { id: 'office-365', name: 'Microsoft 365', price: 9.99, originalPrice: 99.99, category: 'Software', image: '📎', rating: 4.8, reviews: 267 },
  { id: 'adobe-cc', name: 'Adobe Creative Cloud', price: 14.99, originalPrice: 54.99, category: 'Software', image: '🎯', rating: 4.9, reviews: 345 },
  { id: 'autocad', name: 'AutoCAD License', price: 19.99, originalPrice: 220.00, category: 'Software', image: '📐', rating: 4.5, reviews: 45 },
  { id: 'vmware', name: 'VMware Pro', price: 11.99, originalPrice: 189.00, category: 'Software', image: '🖥️', rating: 4.6, reviews: 87 },
  { id: 'jetbrains', name: 'JetBrains All Products', price: 12.99, originalPrice: 249.00, category: 'Software', image: '⚡', rating: 4.9, reviews: 156 },
  { id: 'figma-pro', name: 'Figma Professional', price: 6.99, originalPrice: 15.00, category: 'Design', image: '🎨', rating: 4.7, reviews: 198 },
  { id: 'midjourney', name: 'Midjourney Pro', price: 9.99, originalPrice: 30.00, category: 'AI Tools', image: '🖼️', rating: 4.8, reviews: 312 },
  { id: 'claude-pro', name: 'Claude Pro', price: 8.99, originalPrice: 20.00, category: 'AI Tools', image: '🧠', rating: 4.7, reviews: 234 },
  { id: 'copilot-pro', name: 'GitHub Copilot', price: 4.99, originalPrice: 10.00, category: 'AI Tools', image: '🤖', rating: 4.8, reviews: 278 },
  { id: 'grammarly', name: 'Grammarly Premium', price: 5.99, originalPrice: 30.00, category: 'AI Tools', image: '✍️', rating: 4.6, reviews: 189 },
  { id: 'notion-ai', name: 'Notion AI', price: 4.49, originalPrice: 10.00, category: 'AI Tools', image: '📝', rating: 4.5, reviews: 145 },
  { id: 'gamepass-ultimate', name: 'Xbox Game Pass Ultimate', price: 6.99, originalPrice: 16.99, category: 'Gaming', image: '🎮', rating: 4.9, reviews: 423 },
  { id: 'ps-plus', name: 'PS Plus Premium', price: 7.99, originalPrice: 17.99, category: 'Gaming', image: '🕹️', rating: 4.7, reviews: 234 },
  { id: 'ea-play', name: 'EA Play Pro', price: 4.99, originalPrice: 14.99, category: 'Gaming', image: '⚽', rating: 4.4, reviews: 112 },
  { id: 'nintendo-online', name: 'Nintendo Switch Online', price: 2.99, originalPrice: 7.99, category: 'Gaming', image: '🍄', rating: 4.5, reviews: 167 },
  { id: 'steam-wallet', name: 'Steam Wallet $50', price: 39.99, originalPrice: 50.00, category: 'Gaming', image: '🎲', rating: 4.8, reviews: 345 },
  { id: 'roblox-premium', name: 'Roblox Premium', price: 4.49, originalPrice: 12.99, category: 'Gaming', image: '🧱', rating: 4.6, reviews: 198 },
  { id: 'minecraft-java', name: 'Minecraft Java Edition', price: 9.99, originalPrice: 26.95, category: 'Gaming', image: '⛏️', rating: 4.9, reviews: 456 },
  { id: 'fortnite-vbucks', name: 'Fortnite V-Bucks 5000', price: 24.99, originalPrice: 39.99, category: 'Gaming', image: '🔫', rating: 4.5, reviews: 234 },
  { id: 'valorant-points', name: 'Valorant Points 2050', price: 14.99, originalPrice: 19.99, category: 'Gaming', image: '🎯', rating: 4.6, reviews: 178 },
  { id: 'apex-coins', name: 'Apex Legends Coins', price: 9.99, originalPrice: 19.99, category: 'Gaming', image: '🏆', rating: 4.4, reviews: 89 },
  { id: 'gta-shark', name: 'GTA Shark Card $8M', price: 19.99, originalPrice: 49.99, category: 'Gaming', image: '🚗', rating: 4.3, reviews: 145 },
  { id: 'cod-points', name: 'COD Points 5000', price: 29.99, originalPrice: 49.99, category: 'Gaming', image: '🔫', rating: 4.5, reviews: 167 },
  { id: 'twitch-sub', name: 'Twitch Turbo', price: 3.99, originalPrice: 11.99, category: 'Social', image: '📡', rating: 4.3, reviews: 78 },
  { id: 'linkedin-premium', name: 'LinkedIn Premium', price: 9.99, originalPrice: 59.99, category: 'Social', image: '💼', rating: 4.6, reviews: 134 },
  { id: 'tinder-gold', name: 'Tinder Gold', price: 7.99, originalPrice: 29.99, category: 'Social', image: '🔥', rating: 4.2, reviews: 92 },
  { id: 'reddit-premium', name: 'Reddit Premium', price: 2.99, originalPrice: 6.99, category: 'Social', image: '📱', rating: 4.1, reviews: 56 },
  { id: 'skillshare', name: 'Skillshare Premium', price: 4.99, originalPrice: 32.00, category: 'Education', image: '📚', rating: 4.7, reviews: 189 },
  { id: 'coursera-plus', name: 'Coursera Plus', price: 14.99, originalPrice: 59.00, category: 'Education', image: '🎓', rating: 4.8, reviews: 234 },
  { id: 'udemy-business', name: 'Udemy Business', price: 9.99, originalPrice: 30.00, category: 'Education', image: '📖', rating: 4.6, reviews: 167 },
  { id: 'masterclass', name: 'MasterClass Annual', price: 11.99, originalPrice: 120.00, category: 'Education', image: '🌟', rating: 4.9, reviews: 298 },
  { id: 'duolingo-plus', name: 'Duolingo Super', price: 3.49, originalPrice: 12.99, category: 'Education', image: '🦉', rating: 4.5, reviews: 145 },
  { id: 'brilliant', name: 'Brilliant Premium', price: 7.99, originalPrice: 24.99, category: 'Education', image: '💡', rating: 4.7, reviews: 112 },
  { id: 'envato-elements', name: 'Envato Elements', price: 8.99, originalPrice: 33.00, category: 'Design', image: '🎭', rating: 4.6, reviews: 178 },
  { id: 'shutterstock', name: 'Shutterstock Plan', price: 12.99, originalPrice: 49.00, category: 'Design', image: '📷', rating: 4.4, reviews: 89 },
  { id: 'adobe-stock', name: 'Adobe Stock', price: 9.99, originalPrice: 29.99, category: 'Design', image: '🖼️', rating: 4.5, reviews: 112 },
  { id: 'sketch', name: 'Sketch License', price: 5.99, originalPrice: 12.00, category: 'Design', image: '💎', rating: 4.3, reviews: 67 },
  { id: 'invision', name: 'InVision Enterprise', price: 6.99, originalPrice: 25.00, category: 'Design', image: '🎪', rating: 4.4, reviews: 78 },
  { id: 'claude-api', name: 'Claude API Credits', price: 14.99, originalPrice: 25.00, category: 'AI Tools', image: '⚙️', rating: 4.7, reviews: 145 },
  { id: 'perplexity-pro', name: 'Perplexity Pro', price: 6.99, originalPrice: 20.00, category: 'AI Tools', image: '🔍', rating: 4.6, reviews: 123 },
  { id: 'runway-ml', name: 'Runway ML Pro', price: 11.99, originalPrice: 35.00, category: 'AI Tools', image: '🎬', rating: 4.5, reviews: 98 },
  { id: 'iptv-premium', name: 'IPTV Premium 12M', price: 29.99, originalPrice: 89.99, category: 'Streaming', image: '📺', rating: 4.3, reviews: 234 },
  { id: 'dazn', name: 'DAZN Premium', price: 5.99, originalPrice: 19.99, category: 'Streaming', image: '🥊', rating: 4.4, reviews: 112 },
  { id: 'audible', name: 'Audible Premium Plus', price: 5.99, originalPrice: 14.95, category: 'Streaming', image: '🎧', rating: 4.7, reviews: 189 },
  { id: 'kindle-unlimited', name: 'Kindle Unlimited', price: 3.99, originalPrice: 11.99, category: 'Streaming', image: '📕', rating: 4.5, reviews: 156 },
  { id: 'pureref', name: 'PureRef License', price: 2.99, originalPrice: 10.00, category: 'Design', image: '🖍️', rating: 4.3, reviews: 45 },
];

const allCategories = ['All', ...Array.from(new Set(allProducts.map(p => p.category)))];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 16;

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.reverse(); break;
      default: result.sort((a, b) => b.reviews - a.reviews);
    }
    return result;
  }, [category, searchQuery, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>All Products</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>{filtered.length} products available</p>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search products..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px 12px 40px', color: '#fff', fontSize: 14 }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 13, cursor: 'pointer', minWidth: 160 }}>
          <option value="popular" style={{ background: '#111' }}>Most Popular</option>
          <option value="newest" style={{ background: '#111' }}>Newest First</option>
          <option value="price-low" style={{ background: '#111' }}>Price: Low to High</option>
          <option value="price-high" style={{ background: '#111' }}>Price: High to Low</option>
          <option value="rating" style={{ background: '#111' }}>Highest Rated</option>
        </select>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setCurrentPage(1); }}
            style={{
              padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
              background: category === cat ? '#fff' : 'rgba(255,255,255,0.04)',
              color: category === cat ? '#000' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${category === cat ? '#fff' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 48 }}>
        {paginated.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.3s', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {p.badge && <span style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 600 }}>{p.badge}</span>}
                <div style={{ fontSize: 42, marginBottom: 14 }}>{p.image}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{p.category}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Star size={12} fill="rgba(255,255,255,0.6)" stroke="none" />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.rating} ({p.reviews})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 800 }}>${p.price.toFixed(2)}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>${p.originalPrice.toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: '#4caf50', fontWeight: 600 }}>-{Math.round((1 - p.price / p.originalPrice) * 100)}%</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              style={{
                width: 40, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                background: currentPage === page ? '#fff' : 'rgba(255,255,255,0.04)',
                color: currentPage === page ? '#000' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${currentPage === page ? '#fff' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
