// src/routes/chat.routes.ts

import { Router, Request, Response } from 'express';
import { chatController } from '../controllers/chat.controller';
import { validateChatMessage } from '../middleware/validation';
import { getAllAgents } from '../config/agents';

const router: Router = Router();

router.post('/message', validateChatMessage, chatController.sendMessage.bind(chatController));
router.get('/conversations', chatController.getConversations.bind(chatController));
router.get('/:sessionId/history', chatController.getHistory.bind(chatController));
router.delete('/:sessionId', chatController.deleteConversation.bind(chatController));
router.get('/agents/list', (req: Request, res: Response) => {
  const agents = getAllAgents();
  res.json({ agents });
});

export default router;
