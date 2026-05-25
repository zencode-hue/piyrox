'use client';

import React from 'react';
import Link from 'next/link';
import { assistants } from '@/lib/assistants';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <Link href="/" className="text-2xl font-bold">PiyRox</Link>
      </nav>
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-8">Explore Assistants</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assistants.map((assistant) => (
            <Link href={`/chat/${assistant.id}`} key={assistant.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4">
                  {assistant.icon}
                </div>
                <h2 className="text-2xl font-bold">{assistant.title}</h2>
              </div>
              <p className="text-gray-400">{assistant.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
