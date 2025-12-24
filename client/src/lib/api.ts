// src/lib/api.ts

import axios from 'axios';
import { Message } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface GetHistoryResponse {
  sessionId: string;
  messages: Message[];
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

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};
