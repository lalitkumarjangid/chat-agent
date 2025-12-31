// src/components/chat/TypingIndicator.tsx

'use client';

import { Activity } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="w-full bg-black border-b border-white/5">
      <div className="max-w-3xl mx-auto px-6 py-8 md:px-8 flex gap-6">

          <Activity className="h-4 w-4" />

        <div className="flex-1 pt-1">
          <div className="flex space-x-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
