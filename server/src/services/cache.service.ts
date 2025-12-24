// src/services/cache.service.ts

import { Redis } from '@upstash/redis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { CACHE_TTL } from '../config/constants';

class CacheService {
  private redis: Redis | null = null;

  constructor() {
    try {
      if (config.redis.url && config.redis.token) {
        this.redis = new Redis({
          url: config.redis.url,
          token: config.redis.token,
        });
        logger.info('Redis connection initialized');
      } else {
        logger.warn('Redis credentials not provided, caching disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      return data as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  getConversationKey(sessionId: string): string {
    return `conv:${sessionId}`;
  }
}

export const cacheService = new CacheService();
