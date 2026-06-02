'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 'spotify-premium', name: 'Spotify Premium', variant: '3 Months', price: 9.99, quantity: 1, image: '🎵' },
    { id: 'netflix-uhd', name: 'Netflix UHD', variant: '1 Month', price: 5.99, quantity: 2, image: '🎬' },
    { id: 'chatgpt-plus', name: 'ChatGPT Plus', variant: '1 Month', price: 8.99, quantity: 1, image: '🤖' },
  ]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = discountApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Your Cart</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 40 }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <ShoppingBag size={48} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Your cart is empty</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#000', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
          {/* Cart Items */}
          <div>
            {cartItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 12 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
                  {item.image}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{item.name}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{item.variant}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>${(item.price * item.quantity).toFixed(2)}</div>
                  <button onClick={() => removeItem(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ff1744')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32, position: 'sticky', top: 100 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: '#4caf50' }}>Discount (10%)</span>
                  <span style={{ color: '#4caf50', fontWeight: 600 }}>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Delivery</span>
                <span style={{ color: '#4caf50', fontWeight: 600 }}>Instant</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800 }}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Discount Code */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Discount code"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13 }} />
                <button onClick={() => { if (discountCode.toUpperCase() === 'PIYROX10') setDiscountApplied(true); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Tag size={14} />
                </button>
              </div>

              <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', color: '#000', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'all 0.3s', width: '100%' }}>
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                <ShieldCheck size={14} /> Secure checkout powered by Stripe
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
