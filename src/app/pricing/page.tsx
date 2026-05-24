'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link
            href="/search"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Search chats
          </Link>

          <Link
            href="/images"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            Images
          </Link>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href="/pricing"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 transition-colors text-sm text-gray-900 font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            See plans and pricing
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
            </svg>
            Settings
          </Link>

          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            Help
          </Link>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-200 flex items-center px-6 bg-white">
          <div className="text-sm font-medium text-gray-900">Plans & Pricing</div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple, transparent pricing</h1>
            <p className="text-gray-600 mb-8">Choose the plan that works best for you</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-3xl font-bold text-gray-900 mb-6">$0<span className="text-sm text-gray-600">/month</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Limited messages
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Basic models
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Community support
                  </li>
                </ul>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors">
                  Current plan
                </button>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-indigo-600 rounded-lg p-6 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Popular
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-3xl font-bold text-gray-900 mb-6">$20<span className="text-sm text-gray-600">/month</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Unlimited messages
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    All models
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Upgrade to Pro
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-3xl font-bold text-gray-900 mb-6">Custom</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Custom integrations
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Dedicated support
                  </li>
                </ul>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors">
                  Contact sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
