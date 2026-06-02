import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
  return (
    <div style={{ padding: '8rem 2rem 2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ShoppingCart size={32} /> Your Cart
      </h1>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Mock Cart Item */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Netflix Premium (1 Month)</h3>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>Private account</p>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>$4.99</div>
            <button style={{ padding: '8px', color: '#ef4444' }}><Trash2 size={20} /></button>
          </div>

        </div>

        <div style={{ flex: '1 1 300px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#aaa' }}>
              <span>Subtotal</span>
              <span>$4.99</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#aaa' }}>
              <span>Fees</span>
              <span>$0.00</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <span>Total</span>
              <span>$4.99</span>
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
