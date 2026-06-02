import { ArrowRight, Calendar } from 'lucide-react';

export default function BlogPage() {
  return (
    <div style={{ padding: '8rem 2rem 2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>PIYROX Blog</h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Latest news, updates, and guides from the PIYROX team.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div className="glass-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', height: '200px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}></div>
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} /> June 2, 2026
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Welcome to the New PIYROX Market</h2>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>We've completely redesigned our platform to provide you with the fastest, most secure digital subscription marketplace on the web.</p>
            <button style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>Read More <ArrowRight size={16} /></button>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', height: '200px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}></div>
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} /> May 28, 2026
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>How to Secure Your Digital Accounts</h2>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Learn the best practices for keeping your newly purchased digital subscriptions secure and avoiding lockouts.</p>
            <button style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>Read More <ArrowRight size={16} /></button>
          </div>
        </div>

      </div>
    </div>
  );
}
