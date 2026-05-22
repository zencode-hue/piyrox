"use client";

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am PiyRox-4. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    // Simulate AI typing delay
    setTimeout(() => {
      const newAiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "I am a frontend simulation of PiyRox-4. The backend integration with OpenAI/Anthropic will replace this response soon." 
      };
      setMessages(prev => [...prev, newAiMsg]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100 font-sans">
      
      {/* Sidebar - ChatGPT Style */}
      <aside className="w-[260px] bg-[#171717] flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-gray-800">
        <div className="p-3">
          <button className="flex items-center gap-3 w-full hover:bg-gray-800 p-3 rounded-lg transition-colors border border-gray-700 bg-transparent text-sm">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New chat
          </button>
          
          <div className="mt-6 text-xs font-semibold text-gray-500 px-3 mb-3">Today</div>
          <div className="flex flex-col gap-1 overflow-y-auto">
            <button className="text-left truncate text-sm px-3 py-2 rounded-lg bg-gray-800 text-gray-200">
              PiyRox Chat Setup
            </button>
            <button className="text-left truncate text-sm px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400">
              React Framework Comparison
            </button>
          </div>
        </div>
        
        <div className="p-3 border-t border-gray-800">
          <button className="flex items-center gap-3 w-full hover:bg-gray-800 p-3 rounded-lg transition-colors text-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">P</div>
            Precious
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-14 flex items-center justify-center border-b border-gray-800 text-sm font-medium sticky top-0 bg-[#212121]/90 backdrop-blur-md z-10">
          PiyRox-4 <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs">Beta</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={`w-full ${msg.role === 'assistant' ? 'bg-[#212121]' : 'bg-[#212121]'}`}>
              <div className="max-w-3xl mx-auto flex gap-4 text-base md:gap-6 py-6 px-4 md:px-0">
                <div className="flex-shrink-0 flex flex-col relative items-end">
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-white">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/></svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">P</div>
                  )}
                </div>
                <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                  <div className="flex flex-grow flex-col gap-3">
                    <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-6">
          <form onSubmit={handleSubmit} className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-3xl">
            <div className="relative flex h-full flex-1 flex-col">
              <div className="flex flex-col w-full py-3 flex-grow md:py-4 md:pl-4 relative border border-gray-600/50 text-white bg-[#2f2f2f] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message PiyRox-4..."
                  className="m-0 w-full resize-none border-0 bg-transparent p-0 pl-3 pr-10 focus:ring-0 focus-visible:ring-0 md:pr-12 bg-transparent outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute p-1 rounded-md text-white bottom-2.5 right-2 md:bottom-3 md:right-3 hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors bg-white/10"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white"><path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </button>
              </div>
              <div className="text-center text-xs text-gray-500 mt-3">
                PiyRox can make mistakes. Consider verifying important information.
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
