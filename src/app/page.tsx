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
      <div className="ambient-light" />
      <Navbar />

      <header className="hero">
        <div className="hero-badge">PiyRox OS 2.0 is now available</div>
        <h1>Intelligence engineered<br />for the modern era.</h1>
        <p>
          We build agentic environments. From the world&apos;s first AI-native operating system
          to IDEs that write their own code, PiyRox is the ultimate platform for creators.
        </p>
        <div className="hero-buttons">
          <Link href="/download" className="btn btn-primary btn-large">Download PiyRox OS</Link>
          <Link href="/products" className="btn btn-secondary btn-large">Explore Platform</Link>
          <Link href="/docs" className="btn btn-secondary btn-large">Documentation</Link>
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
            icon="🤖"
            title="Jarvis OS"
            description="Your ambient AI assistant. Always available, securely integrated with your local filesystem, and capable of executing complex multi-step workflows directly on your machine."
            ctaLabel="Download EXE"
            ctaHref="/download"
            delay={0}
          />
          <PremiumCard
            icon="💻"
            title="PiyRox IDE"
            description="The first IDE built entirely around agentic capabilities. It doesn't just autocomplete; it reads your entire codebase, plans massive architectural features, and writes the code."
            ctaLabel="Download EXE"
            ctaHref="/download"
            delay={100}
          />
          <PremiumCard
            icon="💬"
            title="PiyRox Chat"
            description="The conversational powerhouse. Powered by our proprietary frontier models, optimized for deep reasoning, long-context analysis, and creative generation."
            ctaLabel="Open Chat"
            ctaHref="https://chat.piyrox.sbs"
            delay={200}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
