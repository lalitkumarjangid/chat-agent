// src/components/chat/MarkdownContent.tsx

'use client';

import { memo } from 'react';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = memo(({ content }: MarkdownContentProps) => {
  // Simple markdown-like formatting without external library
  const formatText = (text: string) => {
    return text
      // Bold: **text** or __text__
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Code: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
});

MarkdownContent.displayName = 'MarkdownContent';
