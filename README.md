# NexusPay

PWA para el control y planificación de pagos recurrentes.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: Shadcn UI + Lucide Icons
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Deploy**: Vercel

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## Database

Run `supabase/schema.sql` in your Supabase SQL Editor.

## Folder Structure

```
src/
  app/              # Next.js App Router pages
  components/       # Reusable UI components
  lib/              # Supabase client, utils, hooks
  types/            # TypeScript types
```
