"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PremiumCard from '@/components/PremiumCard';
import TerminalMockup from '@/components/TerminalMockup';

export default function Home() {
  return (
    <>
      <div className="ambient-light" style={{ background: 'radial-gradient(circle at top, rgba(42,138,246,0.15) 0%, rgba(168,83,186,0.1) 40%, transparent 70%)', filter: 'blur(40px)' }} />
      <Navbar />

      <header className="hero">
        <div className="hero-badge">PiyRox OS 2.0 is now available</div>
        <h1>Intelligence engineered<br />for the modern era.</h1>
        <p>
          We build agentic environments. From the world&apos;s first AI-native operating system
          to IDEs that write their own code, PiyRox is the ultimate platform for creators.
        </p>
        <div className="hero-buttons">
          <Link href="/download" className="btn btn-primary btn-large" style={{boxShadow: '0 0 20px rgba(255,255,255,0.2)'}}>Download Desktop IDE</Link>
          <Link href="https://chat.piyrox.sbs" className="btn btn-gradient btn-large">Open Web Chat App</Link>
          <Link href="/docs" className="btn btn-secondary btn-large">Explore Documentation</Link>
        </div>
      </header>

      <TerminalMockup />

      <section id="features">
        <div className="section-header">
          <h2>A cohesive AI ecosystem.</h2>
          <p>
            We rejected the concept of fragmented chatbots. PiyRox is a unified platform
            designed to integrate intelligence directly into the core of your digital workflow.
          </p>
        </div>
        <div className="premium-grid">
          <PremiumCard
            icon={<svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            title="Jarvis OS"
            description="Your ambient AI assistant. Always available, securely integrated with your local filesystem, and capable of executing complex multi-step workflows directly on your machine."
            ctaLabel="Download EXE"
            ctaHref="/download"
            delay={0}
          />
          <PremiumCard
            icon={<svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            title="PiyRox IDE"
            description="The first IDE built entirely around agentic capabilities. It doesn't just autocomplete; it reads your entire codebase, plans massive architectural features, and writes the code."
            ctaLabel="Download EXE"
            ctaHref="/download"
            delay={100}
          />
          <PremiumCard
            icon={<svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            title="PiyRox Chat"
            description="The conversational powerhouse. Powered by our proprietary frontier models, optimized for deep reasoning, long-context analysis, and creative generation."
            ctaLabel="Open Chat"
            ctaHref="https://chat.piyrox.sbs"
            delay={200}
          />
        </div>
      </section>

      <section id="capabilities">
        <div className="section-header">
          <h2>Capabilities that matter.</h2>
          <p>
            PiyRox is built on years of research into agentic AI systems. Every feature is designed
            to give you more control, more context, and more leverage over your digital environment.
          </p>
        </div>
        <div className="premium-grid">
          <div className="premium-card">
            <h3>Full Codebase Context</h3>
            <p>With 128k token context windows, PiyRox IDE understands your entire project architecture, dependencies, and design patterns. No more fragmented understanding.</p>
          </div>
          <div className="premium-card">
            <h3>Multi-Step Planning</h3>
            <p>Jarvis OS breaks down complex tasks into executable steps. It plans, verifies, and adapts in real-time, handling failures gracefully.</p>
          </div>
          <div className="premium-card">
            <h3>Local-First Architecture</h3>
            <p>Your data stays on your machine. Jarvis OS runs locally with optional cloud sync. You maintain complete control over your information.</p>
          </div>
          <div className="premium-card">
            <h3>Frontier Models</h3>
            <p>Access to PiyRox-4 and Jarvis V3 models with 200k token context windows. Optimized for reasoning, coding, and creative tasks.</p>
          </div>
          <div className="premium-card">
            <h3>Seamless Integration</h3>
            <p>Works with your existing tools. Git integration, API access, webhook support, and native IDE plugins for VS Code and JetBrains.</p>
          </div>
          <div className="premium-card">
            <h3>Enterprise Security</h3>
            <p>SOC 2 Type II certified. End-to-end encryption, role-based access control, audit logs, and compliance with GDPR, HIPAA, and SOC 2.</p>
          </div>
        </div>
      </section>

      <section id="use-cases">
        <div className="section-header">
          <h2>Built for real work.</h2>
          <p>
            From individual developers to enterprise teams, PiyRox adapts to your workflow.
            Here's how teams are using it today.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '32px', background: 'rgba(20,20,25,0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 600, background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Startups</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Move faster with AI-assisted development. PiyRox IDE helps small teams ship features in days instead of weeks.
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Rapid prototyping and iteration</li>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Automated code reviews and testing</li>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Reduced time-to-market</li>
            </ul>
          </div>
          <div style={{ padding: '32px', background: 'rgba(20,20,25,0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 600, background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Enterprise Teams</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Scale development without scaling headcount. Jarvis OS handles routine tasks, freeing your team for strategic work.
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> System automation and monitoring</li>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Compliance and audit automation</li>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Enterprise security and governance</li>
            </ul>
          </div>
          <div style={{ padding: '32px', background: 'rgba(20,20,25,0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 600, background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Researchers</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Accelerate your research with AI-powered analysis and experimentation. PiyRox Chat handles complex reasoning tasks.
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Long-context document analysis</li>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Data processing and visualization</li>
              <li style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}><span className="mr-2 text-current"><svg className="w-5 h-5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> Hypothesis generation and testing</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="why-piyrox">
        <div className="section-header">
          <h2>Why PiyRox?</h2>
          <p>
            The AI landscape is crowded. Here's what makes PiyRox different.
          </p>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Agentic, not reactive</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Most AI tools wait for your input. PiyRox takes initiative. Jarvis OS can plan multi-step workflows, 
              handle failures, and adapt in real-time. It's not just autocomplete—it's a collaborator.
            </p>
          </div>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Context-aware</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              With 200k token context windows, PiyRox understands the full picture. Your entire codebase, 
              project history, and design decisions are always in scope. No more fragmented understanding.
            </p>
          </div>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Privacy-first</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Jarvis OS runs locally on your machine. Your code, your data, your secrets—they stay with you. 
              Optional cloud sync means you choose what leaves your computer.
            </p>
          </div>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Transparent and safe</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              We publish our research. We document our limitations. We're honest about what our models can and cannot do. 
              Safety isn't an afterthought—it's built into every product.
            </p>
          </div>
        </div>
      </section>

      <section id="stats">
        <div className="section-header">
          <h2>By the numbers.</h2>
          <p>
            PiyRox is trusted by developers and teams worldwide.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>50k+</div>
            <div style={{ color: 'var(--text-secondary)' }}>Active Users</div>
          </div>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '8px' }}>2M+</div>
            <div style={{ color: 'var(--text-secondary)' }}>Code Completions Daily</div>
          </div>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-pink)', marginBottom: '8px' }}>99.9%</div>
            <div style={{ color: 'var(--text-secondary)' }}>Uptime SLA</div>
          </div>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>200k</div>
            <div style={{ color: 'var(--text-secondary)' }}>Token Context Window</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
