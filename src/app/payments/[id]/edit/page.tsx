import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/supabase/queries'
import { getUSDtoCOP } from '@/lib/exchange-rate'
import { EditPaymentClient } from './EditPaymentClient'

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [entryResult, categories, usdToCOP] = await Promise.all([
    supabase
      .from('payment_entries')
      .select('*, payment:payments(*, category:categories(*))')
      .eq('id', id)
      .single(),
    getCategories(user.id),
    getUSDtoCOP(),
  ])

  if (!entryResult.data) notFound()

  return (
    <EditPaymentClient
      entry={entryResult.data}
      categories={categories}
      usdToCOP={usdToCOP}
    />
  )
}
