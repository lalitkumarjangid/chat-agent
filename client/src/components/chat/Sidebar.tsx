// src/components/chat/Sidebar.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  X, 
  PanelLeftClose, 
  MapPin,
  Search,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { chatAPI, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useUserLocation } from '@/hooks/useUserLocation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
  agents: any[];
}

export function Sidebar({ 
  currentSessionId, 
  onNewChat, 
  onSelectChat, 
  isMobileOpen, 
  onMobileClose, 
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const location = useUserLocation();

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [currentSessionId, loadConversations]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteConversation(sessionId);
      setConversations(prev => prev.filter(c => c.id !== sessionId));
      if (sessionId === currentSessionId) onNewChat();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    onMobileClose();
  };

  const handleSelectChat = (sessionId: string) => {
    onSelectChat(sessionId);
    onMobileClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This week';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const label = formatDate(conv.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const sidebarWidth = isCollapsed ? 'w-[60px]' : 'w-[260px]';

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 flex flex-col",
          "bg-[#0c0c0c] border-r border-white/[0.06]",
          "transition-all duration-200 ease-out",
          sidebarWidth,
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between h-8">
            {!isCollapsed && (
              <span className="text-sm font-semibold text-zinc-100 pl-1">ShopEase</span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/[0.06]"
                onClick={onMobileClose}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/[0.06]"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={handleNewChat}
            className={cn(
              "w-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border-0 transition-colors",
              isCollapsed ? "h-10 w-10 p-0 mx-auto" : "h-10 justify-start px-3"
            )}
          >
            <Plus className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="text-sm">New chat</span>}
          </Button>

          {/* Search */}
          {!isCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.12] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {!isCollapsed ? (
            <div className="py-1 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-600">No conversations</p>
                </div>
              ) : (
                Object.entries(groupedConversations).map(([label, convs]) => (
                  <div key={label}>
                    <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-2 mb-1">{label}</p>
                    <div className="space-y-0.5">
                      {convs.map((conv) => (
                        <div
                          key={conv.id}
                          onMouseEnter={() => setHoveredId(conv.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => handleSelectChat(conv.id)}
                          className={cn(
                            "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                            currentSessionId === conv.id
                              ? 'bg-white/[0.08] text-zinc-100'
                              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                          )}
                        >
                          <MessageSquare className="w-4 h-4 opacity-50 flex-shrink-0" />
                          <span className="flex-1 text-sm truncate">
                            {conv.preview.length > 24 ? `${conv.preview.substring(0, 24)}...` : conv.preview}
                          </span>
                          {(hoveredId === conv.id || currentSessionId === conv.id) && (
                            <button
                              onClick={(e) => handleDelete(e, conv.id)}
                              className="p-1 rounded hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  title={conv.preview}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    currentSessionId === conv.id
                      ? 'bg-white/[0.08] text-zinc-200'
                      : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              ))}
              {conversations.length > 5 && (
                <button className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-white/[0.04]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          {!isCollapsed && !location.loading && location.city && (
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.03]">
              <MapPin className="w-4 h-4 text-zinc-600" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-600">Location</p>
                <p className="text-xs text-zinc-400 truncate">{location.city}, {location.country}</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
