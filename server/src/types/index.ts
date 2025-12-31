// src/types/index.ts

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  agent?: string;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
  messages?: Message[];
}

export interface ChatMessageRequest {
  message: string;
  sessionId?: string;
}

export interface ChatMessageResponse {
  reply: string;
  sessionId: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
}
