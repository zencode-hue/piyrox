'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tv, Brain, Monitor, Gamepad2, Shield, GraduationCap } from 'lucide-react';

const categories = [
  { name: 'Streaming', icon: Tv, color: '#e50914', count: 24 },
  { name: 'AI Tools', icon: Brain, color: '#8b5cf6', count: 18 },
  { name: 'Software', icon: Monitor, color: '#2979ff', count: 32 },
  { name: 'Gaming', icon: Gamepad2, color: '#00c853', count: 15 },
  { name: 'VPN', icon: Shield, color: '#ff9100', count: 12 },
  { name: 'Education', icon: GraduationCap, color: '#00bcd4', count: 20 },
];

function CategoryCard({ name, icon: Icon, color, count }: typeof categories[0]) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/products?category=${name}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? `${color}12` : 'rgba(20,20,20,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${hovered ? `${color}33` : 'rgba(255,255,255,0.05)'}`,
          borderRadius: '16px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          cursor: 'pointer',
          boxShadow: hovered ? `0 8px 30px ${color}15` : 'none',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: hovered ? `0 0 20px ${color}20` : 'none',
          }}
        >
          <Icon size={28} color={color} />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{name}</h3>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{count} products</span>
      </div>
    </Link>
  );
}

export default function FeaturedCategories() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          Browse Categories
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>
          Find exactly what you need from our curated collections
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px',
        }}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.name} {...cat} />
        ))}
      </div>
    </section>
  );
}
