# Spur AI Live Chat Agent - Technical Planning Document

## 📋 Project Overview

Build a mini AI support agent for a live chat widget that simulates customer support where an AI agent answers user questions using Google Gemini API.

---

## 🏗️ Architecture Overview

### Monorepo Structure
```
chat-agent/
├── client/          # Next.js frontend
├── server/          # Express backend
├── packages/        # Shared packages (optional)
├── package.json     # Root package.json with workspaces
└── README.md
```

### System Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (App Router + Tailwind CSS)                 │   │
│  │         UI: shadcn/ui + Magic UI components                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  ChatWidget │  │ MessageList │  │  InputBox   │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │         │                │                │                         │   │
│  │         └────────────────┴────────────────┘                         │   │
│  │                          │                                          │   │
│  │                    Chat Context/State                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API Layer (Routes)                          │   │
│  │  POST /api/chat/message  │  GET /api/chat/:sessionId/history        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Service Layer                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ ChatService  │  │  LLMService  │  │ CacheService │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Data Layer                                  │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                │   │
│  │  │   Prisma ORM         │  │   Redis (Upstash)    │                │   │
│  │  └──────────────────────┘  └──────────────────────┘                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
        ┌───────────────────┐          ┌───────────────────┐
        │    PostgreSQL     │          │  Upstash Redis    │
        │    (Database)     │          │    (Cache)        │
        └───────────────────┘          └───────────────────┘
                                               │
                                               │
                    ┌──────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │  Google Gemini API    │
        │  (gemini-2.0-flash)   │
        └───────────────────────┘
```

---

## 🗄️ Database Design (PostgreSQL + Prisma)

### Entity Relationship Diagram

```
┌─────────────────────────┐       ┌─────────────────────────┐
│      Conversation       │       │        Message          │
├─────────────────────────┤       ├─────────────────────────┤
│ id: UUID (PK)           │──────<│ id: UUID (PK)           │
│ createdAt: DateTime     │       │ conversationId: UUID(FK)│
│ updatedAt: DateTime     │       │ role: Enum(user/ai)     │
│ metadata: JSON?         │       │ content: Text           │
│                         │       │ createdAt: DateTime     │
└─────────────────────────┘       └─────────────────────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Conversation {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  metadata  Json?     // For future extensibility (user info, channel, etc.)
  messages  Message[]

  @@index([createdAt])
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           MessageRole
  content        String       @db.Text
  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@index([createdAt])
}

enum MessageRole {
  user
  assistant
}
```

---

## 🔌 API Design

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### 1. Send Message
```
POST /api/chat/message
```

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-string"
}
```

**Response (Success - 200):**
```json
{
  "reply": "Our return policy allows returns within 30 days of purchase...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Message cannot be empty",
  "code": "VALIDATION_ERROR"
}
```

#### 2. Get Conversation History
```
GET /api/chat/:sessionId/history
```

**Response (Success - 200):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "msg-uuid-1",
      "role": "user",
      "content": "What's your return policy?",
      "createdAt": "2025-12-25T10:00:00Z"
    },
    {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "Our return policy allows...",
      "createdAt": "2025-12-25T10:00:02Z"
    }
  ]
}
```

#### 3. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T10:00:00Z"
}
```

---

## 🤖 LLM Integration (Google Gemini 2.0 Flash)

### Model Selection: gemini-2.0-flash-exp
- **Speed**: Fastest response times
- **Cost**: Most economical
- **Quality**: Excellent for customer support use case
- **Context Window**: 1M tokens

### Service Design

```typescript
// server/src/services/llm.service.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

interface LLMService {
  generateReply(history: Message[], userMessage: string): Promise<string>;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
```

### System Prompt Strategy

```typescript
const SYSTEM_PROMPT = `You are a friendly and helpful customer support agent for "ShopEase", 
a small e-commerce store specializing in electronics and home goods.

## Store Information:
- Store Name: ShopEase
- Business Hours: Monday-Friday 9 AM - 6 PM EST, Saturday 10 AM - 4 PM EST
- Support Email: support@shopease.com
- Phone: 1-800-SHOP-EASE

## Shipping Policy:
- Free shipping on orders over $50
- Standard shipping: 5-7 business days ($5.99)
- Express shipping: 2-3 business days ($12.99)
- We ship to USA and Canada only
- Orders are processed within 1-2 business days

## Return & Refund Policy:
- 30-day return window from delivery date
- Items must be unused and in original packaging
- Refunds processed within 5-7 business days
- Free return shipping for defective items
- $7.99 return shipping fee for other returns

## Payment Methods:
- Credit/Debit Cards (Visa, MasterCard, Amex)
- PayPal
- Apple Pay / Google Pay

## Guidelines for responses:
1. Be concise but helpful
2. If you don't know something, say so and suggest contacting support
3. Always be polite and professional
4. For complex issues, recommend contacting support directly
5. Never make up information not provided above`;
```

### Conversation History Handling

```typescript
// Include last N messages for context (to manage token usage)
const MAX_HISTORY_MESSAGES = 10;

function buildPromptMessages(history: Message[], userMessage: string) {
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];
}
```

### Error Handling

```typescript
// Graceful error handling for LLM calls
try {
  const response = await gemini.generateContent(prompt);
  return response.text();
} catch (error) {
  if (error.status === 429) {
    return "I'm experiencing high demand right now. Please try again in a moment.";
  }
  if (error.status === 401) {
    logger.error('Invalid API key');
    return "I'm having trouble connecting. Please try again later.";
  }
  return "I apologize, but I'm unable to respond right now. Please contact support@shopease.com for assistance.";
}
```

---

## 🎨 Frontend Design (Next.js App Router + Tailwind + shadcn/ui + Magic UI)

### UI Library Stack
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality, accessible components (Button, Input, Card, etc.)
- **Magic UI**: Beautiful animated components (ShimmerButton, AnimatedBeam, etc.)

### Component Structure

```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page with chat widget
│   │   └── globals.css         # Global styles + Tailwind imports
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWidget.tsx      # Main chat container
│   │   │   ├── MessageList.tsx     # Scrollable message list
│   │   │   ├── MessageBubble.tsx   # Individual message bubble
│   │   │   ├── ChatInput.tsx       # Input box with send button
│   │   │   └── TypingIndicator.tsx # "Agent is typing..." indicator
│   │   └── ui/                     # shadcn/ui components
│   │       ├── button.tsx          # From shadcn/ui
│   │       ├── input.tsx           # From shadcn/ui
│   │       ├── card.tsx            # From shadcn/ui
│   │       └── scroll-area.tsx     # From shadcn/ui
│   ├── hooks/
│   │   └── useChat.ts          # Custom hook for chat logic
│   ├── lib/
│   │   ├── api.ts              # API client functions
│   │   └── utils.ts            # Utility functions + cn helper
│   └── types/
│       └── chat.ts             # TypeScript interfaces
├── components.json             # shadcn/ui config
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json
└── package.json
```

### State Management

```typescript
// hooks/useChat.ts
interface ChatState {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
- sendMessage(content: string)
- loadHistory(sessionId: string)
- clearChat()
```

### UI/UX Features (Enhanced with Magic UI)

1. **Message List**
   - Scrollable container with auto-scroll to bottom (shadcn ScrollArea)
   - Visual distinction between user (right, gradient) and AI (left, muted) messages
   - Smooth fade-in animations for new messages
   - Timestamps on messages

2. **Input Area**
   - Text input with placeholder (shadcn Input)
   - Send button with shimmer effect (Magic UI ShimmerButton)
   - Enter key to send (Shift+Enter for new line)
   - Character count indicator

3. **Loading States**
   - "Agent is typing..." indicator with animated dots (Magic UI Particles)
   - Disabled input during request
   - Skeleton loaders for messages

4. **Error Handling**
   - Toast notifications (shadcn Toast)
   - Inline error messages with icons
   - Retry option on failure

5. **Visual Polish**
   - Gradient backgrounds
   - Smooth transitions and animations
   - Responsive design (mobile-first)
   - Dark mode support (via Tailwind)

---

## 🗂️ Backend Structure (Monorepo)

```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── config/
│   │   ├── index.ts             # Config loader
│   │   └── constants.ts         # App constants
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   └── chat.routes.ts       # Chat endpoints
│   ├── controllers/
│   │   └── chat.controller.ts   # Request handlers
│   ├── services/
│   │   ├── chat.service.ts      # Chat business logic
│   │   ├── llm.service.ts       # Gemini 2.0 Flash integration
│   │   └── cache.service.ts     # Redis operations
│   ├── middleware/
│   │   ├── errorHandler.ts      # Global error handler
│   │   ├── validation.ts        # Input validation (Zod)
│   │   └── cors.ts              # CORS configuration
│   ├── utils/
│   │   ├── logger.ts            # Logging utility
│   │   └── helpers.ts           # Helper functions
│   └── types/
│       └── index.ts             # TypeScript types
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration files
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🔒 Redis Caching Strategy (Upstash)

### Use Cases

1. **Session Caching**
   - Cache recent conversation history to reduce DB reads
   - TTL: 1 hour

2. **Rate Limiting**
   - Limit requests per session/IP
   - Prevents abuse of LLM API

```typescript
// Cache keys pattern
const CACHE_KEYS = {
  conversation: (sessionId: string) => `conv:${sessionId}`,
  rateLimit: (identifier: string) => `rate:${identifier}`
};

// Cache conversation (TTL: 1 hour)
await redis.setex(
  CACHE_KEYS.conversation(sessionId),
  3600,
  JSON.stringify(messages)
);
```

---

## 🛡️ Input Validation & Security

### Validation Rules

```typescript
const messageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .transform(val => val.trim()),
  sessionId: z.string().uuid().optional()
});
```

### Security Measures

1. **Input Sanitization**
   - Trim whitespace
   - Escape HTML (if rendering raw)
   - Limit message length

2. **Rate Limiting**
   - Max 20 requests per minute per session
   - Max 100 requests per hour per IP

3. **Error Handling**
   - Never expose stack traces in production
   - Generic error messages for security errors

---

## 📁 Environment Variables

### Backend (server/.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chat_agent"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# LLM (Google Gemini 2.0 Flash)
GEMINI_API_KEY="your-gemini-api-key"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Frontend (client/.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### Root (.env) - Optional for monorepo
```env
# Shared environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/chat_agent"
```

---

## 📋 Implementation Checklist

### Phase 1: Setup & Foundation
- [ ] Initialize monorepo structure (pnpm workspaces)
- [ ] Setup backend (Express + TypeScript)
- [ ] Setup frontend (Next.js + TypeScript)
- [ ] Install & configure Tailwind CSS
- [ ] Setup shadcn/ui components
- [ ] Install Magic UI components
- [ ] Configure Prisma with PostgreSQL
- [ ] Setup Upstash Redis connection
- [ ] Create environment configs

### Phase 2: Backend Core
- [ ] Implement Prisma schema & migrations
- [ ] Create chat routes & controllers
- [ ] Implement chat service (CRUD operations)
- [ ] Integrate Gemini API (LLM service)
- [ ] Add input validation middleware
- [ ] Implement error handling middleware
- [ ] Add Redis caching layer

### Phase 3: Frontend Core
- [ ] Create chat UI components
- [ ] Implement useChat hook
- [ ] Add API client functions
- [ ] Style components (Tailwind CSS)
- [ ] Add loading states
- [ ] Handle errors gracefully

### Phase 4: Polish & Testing
- [ ] Test edge cases (empty input, long messages)
- [ ] Test LLM error scenarios
- [ ] Add typing indicator
- [ ] Session persistence (reload support)
- [ ] Mobile responsiveness
- [ ] Code cleanup & documentation

### Phase 5: Deployment
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel)
- [ ] Setup production database
- [ ] Test end-to-end in production
- [ ] Write comprehensive README

---

## 🚀 Deployment Strategy (Simplified)

### Approach: All-in-One Simple Deployment

#### Option 1: Vercel (Recommended - Simplest)
**Frontend + Backend on Vercel:**
- Deploy Next.js app to Vercel
- Deploy Express backend as Vercel Serverless Function
- Use Vercel Postgres (or Neon for free tier)
- Upstash Redis (already serverless)

**Steps:**
1. Push to GitHub
2. Connect repo to Vercel
3. Configure environment variables
4. Deploy with one click

#### Option 2: Render (Alternative)
**Both apps on Render:**
- Frontend: Static Site
- Backend: Web Service
- Database: Render PostgreSQL (free tier)
- Redis: Upstash

**Why Simple:**
- No Docker required
- No complex orchestration
- Free tier available
- Auto-deploys on git push
- Environment variables in UI

---

## 🔮 Future Extensibility

This architecture is designed to easily support:

1. **Multiple Channels**
   - Add `channel` field to Conversation model
   - Create channel-specific handlers
   - Route messages through unified chat service

2. **Multiple LLM Providers**
   - LLM service uses interface pattern
   - Easy to swap Gemini for OpenAI/Claude

3. **Authentication**
   - Add User model linked to Conversation
   - Implement session/JWT auth

4. **Analytics**
   - Message sentiment analysis
   - Response time tracking
   - Common question clustering

---

## ⏱️ Time Estimation

| Phase | Estimated Time |
|-------|---------------|
| Setup & Foundation | 1.5 hours |
| Backend Core | 3 hours |
| Frontend Core | 3 hours |
| Polish & Testing | 2 hours |
| Deployment & Docs | 1.5 hours |
| **Total** | **~11 hours** |

---

## 📝 Trade-offs & Assumptions

### Assumptions Made
1. Single-user session (no auth required)
2. Conversations are ephemeral but persist across page reloads
3. Rate limiting is basic (can be enhanced)
4. No real-time features (WebSocket) - simple request/response

### Trade-offs
1. **Polling vs WebSocket**: Using REST for simplicity; WebSocket would be better for real-time typing indicators
2. **Caching**: Basic Redis caching; could be more sophisticated
3. **Error Handling**: Graceful but generic; could have more specific error recovery

### If I Had More Time...
1. Add WebSocket for real-time experience
2. Implement proper rate limiting with sliding window
3. Add message search functionality
4. Implement conversation summarization for long chats
5. Add admin panel for viewing all conversations
6. Implement A/B testing for different prompts
7. Add analytics dashboard

---

## ✅ Ready to Implement?

This document provides a complete blueprint for the AI Live Chat Agent. The architecture is:
- **Modular**: Easy to understand and extend
- **Scalable**: Can handle growth
- **Maintainable**: Clean separation of concerns
- **Production-ready**: Proper error handling and security

Let me know if you have any questions or want to proceed with implementation!
