'use client';

import React, { useState } from 'react';
import { Tag, Clock, ArrowRight } from 'lucide-react';
import DealCountdown from './DealCountdown';

interface DealCardProps {
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  expiresAt: string | Date;
  badge?: string;
  href?: string;
}

export default function DealCard({
  title,
  description,
  originalPrice,
  salePrice,
  expiresAt,
  badge = 'Hot Deal',
  href = '/products',
}: DealCardProps) {
  const [hovered, setHovered] = useState(false);
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,145,0,0.08), rgba(20,20,20,0.6))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'rgba(255,145,0,0.25)' : 'rgba(255,145,0,0.1)'}`,
        borderRadius: '20px',
        padding: '28px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 30px rgba(255,145,0,0.08)' : 'none',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '50px',
            background: 'rgba(255,145,0,0.15)',
            color: '#ff9100',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <Tag size={12} />
          {badge}
        </span>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            background: 'rgba(0,200,83,0.15)',
            color: '#00c853',
            fontSize: '13px',
            fontWeight: 800,
          }}
        >
          -{discount}%
        </span>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', lineHeight: 1.6 }}>
        {description}
      </p>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>${salePrice.toFixed(2)}</span>
        <span
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.3)',
            textDecoration: 'line-through',
          }}
        >
          ${originalPrice.toFixed(2)}
        </span>
      </div>

      {/* Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Clock size={14} color="rgba(255,255,255,0.4)" />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginRight: '8px' }}>Ends in</span>
        <DealCountdown targetDate={expiresAt} />
      </div>

      <a
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff9100, #ff6d00)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '14px',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        Get Deal
        <ArrowRight size={16} />
      </a>
    </div>
  );
}
