/**
 * Supabase query helpers — server-side only.
 * Import these in Server Components or Server Actions.
 */
import { createClient } from '@/lib/supabase/server'
import type { DashboardSummary, UpcomingPayment } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

/** Get the authenticated user's profile */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/** Fetch payment entries for a given month with joined payment + category data */
export async function getPaymentEntries(userId: string, year: number, month: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_entries')
    .select(`
      *,
      payment:payments (
        *,
        category:categories (*)
      )
    `)
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('getPaymentEntries error:', error)
    return []
  }

  // Attach days_until_due
  return (data ?? []).map(entry => ({
    ...entry,
    days_until_due: differenceInDays(parseISO(entry.due_date), new Date()),
  })) as UpcomingPayment[]
}

/** Compute dashboard summary from payment entries, converting everything to COP */
export function computeSummary(entries: UpcomingPayment[], _currency = 'COP', usdToCOP = 4100): DashboardSummary {
  let total_paid = 0
  let total_pending = 0

  for (const e of entries) {
    const amount = e.payment?.amount ?? 0
    const curr   = e.payment?.currency ?? 'COP'
    const inCOP  = curr === 'USD' ? amount * usdToCOP : amount
    if (e.status === 'paid') {
      total_paid += inCOP
    } else {
      total_pending += inCOP
    }
  }

  return {
    total_month: total_paid + total_pending,
    total_paid,
    total_pending,
    currency: 'COP',
  }
}

/** Mark a payment entry as paid */
export async function markEntryPaid(entryId: string, userId: string) {
  const supabase = await createClient()
  return supabase
    .from('payment_entries')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      paid_by: userId,
    })
    .eq('id', entryId)
}

/** Mark a payment entry as unpaid (undo) */
export async function markEntryUnpaid(entryId: string) {
  const supabase = await createClient()
  return supabase
    .from('payment_entries')
    .update({
      status: 'pending',
      paid_at: null,
      paid_by: null,
    })
    .eq('id', entryId)
}

/** Get user categories */
export async function getCategories(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  return data ?? []
}

/** Get user's spaces with pending totals */
export async function getSpaces(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('space_members')
    .select(`
      space:spaces (
        *,
        members:space_members (
          *,
          profile:profiles (id, full_name, avatar_url)
        )
      )
    `)
    .eq('user_id', userId)
  return (data ?? []).map(d => d.space).filter(Boolean)
}
