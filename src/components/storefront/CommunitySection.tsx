'use client';

import React from 'react';
import { MessageCircle, Send, Users, ArrowRight } from 'lucide-react';

export default function CommunitySection() {
  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          Join Our Community
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto' }}>
          Connect with thousands of PIYROX members. Get updates, support, and exclusive deals.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Discord */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(88,101,242,0.12), rgba(20,20,20,0.6))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(88,101,242,0.2)',
            borderRadius: '20px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(88,101,242,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle size={28} color="#5865F2" />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Discord Server</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Join our Discord for real-time support, announcements, giveaways, and to connect with other customers.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            <Users size={14} />
            <span>2,500+ members online</span>
          </div>
          <a
            href="https://discord.gg/piyrox"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: '#5865F2',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              width: 'fit-content',
            }}
          >
            Join Discord
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Telegram */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,136,204,0.12), rgba(20,20,20,0.6))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,136,204,0.2)',
            borderRadius: '20px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(0,136,204,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={28} color="#0088CC" />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Telegram Channel</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Follow our Telegram for instant notifications on restocks, flash sales, and exclusive promo codes.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            <Users size={14} />
            <span>1,800+ subscribers</span>
          </div>
          <a
            href="https://t.me/piyrox"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: '#0088CC',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              width: 'fit-content',
            }}
          >
            Join Telegram
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
