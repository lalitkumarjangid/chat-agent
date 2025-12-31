// src/components/chat/TypingIndicator.tsx

'use client';

import { Loader2 } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="w-full bg-black">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-neutral-500 animate-spin" />
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-600 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-600 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-600 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
