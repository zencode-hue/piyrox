import { Zap, ShieldCheck, Users, MessageSquare, Fingerprint } from 'lucide-react';

export default function Home() {
  return (
    <>
      <section className="hero-container">
        {/* Background images simulating the hardware/character from the image */}
        <div className="hero-bg"></div>
        
        <div className="hero-logo-wrapper">
          <div className="hero-logo-glow"></div>
          {/* Main glowing hat/mask icon placeholder */}
          <Fingerprint size={80} color="#fff" strokeWidth={1} style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
        </div>
        
        <h1 className="hero-title">
          Start Winning With<br />
          <span>PIYROX</span>
        </h1>
        
        <p className="hero-subtitle">
          Providing high-quality enhancement tools to elevate your experience,<br />
          at competitive prices.
        </p>
        
        <div className="hero-pills">
          <div className="hero-pill">
            <Zap size={14} color="#a3a3a3" /> Instant Delivery
          </div>
          <div className="hero-pill">
            <ShieldCheck size={14} color="#a3a3a3" /> Secure & Undetected
          </div>
          <div className="hero-pill">
            <Users size={14} color="#a3a3a3" /> 1000+ Customers
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-card">
          <div>
            <h2 className="support-title">Need support?</h2>
            <p className="support-desc">Join our Discord server to get help from our staff members.</p>
          </div>
          <button className="discord-btn">
            <MessageSquare size={18} /> Join Discord
          </button>
        </div>
      </section>

      {/* Spacing for future content below */}
      <div style={{ height: '200px' }}></div>
    </>
  );
}
