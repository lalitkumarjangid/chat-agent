// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', error);

  // Don't expose stack traces in production
  const isDev = config.nodeEnv === 'development';

  res.status(500).json({
    error: isDev ? error.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(isDev && { stack: error.stack }),
  });
};
