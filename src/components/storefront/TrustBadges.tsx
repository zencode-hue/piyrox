import React from 'react';
import { Lock, Zap, Headphones, RotateCcw } from 'lucide-react';

const badges = [
  { icon: Lock, title: 'SSL Secure', description: '256-bit encryption' },
  { icon: Zap, title: 'Instant Delivery', description: 'Get access immediately' },
  { icon: Headphones, title: '24/7 Support', description: 'Always here to help' },
  { icon: RotateCcw, title: 'Money Back', description: '30-day guarantee' },
];

export default function TrustBadges() {
  return (
    <section style={{ padding: '60px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(20,20,20,0.4)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color="rgba(255,255,255,0.7)" />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                  {badge.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
