import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategories, getSpaces } from '@/lib/supabase/queries'
import { getUSDtoCOP } from '@/lib/exchange-rate'
import { AddPaymentClient } from './AddPaymentClient'

export default async function AddPaymentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [categories, spaces, usdToCOP] = await Promise.all([
    getCategories(user.id),
    getSpaces(user.id),
    getUSDtoCOP(),
  ])

  return <AddPaymentClient categories={categories} spaces={spaces as any[]} usdToCOP={usdToCOP} />
}
