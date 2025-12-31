'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, X, PanelLeftClose, ShoppingBag, MapPin } from 'lucide-react';
import { chatAPI, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserLocation } from '@/hooks/useUserLocation';

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
  selectedAgent,
  onAgentChange,
  agents
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (diffDays < 7) return 'Previous 7 Days';
    if (diffDays < 30) return 'Previous 30 Days';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const label = formatDate(conv.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        bg-black flex flex-col
        transform transition-all duration-300 ease-in-out border-r border-white/10
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-[260px]'}
      `}>
        {/* Header with Logo and Collapse Button */}
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center justify-between gap-2">
            {/* Logo/Icon - Always visible */}
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Close/Collapse Buttons */}
            <div className="flex items-center gap-1">
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={onMobileClose}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Desktop Close/Collapse Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 flex-shrink-0"
                onClick={onToggleCollapse}
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isCollapsed && (
            <Button
              onClick={handleNewChat}
              className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10 font-normal rounded-lg h-10 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New chat
            </Button>
          )}
        </div>

        {/* Conversations List */}
        {!isCollapsed ? (
          <ScrollArea className="flex-1">
            <div className="space-y-1 py-2 px-2">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <p className="text-gray-600 text-xs mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                Object.entries(groupedConversations).map(([label, convs]) => (
                  <div key={label} className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 px-2 py-2">{label}</h3>
                    <div className="space-y-1 pr-2">
                      {convs.map((conv) => (
                        <div
                          key={conv.id}
                          className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors duration-150"
                        >
                          <button
                            onClick={() => handleSelectChat(conv.id)}
                            className={`
                              flex-1 text-left flex items-center gap-2 px-1 py-1 rounded transition-colors min-w-0
                              ${currentSessionId === conv.id
                                ? 'text-white'
                                : 'text-gray-300'
                              }
                            `}
                            title={conv.preview}
                          >
                            <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                            <span className="text-sm truncate">
                              {conv.preview.length > 20 ? `${conv.preview.substring(0, 20)}...` : conv.preview}
                            </span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, conv.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded flex-shrink-0 transition-all duration-150"
                            aria-label="Delete"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        ) : (
          /* Collapsed View - Show Icons */
          <ScrollArea className="flex-1 px-1 py-2">
            <div className="space-y-1 flex flex-col items-center">
              {conversations.length > 0 && conversations.slice(0, 10).map((conv) => (
                <div
                  key={conv.id}
                  className="w-full flex justify-center group"
                >
                  <button
                    onClick={() => handleSelectChat(conv.id)}
                    title={conv.preview}
                    className={`
                      p-2 rounded-lg transition-colors duration-150
                      ${currentSessionId === conv.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:bg-white/5'
                      }
                    `}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    title="Delete conversation"
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 hover:bg-white/5 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer - Fixed at bottom */}
        {!isCollapsed && (
          <div className="border-t border-white/10 p-3 space-y-2 flex-shrink-0 bg-black">
            <div className="text-xs text-gray-500 px-2">
              ShopEase AI Support
            </div>
            
            {/* User Location */}
            {!location.loading && (
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/5 text-xs">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-300 truncate">
                    {location.city}, {location.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
