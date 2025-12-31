// src/components/chat/ChatWidget.tsx

'use client';

import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { AlertCircle } from 'lucide-react';

interface ChatWidgetProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
  selectedAgent?: string;
}

export function ChatWidget({ sessionId, onSessionCreated, selectedAgent = 'bard-quick' }: ChatWidgetProps) {
  const { messages, isLoading, error, sendMessage, editMessage } = useChat(sessionId, onSessionCreated);

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt, selectedAgent);
  };

  const handleRegenerate = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.role === 'user') {
        sendMessage(userMessage.content, selectedAgent);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onEditMessage={editMessage}
          onPromptClick={handlePromptClick}
          onRegenerateMessage={handleRegenerate}
        />
      </div>
        
      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 flex items-center gap-2.5 bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
        
      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={(msg) => sendMessage(msg, selectedAgent)} disabled={isLoading} />
      </div>
    </div>
  );
}
