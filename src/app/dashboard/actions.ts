'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function togglePaymentPaid(entryId: string, currentlyPaid: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('payment_entries')
    .update(
      currentlyPaid
        ? { status: 'pending', paid_at: null, paid_by: null, amount_paid: null }
        : { status: 'paid', paid_at: new Date().toISOString(), paid_by: user.id }
    )
    .eq('id', entryId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
