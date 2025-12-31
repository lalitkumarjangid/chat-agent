// src/components/chat/MessageBubble.tsx

"use client";

import { useState } from "react";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Edit2, Check, X, User, Sparkles, Zap, Crown } from "lucide-react";
import { TypingEffect } from "./TypingEffect";
import { MarkdownContent } from "./MarkdownContent";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const agentConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'bard-quick': { label: 'Quick', icon: <Zap className="w-3 h-3" />, color: 'text-emerald-400' },
  'bard-shopease': { label: 'Standard', icon: <Sparkles className="w-3 h-3" />, color: 'text-blue-400' },
  'bard-premium': { label: 'Premium', icon: <Crown className="w-3 h-3" />, color: 'text-amber-400' },
};

export function MessageBubble({ message, onEdit }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isTypingComplete, setIsTypingComplete] = useState(!message.isTyping);

  const agent = message.agent ? agentConfig[message.agent] : null;

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
    <div className="group w-full py-3 px-4 sm:px-6 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto">
        <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
          {/* Avatar */}
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
            isUser ? "bg-white/[0.08]" : "bg-gradient-to-br from-zinc-700 to-zinc-800"
          )}>
            {isUser ? (
              <User className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            )}
          </div>

          {/* Content */}
          <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
            {isEditing ? (
              <div className="space-y-2 w-full max-w-[90%]">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-[#111] text-zinc-200 rounded-xl px-4 py-3 text-sm leading-relaxed border border-white/[0.08] focus:border-white/[0.15] outline-none resize-none min-h-[100px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-white text-black hover:bg-zinc-200 h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "text-sm leading-relaxed break-words",
                    isUser 
                      ? "bg-white/[0.06] rounded-2xl rounded-tr-md px-4 py-3 text-zinc-200 max-w-[90%] border border-white/[0.04]" 
                      : "text-zinc-300 prose-invert"
                  )}
                >
                  {!isUser && message.isTyping && !isTypingComplete ? (
                    <TypingEffect
                      text={message.content}
                      speed={4}
                      onComplete={() => setIsTypingComplete(true)}
                    />
                  ) : (
                    <MarkdownContent content={message.content} />
                  )}
                </div>

                {/* Agent badge + Edit button row */}
                <div className={cn(
                  "flex items-center gap-2 mt-1.5",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}>
                  {!isUser && isTypingComplete && agent && (
                    <div className={cn("flex items-center gap-1 text-[10px]", agent.color)}>
                      {agent.icon}
                      <span className="opacity-80">{agent.label}</span>
                    </div>
                  )}
                  {isUser && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="opacity-0 group-hover:opacity-100 h-6 text-[10px] text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] px-2 transition-opacity"
                    >
                      <Edit2 className="h-2.5 w-2.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
