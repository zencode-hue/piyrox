'use client';

import Link from 'next/link';

export default function HelpPage() {
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 transition-colors text-sm text-gray-900 font-medium"
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
          <div className="text-sm font-medium text-gray-900">Help & Support</div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Help & Support</h1>

            {/* FAQ */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer">
                  <summary className="font-medium text-gray-900">How do I start a new chat?</summary>
                  <p className="mt-2 text-sm text-gray-600">Click the "New chat" button in the sidebar to start a fresh conversation.</p>
                </details>

                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer">
                  <summary className="font-medium text-gray-900">Can I upload files?</summary>
                  <p className="mt-2 text-sm text-gray-600">Yes, click the + button in the input area to upload files. Supported formats include images, documents, and code files.</p>
                </details>

                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer">
                  <summary className="font-medium text-gray-900">How do I change my settings?</summary>
                  <p className="mt-2 text-sm text-gray-600">Go to Settings in the sidebar to customize your theme, privacy preferences, and account settings.</p>
                </details>

                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer">
                  <summary className="font-medium text-gray-900">What models are available?</summary>
                  <p className="mt-2 text-sm text-gray-600">We offer multiple AI models including PiyRox-4, PiyRox-4o, PiyRox-3.5, and Jarvis V3. Each has different capabilities and speeds.</p>
                </details>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h2>
              <div className="space-y-3">
                <a href="mailto:support@piyrox.sbs" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-600">support@piyrox.sbs</p>
                </a>
                <a href="#" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Documentation</p>
                  <p className="text-sm text-gray-600">Read our full documentation</p>
                </a>
                <a href="#" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Community</p>
                  <p className="text-sm text-gray-600">Join our community forum</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
