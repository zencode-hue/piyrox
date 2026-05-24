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

    // Check dark mode preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const updateChat = useCallback((chatId: string, updater: (c: Chat) => Chat) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)));
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
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
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
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0d0d0d]">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 dark:text-gray-300">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">PiyRox Chat</div>
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
              <div className="text-center max-w-2xl mx-auto px-4">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-4">What can I help you with?</div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Ask me anything or choose a topic below</p>
                
                {/* Quick action cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Create content</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Write a blog post, email, or story</div>
                  </button>
                  <button className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Analyze data</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Get insights from your data</div>
                  </button>
                  <button className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Code & debug</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Write, fix, or explain code</div>
                  </button>
                  <button className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Get advice</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ask for recommendations</div>
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
