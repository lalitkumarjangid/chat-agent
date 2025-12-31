// src/controllers/chat.controller.ts

import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { logger } from '../utils/logger';

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, sessionId, agent } = req.body;

      logger.info(`Processing message${sessionId ? ` for session ${sessionId}` : ''} with agent ${agent || 'default'}`);

      const result = await chatService.processMessage(message, sessionId, agent);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      logger.info(`Fetching history for session ${sessionId}`);

      const messages = await chatService.getConversationHistory(sessionId);

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
      logger.info('Fetching all conversations');
      const conversations = await chatService.getAllConversations();
      res.json({ conversations });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      logger.info(`Deleting conversation ${sessionId}`);
      await chatService.deleteConversation(sessionId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
