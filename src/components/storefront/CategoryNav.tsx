'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryNav({ categories, selected, onSelect }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const allCategories = ['All', ...categories];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 24px',
        maxWidth: '1400px',
        margin: '0 auto 32px',
      }}
    >
      <button
        onClick={() => scroll('left')}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: 1,
          padding: '4px 0',
        }}
      >
        {allCategories.map((cat) => {
          const isActive = selected === cat || (cat === 'All' && selected === '');
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat === 'All' ? '' : cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '50px',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => scroll('right')}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ChevronRight size={16} />
      </button>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
