'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
  plan: string;
  message_count: number;
  last_message_date: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('An error occurred while fetching your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getRemainingMessages = () => {
    if (!user || user.plan !== 'free') return null;

    const today = new Date().toISOString().split('T')[0];
    if (user.last_message_date === today) {
      return 20 - user.message_count;
    }
    return 20;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-white">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage your account and usage.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Profile</h2>
              <p className="mb-2"><span className="font-semibold">Name:</span> {user.name}</p>
              <p><span className="font-semibold">Email:</span> {user.email}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Your Plan</h2>
              <p className="text-3xl font-bold capitalize mb-4">{user.plan}</p>
              
              {user.plan === 'free' && (
                <div className="mb-4">
                  <p className="text-lg font-semibold">Remaining Messages Today:</p>
                  <p className="text-5xl font-bold">{getRemainingMessages()}</p>
                  <p className="text-sm text-gray-500">Your limit resets daily.</p>
                </div>
              )}

              <Link href="/pricing">
                <button className="w-full py-3 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors">
                  {user.plan === 'free' ? 'Upgrade to Plus' : 'View Plans'}
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
