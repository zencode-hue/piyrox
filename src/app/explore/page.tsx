'use client';

import React from 'react';
import Link from 'next/link';

export default function ExplorePage() {
  const categories = [
    {
      title: 'Writing',
      description: 'Get help with writing, editing, and brainstorming',
      icon: '✍️',
      items: ['Blog post', 'Email', 'Story', 'Poem', 'Script'],
    },
    {
      title: 'Analysis',
      description: 'Analyze data, trends, and patterns',
      icon: '📊',
      items: ['Data analysis', 'Market research', 'Trend analysis', 'Report writing'],
    },
    {
      title: 'Coding',
      description: 'Write, debug, and explain code',
      icon: '💻',
      items: ['Python', 'JavaScript', 'React', 'SQL', 'Debugging'],
    },
    {
      title: 'Learning',
      description: 'Learn new concepts and skills',
      icon: '📚',
      items: ['Explain concept', 'Tutorial', 'Quiz', 'Study guide'],
    },
    {
      title: 'Business',
      description: 'Business planning and strategy',
      icon: '💼',
      items: ['Business plan', 'Marketing', 'Sales pitch', 'Strategy'],
    },
    {
      title: 'Creative',
      description: 'Unleash your creativity',
      icon: '🎨',
      items: ['Brainstorm ideas', 'Design concepts', 'Creative writing'],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Explore</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover what you can do with PiyRox Chat
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.title}
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {category.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <Link
                    key={item}
                    href="/"
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
