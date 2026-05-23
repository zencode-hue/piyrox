"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ModelSelector from '@/components/ModelSelector';
import WelcomeScreen from '@/components/WelcomeScreen';
import { Message, Chat, Model } from '@/types';

const MODELS: Model[] = [
  { id: 'piyrox-4', name: 'PiyRox-4', desc: 'Most capable. Best for complex tasks.', badge: 'Pro' },
  { id: 'piyrox-4o', name: 'PiyRox-4o', desc: 'Fast and intelligent. Great for most tasks.', badge: null },
  { id: 'jarvis-v3', name: 'Jarvis V3', desc: 'Advanced reasoning and analysis.', badge: 'Pro' },
  { id: 'piyrox-3.5', name: 'PiyRox-3.5', desc: 'Fast responses for everyday tasks.', badge: null },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 'default', title: 'New chat', messages: [], createdAt: Date.now() },
  ]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[1]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId)!;
  const messages = activeChat?.messages ?? [];

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

      // Auto-title the chat from first message
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
          content: "I'm having trouble connecting right now. Please check your API configuration or try again.",
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121]">
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
        <header className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06] bg-[#212121]/90 backdrop-blur-md flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
                aria-label="Open sidebar"
              >
                <IconMenu />
              </button>
            )}
            <ModelSelector
              models={MODELS}
              selected={selectedModel}
              open={modelMenuOpen}
              onToggle={() => setModelMenuOpen((v) => !v)}
              onSelect={(m) => { setSelectedModel(m); setModelMenuOpen(false); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://piyrox.sbs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors hidden sm:block"
            >
              piyrox.sbs ↗
            </a>
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              P
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen model={selectedModel} onPrompt={sendMessage} />
          ) : (
            <div className="pb-36">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="py-6 px-4">
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
                      <IconPiyRox />
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
                      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
                      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
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

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconPiyRox() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
