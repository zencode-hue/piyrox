'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Star, X } from 'lucide-react';

const allProducts = [
  { id: 'spotify-premium', name: 'Spotify Premium', price: 3.99, category: 'Streaming', image: '🎵', rating: 4.9 },
  { id: 'netflix-uhd', name: 'Netflix UHD', price: 5.99, category: 'Streaming', image: '🎬', rating: 4.8 },
  { id: 'discord-nitro', name: 'Discord Nitro', price: 4.99, category: 'Social', image: '💬', rating: 4.7 },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 8.99, category: 'AI Tools', image: '🤖', rating: 4.9 },
  { id: 'nordvpn', name: 'NordVPN Premium', price: 2.99, category: 'Security', image: '🔐', rating: 4.6 },
  { id: 'canva-pro', name: 'Canva Pro', price: 4.49, category: 'Design', image: '🎨', rating: 4.8 },
  { id: 'windows-11', name: 'Windows 11 Pro Key', price: 12.99, category: 'Software', image: '🪟', rating: 4.7 },
  { id: 'youtube-premium', name: 'YouTube Premium', price: 3.49, category: 'Streaming', image: '📺', rating: 4.8 },
  { id: 'adobe-cc', name: 'Adobe Creative Cloud', price: 14.99, category: 'Software', image: '🎯', rating: 4.9 },
  { id: 'midjourney', name: 'Midjourney Pro', price: 9.99, category: 'AI Tools', image: '🖼️', rating: 4.8 },
  { id: 'gamepass-ultimate', name: 'Xbox Game Pass Ultimate', price: 6.99, category: 'Gaming', image: '🎮', rating: 4.9 },
  { id: 'hbo-max', name: 'HBO Max', price: 4.99, category: 'Streaming', image: '🎭', rating: 4.6 },
  { id: 'disney-plus', name: 'Disney+ Premium', price: 3.99, category: 'Streaming', image: '🏰', rating: 4.7 },
  { id: 'figma-pro', name: 'Figma Professional', price: 6.99, category: 'Design', image: '🎨', rating: 4.7 },
  { id: 'copilot-pro', name: 'GitHub Copilot', price: 4.99, category: 'AI Tools', image: '🤖', rating: 4.8 },
  { id: 'masterclass', name: 'MasterClass Annual', price: 11.99, category: 'Education', image: '🌟', rating: 4.9 },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const results = query.length > 0
    ? allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 32, textAlign: 'center' }}>Search Products</h1>

      <div style={{ maxWidth: 600, margin: '0 auto 48px', position: 'relative' }}>
        <SearchIcon size={20} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for products, categories..."
          autoFocus
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 50px 16px 50px', color: '#fff', fontSize: 16, transition: 'border-color 0.2s' }} />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {query.length > 0 && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>{results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</p>
      )}

      {results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {results.map(p => (
            <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 42, marginBottom: 14 }}>{p.image}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{p.category}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Star size={12} fill="rgba(255,255,255,0.6)" stroke="none" />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.rating}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800 }}>${p.price.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : query.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No results found</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Try searching for something else or browse our categories.</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Start typing to search through our product catalog</p>
        </div>
      )}
    </div>
  );
}
