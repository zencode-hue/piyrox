import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function HelpPage() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      <Sidebar isOpen={true} onToggle={() => {}} onNewChat={() => {}} chats={[]} activeChatId="" onSelectChat={() => {}} onDeleteChat={() => {}} user={null} darkMode={true} onToggleDarkMode={() => {}} />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 px-8 py-16 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            How can we help?
          </h1>
          
          <div className="relative max-w-2xl mx-auto mb-16">
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full bg-[#151515] border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xl"
            />
            <button className="absolute right-3 top-3 p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#151515] rounded-3xl p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Getting Started</h3>
              <p className="text-gray-400 text-sm">Learn the basics of Piyrox, how to prompt effectively, and navigate the interface.</p>
            </div>

            <div className="bg-[#151515] rounded-3xl p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Using the IDE</h3>
              <p className="text-gray-400 text-sm">Connect your desktop app, orchestrate AI agents, and manage workspaces.</p>
            </div>

            <div className="bg-[#151515] rounded-3xl p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Billing & Pricing</h3>
              <p className="text-gray-400 text-sm">Manage your Pro subscription, update payment methods, and view usage limits.</p>
            </div>

            <div className="bg-[#151515] rounded-3xl p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Support Contact</h3>
              <p className="text-gray-400 text-sm">Can't find what you need? Reach out directly to the Piyrox support team.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
