# Quick Start Guide

## 🚀 One-Command Setup

Run this from the project root:

```bash
chmod +x setup.sh && ./setup.sh
```

This will:
- ✅ Install all dependencies (root, server, client)
- ✅ Create environment files from templates
- ✅ Generate Prisma client

## 📝 Manual Setup Steps

If you prefer to set up manually:

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/chat_agent"
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:3000"
```

**Client (`client/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Setup Database

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run the App

From the root directory:
```bash
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

## 🔑 Getting API Keys

### Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy to `GEMINI_API_KEY` in `server/.env`

### Upstash Redis (Optional but recommended)
1. Visit https://upstash.com/
2. Create a free account
3. Create a Redis database
4. Copy REST URL and Token to `server/.env`

### PostgreSQL Database

**Local:**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or use Docker
docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

**Cloud (Free Options):**
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Supabase](https://supabase.com/) - PostgreSQL with extras
- [Railway](https://railway.app/) - PostgreSQL hosting

## 🧪 Test the Application

Try these test queries:
1. "What are your shipping options?"
2. "How do I return an item?"
3. "Do you ship to Canada?"
4. "What are your business hours?"

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3001 or 3000
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Prisma errors
```bash
cd server
npx prisma generate
npx prisma migrate reset
```

### Module not found errors
```bash
# Clean install
rm -rf node_modules client/node_modules server/node_modules
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## 📚 Additional Resources

- [Full README](README.md)
- [Planning Document](PLANNING.md)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
