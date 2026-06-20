# askfes — multi-account X auto-poster

A Next.js dashboard that auto-generates and posts questions to multiple X/Twitter
accounts via IFTTT. Each account has its own AI persona, topic list, IFTTT
credentials, and posting interval. Tweets are generated with Google Gemini and
delivered through IFTTT Webhooks; a Vercel cron job drives the schedule.

## Stack
- Next.js 16 (App Router) on Vercel
- Neon Postgres (`@neondatabase/serverless`)
- Google Gemini (`gemini-2.5-flash`)
- IFTTT Maker Webhooks → X

## Setup

1. Install deps:
   ```bash
   npm install
   ```
2. Copy `.env.example` → `.env.local` and fill in:
   - `DATABASE_URL` — Neon connection string
   - `GEMINI_API_KEY` — https://aistudio.google.com/apikey
   - `DASHBOARD_PASSWORD` — password for the dashboard login
   - `AUTH_SECRET` — any long random string (signs the session cookie)
   - `CRON_SECRET` — bearer token Vercel sends to the cron endpoint
3. Create the tables and (optionally) seed the first account:
   ```bash
   npm run db:migrate
   npm run db:seed     # seeds an "askfes" account from IFTTT_* env vars, if set
   ```
4. Run locally:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 → redirects to `/dashboard` (login required).

## How it works

- **Accounts** live in the `accounts` table. Manage them in the dashboard:
  name, handle, IFTTT webhook key + event name, post prefix (e.g. `ask! `),
  system prompt, topic list, posting interval, and an enabled toggle.
- **Cron** (`/api/cron/tweet`, scheduled in `vercel.json`) runs on a fixed
  schedule. Each run it posts for every *enabled* account whose interval has
  elapsed since `last_posted_at`, logging each attempt to the `posts` table.
- **Test now** on each dashboard card generates + posts immediately.

## Deploy (Vercel)

Set all `.env.local` values in **Project → Settings → Environment Variables**
(Vercel auto-injects `CRON_SECRET` for cron requests). Push to deploy.

> **Cron note:** Vercel **Hobby** plan only runs crons ~once/day regardless of
> the `*/20 * * * *` schedule in `vercel.json`. For true 20-minute posting you
> need the **Pro** plan, or move the cron to an external scheduler hitting
> `/api/cron/tweet` with the `Authorization: Bearer $CRON_SECRET` header.
