// src/services/llm.service.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { SYSTEM_PROMPT, MAX_HISTORY_MESSAGES } from '../config/constants';
import { Message } from '../types';

class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  async generateReply(history: Message[], userMessage: string): Promise<string> {
    try {
      const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
      
      // Build conversation history
      const conversationHistory = recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Create chat with history
      const chat = this.model.startChat({
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
            parts: [{ text: SYSTEM_PROMPT }],
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
      if (error.status === 429) {
        return "I'm experiencing high demand right now. Please try again in a moment.";
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
