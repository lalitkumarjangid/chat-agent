// src/components/chat/MarkdownContent.tsx

'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = memo(({ content }: MarkdownContentProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-lg font-semibold text-neutral-100 mt-4 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-neutral-100 mt-4 mb-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-neutral-200 mt-3 mb-1.5 first:mt-0">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-medium text-neutral-200 mt-2 mb-1">{children}</h4>
        ),
        // Paragraph
        p: ({ children }) => (
          <p className="text-neutral-300 leading-relaxed mb-3 last:mb-0">{children}</p>
        ),
        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-200">{children}</strong>
        ),
        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic text-neutral-300">{children}</em>
        ),
        // Code inline
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <code className="block bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300 overflow-x-auto my-3">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-neutral-800/60 text-neutral-300 px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          );
        },
        // Code block wrapper
        pre: ({ children }) => (
          <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 overflow-x-auto my-3">
            {children}
          </pre>
        ),
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        // Unordered list
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-neutral-300">{children}</ul>
        ),
        // Ordered list
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-neutral-300">{children}</ol>
        ),
        // List item
        li: ({ children }) => (
          <li className="text-neutral-300 pl-1">{children}</li>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-neutral-700 pl-3 my-3 text-neutral-400 italic">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="border-neutral-800 my-4" />,
        // Table
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-lg border border-neutral-800">
            <table className="w-full text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-neutral-900 border-b border-neutral-800">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-neutral-800/50">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-neutral-900/50 transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-medium text-neutral-300 whitespace-nowrap">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-neutral-400">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownContent.displayName = 'MarkdownContent';
