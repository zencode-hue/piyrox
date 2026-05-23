"use client";
import React, { useRef, useEffect } from 'react';
import { Model } from '@/types';

interface ModelSelectorProps {
  models: Model[];
  selected: Model;
  open: boolean;
  onToggle: () => void;
  onSelect: (model: Model) => void;
}

export default function ModelSelector({ models, selected, open, onToggle, onSelect }: ModelSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open) onToggle();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors text-sm font-semibold text-white"
      >
        {selected.name}
        {selected.badge && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">
            {selected.badge}
          </span>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wider">Model</div>
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelect(model)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                  selected.id === model.id
                    ? 'bg-white/[0.08] text-white'
                    : 'hover:bg-white/[0.05] text-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{model.name}</span>
                    {model.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">
                        {model.badge}
                      </span>
                    )}
                    {selected.id === model.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-blue-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{model.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-white/[0.06] p-3">
            <a
              href="https://piyrox.sbs/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors text-xs text-gray-400 hover:text-gray-200"
            >
              <span>Upgrade to Pro for all models</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
