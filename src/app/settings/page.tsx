'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [streamResponses, setStreamResponses] = useState(true);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'appearance', label: 'Appearance', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
    { id: 'ai', label: 'AI Preferences', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
    { id: 'danger', label: 'Danger Zone', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.04] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">PiyRox</Link>
            <span className="text-gray-600 text-sm border-l border-gray-700 pl-3">Settings</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Chat
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-10">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="md:w-56 flex-shrink-0">
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg border border-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-l-2xl"></div>}
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="bg-white/10 p-2 rounded-xl border border-white/5">👤</span>
                  Profile Information
                </h2>
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold border-4 border-[#111] shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform duration-300">
                    P
                  </div>
                  <div>
                    <button className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium border border-white/10">
                      Change Avatar
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[#111] border border-gray-800 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-[#151515] shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="user@piyrox.sbs"
                      className="w-full bg-[#111]/50 border border-gray-800/50 rounded-2xl px-5 py-4 text-gray-500 cursor-not-allowed shadow-inner"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> Email cannot be changed.</p>
                  </div>
                  <button
                    onClick={handleSave}
                    className="mt-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    {saved ? (
                      <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Saved Successfully!</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-purple-500/10 transition-colors duration-500"></div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="bg-white/10 p-2 rounded-xl border border-white/5">✨</span>
                  Appearance
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <h3 className="font-medium text-white">Dark Mode</h3>
                      <p className="text-sm text-gray-500 mt-1">Use dark theme across the interface.</p>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full transition-colors duration-300 relative border border-white/10 ${darkMode ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-[#111]'}`}>
                      <span className={`block w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 absolute top-0.5 ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <h3 className="font-medium text-white">Compact Messages</h3>
                      <p className="text-sm text-gray-500 mt-1">Reduce spacing between chat messages.</p>
                    </div>
                    <button onClick={() => setCompactMode(!compactMode)} className={`w-14 h-8 rounded-full transition-colors duration-300 relative border border-white/10 ${compactMode ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-[#111]'}`}>
                      <span className={`block w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 absolute top-0.5 ${compactMode ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-cyan-500/10 transition-colors duration-500"></div>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="bg-white/10 p-2 rounded-xl border border-white/5">🤖</span>
                  AI Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <h3 className="font-medium text-white">Stream Responses</h3>
                      <p className="text-sm text-gray-500 mt-1">Show AI responses as they are generated.</p>
                    </div>
                    <button onClick={() => setStreamResponses(!streamResponses)} className={`w-14 h-8 rounded-full transition-colors duration-300 relative border border-white/10 ${streamResponses ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-[#111]'}`}>
                      <span className={`block w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 absolute top-0.5 ${streamResponses ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="p-5 rounded-2xl border border-white/5 bg-black/20">
                    <h3 className="font-medium text-white mb-1">Default Model</h3>
                    <p className="text-sm text-gray-500 mb-5">Choose which model starts each new conversation.</p>
                    <div className="relative">
                      <select className="w-full bg-[#111] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:bg-[#151515] transition-all shadow-inner appearance-none">
                        <option value="piyrox-4">PiyRox-4 — Most capable</option>
                        <option value="piyrox-4o">PiyRox-4o — Fast & smart</option>
                        <option value="piyrox-3.5">PiyRox-3.5 — Quick responses</option>
                        <option value="jarvis-v3">Jarvis V3 — Advanced reasoning</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="bg-red-500/5 rounded-[2rem] p-8 md:p-10 border border-red-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-red-500/20 transition-colors duration-500"></div>
                <h2 className="text-2xl font-bold text-red-500 mb-2 flex items-center gap-3">
                  <span className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">⚠️</span>
                  Danger Zone
                </h2>
                <p className="text-red-400/80 text-sm mb-8">These actions are permanent and cannot be undone. Please proceed with caution.</p>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.05] transition-colors gap-4">
                    <div>
                      <h3 className="font-medium text-red-400">Clear all chat history</h3>
                      <p className="text-sm text-red-400/60 mt-1">Permanently delete all conversations from servers.</p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] shrink-0">
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.05] transition-colors gap-4">
                    <div>
                      <h3 className="font-medium text-red-400">Delete Account</h3>
                      <p className="text-sm text-red-400/60 mt-1">Remove your account and all associated data.</p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold border border-red-500 hover:bg-red-700 transition-all duration-300 text-sm shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 shrink-0">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
