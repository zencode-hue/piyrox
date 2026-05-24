'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulate search results
    setTimeout(() => {
      setSearchResults([
        {
          id: 1,
          title: 'How to use PiyRox Chat',
          preview: 'Learn the basics of using PiyRox Chat for your daily tasks...',
          date: '2 days ago',
          type: 'article',
        },
        {
          id: 2,
          title: 'Advanced features guide',
          preview: 'Explore advanced features like custom instructions and API access...',
          date: '1 week ago',
          type: 'guide',
        },
        {
          id: 3,
          title: 'Pricing and plans',
          preview: 'Compare our different pricing plans and find the best one for you...',
          date: '3 days ago',
          type: 'pricing',
        },
      ]);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Search Chats</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find your previous conversations
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search your chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="flex gap-1">
                    <span className="typing-dot w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
                  </div>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Found {searchResults.length} results
                </p>
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href="/"
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{result.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{result.preview}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{result.date}</p>
                  </Link>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No results found</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Start typing to search your chats</p>
          </div>
        )}
      </div>
    </div>
  );
}
