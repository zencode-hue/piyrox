"use client";
import React, { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
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
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.size <= MAX_FILE_SIZE);
    setFiles((prev) => [...prev, ...arr].slice(0, MAX_FILES));
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const canSend = (input.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121]/95 to-transparent pt-8 pb-4 px-4">
      <div className="max-w-3xl mx-auto">
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#2f2f2f] border border-white/[0.08] rounded-xl text-xs text-gray-300 group">
                <span>{f.type.startsWith('image/') ? '🖼️' : '📎'}</span>
                <span className="truncate max-w-[120px]">{f.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-gray-500 hover:text-gray-200 transition-colors ml-1"
                  aria-label="Remove file"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input box */}
        <div
          className={`relative flex flex-col bg-[#2f2f2f] border rounded-2xl shadow-lg transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-white/[0.1] hover:border-white/[0.15]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message PiyRox..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-sm resize-none outline-none px-4 pt-4 pb-2 max-h-[200px] leading-6 disabled:opacity-50"
            style={{ minHeight: '52px' }}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.md"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"
                title="Attach files"
                disabled={disabled}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Image upload shortcut */}
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*';
                    fileInputRef.current.click();
                    fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.md';
                  }
                }}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"
                title="Upload image"
                disabled={disabled}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
            </div>

            {/* Send button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!canSend}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                canSend
                  ? 'bg-white text-black hover:bg-gray-200 shadow-sm'
                  : 'bg-white/[0.08] text-gray-600 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-2">
          PiyRox can make mistakes. Verify important information. · <a href="https://piyrox.sbs" className="hover:text-gray-400 transition-colors" target="_blank" rel="noopener noreferrer">piyrox.sbs</a>
        </p>
      </div>
    </div>
  );
}
