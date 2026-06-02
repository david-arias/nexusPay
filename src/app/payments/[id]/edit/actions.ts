'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePayment(paymentId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name        = formData.get('name') as string
  const amount      = parseFloat(formData.get('amount') as string)
  const due_day     = parseInt(formData.get('due_day') as string, 10)
  const category_id = formData.get('category_id') as string || null
  const currency    = formData.get('currency') as string || 'COP'
  const is_recurring = formData.get('is_recurring') === 'true'
  const notes       = formData.get('notes') as string || null

  if (!name || isNaN(amount)) return { error: 'Nombre y monto son obligatorios.' }

  const { error } = await supabase
    .from('payments')
    .update({ name, amount, due_day, category_id, currency, is_recurring, notes, updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/payments')
  revalidatePath('/dashboard')
  redirect('/payments')
}

export async function deletePayment(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/payments')
  revalidatePath('/dashboard')
  redirect('/payments')
}
