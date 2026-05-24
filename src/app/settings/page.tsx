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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none z-0"></div>

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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white shadow-sm border border-white/[0.05]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="bg-[#111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/[0.05] shadow-xl">
                <h2 className="text-xl font-bold mb-8">Profile Information</h2>
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold border-4 border-[#111] shadow-lg shadow-purple-500/20">
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
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="user@piyrox.sbs"
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                  >
                    {saved ? (
                      <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-[#111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/[0.05] shadow-xl">
                <h2 className="text-xl font-bold mb-8">Appearance</h2>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-5 border-b border-gray-800/50">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Use dark theme across the interface.</p>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${darkMode ? 'bg-purple-500' : 'bg-gray-700'}`}>
                      <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 absolute top-1 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-5">
                    <div>
                      <h3 className="font-medium">Compact Messages</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Reduce spacing between chat messages.</p>
                    </div>
                    <button onClick={() => setCompactMode(!compactMode)} className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${compactMode ? 'bg-purple-500' : 'bg-gray-700'}`}>
                      <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 absolute top-1 ${compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-[#111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/[0.05] shadow-xl">
                <h2 className="text-xl font-bold mb-8">AI Preferences</h2>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-5 border-b border-gray-800/50">
                    <div>
                      <h3 className="font-medium">Stream Responses</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Show AI responses as they are generated.</p>
                    </div>
                    <button onClick={() => setStreamResponses(!streamResponses)} className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${streamResponses ? 'bg-purple-500' : 'bg-gray-700'}`}>
                      <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 absolute top-1 ${streamResponses ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="py-5">
                    <h3 className="font-medium mb-2">Default Model</h3>
                    <p className="text-sm text-gray-500 mb-4">Choose which model starts each new conversation.</p>
                    <select className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="piyrox-4">PiyRox-4 — Most capable</option>
                      <option value="piyrox-4o">PiyRox-4o — Fast & smart</option>
                      <option value="piyrox-3.5">PiyRox-3.5 — Quick responses</option>
                      <option value="jarvis-v3">Jarvis V3 — Advanced reasoning</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="bg-red-500/5 rounded-3xl p-8 border border-red-500/20">
                <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
                <p className="text-red-400/60 text-sm mb-8">These actions are irreversible. Please be certain.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-red-500/10">
                    <div>
                      <h3 className="font-medium text-red-400">Clear all chat history</h3>
                      <p className="text-sm text-red-400/50 mt-0.5">Permanently delete all conversations.</p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm">
                      Clear History
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-medium text-red-400">Delete Account</h3>
                      <p className="text-sm text-red-400/50 mt-0.5">Remove your account and all data.</p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm">
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
