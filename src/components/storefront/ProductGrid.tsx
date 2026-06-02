import React, { ReactNode } from 'react';

interface ProductGridProps {
  children: ReactNode;
  columns?: number;
}

export default function ProductGrid({ children, columns = 4 }: ProductGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(260, Math.floor(1200 / columns))}px, 1fr))`,
        gap: '24px',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
      }}
    >
      {children}
    </div>
  );
}
