"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Sidebar from '@/components/Sidebar';
import { Message, Chat, Model } from '@/types';

const MODELS: Model[] = [
  { id: 'piyrox-4', name: 'PiyRox-4', desc: 'Most capable', badge: null },
  { id: 'piyrox-4o', name: 'PiyRox-4o', desc: 'Fast & smart', badge: null },
  { id: 'piyrox-3.5', name: 'PiyRox-3.5', desc: 'Quick responses', badge: null },
  { id: 'jarvis-v3', name: 'Jarvis V3', desc: 'Advanced', badge: null },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPageClient() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 'default', title: 'New chat', messages: [], createdAt: Date.now() },
  ]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string; plan: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId)!;
  const messages = activeChat?.messages ?? [];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();

    const loadChats = async () => {
      try {
        const res = await fetch('/api/chats');
        const data = await res.json();
        if (data.success && data.chats && data.chats.length > 0) {
          // Parse messages if it's a string, DB might return JSON
          const loadedChats = data.chats.map((c: any) => ({
            ...c,
            messages: typeof c.messages === 'string' ? JSON.parse(c.messages) : c.messages
          }));
          setChats(loadedChats);
          setActiveChatId(loadedChats[0].id);
        }
      } catch (e) {
        console.error('Failed to load chats:', e);
      }
    };
    loadChats();

    // Check dark mode preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const updateChat = useCallback((chatId: string, updater: (c: Chat) => Chat) => {
    setChats((prev) => {
      const next = prev.map((c) => (c.id === chatId ? updater(c) : c));
      const updatedChat = next.find(c => c.id === chatId);
      if (updatedChat) {
        fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedChat),
        }).catch(e => console.error('Error saving chat:', e));
      }
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        files: files?.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        timestamp: Date.now(),
      };

      const isFirst = messages.length === 0;
      const newTitle = isFirst ? content.slice(0, 40) + (content.length > 40 ? '...' : '') : activeChat.title;

      updateChat(activeChatId, (c) => ({
        ...c,
        title: newTitle,
        messages: [...c.messages, userMsg],
      }));

      setIsTyping(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
            model: selectedModel.id,
            prompt: content,
          }),
        });

        const data = await res.json();
        const assistantMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.content || data.message || 'Sorry, I could not generate a response.',
          timestamp: Date.now(),
          model: selectedModel.id,
        };

        updateChat(activeChatId, (c) => ({
          ...c,
          messages: [...c.messages, assistantMsg],
        }));
      } catch {
        const errMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: "I'm having trouble connecting. Please try again.",
          timestamp: Date.now(),
          model: selectedModel.id,
        };
        updateChat(activeChatId, (c) => ({
          ...c,
          messages: [...c.messages, errMsg],
        }));
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, messages, selectedModel, activeChat, updateChat]
  );

  const newChat = () => {
    const id = generateId();
    setChats((prev) => [{ id, title: 'New chat', messages: [], createdAt: Date.now() }, ...prev]);
    setActiveChatId(id);
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(chats[0]?.id || 'default');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  if (loadingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d]">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={newChat}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onDeleteChat={deleteChat}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] shadow-xl rounded-l-3xl overflow-hidden border-l border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="h-16 backdrop-blur-md bg-white/70 dark:bg-[#0a0a0a]/70 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 dark:text-gray-300">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">PiyRox Chat</div>
            <div className="ml-4 flex items-center bg-gray-100 dark:bg-[#1a1a1a] rounded-lg px-2 py-1">
              <select
                value={selectedModel.id}
                onChange={(e) => setSelectedModel(MODELS.find(m => m.id === e.target.value) || MODELS[0])}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none border-none cursor-pointer focus:ring-0"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-[#1a1a1a]">{m.name} - {m.desc}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <a href="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Log in
                </a>
                <a href="/signup" className="text-sm bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Sign up
                </a>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                <a href="/api/auth/logout" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-40">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-3xl mx-auto px-4 mt-20">
                <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6 tracking-tight">What can I help you with?</div>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 font-medium">Ask me anything or choose a topic below</p>
                
                {/* Quick action cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => sendMessage("Write a blog post, email, or story")} className="p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 dark:hover:bg-gray-800/80 transition-all duration-300 text-left group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">Create content</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Write a blog post, email, or story</div>
                  </button>
                  <button onClick={() => sendMessage("Analyze data and find insights")} className="p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 dark:hover:bg-gray-800/80 transition-all duration-300 text-left group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">Analyze data</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Get insights from your data</div>
                  </button>
                  <button onClick={() => sendMessage("Write, fix, or explain this code:")} className="p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 dark:hover:bg-gray-800/80 transition-all duration-300 text-left group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">Code & debug</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Write, fix, or explain code</div>
                  </button>
                  <button onClick={() => sendMessage("Can you give me some advice or recommendations on...")} className="p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 dark:hover:bg-gray-800/80 transition-all duration-300 text-left group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">Get advice</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ask for recommendations</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="py-6 px-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex gap-1 pt-2">
                      <span className="typing-dot w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isTyping} darkMode={darkMode} />
      </div>
    </div>
  );
}
