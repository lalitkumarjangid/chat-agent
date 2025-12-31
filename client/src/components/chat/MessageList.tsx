// src/components/chat/MessageList.tsx

'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Package, RotateCcw, CreditCard, HelpCircle } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage?: (id: string, newContent: string) => void;
  onPromptClick?: (prompt: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

const prompts = [
  { text: "What are your shipping options?", icon: Package },
  { text: "What's your return policy?", icon: RotateCcw },
  { text: "What payment methods do you accept?", icon: CreditCard },
  { text: "I need help with an order", icon: HelpCircle }
];

export function MessageList({ messages, isLoading, onEditMessage, onPromptClick, onRegenerateMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full bg-[#0a0a0a]">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
          <div className="max-w-lg w-full space-y-10 pt-20">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-zinc-300" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
                How can I help you today?
              </h1>
              <p className="text-sm text-zinc-500">
                Your AI shopping assistant is ready
              </p>
            </div>

            {/* Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptClick?.(prompt.text)}
                  className="flex items-center gap-3 text-left px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                    <prompt.icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
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
          
          <div ref={bottomRef} className="h-20" />
        </div>
      )}
    </ScrollArea>
  );
}
