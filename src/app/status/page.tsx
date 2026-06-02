import { Activity, CheckCircle, Clock } from 'lucide-react';

export default function StatusPage() {
  return (
    <div style={{ padding: '8rem 2rem 2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>System Status</h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Live updates on our services and product delivery systems.</p>
      </div>

      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid #4ade80' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>All Systems Operational</h2>
          <p style={{ color: '#888' }}>Last checked: Just now</p>
        </div>
        <CheckCircle size={40} color="#4ade80" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Website & API</h3>
            <span style={{ color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Operational</span>
          </div>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>The main website and core APIs are functioning normally.</p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Delivery System</h3>
            <span style={{ color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Operational</span>
          </div>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Automated email delivery for digital products is working.</p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Payment Gateway</h3>
            <span style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> Degraded</span>
          </div>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Some crypto payments are experiencing slight delays.</p>
        </div>

      </div>
    </div>
  );
}
