'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailUpdates: true,
    dataCollection: false,
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Password</h3>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Change Password
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Danger Zone</h3>
                  <button className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications about your chats</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email Updates</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates about new features</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailUpdates}
                      onChange={(e) => setSettings({ ...settings, emailUpdates: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Data Collection</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow us to collect usage data to improve the service</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dataCollection}
                      onChange={(e) => setSettings({ ...settings, dataCollection: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Chat History</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Your chat history is encrypted and stored securely.
                    </p>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Learn more about our privacy policy
                    </button>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add an extra layer of security to your account.
                    </p>
                    <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing</h2>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Free Plan</p>
                  <Link href="/pricing" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Upgrade to Plus
                  </Link>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
