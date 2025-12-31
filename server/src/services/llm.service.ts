// src/services/llm.service.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { SYSTEM_PROMPT, MAX_HISTORY_MESSAGES } from '../config/constants';
import { Message } from '../types';
import { getAgentById } from '../config/agents';

class LLMService {
  private genAI: GoogleGenerativeAI;
  private models: Map<string, any> = new Map();

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const modelName = config.gemini.model;
    
    logger.info(`Initializing Gemini model: ${modelName}`);
    
    // Initialize default model
    this.models.set('default', this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }));
  }

  private getModel(agentId?: string) {
    if (!agentId) {
      return this.models.get('default');
    }

    if (this.models.has(agentId)) {
      return this.models.get(agentId);
    }

    const agent = getAgentById(agentId);
    if (!agent) {
      return this.models.get('default');
    }

    const model = this.genAI.getGenerativeModel({ 
      model: agent.model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    this.models.set(agentId, model);
    return model;
  }

  async generateReply(history: Message[], userMessage: string, agentId?: string): Promise<string> {
    try {
      const model = this.getModel(agentId);
      const agent = agentId ? getAgentById(agentId) : null;
      const systemPrompt = agent?.systemPrompt || SYSTEM_PROMPT;
      
      const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
      
      // Build conversation history
      const conversationHistory = recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Create chat with history
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'You are a customer support agent. Read this context and remember it.' }],
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I am a customer support agent for ShopEase. I will help customers with their questions about our store, shipping, returns, and products.' }],
          },
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'I have read and understood all the store information, policies, and guidelines. I am ready to assist customers professionally and helpfully.' }],
          },
          ...conversationHistory,
        ],
      });

      // Send user message
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      logger.debug('LLM response generated successfully');
      return text;

    } catch (error: any) {
      logger.error('LLM generation error:', error);
      
      // Handle specific error types
      if (error.status === 429 || error.message?.includes('429')) {
        const retryDelay = error.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
        logger.warn(`Rate limit exceeded. Agent: ${agentId || 'default'}. Retry delay: ${retryDelay || 'unknown'}`);
        throw new Error('429-high demand');
      }
      
      if (error.status === 401 || error.message?.includes('API key')) {
        logger.error('Invalid Gemini API key');
        return "I'm having trouble connecting. Please try again later.";
      }
      
      if (error.message?.includes('SAFETY')) {
        return "I apologize, but I cannot process that request. Please rephrase your question or contact support@shopease.com for assistance.";
      }
      
      return "I apologize, but I'm unable to respond right now. Please contact support@shopease.com for assistance.";
    }
  }
}

export const llmService = new LLMService();
