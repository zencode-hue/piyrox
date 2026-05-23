"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
      <div className="w-full h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <button onClick={newChat} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-300">PiyRox Chat</span>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedModel.id}
              onChange={(e) => setSelectedModel(MODELS.find((m) => m.id === e.target.value) || MODELS[0])}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:border-gray-600 transition-colors"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-400">{user.name}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <a href="/login" className="text-sm text-gray-400 hover:text-gray-200">
                  Log in
                </a>
                <a href="/signup" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg">
                  Sign up
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-40">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-100 mb-2">Start a conversation</div>
                <div className="text-gray-500">Ask me anything</div>
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
                      <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full" />
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
