# Deployment Guide

## Architecture

- Frontend: Vercel (React/Vite) — `src/frontend/`
- Backend: Render (Node.js/Express) — `src/backend-node/`
- Database + Storage: Supabase

---

## 1. Supabase Setup

1. Create a project at https://supabase.com
2. Go to SQL Editor and run `src/backend-node/supabase-schema.sql`
3. Go to Storage → Create a **public** bucket named `card-photos`
4. Note your **Project URL** and **service_role** key from Settings → API

---

## 2. Backend on Render

1. Push this repo to GitHub
2. Create a new **Web Service** on https://render.com
3. Set:
   - Root directory: `src/backend-node`
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   FRONTEND_URL=https://your-app.vercel.app
   PORT=3001
   ```
5. After deploy, seed the admin: `node seed-admin.js` (run via Render shell)

---

## 3. Frontend on Vercel

1. Create a new project on https://vercel.com
2. Set:
   - Root directory: `src/frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Deploy

---

## Local Development

```bash
# Backend
cd src/backend-node
cp .env.example .env   # fill in your Supabase credentials
npm install
npm run dev

# Frontend (separate terminal)
cd src/frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:3001
npm install
npm run dev
```
