// src/components/chat/MessageList.tsx

'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage?: (id: string, newContent: string) => void;
  onPromptClick?: (prompt: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

export function MessageList({ messages, isLoading, onEditMessage, onPromptClick, onRegenerateMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const examplePrompts = [
    "What are your shipping options?",
    "What's your return policy?",
    "What payment methods do you accept?",
    "What are your business hours?"
  ];

  return (
    <ScrollArea className="h-full bg-black">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-full px-3 sm:px-4 pb-20 sm:pb-32">
          <div className="max-w-3xl w-full space-y-6 sm:space-y-10 pt-12 sm:pt-20">
            {/* Logo */}
            <div className="flex justify-center">

                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />

            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
                How can I help you today?
              </h1>
            </div>

            {/* Example Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptClick?.(prompt)}
                  className="group text-left p-3 sm:p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="text-xs sm:text-sm text-gray-300">
                    {prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              onEdit={onEditMessage}
              onRegenerate={onRegenerateMessage}
            />
          ))}
          
          {isLoading && <TypingIndicator />}
          
          <div ref={bottomRef} className="h-20 sm:h-32" />
        </div>
      )}
    </ScrollArea>
  );
}
