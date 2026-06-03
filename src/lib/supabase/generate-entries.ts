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
 * - For non-recurring payments: skip if they already have an entry in ANY month
 *   (they were explicitly allocated to a specific month by the user)
 * - Insert missing entries with status='pending'
 */
export async function ensureMonthlyEntries(userId: string, year: number, month: number) {
  const supabase = await createClient()

  // 1. Get all payments for the user
  const { data: payments } = await supabase
    .from('payments')
    .select('id, due_day, is_recurring, created_at')
    .eq('user_id', userId)

  if (!payments || payments.length === 0) return

  // 2. Get existing entries for this specific month
  const { data: existingThisMonth } = await supabase
    .from('payment_entries')
    .select('payment_id')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)

  const existingThisMonthIds = new Set((existingThisMonth ?? []).map(e => e.payment_id))

  // 3. For non-recurring payments, check if they already have an entry in ANY month
  //    to avoid auto-generating a current-month entry for a payment the user
  //    explicitly scheduled for a different month.
  const nonRecurringIds = payments.filter(p => !p.is_recurring).map(p => p.id)

  let nonRecurringAllocated = new Set<string>()
  if (nonRecurringIds.length > 0) {
    const { data: anyEntry } = await supabase
      .from('payment_entries')
      .select('payment_id')
      .eq('user_id', userId)
      .in('payment_id', nonRecurringIds)

    nonRecurringAllocated = new Set((anyEntry ?? []).map(e => e.payment_id))
  }

  // 4. Filter payments that need a new entry this month
  const missing = payments.filter(p => {
    // Skip if already has entry this month
    if (existingThisMonthIds.has(p.id)) return false

    // Recurring → always generate for this month
    if (p.is_recurring) return true

    // Non-recurring → skip entirely if it already has any entry anywhere
    // (the user explicitly placed it in a specific month)
    if (nonRecurringAllocated.has(p.id)) return false

    // Non-recurring with no entry yet → generate only if created this month
    const created = new Date(p.created_at)
    return created.getFullYear() === year && created.getMonth() + 1 === month
  })

  if (missing.length === 0) return

  // 5. Build and insert entries
  const entries = missing.map(p => {
    const daysInMonth = getDaysInMonth(new Date(year, month - 1))
    const cappedDay   = Math.min(p.due_day, daysInMonth)
    const due_date    = format(setDate(new Date(year, month - 1), cappedDay), 'yyyy-MM-dd')
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
