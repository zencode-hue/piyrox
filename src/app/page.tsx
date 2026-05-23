'use client';

import dynamic from 'next/dynamic';

const ChatPageClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => null,
});

export default function ChatPage() {
  return <ChatPageClient />;
}
