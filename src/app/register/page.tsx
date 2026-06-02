import { User, Lock, Mail, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '70px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
            <UserPlus size={30} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Create an Account</h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Join PIYROX Market today</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Full Name</label>
            <div className="search-bar" style={{ width: '100%' }}>
              <User size={16} color="#888" />
              <input type="text" placeholder="John Doe" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Email Address</label>
            <div className="search-bar" style={{ width: '100%' }}>
              <Mail size={16} color="#888" />
              <input type="email" placeholder="you@example.com" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Password</label>
            <div className="search-bar" style={{ width: '100%' }}>
              <Lock size={16} color="#888" />
              <input type="password" placeholder="••••••••" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '1rem', fontSize: '1rem' }}>
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
          Already have an account? <a href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
