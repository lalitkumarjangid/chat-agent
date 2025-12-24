// src/routes/index.ts

import { Router } from 'express';
import chatRoutes from './chat.routes';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.use('/chat', chatRoutes);
router.get('/health', chatController.healthCheck.bind(chatController));

export default router;
