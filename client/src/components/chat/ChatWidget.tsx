// src/components/chat/ChatWidget.tsx

'use client';

import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export function ChatWidget() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  return (
    <Card className="w-full max-w-4xl h-[700px] flex flex-col shadow-2xl">
      <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ShopEase Support</CardTitle>
            <CardDescription className="text-blue-50">
              AI-powered customer support assistant
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="text-white hover:bg-white/20"
            title="Clear chat"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 mx-4 mb-2 rounded-md">
            {error}
          </div>
        )}
        
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </CardContent>
    </Card>
  );
}
