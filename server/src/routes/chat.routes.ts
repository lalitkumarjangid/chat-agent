// src/routes/chat.routes.ts

import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { validateChatMessage } from '../middleware/validation';

const router = Router();

router.post('/message', validateChatMessage, chatController.sendMessage.bind(chatController));
router.get('/:sessionId/history', chatController.getHistory.bind(chatController));

export default router;
