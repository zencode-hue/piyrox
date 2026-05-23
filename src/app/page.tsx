'use client';

import dynamic from 'next/dynamic';

const ChatPageClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">Loading...</div>
    </div>
  ),
});

export default function ChatPage() {
  return <ChatPageClient />;
}
