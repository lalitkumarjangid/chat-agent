# 🤖 ShopEase AI Live Chat Agent

A full-stack AI-powered customer support chat application built for the Spur take-home assignment. Features real-time chat with Google Gemini 2.0 Flash AI, persistent conversations, and a beautiful modern UI.

## 🎯 Project Overview

This project demonstrates a production-ready AI chat agent that can handle customer support queries for a fictional e-commerce store "ShopEase". The agent has built-in knowledge about shipping policies, returns, payment methods, and business hours.

### ✨ Key Features

- 🤖 **AI-Powered Responses** - Google Gemini 2.0 Flash integration
- 💾 **Persistent Conversations** - Sessions stored in PostgreSQL
- ⚡ **Redis Caching** - Upstash Redis for performance optimization
- 🎨 **Modern UI** - Built with Next.js, Tailwind CSS, shadcn/ui
- 🔒 **Input Validation** - Zod schemas with comprehensive error handling
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 🔄 **Session Management** - Conversations persist across page reloads
- ⏱️ **Typing Indicators** - Real-time UI feedback

## 🏗️ Architecture

```
Monorepo Structure:
├── client/          Next.js 15 + React 18 + TypeScript
├── server/          Express + TypeScript + Prisma
└── package.json     Workspace configuration
```

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Axios for API calls
- Lucide React icons

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- Upstash Redis (caching)
- Google Gemini 2.0 Flash API
- Zod (validation)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Upstash Redis account (free tier works)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**

```bash
cd chat-agent
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

3. **Setup environment variables**

**Server (.env):**

Create `server/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (replace with your PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/chat_agent"

# Redis (Upstash - get from https://upstash.com/)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Google Gemini API (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY="your-gemini-api-key"

# CORS
FRONTEND_URL="http://localhost:3000"
```

**Client (.env.local):**

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Setup Database**

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

5. **Run the application**

From the root directory:

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health

## 📚 API Documentation

### Endpoints

#### 1. Send Message
```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid"
}

Response:
{
  "reply": "Our return policy allows returns within 30 days...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 2. Get Conversation History
```http
GET /api/chat/:sessionId/history

Response:
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "What's your return policy?",
      "createdAt": "2025-12-25T10:00:00Z"
    },
    ...
  ]
}
```

#### 3. Health Check
```http
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2025-12-25T10:00:00Z"
}
```

## 🎨 UI Components

The chat interface includes:
- **ChatWidget** - Main container with gradient header
- **MessageList** - Scrollable message area with auto-scroll
- **MessageBubble** - Individual messages with user/AI distinction
- **ChatInput** - Input field with character count and send button
- **TypingIndicator** - Animated dots when AI is generating response

## 🧪 Testing the Application

### Test Queries

Try these questions to test the AI agent:

1. "What are your shipping options?"
2. "How do I return an item?"
3. "Do you ship to Canada?"
4. "What payment methods do you accept?"
5. "What are your business hours?"

### Error Handling Tests

- Send empty message (validation error)
- Send very long message (>2000 chars)
- Disconnect from database (graceful error)
- Invalid API key (fallback message)

## 🗄️ Database Schema

```prisma
model Conversation {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  metadata  Json?
  messages  Message[]
}

model Message {
  id             String      @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(...)
  role           MessageRole  // 'user' | 'assistant'
  content        String      @db.Text
  createdAt      DateTime    @default(now())
}
```

## 🚢 Deployment

### Option 1: Vercel (Recommended)

**Backend:**
1. Push code to GitHub
2. Import project to Vercel
3. Set root directory to `server`
4. Add environment variables in Vercel dashboard
5. Deploy

**Frontend:**
1. Import project to Vercel (same repo)
2. Set root directory to `client`
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

**Database:**
- Use [Neon](https://neon.tech/) (free PostgreSQL)
- Or [Supabase](https://supabase.com/)
- Update `DATABASE_URL` in Vercel env vars

### Option 2: Render

**Backend:**
1. Create new Web Service
2. Build command: `cd server && npm install && npm run build`
3. Start command: `cd server && npm start`
4. Add environment variables

**Frontend:**
1. Create new Static Site
2. Build command: `cd client && npm install && npm run build`
3. Publish directory: `client/.next`

## 📁 Project Structure

```
chat-agent/
├── client/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── chat/          # Chat-specific components
│   │   │   │   ├── ChatWidget.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   │   └── ui/            # shadcn/ui components
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── card.tsx
│   │   │       └── scroll-area.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts     # Custom chat hook
│   │   ├── lib/
│   │   │   ├── api.ts         # API client
│   │   │   └── utils.ts       # Utilities
│   │   └── types/
│   │       └── chat.ts        # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts       # Configuration
│   │   │   └── constants.ts   # Constants & prompts
│   │   ├── controllers/
│   │   │   └── chat.controller.ts
│   │   ├── middleware/
│   │   │   ├── validation.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── cors.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   └── chat.routes.ts
│   │   ├── services/
│   │   │   ├── chat.service.ts
│   │   │   ├── llm.service.ts
│   │   │   └── cache.service.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── package.json                 # Root workspace config
├── .gitignore
├── .env.example
├── PLANNING.md                  # Technical planning doc
└── README.md                    # This file
```

## 🔧 Development Notes

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Useful Scripts

```bash
# Root level
npm run dev          # Run both frontend & backend
npm run build        # Build both apps

# Server only
cd server
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm start            # Run production build

# Client only
cd client
npm run dev          # Development server
npm run build        # Production build
npm start            # Run production build
```

## 🛡️ Security & Validation

- ✅ Input validation with Zod schemas
- ✅ Message length limits (max 2000 characters)
- ✅ CORS configuration
- ✅ Environment variable validation
- ✅ No exposed secrets in code
- ✅ Error messages sanitized in production
- ✅ SQL injection protection (Prisma ORM)

## 📝 Trade-offs & Future Improvements

### Current Limitations

1. **No Authentication** - Single-user system (as per requirements)
2. **Basic Rate Limiting** - Can be enhanced with Redis-based sliding window
3. **REST API** - WebSocket would be better for real-time typing indicators
4. **Simple Caching** - Could implement more sophisticated cache invalidation

### If I Had More Time...

1. **WebSocket Integration** - Real-time bidirectional communication
2. **Admin Dashboard** - View all conversations, analytics
3. **Conversation Search** - Full-text search through messages
4. **Message Reactions** - Thumbs up/down for AI responses
5. **Multi-language Support** - i18n for the UI
6. **A/B Testing** - Test different prompts and UI variations
7. **Analytics Dashboard** - Response times, common queries, sentiment
8. **Voice Input** - Speech-to-text integration
9. **File Uploads** - Support for image attachments
10. **Export Conversations** - Download chat history

## 🤝 Contributing

This is a take-home assignment, but if you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this code for learning purposes.

## 📞 Support

For questions about this project, please open an issue on GitHub or contact [your-email@example.com]

---

**Built with ❤️ for Spur - December 2025**
# chat-agent
