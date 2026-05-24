import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function ExplorePage() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      <Sidebar isOpen={true} onToggle={() => {}} onNewChat={() => {}} chats={[]} activeChatId="" onSelectChat={() => {}} onDeleteChat={() => {}} user={null} darkMode={true} onToggleDarkMode={() => {}} />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 px-8 py-12 max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Explore Assistants
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Discover powerful AI agents specialized in coding, writing, analysis, and more.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "React Expert", desc: "Builds modern React/Next.js components", icon: "⚛️", color: "from-blue-500/20 to-cyan-500/5" },
              { title: "Copywriter", desc: "Crafts engaging marketing copy", icon: "✍️", color: "from-pink-500/20 to-orange-500/5" },
              { title: "Data Analyst", desc: "Python expert for pandas and numpy", icon: "📊", color: "from-green-500/20 to-emerald-500/5" },
              { title: "UX Reviewer", desc: "Critiques designs for usability", icon: "🎨", color: "from-purple-500/20 to-indigo-500/5" },
              { title: "System Architect", desc: "Designs scalable backend systems", icon: "🏗️", color: "from-yellow-500/20 to-amber-500/5" },
              { title: "Security Auditor", desc: "Finds vulnerabilities in code", icon: "🔒", color: "from-red-500/20 to-rose-500/5" }
            ].map((bot, i) => (
              <div key={i} className="group relative bg-[#151515] rounded-3xl p-6 border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${bot.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-4 bg-black/30 w-16 h-16 flex items-center justify-center rounded-2xl border border-white/10 shadow-inner">
                    {bot.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{bot.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">{bot.desc}</p>
                  <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    Start Chat <span className="opacity-50">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
