"use client";
import React, { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && files.length === 0) || disabled) return;
    onSend(input.trim(), files.length > 0 ? files : undefined);
    setInput('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).slice(0, 5);
    setFiles((prev) => [...prev, ...arr].slice(0, 5));
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = (input.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent pt-4 pb-6 px-4">
      <div className="max-w-3xl mx-auto">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-4">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400">
                <span>{f.type.startsWith('image/') ? '🖼️' : '📎'}</span>
                <span className="truncate max-w-[100px]">{f.name}</span>
                <button onClick={() => removeFile(i)} className="text-gray-600 hover:text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            disabled={disabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm resize-none outline-none max-h-[200px] leading-6"
            style={{ minHeight: '44px' }}
          />

          <button
            onClick={() => handleSubmit()}
            disabled={!canSend}
            className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
              canSend ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
