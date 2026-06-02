'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function togglePaymentPaid(
  entryId: string,
  currentlyPaid: boolean,
  opts?: { paidAt?: string; amountPaid?: number; method?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('payment_entries')
    .update(
      currentlyPaid
        ? { status: 'pending', paid_at: null, paid_by: null, amount_paid: null, payment_method: null }
        : {
            status: 'paid',
            paid_at: opts?.paidAt ?? new Date().toISOString(),
            paid_by: user.id,
            amount_paid: opts?.amountPaid ?? null,
            payment_method: opts?.method ?? null,
          }
    )
    .eq('id', entryId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/notifications')
  return { success: true }
}
