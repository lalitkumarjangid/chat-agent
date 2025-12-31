
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message, ChatState } from '@/types/chat';
import { chatAPI } from '@/lib/api';

export function useChat(sessionId: string | null, onSessionCreated?: (sessionId: string) => void) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    sessionId: null,
    isLoading: false,
    error: null,
  });

  // Load history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadHistory(sessionId);
    } else {
      // Clear messages when starting a new chat
      setState((prev) => ({
        ...prev,
        messages: [],
        sessionId: null,
      }));
    }
  }, [sessionId]);

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

  const sendMessage = useCallback(async (content: string, agent?: string) => {
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
        sessionId: sessionId || undefined,
        agent,
      });

      // Notify parent of new session
      if (data.sessionId && data.sessionId !== sessionId) {
        onSessionCreated?.(data.sessionId);
      }

      // Add AI response with typing effect
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
        agent,
        isTyping: true,
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
  }, [sessionId, onSessionCreated]);

  const editMessage = useCallback(async (messageId: string, newContent: string, agent?: string) => {
    // Find the message to edit
    const messageIndex = state.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Remove messages after the edited one
    const messagesToKeep = state.messages.slice(0, messageIndex);
    
    setState((prev) => ({
      ...prev,
      messages: messagesToKeep,
      isLoading: true,
    }));

    // Resend the edited message
    await sendMessage(newContent, agent);
  }, [state.messages, sendMessage]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    editMessage,
  };
}
