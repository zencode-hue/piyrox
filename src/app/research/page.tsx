'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const papers = [
  {
    title: 'Agentic Reasoning at Scale: The Jarvis Architecture',
    date: 'October 2026',
    desc: 'We introduce the Jarvis architecture — a novel approach to building ambient AI agents that operate directly on local filesystems with full context awareness and multi-step planning capabilities.',
    tags: ['Agents', 'Architecture', 'Reasoning'],
  },
  {
    title: 'PiyRox-4 Technical Report',
    date: 'September 2026',
    desc: 'A comprehensive overview of PiyRox-4, our latest frontier language model. We detail the training methodology, safety evaluations, and benchmark results across coding, reasoning, and creative tasks.',
    tags: ['Language Models', 'Safety', 'Benchmarks'],
  },
  {
    title: 'IDE-Native Agents: Rethinking the Developer Workflow',
    date: 'August 2026',
    desc: 'We present a new paradigm for AI-assisted software development where the agent has full codebase context, can plan architectural changes, and executes multi-file edits with rollback capabilities.',
    tags: ['IDE', 'Agents', 'Developer Tools'],
  },
  {
    title: 'Long-Context Efficiency in Transformer Models',
    date: 'July 2026',
    desc: 'Our research on extending effective context windows to 200k tokens while maintaining inference efficiency. We introduce sparse attention patterns that reduce quadratic complexity without quality loss.',
    tags: ['Transformers', 'Efficiency', 'Context'],
  },
];

export default function Research() {
  return (
    <>
      <Navbar activePage="research" />

      <div className="page-header">
        <h1>Research</h1>
        <p>Advancing the science of artificial intelligence. Our work is open and peer-reviewed.</p>
      </div>

      <section style={{ borderTop: 'none', paddingTop: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {papers.map((paper) => (
            <div key={paper.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '36px', transition: 'border-color 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.02em', maxWidth: '700px' }}>{paper.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{paper.date}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }}>{paper.desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {paper.tags.map((tag) => (
                  <span key={tag} style={{ padding: '4px 12px', background: 'rgba(42,138,246,0.08)', border: '1px solid rgba(42,138,246,0.15)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
