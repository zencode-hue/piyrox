"use client";
import React from 'react';
import { Model } from '@/types';

interface WelcomeScreenProps {
  model: Model;
  onPrompt: (content: string) => void;
}

export default function WelcomeScreen({ model, onPrompt }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-20">
      <h1 className="text-5xl font-bold text-white mb-2 text-center">
        What's on your mind today?
      </h1>
      <p className="text-gray-400 text-center mb-12">
        Chat with {model.name}
      </p>

      {/* Quick action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
        <button
          onClick={() => onPrompt('Explain how machine learning works')}
          className="flex items-start gap-3 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg text-left transition-all group"
        >
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-gray-100">Explain a concept</div>
            <div className="text-xs text-gray-500 mt-1">Help me understand a topic</div>
          </div>
        </button>

        <button
          onClick={() => onPrompt('Write a Python function to sort a list')}
          className="flex items-start gap-3 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg text-left transition-all group"
        >
          <span className="text-xl flex-shrink-0">💻</span>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-gray-100">Write code</div>
            <div className="text-xs text-gray-500 mt-1">Help me write or debug code</div>
          </div>
        </button>

        <button
          onClick={() => onPrompt('Write a professional email')}
          className="flex items-start gap-3 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg text-left transition-all group"
        >
          <span className="text-xl flex-shrink-0">✍️</span>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-gray-100">Draft content</div>
            <div className="text-xs text-gray-500 mt-1">Help me write something</div>
          </div>
        </button>

        <button
          onClick={() => onPrompt('Analyze this data for trends')}
          className="flex items-start gap-3 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg text-left transition-all group"
        >
          <span className="text-xl flex-shrink-0">📊</span>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-gray-100">Analyze data</div>
            <div className="text-xs text-gray-500 mt-1">Help me understand data</div>
          </div>
        </button>
      </div>
    </div>
  );
}
