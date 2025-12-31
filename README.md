# 🤖 ShopEase AI Live Chat Agent

 A full-stack AI-powered customer support chat application

## 🔗 Live Demo

- **Frontend:** [https://chat-agent-client-ten.vercel.app](https://chat-agent-client-ten.vercel.app)
- **Backend API:** [https://chat-agent-server.vercel.app/api/health](https://chat-agent-server.vercel.app/api/health) 
- **GitHub:** [https://github.com/lalitkumarjangid/chat-agent](https://github.com/lalitkumarjangid/chat-agent)

---



## 🚀 Quick Start (Run Locally)

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database (local or cloud like [Neon](https://neon.tech), [Supabase](https://supabase.com))
- **Google Gemini API Key** - [Get one free here](https://makersuite.google.com/app/apikey)
- **Upstash Redis** (optional) - [Get free account](https://upstash.com)

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/lalitkumarjangid/chat-agent.git
cd chat-agent

# 2. Install all dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Setup environment variables (see below)

# 4. Setup database
cd server
npx prisma generate
npx prisma migrate dev --name init
cd ..

# 5. Run the application
npm run dev
```

### Environment Variables

**Server (`server/.env`):**

```env
# Server
PORT=3001
NODE_ENV=development

# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Redis (Upstash - optional but recommended)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# LLM - Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# CORS
FRONTEND_URL="http://localhost:3000"
```

**Client (`client/.env`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health Check | http://localhost:3001/api/health |
| Prisma Studio | `npx prisma studio` (port 5555) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 15 + React 18 + TypeScript                      │  │
│  │  ├── ChatWidget (main container)                         │  │
│  │  ├── MessageList (scrollable messages)                   │  │
│  │  ├── MessageBubble (user/AI distinction)                 │  │
│  │  ├── ChatInput (input + send button)                     │  │
│  │  ├── TypingIndicator ("Agent is typing...")              │  │
│  │  └── Sidebar (conversation list)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                     Axios HTTP Requests                         │
└──────────────────────────────┼──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                 │  │
│  │                                                          │  │
│  │  Routes → Controllers → Services → Data Layer            │  │
│  │                                                          │  │
│  │  ├── chat.routes.ts      (API endpoints)                 │  │
│  │  ├── chat.controller.ts  (request handling)              │  │
│  │  ├── chat.service.ts     (business logic)                │  │
│  │  ├── llm.service.ts      (Gemini API wrapper)            │  │
│  │  └── cache.service.ts    (Redis caching)                 │  │
│  │                                                          │  │
│  │  Middleware:                                             │  │
│  │  ├── validation.ts       (Zod schemas)                   │  │
│  │  ├── errorHandler.ts     (graceful errors)               │  │
│  │  └── cors.ts             (CORS configuration)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    │                    │                       │
└────────────────────┼────────────────────┼───────────────────────┘
                     ▼                    ▼
            ┌──────────────┐      ┌──────────────┐
            │  PostgreSQL  │      │    Redis     │
            │   (Prisma)   │      │  (Upstash)   │
            │              │      │              │
            │ Conversation │      │   Caching    │
            │   Message    │      │              │
            └──────────────┘      └──────────────┘
```

### Backend Structure (Layered Architecture)

```
server/src/
├── config/           # Configuration & constants
│   ├── index.ts      # Environment variables
│   ├── constants.ts  # App constants (prompts, limits)
│   └── agents.ts     # AI agent configurations
├── controllers/      # HTTP request handlers
│   └── chat.controller.ts
├── middleware/       # Express middleware
│   ├── validation.ts # Zod input validation
│   ├── errorHandler.ts
│   └── cors.ts
├── routes/           # API route definitions
│   ├── index.ts
│   └── chat.routes.ts
├── services/         # Business logic layer
│   ├── chat.service.ts   # Conversation management
│   ├── llm.service.ts    # LLM API wrapper
│   └── cache.service.ts  # Redis caching
├── types/            # TypeScript interfaces
├── utils/            # Helpers & utilities
│   ├── logger.ts
│   └── helpers.ts
├── app.ts            # Express app setup
└── index.ts          # Entry point
```

---

## 🤖 LLM Integration Details

### Provider: Google Gemini 2.5 Flash

**Why Gemini?**
- Fast response times (important for chat UX)
- Generous free tier (1500 requests/day)
- Good balance of quality and speed
- Easy to integrate via `@google/generative-ai` SDK

### How It Works

```typescript
// llm.service.ts - generateReply function
async generateReply(history: Message[], userMessage: string): Promise<string> {
  const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  // Include conversation history for context
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand...' }] },
      ...recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ],
  });
  
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
```

### System Prompt Design

The AI is configured as a customer support agent for "ShopEase" with knowledge about:
- **Shipping Policy:** Free over $50, USA/Canada only, 5-7 days standard
- **Return Policy:** 30-day window, original packaging required
- **Payment Methods:** Cards, PayPal, Apple/Google Pay
- **Business Hours:** Mon-Fri 9AM-6PM, Sat 10AM-4PM EST

### Cost Control & Guardrails

| Guardrail | Implementation |
|-----------|----------------|
| Max tokens | `maxOutputTokens: 1024` |
| History limit | Last 10 messages only |
| Input validation | Max 2000 characters |
| Rate limit retry | Exponential backoff (3 retries) |
| Error handling | Graceful fallback messages |

---

## 📚 API Documentation

### POST /api/chat/message

Send a message and get AI response.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid",
  "agent": "bard-shopease"
}
```

**Response (200):**
```json
{
  "reply": "Our return policy allows returns within 30 days...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error (400):**
```json
{
  "error": "Message cannot be empty",
  "code": "VALIDATION_ERROR"
}
```

### GET /api/chat/:sessionId/history

Get conversation history.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "What's your return policy?",
      "createdAt": "2025-12-25T10:00:00Z"
    },
    {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "Our return policy allows...",
      "createdAt": "2025-12-25T10:00:01Z"
    }
  ]
}
```

### GET /api/chat/conversations

List all conversations.

### DELETE /api/chat/:sessionId

Delete a conversation.

### GET /api/health

Health check endpoint.

---

## 🗄️ Database Schema

```prisma
model Conversation {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  metadata  Json?
  messages  Message[]
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           MessageRole  // 'user' | 'assistant'
  content        String       @db.Text
  agent          String?
  createdAt      DateTime     @default(now())
}

enum MessageRole {
  user
  assistant
}
```

---

## 🛡️ Robustness & Error Handling

### Input Validation (Zod)

```typescript
const messageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .transform(val => val.trim()),
  sessionId: z.string().uuid().optional(),
  agent: z.string().optional(),
});
```

### Error Scenarios Handled

| Scenario | Handling |
|----------|----------|
| Empty message | 400 error with clear message |
| Message too long | 400 error, suggests truncating |
| Invalid sessionId | Creates new conversation |
| LLM API timeout | Retry with exponential backoff |
| LLM rate limit (429) | Up to 3 retries with delays |
| Database error | Graceful error message |
| Invalid API key | Friendly error, logs details |

### Frontend Error Display

All errors are caught and displayed as toast notifications, never crashing the UI.

---

## 🧪 Test Queries

Try these to test the AI agent:

1. "What are your shipping options?"
2. "How do I return an item?"
3. "Do you ship to Canada?"
4. "What payment methods do you accept?"
5. "What are your business hours?"
6. "I received a defective product, what should I do?"

---

## 🚢 Deployment Guide

### Deploy to Vercel (Monorepo)

Since this is a monorepo, deploy **two separate Vercel projects**:

**1. Server (Backend):**
- Import repo → Set root directory to `server`
- Add environment variables:
  - `NODE_ENV=production`
  - `DATABASE_URL=your-postgres-url`
  - `UPSTASH_REDIS_REST_URL=your-redis-url`
  - `UPSTASH_REDIS_REST_TOKEN=your-token`
  - `GEMINI_API_KEY=your-key`
  - `FRONTEND_URL=https://your-client.vercel.app`

**2. Client (Frontend):**
- Import repo → Set root directory to `client`
- Add environment variable:
  - `NEXT_PUBLIC_API_URL=https://your-server.vercel.app/api`

### Database Setup (Production)

Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for free PostgreSQL.

```bash
# Run migrations on production DB
DATABASE_URL="your-prod-url" npx prisma migrate deploy
```

---

## 📝 Trade-offs & Design Decisions

### Decisions Made

1. **React instead of Svelte** - Faster development with existing knowledge
2. **Google Gemini instead of OpenAI** - Higher free tier limits
3. **REST instead of WebSocket** - Simpler for the scope, works well
4. **Prisma ORM** - Type-safe, great DX, auto migrations
5. **Monorepo structure** - Easier to manage for this project size

### Current Limitations

1. **No Authentication** - As per requirements
2. **Polling-based updates** - No real-time push notifications
3. **Single region** - No global edge deployment
4. **Basic rate limiting** - Server-side only

---

## 🔮 If I Had More Time...

1. **WebSocket Integration** - Real-time bidirectional communication
2. **Streaming Responses** - Show AI typing character by character
3. **Admin Dashboard** - View all conversations, analytics
4. **Message Search** - Full-text search through conversations
5. **Message Reactions** - 👍/👎 for AI response feedback
6. **Multi-agent Selection** - Let users choose different AI personalities
7. **Voice Input** - Speech-to-text integration
8. **Export Feature** - Download conversation history
9. **Rate Limiting** - Redis-based sliding window
10. **E2E Tests** - Playwright or Cypress tests

---

## 📁 Full Project Structure

```
chat-agent/
├── client/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router
│   │   ├── components/
│   │   │   ├── chat/          # Chat components
│   │   │   └── ui/            # shadcn/ui
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # API client, utils
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Validation, errors
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Helpers
│   ├── prisma/                # Database schema
│   └── package.json
│
├── package.json                # Workspace root
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

---

## 📞 Contact

For questions about this submission:
- **GitHub:** [lalitkumarjangid](https://github.com/lalitkumarjangid)
- **Repository:** [chat-agent](https://github.com/lalitkumarjangid/chat-agent)

---

**Built with ❤️**
