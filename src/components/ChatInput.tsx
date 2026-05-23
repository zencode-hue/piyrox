"use client";
import React, { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent pt-6 pb-6 px-4 z-40">
      <div className="max-w-4xl mx-auto">
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 px-4">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300">
                <span>{f.type.startsWith('image/') ? '🖼️' : '📎'}</span>
                <span className="truncate max-w-[120px]">{f.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-gray-500 hover:text-gray-300 transition-colors ml-1"
                  aria-label="Remove file"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input container */}
        <div
          className={`flex items-end gap-3 px-4 py-3 bg-gray-900 border rounded-2xl transition-all ${
            dragOver ? 'border-indigo-500 bg-indigo-950/10' : 'border-gray-800 hover:border-gray-700'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {/* File upload button */}
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
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            title="Attach files"
            disabled={disabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message PiyRox..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm resize-none outline-none max-h-[200px] leading-6 disabled:opacity-50"
            style={{ minHeight: '44px' }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!canSend}
            className={`p-2 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              canSend
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-3">
          PiyRox can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
