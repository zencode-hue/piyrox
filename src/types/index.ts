export interface FileAttachment {
  name: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  files?: FileAttachment[];
  timestamp: number;
  model?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface Model {
  id: string;
  name: string;
  desc: string;
  badge: string | null;
}
