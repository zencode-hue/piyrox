import { products, categories } from '../../data/products';
import { Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>All Products</h1>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="search-bar" style={{ width: '250px' }}>
            <Search size={16} color="#888" />
            <input type="text" placeholder="Search..." />
          </div>
          <button className="glass" style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <button className="btn-primary">All</button>
        {categories.map(cat => (
          <button key={cat} className="glass" style={{ padding: '8px 16px', borderRadius: '20px' }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <a href={`/products/${product.id}`} key={product.id} className="glass-card" style={{ display: 'block' }}>
            <div style={{ height: '120px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#555' }}>{product.category} Image</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1rem' }}>{product.description.substring(0, 50)}...</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${product.price}</span>
              <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>View</button>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
