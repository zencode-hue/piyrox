'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    // Simulated API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(20,20,20,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px',
          padding: '60px 40px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Mail size={24} color="rgba(255,255,255,0.7)" />
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          Stay in the Loop
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', lineHeight: 1.7 }}>
          Get notified about new products, exclusive deals, and restocks. No spam, unsubscribe anytime.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '14px 20px',
              borderRadius: '50px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '14px 28px',
              borderRadius: '50px',
              background: status === 'success'
                ? 'rgba(0,200,83,0.2)'
                : 'linear-gradient(135deg, #fff, #e0e0e0)',
              color: status === 'success' ? '#00c853' : '#000',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
            }}
          >
            {status === 'success' ? (
              <>
                <Check size={16} />
                Subscribed!
              </>
            ) : status === 'loading' ? (
              'Subscribing...'
            ) : (
              <>
                Subscribe
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
