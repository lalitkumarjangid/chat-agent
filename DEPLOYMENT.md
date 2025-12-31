# Vercel Deployment Guide

This guide explains how to deploy the Chat Agent monorepo on Vercel.

## Overview

Since Vercel works best with separate projects for each app in a monorepo, you'll need to create **two separate Vercel projects**:

1. **Client** (Next.js frontend)
2. **Server** (Express API as serverless functions)

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your repository pushed to GitHub/GitLab/Bitbucket
- A PostgreSQL database (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres))
- [Upstash Redis](https://upstash.com) for caching (optional but recommended)
- [Google AI Studio API Key](https://makersuite.google.com/app/apikey) for Gemini

---

## Step 1: Deploy the Server (API)

### 1.1 Create a New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: `Other`
   - **Root Directory**: `server` (click "Edit" and select `server`)
   - **Build Command**: `pnpm vercel-build` or leave as default
   - **Output Directory**: Leave empty

### 1.2 Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` | PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | `https://your-redis.upstash.io` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | `your-upstash-token` | Upstash Redis REST Token |
| `GEMINI_API_KEY` | `your-gemini-api-key` | Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Model to use (optional) |
| `FRONTEND_URL` | `https://your-client-app.vercel.app` | Your deployed client URL (add after deploying client) |

### 1.3 Deploy

Click **"Deploy"** and wait for the build to complete.

> **Note**: After deployment, copy the server URL (e.g., `https://your-server-app.vercel.app`). You'll need it for the client.

---

## Step 2: Deploy the Client (Frontend)

### 2.1 Create Another Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the **same** Git repository
4. Configure the project:
   - **Framework Preset**: `Next.js` (should auto-detect)
   - **Root Directory**: `client` (click "Edit" and select `client`)
   - **Build Command**: Leave as default (`pnpm build` or `next build`)
   - **Output Directory**: Leave as default

### 2.2 Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-server-app.vercel.app/api` | Your deployed server API URL |

> **Important**: Replace `your-server-app.vercel.app` with your actual server deployment URL from Step 1.

### 2.3 Deploy

Click **"Deploy"** and wait for the build to complete.

---

## Step 3: Update CORS Settings

After both are deployed, go back to your **Server** project in Vercel and update:

| Variable Name | Value |
|--------------|-------|
| `FRONTEND_URL` | `https://your-client-app.vercel.app` |

Then redeploy the server project for the changes to take effect.

---

## Environment Variables Summary

### Server Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
FRONTEND_URL=https://your-client-app.vercel.app
```

### Client Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-server-app.vercel.app/api
```

---

## How to Add Environment Variables in Vercel UI

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **"Settings"** tab
3. Select **"Environment Variables"** from the left sidebar
4. For each variable:
   - Enter the **Key** (variable name)
   - Enter the **Value**
   - Select which environments to apply it to (Production, Preview, Development)
   - Click **"Save"**

![Vercel Environment Variables](https://vercel.com/_next/image?url=%2Fdocs-proxy%2Fstatic%2Fdocs%2Fconcepts%2Fprojects%2Fenvironment-variables.png&w=1920&q=75)

---

## Database Migration

Before your app works, you need to run database migrations. You have two options:

### Option 1: Run Locally (Recommended for first deploy)

```bash
cd server
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

### Option 2: Use Vercel CLI

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in server matches your client URL exactly
- Check there's no trailing slash

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel's IP ranges
- For Neon/Supabase, enable "Allow connections from anywhere" or add Vercel's IPs

### API Not Working
- Check the server logs in Vercel Dashboard → Deployments → Functions tab
- Verify all required environment variables are set

### Build Failures
- Check that `prisma generate` runs during build
- Ensure all dependencies are in `dependencies` not `devDependencies` if needed at runtime

---

## Alternative: Deploy as a Single App

If you prefer a single deployment, you can:

1. Move the Express API to Next.js API routes in the client
2. Use the root `vercel.json` to configure both

However, the two-project approach is recommended for better separation of concerns and independent scaling.

---

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
