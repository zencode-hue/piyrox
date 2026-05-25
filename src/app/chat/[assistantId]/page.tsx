'use client';

import dynamic from 'next/dynamic';
import { assistants } from '@/lib/assistants';

const ChatPageClient = dynamic(() => import('@/app/page-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d]">
      <div className="text-gray-600 dark:text-gray-400">Loading...</div>
    </div>
  ),
});

export default function AssistantChatPage({ params }: { params: { assistantId: string } }) {
  const assistant = assistants.find((a) => a.id === params.assistantId);

  return <ChatPageClient defaultSystemPrompt={assistant?.systemPrompt} />;
}
