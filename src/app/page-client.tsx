"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
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

  if (loadingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        {/* Top section */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link
            href="/search"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Search chats
          </Link>

          <Link
            href="/images"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            Images
          </Link>
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href="/pricing"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            See plans and pricing
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
            </svg>
            Settings
          </Link>

          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            Help
          </Link>
        </div>

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
          <div className="text-sm font-medium text-gray-900">ChatGPT</div>
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <a href="/login" className="text-sm text-gray-700 hover:text-gray-900">
                  Log in
                </a>
                <a href="/signup" className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                  Sign up for free
                </a>
              </>
            ) : (
              <div className="text-sm text-gray-700">{user.name}</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-40">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">What's on your mind today?</div>
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
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex gap-1 pt-2">
                      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
