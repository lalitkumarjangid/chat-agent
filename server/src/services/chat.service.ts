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

  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Message> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          role,
          content,
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
    sessionId?: string
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

      // Generate AI reply
      const reply = await llmService.generateReply(history, message);

      // Save AI reply
      await this.saveMessage(conversation.id, 'assistant', reply);

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
