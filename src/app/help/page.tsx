'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: 'How do I switch between AI models?', a: 'Use the model selector dropdown in the top header of the chat interface. You can choose from PiyRox-4, PiyRox-4o, PiyRox-3.5, and Jarvis V3.' },
    { q: 'How do I enable dark mode?', a: 'Click the moon/sun icon in the sidebar, or go to Settings > Appearance to toggle dark mode.' },
    { q: 'Can I export my chat history?', a: 'This feature is coming soon. Currently your chats are saved to your account and persist across sessions.' },
    { q: 'What AI models are available?', a: 'We offer PiyRox-4 (most capable), PiyRox-4o (fast & smart), PiyRox-3.5 (quick responses), and Jarvis V3 (advanced reasoning). All are free to use.' },
    { q: 'How do I upload images?', a: 'Navigate to the Images page from the sidebar. You can drag-and-drop images or click "Browse Files" to upload.' },
    { q: 'Is there a desktop app?', a: 'Yes! Piyrox IDE is our AI-powered desktop development environment. Visit the main website to download it.' },
  ];

  const filteredFaqs = searchQuery.trim()
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">PiyRox</Link>
            <span className="text-gray-600 text-sm border-l border-gray-700 pl-3">Help Center</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Chat
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            How can we help?
          </h1>
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: 'Getting Started', desc: 'Learn the basics of Piyrox', icon: <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: 'from-blue-500/20 to-cyan-500/5' },
            { title: 'Using the IDE', desc: 'Desktop app and workspace tools', icon: <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: 'from-purple-500/20 to-indigo-500/5' },
            { title: 'Billing & Plans', desc: 'Manage your subscription', icon: <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, color: 'from-green-500/20 to-emerald-500/5' },
          ].map((item, i) => (
            <div key={i} className="group relative bg-[#111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-black/30 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-[#111]/80 backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/[0.03] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 text-gray-500">No results found for &quot;{searchQuery}&quot;</div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl p-10 border border-blue-500/10 text-center">
          <h3 className="text-2xl font-bold mb-3">Still need help?</h3>
          <p className="text-gray-400 mb-6">Our support team is here for you.</p>
          <a href="mailto:support@piyrox.sbs" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25">
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
