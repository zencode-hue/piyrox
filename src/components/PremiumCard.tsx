"use client";
import React, { useRef } from 'react';
import Link from 'next/link';

interface PremiumCardProps {
  icon: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  delay?: number;
}

export default function PremiumCard({ icon, title, description, ctaLabel, ctaHref, delay = 0 }: PremiumCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const isExternal = ctaHref.startsWith('http');

  return (
    <div
      ref={cardRef}
      className="premium-card"
      onMouseMove={handleMouseMove}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {isExternal ? (
        <a href={ctaHref} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      ) : (
        <Link href={ctaHref} className="btn btn-secondary">{ctaLabel}</Link>
      )}
    </div>
  );
}
