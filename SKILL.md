---
name: nexuspay-dev
description: NexusPay full-stack developer skill. Use when building features, components, pages, API routes, or database queries for the NexusPay PWA.
color: blue
emoji: 💳
---

# NexusPay Developer

You are a Senior Full-Stack developer working on **NexusPay** — a Mobile-First PWA for recurring payment management.

## Project Context

- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Vercel
- **UI Library**: Lucide React icons, custom Tailwind components
- **Design**: Mobile-First, max-width 448px (md), bottom navigation bar
- **Language**: Spanish UI (all labels, placeholders, and copy in Spanish)

## Design System Rules

### Colors
- Primary blue: `#0058BE` / `text-primary-600` / `bg-primary-600`
- Success (paid): `#10B981` / `text-success` / `bg-success-bg`
- Warning (upcoming): `#F59E0B` / `text-warning` / `bg-warning-bg`
- Danger (overdue): `#EF4444` / `text-danger` / `bg-danger-bg`
- Background: `bg-surface` (`#F9F9FF`)
- Cards: `bg-white rounded-2xl border border-gray-100`

### Typography
- Font: Inter
- Headings: `font-bold text-gray-900`
- Labels/caps: `text-xs font-semibold uppercase tracking-wider text-gray-400`
- Amounts: `font-bold tabular-nums`

### Spacing & Layout
- Container padding: `px-4`
- Card padding: `p-4` or `p-5`
- Section gap: `mt-6`
- Cards gap: `gap-3`

### Components
- All tap targets minimum 44×44px
- Buttons: `min-h-[44px]`, primary = `bg-primary-600 text-white rounded-2xl`
- Cards: `bg-white rounded-2xl border border-gray-100 p-4`
- Bottom nav: fixed, `pb-[env(safe-area-inset-bottom)]`

## File Structure

```
src/
  app/
    layout.tsx          # Root layout
    page.tsx            # Redirects to /dashboard
    dashboard/page.tsx  # Main dashboard (Inicio)
    add/page.tsx        # Add payment form
    spaces/page.tsx     # Shared spaces
    profile/page.tsx    # User profile
    auth/
      login/page.tsx
      register/page.tsx
  components/
    layout/
      BottomNav.tsx
    dashboard/
      SummaryCard.tsx
      PaymentItem.tsx
      Promobanner.tsx
    ui/
      CategoryIcon.tsx
  lib/
    utils.ts            # cn(), formatCurrency(), getStatusConfig()
    mock-data.ts        # Mock data for UI dev
    supabase/
      client.ts         # Browser client
      server.ts         # Server component client
  types/
    index.ts            # All TypeScript types
supabase/
  schema.sql            # Full DB schema with RLS
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Public user data (extends auth.users) |
| `categories` | User-defined payment categories |
| `spaces` | Shared payment groups |
| `space_members` | Users ↔ Spaces junction |
| `payments` | Recurring/one-time payment definitions |
| `payment_entries` | Monthly occurrences (1 per payment per month) |
| `space_invitations` | Pending email invites |

## Key Patterns

### Supabase query in Server Component
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('payment_entries')
  .select('*, payment:payments(*, category:categories(*))')
  .eq('user_id', user.id)
  .eq('year', year)
  .eq('month', month)
  .order('due_date')
```

### Mark payment as paid
```typescript
await supabase
  .from('payment_entries')
  .update({ status: 'paid', paid_at: new Date().toISOString(), paid_by: user.id })
  .eq('id', entryId)
```

### Status color helper
```typescript
import { getStatusConfig } from '@/lib/utils'
const cfg = getStatusConfig(entry.status, entry.days_until_due)
// cfg.label, cfg.textColor, cfg.bgColor, cfg.dotColor
```

## When Building a New Page

1. Create `src/app/[route]/page.tsx`
2. Add `<BottomNav />` at the bottom
3. Wrap in `<div className="flex flex-col min-h-screen bg-surface pb-20">`
4. Use `px-4` container padding throughout
5. Always include proper `aria-label` attributes
6. Copy (text) must be in Spanish

## When Building a New Component

1. Place in `src/components/[section]/ComponentName.tsx`
2. Add `'use client'` only if it uses hooks or event handlers
3. Export as named export (not default)
4. Use `cn()` from `@/lib/utils` for conditional classes
5. Props interface should be typed with TypeScript

## Reminder

- The app is called **NexusPay** (not "No Se Me Pasa")
- Always mobile-first: test at 390px width
- Bottom nav height is 64px + safe-area; content needs `pb-20` minimum
