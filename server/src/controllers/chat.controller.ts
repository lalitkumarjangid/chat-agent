// src/controllers/chat.controller.ts

import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { logger } from '../utils/logger';

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, sessionId } = req.body;

      logger.info(`Processing message${sessionId ? ` for session ${sessionId}` : ''}`);

      const result = await chatService.processMessage(message, sessionId);

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
}

export const chatController = new ChatController();
