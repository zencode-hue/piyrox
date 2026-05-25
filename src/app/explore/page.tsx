'use client';

import React from 'react';
import Link from 'next/link';
import { assistants } from '@/lib/assistants';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">PiyRox</Link>
            <span className="text-gray-600 text-sm border-l border-gray-700 pl-3">Explore</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Chat
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Explore Assistants
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover specialized AI agents tailored for coding, writing, analysis, and more.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((bot) => (
            <Link href={`/chat/${bot.id}`} key={bot.id} className="group relative bg-[#111]/80 backdrop-blur-md rounded-3xl p-7 border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer overflow-hidden block">
              <div className={`absolute inset-0 bg-gradient-to-br ${bot.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-black/30 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {bot.icon}
                </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/10">
                    {bot.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{bot.title}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{bot.desc}</p>
                <div className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors flex items-center justify-center gap-2 group-hover:bg-white/10">
                  Start Chat <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
