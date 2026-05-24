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
    <div className={`fixed bottom-0 left-0 md:left-64 right-0 bg-gradient-to-t ${darkMode ? 'from-[#0a0a0a] via-[#0a0a0a] to-transparent' : 'from-white via-white to-transparent'} pt-8 pb-6 px-4 z-20`}>
      <div className="max-w-3xl mx-auto relative">
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

        <div className={`flex gap-3 px-4 py-3.5 rounded-3xl transition-all duration-300 shadow-xl border backdrop-blur-md ${darkMode ? 'bg-[#111111]/80 border-gray-800/80 hover:border-gray-700/80 shadow-black/40' : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:shadow-2xl'}`}>
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
            className={`flex-1 bg-transparent text-[15px] resize-none outline-none max-h-[200px] leading-6 py-1 ${darkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            style={{ minHeight: '32px' }}
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
            className={`p-2.5 rounded-full flex-shrink-0 transition-all duration-300 ${
              canSend ? (darkMode ? 'bg-white hover:bg-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-black hover:bg-gray-800 text-white shadow-md') : (darkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
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
