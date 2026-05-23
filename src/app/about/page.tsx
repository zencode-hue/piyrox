import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <>
      <Navbar activePage="about" />

      <div className="page-header">
        <h1>About PiyRox</h1>
        <p>We are building the infrastructure for the agentic era of computing.</p>
      </div>

      <section style={{ borderTop: 'none', paddingTop: '0' }}>
        <div style={{ maxWidth: '760px' }}>
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '24px' }}>Our Mission</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
              PiyRox AI Lab was founded on a single conviction: the next era of computing is agentic.
              AI won&apos;t just answer questions — it will take actions, write code, manage systems,
              and operate autonomously on behalf of humans.
            </p>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              We build the tools that make this possible. From Jarvis OS — an AI that lives on your
              machine — to PiyRox IDE, which doesn&apos;t just suggest code but architects entire systems,
              every product we ship is designed to give humans more leverage over their digital world.
            </p>
          </div>

          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '24px' }}>Our Values</h2>
            {[
              { title: 'Safety First', desc: 'Every model we ship is evaluated for safety before release. We believe powerful AI and responsible AI are not in conflict.' },
              { title: 'Radical Transparency', desc: 'We publish our research, document our limitations, and are honest about what our models can and cannot do.' },
              { title: 'Builder-Focused', desc: 'We build for creators, developers, and makers. Our products are designed to give builders superpowers, not replace them.' },
              { title: 'Long-Term Thinking', desc: 'We optimize for the long-term benefit of humanity, not short-term metrics. We are building for the next 50 years.' },
            ].map((v) => (
              <div key={v.title} style={{ padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '24px' }}>Contact</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              For press inquiries, partnerships, or general questions, reach us at{' '}
              <a href="mailto:support@piyrox.sbs" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>support@piyrox.sbs</a>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
