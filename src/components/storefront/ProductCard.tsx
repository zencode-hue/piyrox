"use client";

import React from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="glass-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ height: '150px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#555' }}>{product.category} Image</span>
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{product.name}</h3>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {product.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${product.price}</span>
        <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>Purchase</button>
      </div>
    </Link>
  );
}
