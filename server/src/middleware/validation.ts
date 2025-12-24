// src/middleware/validation.ts

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { MAX_MESSAGE_LENGTH } from '../config/constants';

export const messageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`)
    .transform((val) => val.trim()),
  sessionId: z.string().uuid().optional(),
});

export const validateChatMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = messageSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.errors[0].message,
        code: 'VALIDATION_ERROR',
      });
    }
    next(error);
  }
};
