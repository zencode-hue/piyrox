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
        <div className="text-xs font-semibold text-gray-500 px-3 mb-1 uppercase tracking-wider">{label}</div>
        {items.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
              chat.id === activeChatId
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={() => onSelectChat(chat.id)}
            onMouseEnter={() => setHoveredId(chat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="truncate flex-1">{chat.title}</span>
            {(hoveredId === chat.id || chat.id === activeChatId) && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="ml-2 p-1 rounded hover:bg-gray-300 text-gray-600 hover:text-gray-900 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        flex flex-col h-full w-[260px] bg-white border-r border-gray-200
        transition-transform duration-250 ease-in-out flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full md:-translate-x-full md:w-0 md:border-0'}
      `}
    >
      {/* Top */}
      <div className="flex items-center justify-between p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">PiyRox Chat</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Close sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* New chat */}
      <div className="px-3 mb-3 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-gray-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {renderGroup('Today', groups.today)}
        {renderGroup('Yesterday', groups.yesterday)}
        {renderGroup('Previous 7 days', groups.week)}
        {renderGroup('Older', groups.older)}
        {chats.length === 0 && (
          <p className="text-xs text-gray-500 text-center mt-8 px-4">No conversations yet. Start a new chat!</p>
        )}
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <a
          href="https://piyrox.sbs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-gray-900"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">P</div>
          <span className="truncate">piyrox.sbs</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
