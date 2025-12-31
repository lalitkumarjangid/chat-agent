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
    <div className="p-3 sm:p-4 bg-black border-t border-neutral-800/30">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 bg-neutral-900 rounded-2xl border border-neutral-800 focus-within:border-neutral-700 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-neutral-200 placeholder-neutral-600 px-4 py-3 text-sm resize-none outline-none min-h-[44px] max-h-[160px]"
            style={{
              fieldSizing: 'content',
            } as React.CSSProperties}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            size="icon"
            className={cn(
              'h-7 w-7 rounded-lg mb-2 mr-2 shrink-0 transition-all',
              input.trim() && !disabled
                ? 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600'
                : 'bg-neutral-800 text-neutral-600'
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-neutral-700 text-center mt-2">
          AI responses may be inaccurate. Verify important information.
        </p>
      </div>
    </div>
  );
}
