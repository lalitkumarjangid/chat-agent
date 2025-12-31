// src/components/chat/TypingIndicator.tsx

'use client';

import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="w-full py-3 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          
          {/* Typing dots */}
          <div className="flex items-center gap-1.5 py-2">
            <div className="h-2 w-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
            <div className="h-2 w-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '600ms' }} />
            <div className="h-2 w-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '600ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
