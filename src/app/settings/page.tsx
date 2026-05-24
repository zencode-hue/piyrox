import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      <Sidebar isOpen={true} onToggle={() => {}} onNewChat={() => {}} chats={[]} activeChatId="" onSelectChat={() => {}} onDeleteChat={() => {}} user={null} darkMode={true} onToggleDarkMode={() => {}} />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
        
        <div className="relative z-10 px-8 py-12 max-w-4xl mx-auto">
          <header className="mb-10 border-b border-white/[0.05] pb-6">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account settings and preferences.</p>
          </header>

          <div className="space-y-12">
            {/* Profile Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profile
              </h2>
              <div className="bg-[#151515] rounded-3xl p-8 border border-white/[0.05] shadow-lg">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold border-4 border-[#0a0a0a]">
                    J
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium border border-white/10">
                      Upload Avatar
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max 2MB.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                    <input type="text" defaultValue="John Doe" className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input type="email" defaultValue="john@example.com" className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white opacity-50 cursor-not-allowed" disabled />
                  </div>
                  <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25">
                    Save Changes
                  </button>
                </div>
              </div>
            </section>

            {/* Appearance Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                Appearance
              </h2>
              <div className="bg-[#151515] rounded-3xl p-8 border border-white/[0.05] shadow-lg">
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <div>
                    <h3 className="font-medium text-white">Theme</h3>
                    <p className="text-sm text-gray-400">Select your interface color scheme.</p>
                  </div>
                  <div className="flex bg-black/50 p-1 rounded-xl border border-gray-800">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">Light</button>
                    <button className="px-4 py-2 rounded-lg bg-white/10 shadow text-white text-sm font-medium">Dark</button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">System</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-white">Compact Mode</h3>
                    <p className="text-sm text-gray-400">Reduce spacing between chat messages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>
            </section>
            
            {/* Danger Zone */}
            <section>
              <div className="bg-red-500/5 rounded-3xl p-8 border border-red-500/20">
                <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-red-400/70 text-sm mb-6">Irreversible actions for your account.</p>
                <button className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
