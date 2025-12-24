// src/hooks/useChat.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message, ChatState } from '@/types/chat';
import { chatAPI } from '@/lib/api';

const SESSION_STORAGE_KEY = 'chat_session_id';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    sessionId: null,
    isLoading: false,
    error: null,
  });

  // Load session ID from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSessionId) {
      setState((prev) => ({ ...prev, sessionId: savedSessionId }));
      loadHistory(savedSessionId);
    }
  }, []);

  const loadHistory = async (sessionId: string) => {
    try {
      const data = await chatAPI.getHistory(sessionId);
      setState((prev) => ({
        ...prev,
        messages: data.messages,
        sessionId: data.sessionId,
      }));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    try {
      const data = await chatAPI.sendMessage({
        message: content,
        sessionId: state.sessionId || undefined,
      });

      // Save session ID
      if (data.sessionId) {
        localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
      }

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        sessionId: data.sessionId,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.error || 'Failed to send message',
      }));

      // Remove optimistic user message on error
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== userMessage.id),
      }));
    }
  }, [state.sessionId]);

  const clearChat = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setState({
      messages: [],
      sessionId: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearChat,
  };
}
