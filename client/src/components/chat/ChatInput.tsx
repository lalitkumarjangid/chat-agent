// src/components/chat/ChatInput.tsx

'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 bg-zinc-900 rounded-3xl border border-white/10 focus-within:border-white/20 transition-colors shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ShopEase AI"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base resize-none outline-none min-h-[48px] sm:min-h-[52px] max-h-[200px]"
            style={{
              fieldSizing: 'content',
            } as React.CSSProperties}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            size="icon"
            className={cn(
              'h-7 w-7 sm:h-8 sm:w-8 rounded-full mb-2.5 sm:mb-3 mr-2 shrink-0 transition-all',
              input.trim() && !disabled
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-zinc-800 text-gray-600'
            )}
          >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-2 sm:mt-3">
          ShopEase AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
