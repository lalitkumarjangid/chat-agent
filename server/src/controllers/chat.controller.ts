

import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { logger } from '../utils/logger';

export class ChatController {
  private getUserId(req: Request): string {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return userId;
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, sessionId, agent } = req.body;
      const userId = this.getUserId(req);

      logger.info(`Processing message for user ${userId}${sessionId ? ` session ${sessionId}` : ''} with agent ${agent || 'default'}`);

      const result = await chatService.processMessage(message, sessionId, agent, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = this.getUserId(req);

      logger.info(`Fetching history for user ${userId} session ${sessionId}`);

      const messages = await chatService.getConversationHistory(sessionId, userId);

      res.json({
        sessionId,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async healthCheck(req: Request, res: Response) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      logger.info(`Fetching conversations for user ${userId}`);
      const conversations = await chatService.getAllConversations(userId);
      res.json({ conversations });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = this.getUserId(req);
      logger.info(`Deleting conversation ${sessionId} for user ${userId}`);
      await chatService.deleteConversation(sessionId, userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
