// src/components/chat/MessageBubble.tsx

'use client';

import { Message } from '@/types/chat';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[80%] gap-2',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600'
              : 'bg-muted'
          )}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div
          className={cn(
            'flex flex-col space-y-1',
            isUser ? 'items-end' : 'items-start'
          )}
        >
          <div
            className={cn(
              'rounded-2xl px-4 py-2 shadow-sm',
              isUser
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-muted text-foreground'
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <span className="text-xs text-muted-foreground px-2">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
