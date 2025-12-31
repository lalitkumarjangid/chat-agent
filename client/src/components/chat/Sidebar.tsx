// src/components/chat/Sidebar.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  X, 
  PanelLeftClose, 
  MapPin,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { chatAPI, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentSessionId]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    
    try {
      await chatAPI.deleteConversation(sessionId);
      setConversations(prev => prev.filter(c => c.id !== sessionId));
      if (sessionId === currentSessionId) {
        onNewChat();
      }
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
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This week';
    if (diffDays < 30) return 'This month';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 68 : 260 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 h-full",
          "bg-neutral-950 flex flex-col",
          "border-r border-neutral-800/50",
          "transform transition-transform duration-200",
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-3 space-y-3">
          {/* Top Row */}
          <div className="flex items-center justify-between h-9">
            <div className={cn("flex items-center gap-2.5", isCollapsed && "justify-center w-full")}>
              <div className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-neutral-400" />
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium text-neutral-200">ShopEase</span>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                  onClick={onMobileClose}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                  onClick={onToggleCollapse}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* New Chat */}
          {!isCollapsed ? (
            <Button
              onClick={handleNewChat}
              className="w-full h-9 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg text-sm font-normal justify-start px-3"
            >
              <Plus className="w-4 h-4 mr-2 text-neutral-500" />
              New chat
            </Button>
          ) : (
            <Button
              onClick={handleNewChat}
              variant="ghost"
              size="icon"
              className="mx-auto h-9 w-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}

          {/* Search */}
          {!isCollapsed && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 bg-neutral-900/50 border border-neutral-800/50 rounded-lg pl-8 pr-3 text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 px-2">
          {!isCollapsed ? (
            <div className="py-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-5 h-5 border border-neutral-700 border-t-neutral-500 rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <MessageSquare className="w-5 h-5 text-neutral-700 mb-2" />
                  <p className="text-xs text-neutral-600">No conversations yet</p>
                </div>
              ) : (
                Object.entries(groupedConversations).map(([label, convs]) => (
                  <div key={label} className="mb-3">
                    <div className="px-2 py-1.5">
                      <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider">{label}</span>
                    </div>
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
                              ? 'bg-neutral-800/80 text-neutral-200'
                              : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-300'
                          )}
                        >
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                          <span className="flex-1 text-xs truncate">
                            {conv.preview.length > 28 ? `${conv.preview.substring(0, 28)}...` : conv.preview}
                          </span>
                          
                          {(hoveredId === conv.id || currentSessionId === conv.id) && (
                            <button
                              onClick={(e) => handleDelete(e, conv.id)}
                              className="p-1 rounded text-neutral-600 hover:text-neutral-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
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
              {conversations.slice(0, 6).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  title={conv.preview}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                    currentSessionId === conv.id
                      ? 'bg-neutral-800 text-neutral-300'
                      : 'text-neutral-600 hover:bg-neutral-900 hover:text-neutral-400'
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer - Location sticky at bottom */}
        <div className="flex-shrink-0 border-t border-neutral-800/50 p-3">
          {!isCollapsed ? (
            <>
              {!location.loading && location.city && (
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-neutral-900/50">
                  <MapPin className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-neutral-600 leading-none">Location</p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {location.city}, {location.country}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="mx-auto h-9 w-9 rounded-lg text-neutral-600 hover:text-neutral-400 hover:bg-neutral-900"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
