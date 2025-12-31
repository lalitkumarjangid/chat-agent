'use client';

import { useState, useEffect } from 'react';
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Sidebar } from "@/components/chat/Sidebar";
import { PanelLeft, Share2, ChevronDown, Zap, MessageSquare, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description: string;
}

export default function Home() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('bard-quick');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch agents from backend
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/chat/agents/list');
        const data = await response.json();
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgent(data.agents[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        // Fallback to default agents
        setAgents([
          { id: 'bard-quick', name: 'Bard Quick', description: 'Fast responses' },
          { id: 'bard-shopease', name: 'Bard', description: 'Friendly support assistant' },
          { id: 'bard-premium', name: 'Bard Premium', description: 'Advanced support' },
        ]);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const handleNewChat = () => {
    setCurrentSessionId(null);
  };

  const handleSelectChat = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleShareChat = () => {
    if (currentSessionId) {
      const shareUrl = `${window.location.origin}?session=${currentSessionId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Chat link copied to clipboard!');
    } else {
      toast.error('Please start a conversation first to share it.');
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Desktop Sidebar - Collapsible */}
      <div className="hidden lg:block">
        <Sidebar 
          currentSessionId={currentSessionId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isDesktopSidebarCollapsed}
          onToggleCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
          agents={agents}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar 
          currentSessionId={currentSessionId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
          agents={agents}
        />
      </div>
      
      <div className="flex-1 flex flex-col relative">
        {/* Header with Agent Selector and Share Button - Fixed */}
        <div className="sticky top-0 z-40 border-b border-white/10 bg-black px-4 py-3 flex items-center gap-4 flex-shrink-0">
          {/* Mobile menu button and Agent Selector */}
          <div className="flex items-center gap-2 flex-1">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              <PanelLeft className="w-5 h-5" />
            </Button>

            {/* Agent Selector */}
            <div className="relative max-w-xs flex-1">
              <button
                onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-all"
              >
                <div className="flex-1 truncate text-left">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Model</div>
                  <div className="font-semibold text-white">
                    {agents.find(a => a.id === selectedAgent)?.name || 'Select Agent'}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isAgentDropdownOpen && agents.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-950 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
                  <div className="divide-y divide-white/5">
                    {agents.map((agent) => {
                      // Get icon based on agent ID
                      const getIcon = (id: string) => {
                        switch(id) {
                          case 'bard-quick':
                            return <Zap className="w-4 h-4" />;
                          case 'bard-shopease':
                            return <MessageSquare className="w-4 h-4" />;
                          case 'bard-premium':
                            return <Brain className="w-4 h-4" />;
                          default:
                            return null;
                        }
                      };
                      
                      return (
                        <button
                          key={agent.id}
                          onClick={() => {
                            setSelectedAgent(agent.id);
                            setIsAgentDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-sm transition-colors flex items-start gap-3 ${
                            selectedAgent === agent.id
                              ? 'bg-white/10 text-white'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5 opacity-60">
                            {getIcon(agent.id)}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{agent.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{agent.description}</div>
                          </div>
                          {selectedAgent === agent.id && (
                            <div className="flex-shrink-0 w-2 h-2 bg-white rounded-full mt-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShareChat}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 flex-shrink-0"
            title="Share this chat"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Widget Container */}
        <div className="flex-1 overflow-hidden">
          <ChatWidget 
            sessionId={currentSessionId}
            onSessionCreated={setCurrentSessionId}
            selectedAgent={selectedAgent}
          />
        </div>
      </div>
    </div>
  );
}
