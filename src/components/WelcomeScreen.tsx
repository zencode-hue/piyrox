"use client";
import React from 'react';
import { Model } from '@/types';

interface WelcomeScreenProps {
  model: Model;
  onPrompt: (content: string) => void;
}

const SUGGESTIONS = [
  { icon: '💡', label: 'Explain a concept', prompt: 'Explain how large language models work in simple terms' },
  { icon: '💻', label: 'Write code', prompt: 'Write a Python function to scrape a webpage and extract all links' },
  { icon: '✍️', label: 'Draft content', prompt: 'Write a professional email to a client about a project delay' },
  { icon: '🔍', label: 'Analyze data', prompt: 'Help me analyze this dataset and identify key trends' },
  { icon: '🧠', label: 'Brainstorm ideas', prompt: 'Give me 10 creative startup ideas in the AI space for 2026' },
  { icon: '📋', label: 'Summarize text', prompt: 'Summarize the key points from a long document I\'ll paste' },
];

export default function WelcomeScreen({ model, onPrompt }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
        How can I help you today?
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        You&apos;re chatting with <span className="text-gray-300 font-medium">{model.name}</span>
      </p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onPrompt(s.prompt)}
            className="flex items-start gap-3 p-4 bg-[#2f2f2f] hover:bg-[#383838] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl text-left transition-all group"
          >
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <div>
              <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.prompt}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Back to homepage link */}
      <div className="mt-12 flex items-center gap-4 text-xs text-gray-600">
        <a href="https://piyrox.sbs" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
          piyrox.sbs
        </a>
        <span>·</span>
        <a href="https://piyrox.sbs/pricing" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
          Upgrade to Pro
        </a>
        <span>·</span>
        <a href="https://piyrox.sbs/products" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
          All Products
        </a>
      </div>
    </div>
  );
}
