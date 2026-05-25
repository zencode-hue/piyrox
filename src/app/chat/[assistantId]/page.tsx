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

  // A simple system prompt, you can get much more creative
  const systemPrompt = assistant
    ? `You are ${assistant.title}, a specialized AI assistant. Your purpose is to ${assistant.desc.toLowerCase()}`
    : undefined; // Let the default prompt be used if not found

  return <ChatPageClient defaultSystemPrompt={systemPrompt} />;
}
