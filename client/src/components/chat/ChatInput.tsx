// src/components/chat/ChatInput.tsx

'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const canSend = input.trim() && !disabled;

  return (
    <div className="p-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-[#111] rounded-xl border border-white/[0.08] focus-within:border-white/[0.15] transition-colors shadow-lg">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 px-4 py-3.5 text-sm resize-none outline-none min-h-[50px] max-h-[160px] leading-relaxed"
          />
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg mb-2.5 mr-2.5 shrink-0 transition-all duration-200',
              canSend
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-white/[0.06] text-zinc-600 cursor-not-allowed'
            )}
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-2.5 tracking-wide">
          AI may produce inaccurate information
        </p>
      </div>
    </div>
  );
}
