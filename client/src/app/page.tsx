'use client';

import { useState, useEffect } from 'react';
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Sidebar } from "@/components/chat/Sidebar";
import { Menu, Share2, ChevronDown, Zap, MessageSquare, Sparkles, Check } from 'lucide-react';
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
  const [selectedAgent, setSelectedAgent] = useState('bard-shopease');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/chat/agents/list');
        const data = await response.json();
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgent(data.agents[1]?.id || data.agents[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        setAgents([
          { id: 'bard-quick', name: 'Quick', description: 'Fast responses' },
          { id: 'bard-shopease', name: 'Standard', description: 'Balanced assistant' },
          { id: 'bard-premium', name: 'Premium', description: 'Deep reasoning' },
        ]);
      }
    };
    fetchAgents();
  }, []);

  const handleNewChat = () => setCurrentSessionId(null);
  const handleSelectChat = (sessionId: string) => setCurrentSessionId(sessionId);

  const handleShareChat = () => {
    if (currentSessionId) {
      navigator.clipboard.writeText(`${window.location.origin}?session=${currentSessionId}`);
      toast.success('Link copied');
    } else {
      toast.error('Start a chat first');
    }
  };

  const getAgentIcon = (id: string) => {
    const icons: Record<string, JSX.Element> = {
      'bard-quick': <Zap className="w-4 h-4" />,
      'bard-shopease': <MessageSquare className="w-4 h-4" />,
      'bard-premium': <Sparkles className="w-4 h-4" />,
    };
    return icons[id] || <MessageSquare className="w-4 h-4" />;
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  return (
    <div className="flex h-dvh bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
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
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Agent Selector */}
            <div className="relative">
              <button
                onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                className="flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              >
                <span className="text-zinc-400">{getAgentIcon(selectedAgent)}</span>
                <span className="text-sm font-medium text-zinc-200">
                  {selectedAgentData?.name || 'Select'}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAgentDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAgentDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#141414] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5">
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => { setSelectedAgent(agent.id); setIsAgentDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            selectedAgent === agent.id ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedAgent === agent.id ? 'bg-white/[0.1] text-white' : 'bg-white/[0.04] text-zinc-500'
                          }`}>
                            {getAgentIcon(agent.id)}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-zinc-200">{agent.name}</div>
                            <div className="text-xs text-zinc-500">{agent.description}</div>
                          </div>
                          {selectedAgent === agent.id && <Check className="w-4 h-4 text-zinc-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleShareChat}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatWidget 
            sessionId={currentSessionId}
            onSessionCreated={setCurrentSessionId}
            selectedAgent={selectedAgent}
          />
        </div>
      </main>
    </div>
  );
}
