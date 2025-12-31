// src/components/chat/MessageBubble.tsx

"use client";

import { useState } from "react";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Edit2, Check, X, RefreshCw, Share2 } from "lucide-react";
import { TypingEffect } from "./TypingEffect";
import { MarkdownContent } from "./MarkdownContent";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
        "group w-full py-2 pr-4 pl-4 px-6 sm:px-4 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-300",
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
              isUser ? "bg-zinc-800 rounded-2xl px-4 py-3" : ""
            )}
          >
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm sm:text-[15px] leading-7 border border-white/10 focus:border-white/20 outline-none resize-none min-h-[100px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-white text-black hover:bg-gray-200 h-8"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="hover:bg-white/10 h-8"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm sm:text-[15px] leading-7 text-white whitespace-pre-wrap break-words">
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

                {/* AI Message Actions - Show only model info */}
                {!isUser && isTypingComplete && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] text-gray-500">
                      {message.agent === 'bard-shopease' ? 'Bard' : message.agent === 'bard-premium' ? 'Bard Premium' : message.agent === 'bard-quick' ? 'Bard Quick' : 'Bard'}
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
                className="h-7 text-xs text-gray-400 hover:text-white hover:bg-white/10 px-2"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
