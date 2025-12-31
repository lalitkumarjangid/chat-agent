// src/components/chat/ChatWidget.tsx

'use client';

import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

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
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
        <div className="bg-red-950/50 text-red-400 text-xs p-3 mx-4 mb-2 rounded-lg border border-red-900/50 flex-shrink-0">
          {error}
        </div>
      )}
        
      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={(msg) => sendMessage(msg, selectedAgent)} disabled={isLoading} />
      </div>
    </div>
  );
}
