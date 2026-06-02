'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addMonths, format, setDate, getDaysInMonth } from 'date-fns'

export async function createPayment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name        = formData.get('name') as string
  const amount      = parseFloat(formData.get('amount') as string)
  const due_day     = parseInt(formData.get('due_day') as string, 10)
  const category_id = formData.get('category_id') as string || null
  const space_id    = formData.get('space_id') as string || null
  const is_recurring = formData.get('is_recurring') === 'true'

  if (!name || isNaN(amount) || amount <= 0) {
    return { error: 'Nombre y monto son obligatorios.' }
  }

  // 1. Insert the payment definition
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      name,
      amount,
      due_day,
      category_id,
      space_id,
      is_recurring,
      currency: 'USD',
    })
    .select()
    .single()

  if (paymentError || !payment) {
    return { error: paymentError?.message ?? 'Error al crear pago' }
  }

  // 2. Create the payment_entry for the current month
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  // Cap due_day to last day of month (e.g. day 31 in Feb → 28)
  const cappedDay = Math.min(due_day, getDaysInMonth(new Date(year, month - 1)))
  const due_date = format(setDate(new Date(year, month - 1), cappedDay), 'yyyy-MM-dd')

  await supabase.from('payment_entries').insert({
    payment_id: payment.id,
    user_id: user.id,
    year,
    month,
    due_date,
    status: 'pending',
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
