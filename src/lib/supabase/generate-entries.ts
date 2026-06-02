'use server'

import { createClient } from '@/lib/supabase/server'
import { getDaysInMonth, setDate, format } from 'date-fns'

/**
 * Ensures payment_entries exist for the given user + month.
 * Called lazily from the dashboard on every load.
 *
 * Logic:
 * - Fetch all active payments for the user
 * - Find which ones DON'T have an entry for year/month yet
 * - Insert missing entries with status='pending'
 * - Overdue entries from previous months stay as-is in history
 */
export async function ensureMonthlyEntries(userId: string, year: number, month: number) {
  const supabase = await createClient()

  // 1. Get all payments (recurring + one-time that were created this month)
  const { data: payments } = await supabase
    .from('payments')
    .select('id, due_day, is_recurring, created_at')
    .eq('user_id', userId)

  if (!payments || payments.length === 0) return

  // 2. Get existing entries for this month
  const { data: existing } = await supabase
    .from('payment_entries')
    .select('payment_id')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)

  const existingIds = new Set((existing ?? []).map(e => e.payment_id))

  // 3. Filter payments that need a new entry this month
  const missing = payments.filter(p => {
    if (existingIds.has(p.id)) return false
    // Recurring → always generate
    if (p.is_recurring) return true
    // One-time → only if created in the current month
    const created = new Date(p.created_at)
    return created.getFullYear() === year && created.getMonth() + 1 === month
  })

  if (missing.length === 0) return

  // 4. Build entries
  const entries = missing.map(p => {
    const daysInMonth  = getDaysInMonth(new Date(year, month - 1))
    const cappedDay    = Math.min(p.due_day, daysInMonth)
    const due_date     = format(setDate(new Date(year, month - 1), cappedDay), 'yyyy-MM-dd')

    return {
      payment_id: p.id,
      user_id:    userId,
      year,
      month,
      due_date,
      status:     'pending' as const,
    }
  })

  await supabase.from('payment_entries').insert(entries)
}
