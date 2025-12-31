// src/components/chat/MessageBubble.tsx

"use client";

import { useState } from "react";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Edit2, Check, X } from "lucide-react";
import { TypingEffect } from "./TypingEffect";
import { MarkdownContent } from "./MarkdownContent";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function MessageBubble({ message, onEdit, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isTypingComplete, setIsTypingComplete] = useState(!message.isTyping);

  const handleSaveEdit = () => {
    if (onEdit && editedContent.trim()) {
      onEdit(message.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group w-full py-2 px-4 sm:px-6 animate-in fade-in duration-200",
        "bg-black"
      )}
    >
      <div className="max-w-4xl mx-auto flex justify-center">
        <div className={cn(
          "flex flex-col w-full",
          isUser ? "items-end" : "items-start"
        )}>
          <div
            className={cn(
              "space-y-2 overflow-hidden max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%]",
              isUser ? "bg-neutral-900 rounded-2xl px-4 py-3 border border-neutral-800/50" : ""
            )}
          >
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-200 rounded-xl px-4 py-3 text-sm leading-relaxed border border-neutral-800 focus:border-neutral-700 outline-none resize-none min-h-[100px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-neutral-800 text-neutral-200 hover:bg-neutral-700 h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap break-words">
                  {!isUser && message.isTyping && !isTypingComplete ? (
                    <TypingEffect
                      text={message.content}
                      speed={15}
                      onComplete={() => setIsTypingComplete(true)}
                    />
                  ) : (
                    <MarkdownContent content={message.content} />
                  )}
                </div>

                {!isUser && isTypingComplete && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-neutral-800/50">
                    <span className="text-[10px] text-neutral-600">
                      {message.agent === 'bard-shopease' ? 'Standard' : message.agent === 'bard-premium' ? 'Premium' : message.agent === 'bard-quick' ? 'Quick' : 'AI'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          {isUser && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 text-[10px] text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50 px-2"
              >
                <Edit2 className="h-2.5 w-2.5 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
