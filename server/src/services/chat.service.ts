// src/services/chat.service.ts

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { llmService } from './llm.service';
import { cacheService } from './cache.service';
import { Message, Conversation } from '../types';

const prisma = new PrismaClient();

class ChatService {
  async createConversation(): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.create({
        data: {},
      });
      
      logger.info(`New conversation created: ${conversation.id}`);
      return conversation;
    } catch (error) {
      logger.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async getConversation(sessionId: string): Promise<Conversation | null> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      
      return conversation;
    } catch (error) {
      logger.error('Error fetching conversation:', error);
      return null;
    }
  }

  async getAllConversations(): Promise<Array<{ id: string; createdAt: Date; updatedAt: Date; preview: string }>> {
    try {
      const conversations = await prisma.conversation.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1,
            where: { role: 'user' },
          },
        },
      });
      
      return conversations.map(conv => ({
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        preview: conv.messages[0]?.content || 'New conversation',
      }));
    } catch (error) {
      logger.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  async deleteConversation(sessionId: string): Promise<void> {
    try {
      await prisma.conversation.delete({
        where: { id: sessionId },
      });
      
      // Clear cache
      await cacheService.delete(cacheService.getConversationKey(sessionId));
      
      logger.info(`Conversation deleted: ${sessionId}`);
    } catch (error) {
      logger.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    agent?: string
  ): Promise<Message> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          role,
          content,
          agent,
        },
      });
      
      // Invalidate cache
      await cacheService.delete(cacheService.getConversationKey(conversationId));
      
      return message;
    } catch (error) {
      logger.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  async processMessage(
    message: string,
    sessionId?: string,
    agent?: string
  ): Promise<{ reply: string; sessionId: string }> {
    try {
      // Get or create conversation
      let conversation: Conversation | null = null;
      
      if (sessionId) {
        conversation = await this.getConversation(sessionId);
      }
      
      if (!conversation) {
        conversation = await this.createConversation();
      }

      // Save user message
      await this.saveMessage(conversation.id, 'user', message);

      // Get conversation history
      const history = await this.getConversationHistory(conversation.id);

      // Generate AI reply with retry logic for rate limiting
      let reply: string;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          reply = await llmService.generateReply(history, message, agent);
          break;
        } catch (error: any) {
          if (error.message?.includes('429') || error.message?.includes('high demand')) {
            retries++;
            if (retries < maxRetries) {
              // Exponential backoff: 2s, 4s, 8s
              const delay = Math.pow(2, retries) * 1000;
              logger.info(`Rate limited. Retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw new Error('Service is experiencing high demand. Please try again in a few moments.');
            }
          } else {
            throw error;
          }
        }
      }

      // Save AI reply with agent info
      await this.saveMessage(conversation.id, 'assistant', reply, agent);

      return {
        reply,
        sessionId: conversation.id,
      };
    } catch (error) {
      logger.error('Error processing message:', error);
      throw error;
    }
  }

  async getConversationHistory(sessionId: string): Promise<Message[]> {
    try {
      // Try cache first
      const cacheKey = cacheService.getConversationKey(sessionId);
      const cached = await cacheService.get<Message[]>(cacheKey);
      
      if (cached) {
        logger.debug('Cache hit for conversation:', sessionId);
        return cached;
      }

      // Fetch from database
      const messages = await prisma.message.findMany({
        where: { conversationId: sessionId },
        orderBy: { createdAt: 'asc' },
      });

      // Cache the result
      await cacheService.set(cacheKey, messages);

      return messages;
    } catch (error) {
      logger.error('Error fetching conversation history:', error);
      throw new Error('Failed to fetch conversation history');
    }
  }
}

export const chatService = new ChatService();
