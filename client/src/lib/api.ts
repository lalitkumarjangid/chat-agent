
import axios from 'axios';
import { Message } from '@/types/chat';
import { getUserId } from './user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add user ID to all requests
api.interceptors.request.use((config) => {
  const userId = getUserId();
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  agent?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface GetHistoryResponse {
  sessionId: string;
  messages: Message[];
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export const chatAPI = {
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post<SendMessageResponse>('/chat/message', data);
    return response.data;
  },

  getHistory: async (sessionId: string): Promise<GetHistoryResponse> => {
    const response = await api.get<GetHistoryResponse>(`/chat/${sessionId}/history`);
    return response.data;
  },

  getConversations: async (): Promise<GetConversationsResponse> => {
    const response = await api.get<GetConversationsResponse>('/chat/conversations');
    return response.data;
  },

  deleteConversation: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/${sessionId}`);
  },

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};
