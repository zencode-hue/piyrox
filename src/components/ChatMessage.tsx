"use client";
import React, { useState } from 'react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

function formatContent(content: string) {
  return content
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupol])/gm, '')
    .trim();
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
    <div className={`py-6 px-4 msg-animate ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {isUser ? 'You' : 'PiyRox'}
            </span>
            {!isUser && message.model && (
              <span className="text-xs text-gray-500">{message.model}</span>
            )}
          </div>

          {/* File attachments */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700">
                  <FileIcon type={f.type} />
                  <span className="truncate max-w-[160px]">{f.name}</span>
                  <span className="text-gray-500">{formatSize(f.size)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message text */}
          {isUser ? (
            <div className="text-gray-800 text-sm leading-7 whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div
              className="prose-chat text-gray-800 text-sm"
              dangerouslySetInnerHTML={{ __html: `<p>${formatContent(message.content)}</p>` }}
            />
          )}

          {/* Actions (assistant only) */}
          {!isUser && (
            <div className="flex items-center gap-1 mt-3 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-xs"
                title="Copy"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <span>🖼️</span>;
  if (type === 'application/pdf') return <span>📄</span>;
  if (type.includes('spreadsheet') || type.includes('excel')) return <span>📊</span>;
  if (type.includes('word') || type.includes('document')) return <span>📝</span>;
  return <span>📎</span>;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
