'use client';

import { useState, useEffect } from 'react';
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Sidebar } from "@/components/chat/Sidebar";
import { PanelLeft, Share2, ChevronDown, Zap, MessageSquare, Sparkles } from 'lucide-react';
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
        setAgents([
          { id: 'bard-quick', name: 'Quick', description: 'Fast responses' },
          { id: 'bard-shopease', name: 'Standard', description: 'Balanced assistant' },
          { id: 'bard-premium', name: 'Premium', description: 'Advanced support' },
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
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Start a conversation first');
    }
  };

  const getAgentIcon = (id: string) => {
    switch(id) {
      case 'bard-quick':
        return <Zap className="w-3.5 h-3.5" />;
      case 'bard-shopease':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'bard-premium':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Desktop Sidebar */}
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
      
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 h-12 border-b border-neutral-800/50 bg-black/95 backdrop-blur-sm px-3 flex items-center gap-3 flex-shrink-0">
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>

          {/* Agent Selector */}
          <div className="relative flex-1 max-w-[200px]">
            <button
              onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              className="w-full flex items-center gap-2 h-8 px-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 text-sm transition-colors"
            >
              <span className="text-neutral-500">{getAgentIcon(selectedAgent)}</span>
              <span className="flex-1 text-left text-neutral-300 text-xs font-medium truncate">
                {agents.find(a => a.id === selectedAgent)?.name || 'Model'}
              </span>
              <ChevronDown className={`w-3 h-3 text-neutral-600 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isAgentDropdownOpen && agents.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsAgentDropdownOpen(false)} 
                />
                <div className="absolute top-full mt-1 left-0 w-52 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        setIsAgentDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left flex items-center gap-2.5 transition-colors ${
                        selectedAgent === agent.id
                          ? 'bg-neutral-800 text-neutral-200'
                          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
                      }`}
                    >
                      <span className="opacity-60">{getAgentIcon(agent.id)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{agent.name}</div>
                        <div className="text-[10px] text-neutral-600 truncate">{agent.description}</div>
                      </div>
                      {selectedAgent === agent.id && (
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Share */}
          <Button
            onClick={handleShareChat}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </header>

        {/* Chat */}
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
