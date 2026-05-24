'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: '💬',
      title: 'Natural Conversations',
      description: 'Chat naturally with AI that understands context and nuance',
    },
    {
      icon: '📝',
      title: 'Content Creation',
      description: 'Write, edit, and brainstorm with AI assistance',
    },
    {
      icon: '💻',
      title: 'Code Help',
      description: 'Get help with coding, debugging, and learning',
    },
    {
      icon: '📊',
      title: 'Data Analysis',
      description: 'Analyze data and get insights instantly',
    },
    {
      icon: '🎨',
      title: 'Creative Tools',
      description: 'Generate ideas and creative content',
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your conversations are encrypted and private',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      text: 'PiyRox Chat has transformed how I work. It\'s like having a brilliant colleague available 24/7.',
      avatar: '👩‍💼',
    },
    {
      name: 'Alex Rodriguez',
      role: 'Developer',
      text: 'The coding assistance is incredible. It saves me hours every week on debugging and learning.',
      avatar: '👨‍💻',
    },
    {
      name: 'Emma Wilson',
      role: 'Writer',
      text: 'Finally, an AI that understands creative writing. It\'s my perfect writing partner.',
      avatar: '👩‍🎨',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">PiyRox Chat</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            The AI that works the way you think
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            PiyRox Chat is your AI assistant for writing, coding, analysis, and creative work. 
            Get instant help with anything you're working on.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">
              Get started free
            </Link>
            <Link href="/pricing" className="px-8 py-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 font-semibold transition-colors">
              View pricing
            </Link>
          </div>
        </div>

        {/* Demo Area */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 mb-20">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  You
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">
                    Help me write a professional email to my manager about a project update
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  P
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white mb-3">
                    Here's a professional email template for your project update:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-700 dark:text-gray-300">
                    <p className="mb-2">Subject: Project Update - Q1 Deliverables</p>
                    <p>Dear [Manager's Name],</p>
                    <p className="mt-2">I wanted to provide you with an update on our current project...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-200 dark:border-gray-700 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            What you can do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t border-gray-200 dark:border-gray-700 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Loved by users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 dark:border-gray-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of users who are already using PiyRox Chat to work smarter.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white">Pricing</Link></li>
                <li><Link href="/explore" className="hover:text-gray-900 dark:hover:text-white">Explore</Link></li>
                <li><Link href="/help" className="hover:text-gray-900 dark:hover:text-white">Help</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Follow</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 PiyRox Chat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
