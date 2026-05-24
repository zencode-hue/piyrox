"use client";
import React, { useState } from 'react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-6 px-4 ${isUser ? 'bg-white dark:bg-[#0d0d0d]' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{isUser ? 'You' : 'PiyRox'}</span>
            {!isUser && message.model && <span className="text-xs text-gray-500 dark:text-gray-400">{message.model}</span>}
          </div>

          {isUser ? (
            <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-7 whitespace-pre-wrap">{message.content}</div>
          )}

          {!isUser && (
            <button
              onClick={handleCopy}
              className="mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
