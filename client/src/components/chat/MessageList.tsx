// src/components/chat/MessageList.tsx

'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ShoppingBag, Clock, CreditCard, HelpCircle } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage?: (id: string, newContent: string) => void;
  onPromptClick?: (prompt: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

const prompts = [
  { text: "What are your shipping options?", icon: ShoppingBag },
  { text: "What's your return policy?", icon: HelpCircle },
  { text: "What payment methods do you accept?", icon: CreditCard },
  { text: "What are your business hours?", icon: Clock }
];

export function MessageList({ messages, isLoading, onEditMessage, onPromptClick, onRegenerateMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full bg-black">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
          <div className="max-w-2xl w-full space-y-8 pt-16">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-neutral-400" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-medium text-neutral-200">
                How can I help you?
              </h1>
              <p className="text-sm text-neutral-600 mt-2">
                Ask me anything about our products and services
              </p>
            </div>

            {/* Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptClick?.(prompt.text)}
                  className="flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-neutral-800/50 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-neutral-700/50 transition-all group"
                >
                  <prompt.icon className="w-4 h-4 text-neutral-600 group-hover:text-neutral-500 flex-shrink-0" />
                  <span className="text-xs text-neutral-400 group-hover:text-neutral-300">
                    {prompt.text}
                  </span>
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
          
          <div ref={bottomRef} className="h-16 sm:h-24" />
        </div>
      )}
    </ScrollArea>
  );
}
