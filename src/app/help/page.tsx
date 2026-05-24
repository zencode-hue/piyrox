'use client';

import React, { useState } from 'react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: 'getting-started',
      category: 'Getting Started',
      question: 'How do I get started with PiyRox Chat?',
      answer: 'Simply sign up for a free account, and you can start chatting immediately. No credit card required. You can ask questions, get help with writing, coding, analysis, and much more.',
    },
    {
      id: 'models',
      category: 'Models',
      question: 'What models are available?',
      answer: 'We offer several models: PiyRox-4 (most capable), PiyRox-4o (fast & smart), PiyRox-3.5 (quick responses), and Jarvis V3 (advanced). Different models are available based on your plan.',
    },
    {
      id: 'file-upload',
      category: 'Features',
      question: 'Can I upload files?',
      answer: 'Yes! You can upload various file types including documents, images, and code files. The Free plan has basic file upload support, while Plus and Pro plans have advanced file handling.',
    },
    {
      id: 'chat-history',
      category: 'Privacy',
      question: 'Is my chat history private?',
      answer: 'Yes, your chat history is encrypted and stored securely. Only you can access your chats. You can delete individual chats or your entire history at any time.',
    },
    {
      id: 'api-access',
      category: 'API',
      question: 'Is there an API available?',
      answer: 'Yes, API access is available for Pro plan subscribers. You can integrate PiyRox Chat into your applications. Check our documentation for details.',
    },
    {
      id: 'billing',
      category: 'Billing',
      question: 'How does billing work?',
      answer: 'We offer monthly and annual billing options. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate charges accordingly.',
    },
    {
      id: 'support',
      category: 'Support',
      question: 'How can I get support?',
      answer: 'Free plan users have access to community support. Plus and Pro users get priority email support. For urgent issues, Pro users can contact our dedicated support team.',
    },
    {
      id: 'export',
      category: 'Data',
      question: 'Can I export my chats?',
      answer: 'Yes, you can export your chats as JSON or PDF files. This is available for all paid plans. Go to Settings > Data Export to get started.',
    },
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions and get help
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative mb-8">
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
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {faq.category}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{faq.question}</h3>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-gray-400 transition-transform ${
                      expandedFaq === faq.id ? 'rotate-180' : ''
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No results found. Try a different search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still need help?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
