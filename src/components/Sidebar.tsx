"use client";
import React, { useState } from 'react';
import { Chat } from '@/types';

interface SidebarProps {
  open: boolean;
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

function groupChats(chats: Chat[]) {
  const now = Date.now();
  const day = 86400000;
  const today: Chat[] = [], yesterday: Chat[] = [], week: Chat[] = [], older: Chat[] = [];
  chats.forEach((c) => {
    const age = now - c.createdAt;
    if (age < day) today.push(c);
    else if (age < 2 * day) yesterday.push(c);
    else if (age < 7 * day) week.push(c);
    else older.push(c);
  });
  return { today, yesterday, week, older };
}

export default function Sidebar({ open, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onClose }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const groups = groupChats(chats);

  const renderGroup = (label: string, items: Chat[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-4">
        <div className="text-xs font-semibold text-gray-600 px-3 mb-2 uppercase tracking-wider">{label}</div>
        {items.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
              chat.id === activeChatId
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
            onClick={() => onSelectChat(chat.id)}
            onMouseEnter={() => setHoveredId(chat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="truncate flex-1">{chat.title}</span>
            {(hoveredId === chat.id || chat.id === activeChatId) && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="ml-2 p-1 rounded hover:bg-red-600/20 text-gray-500 hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed md:relative z-30 md:z-auto
        flex flex-col h-full w-[260px] bg-black border-r border-gray-800
        transition-transform duration-250 ease-in-out flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full md:-translate-x-full md:w-0 md:border-0'}
      `}
    >
      {/* Top */}
      <div className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-semibold text-white">PiyRox</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-900 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Close sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-4 flex-shrink-0 border-b border-gray-800">
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-900 hover:border-gray-600 transition-colors text-sm text-gray-300 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New chat
        </button>

        <div className="mt-3 space-y-2">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm text-gray-400 hover:text-gray-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Search chats
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm text-gray-400 hover:text-gray-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            Images
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {renderGroup('Today', groups.today)}
        {renderGroup('Yesterday', groups.yesterday)}
        {renderGroup('Previous 7 days', groups.week)}
        {renderGroup('Older', groups.older)}
        {chats.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-8 px-4">No conversations yet</p>
        )}
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 flex-shrink-0 space-y-2">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm text-gray-400 hover:text-gray-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
          Settings
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm text-gray-400 hover:text-gray-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          Help
        </button>
      </div>
    </aside>
  );
}
