"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import WelcomeScreen from '@/components/WelcomeScreen';
import ModelSelector from '@/components/ModelSelector';
import { Message, Chat, Model } from '@/types';

const MODELS: Model[] = [
  { id: 'piyrox-4', name: 'PiyRox-4', desc: 'Most capable. Best for complex tasks.', badge: 'Best' },
  { id: 'piyrox-4o', name: 'PiyRox-4o', desc: 'Fast and intelligent. Supports images & files.', badge: 'Vision' },
  { id: 'piyrox-3.5', name: 'PiyRox-3.5', desc: 'Advanced reasoning and analysis.', badge: 'Reasoning' },
  { id: 'jarvis-v3', name: 'Jarvis V3', desc: 'Fast responses for everyday tasks.', badge: 'Fast' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function ChatPageContent() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 'default', title: 'New chat', messages: [], createdAt: Date.now() },
  ]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[1]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string; plan: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId)!;
  const messages = activeChat?.messages ?? [];

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
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
      const newTitle = isFirst
        ? content.slice(0, 40) + (content.length > 40 ? '...' : '')
        : activeChat.title;

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
          content: "I'm having trouble connecting right now. Please check your connection or try again.",
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
    setChats((prev) => [
      { id, title: 'New chat', messages: [], createdAt: Date.now() },
      ...prev,
    ]);
    setActiveChatId(id);
  };

  const deleteChat = (id: string) => {
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const newId = generateId();
        setActiveChatId(newId);
        return [{ id: newId, title: 'New chat', messages: [], createdAt: Date.now() }];
      }
      if (activeChatId === id) setActiveChatId(remaining[0].id);
      return remaining;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setChats([{ id: 'default', title: 'New chat', messages: [], createdAt: Date.now() }]);
      setActiveChatId('default');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
                aria-label="Open sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-gray-100">PiyRox Chat</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ModelSelector
              models={MODELS}
              selected={selectedModel}
              open={modelMenuOpen}
              onToggle={() => setModelMenuOpen((v) => !v)}
              onSelect={(m) => { setSelectedModel(m); setModelMenuOpen(false); }}
            />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:inline">{user.name}</span>
                </button>
                
                {showProfile && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-100">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                            <div className="text-xs text-indigo-400 mt-1">{user.plan}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300 hover:text-gray-100 w-full text-left"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Sign up
                </a>
              </div>
            )}

            <a href="https://piyrox.sbs" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
              piyrox.sbs
            </a>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-gray-950 pb-40">
          {messages.length === 0 ? (
            <WelcomeScreen model={selectedModel} onPrompt={sendMessage} />
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="py-8 px-6 animate-fadeIn">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full inline-block" />
                      <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full inline-block" />
                      <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full inline-block" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed input at bottom */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}

export default function ChatPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
