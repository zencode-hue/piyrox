"use client";
import React, { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
  darkMode?: boolean;
}

export default function ChatInput({ onSend, disabled, darkMode }: ChatInputProps) {
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
    <div className={`fixed bottom-0 left-64 right-0 bg-gradient-to-t ${darkMode ? 'from-[#0d0d0d] via-[#0d0d0d] to-transparent' : 'from-white via-white to-transparent'} pt-4 pb-6 px-4`}>
      <div className="max-w-3xl mx-auto">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-4">
            {files.map((f, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-gray-100 border border-gray-300 text-gray-700'}`}>
                <span>{f.type.startsWith('image/') ? '🖼️' : '📎'}</span>
                <span className="truncate max-w-[100px]">{f.name}</span>
                <button onClick={() => removeFile(i)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`flex gap-3 px-4 py-3 rounded-2xl hover:border-gray-400 transition-colors shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-300 hover:border-gray-400'}`}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
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
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            className={`flex-1 bg-transparent text-sm resize-none outline-none max-h-[200px] leading-6 ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
            style={{ minHeight: '44px' }}
          />

          <button
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            title="Voice input"
            disabled={disabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          <button
            onClick={() => handleSubmit()}
            disabled={!canSend}
            className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
              canSend ? (darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white') : (darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
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
