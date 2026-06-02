'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Shield, Clock, CheckCircle, ChevronDown, ChevronUp, Heart, Share2, ArrowLeft, Zap } from 'lucide-react';

const productsData: Record<string, any> = {
  'spotify-premium': { name: 'Spotify Premium', price: 3.99, originalPrice: 9.99, image: '🎵', category: 'Streaming', rating: 4.9, reviews: 342, description: 'Enjoy unlimited ad-free music streaming with Spotify Premium. Download your favorite songs, play any track on-demand, and experience superior audio quality up to 320kbps. Works on all devices.', features: ['Ad-free listening', 'Offline downloads', 'High quality audio (320kbps)', 'Play any song on-demand', 'Cross-device sync'], variants: [{ name: '1 Month', price: 3.99 }, { name: '3 Months', price: 9.99 }, { name: '6 Months', price: 17.99 }, { name: '12 Months', price: 29.99 }], warranty: '30-day replacement warranty', delivery: 'Instant (1-5 minutes)' },
  'netflix-uhd': { name: 'Netflix UHD', price: 5.99, originalPrice: 15.49, image: '🎬', category: 'Streaming', rating: 4.8, reviews: 287, description: 'Stream thousands of movies, TV shows, and Netflix Originals in stunning 4K UHD quality. Access content from anywhere with our premium shared accounts. Includes all the latest releases.', features: ['4K Ultra HD streaming', 'Access all content', 'Multiple profiles', 'Watch on any device', 'New releases included'], variants: [{ name: '1 Month', price: 5.99 }, { name: '3 Months', price: 14.99 }, { name: '6 Months', price: 27.99 }, { name: '12 Months', price: 49.99 }], warranty: '30-day replacement warranty', delivery: 'Instant (1-5 minutes)' },
};

const defaultProduct = { name: 'Premium Product', price: 4.99, originalPrice: 14.99, image: '⚡', category: 'Digital', rating: 4.7, reviews: 156, description: 'Premium digital subscription at an unbeatable price. Instant delivery, full warranty, and 24/7 support included. Experience the best value on the market with PIYROX.', features: ['Premium access', 'Instant delivery', 'Full warranty', '24/7 support', 'Best price guarantee'], variants: [{ name: '1 Month', price: 4.99 }, { name: '3 Months', price: 12.99 }, { name: '6 Months', price: 22.99 }, { name: '12 Months', price: 39.99 }], warranty: '30-day replacement warranty', delivery: 'Instant (1-5 minutes)' };

const sampleReviews = [
  { id: 1, user: 'Alex M.', rating: 5, date: '2024-07-15', text: 'Absolutely perfect! Delivered instantly and works flawlessly. This is my 5th purchase from PIYROX and they never disappoint. Highly recommended!', verified: true },
  { id: 2, user: 'Sarah K.', rating: 5, date: '2024-07-12', text: 'Best prices I\'ve found anywhere. The delivery was literally within 2 minutes of payment. Will definitely be buying again!', verified: true },
  { id: 3, user: 'David R.', rating: 4, date: '2024-07-10', text: 'Great service overall. Had a small issue with my first delivery but support resolved it in under 10 minutes. Very impressed.', verified: true },
  { id: 4, user: 'Emma L.', rating: 5, date: '2024-07-08', text: 'I was skeptical at first but PIYROX is legit. Fast delivery, great prices, and excellent customer support. 10/10!', verified: true },
  { id: 5, user: 'James W.', rating: 5, date: '2024-07-05', text: 'Third time purchasing from here. Always reliable, always fast. The warranty gives me peace of mind too.', verified: true },
];

const relatedProducts = [
  { id: 'spotify-premium', name: 'Spotify Premium', price: 3.99, image: '🎵', category: 'Streaming' },
  { id: 'youtube-premium', name: 'YouTube Premium', price: 3.49, image: '📺', category: 'Streaming' },
  { id: 'discord-nitro', name: 'Discord Nitro', price: 4.99, image: '💬', category: 'Social' },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 8.99, image: '🤖', category: 'AI Tools' },
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = productsData[params.id] || { ...defaultProduct, name: params.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const currentPrice = product.variants[selectedVariant].price;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.4)' }}>Home</Link>
        <span>/</span>
        <Link href="/products" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.4)' }}>Products</Link>
        <span>/</span>
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 80 }}>
        {/* Left - Product Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
              <button style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <Heart size={16} />
              </button>
              <button style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <Share2 size={16} />
              </button>
            </div>
            <span style={{ fontSize: 120 }}>{product.image}</span>
          </div>
        </motion.div>

        {/* Right - Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{product.category}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'rgba(255,255,255,0.7)' : 'none'} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{product.rating} ({product.reviews} reviews)</span>
          </div>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 28 }}>{product.description}</p>

          {/* Variants */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Select Duration</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {product.variants.map((v: any, i: number) => (
                <button key={i} onClick={() => setSelectedVariant(i)}
                  style={{
                    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedVariant === i ? '#fff' : 'rgba(255,255,255,0.04)',
                    color: selectedVariant === i ? '#000' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${selectedVariant === i ? '#fff' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {v.name} — ${v.price.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>${currentPrice.toFixed(2)}</span>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>
            <span style={{ fontSize: 14, color: '#4caf50', fontWeight: 700, background: 'rgba(76,175,80,0.1)', padding: '4px 10px', borderRadius: 6 }}>Save {Math.round((1 - currentPrice / product.originalPrice) * 100)}%</span>
          </div>

          {/* Quantity & Add to Cart */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '12px 16px', background: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>−</button>
              <span style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, minWidth: 50, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '12px 16px', background: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>+</button>
            </div>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', color: '#000', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, transition: 'all 0.3s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              <ShoppingCart size={18} /> Add to Cart — ${(currentPrice * quantity).toFixed(2)}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: <Zap size={14} />, text: product.delivery },
              { icon: <Shield size={14} />, text: product.warranty },
              { icon: <CheckCircle size={14} />, text: 'Verified Seller' },
            ].map((badge, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {badge.icon} {badge.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          {(['description', 'reviews'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '14px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: 'none',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
              }}>
              {tab === 'description' ? 'Description & Features' : `Reviews (${product.reviews})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>What You Get</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {product.features.map((f: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                  <CheckCircle size={16} color="#4caf50" /> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {(showAllReviews ? sampleReviews : sampleReviews.slice(0, 3)).map(r => (
              <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 24, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{r.user[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{r.user}</div>
                      <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={10} fill="rgba(255,255,255,0.6)" stroke="none" />)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.verified && <span style={{ fontSize: 10, color: '#4caf50', background: 'rgba(76,175,80,0.1)', padding: '2px 8px', borderRadius: 4 }}>Verified</span>}
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{r.date}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{r.text}</p>
              </div>
            ))}
            {sampleReviews.length > 3 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', margin: '0 auto' }}>
                {showAllReviews ? 'Show Less' : 'Show All Reviews'} {showAllReviews ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Related Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {relatedProducts.filter(r => r.id !== params.id).map(p => (
            <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{p.image}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{p.category}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>${p.price.toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
