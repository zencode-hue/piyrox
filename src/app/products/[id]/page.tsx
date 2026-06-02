import { products } from '../../../data/products';
import { ShoppingCart, ShieldCheck, Zap } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id) || products[0];

  return (
    <div style={{ padding: '8rem 2rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ height: '400px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)' }}>
             <span style={{ color: '#555', fontSize: '1.5rem' }}>Product Visual</span>
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {product.category}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{product.name}</h1>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#fff' }}>
            ${product.price}
          </div>
          
          <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '2rem' }}>
            {product.description} Includes a full warranty and instant delivery to your email immediately after purchase.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa' }}>
               <Zap size={18} color="#4ade80" /> Instant automated delivery
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa' }}>
               <ShieldCheck size={18} color="#4ade80" /> 100% secure payment
             </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <ShoppingCart /> Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}
