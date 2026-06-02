import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentEntries, computeSummary } from '@/lib/supabase/queries'
import { ensureMonthlyEntries } from '@/lib/supabase/generate-entries'
import { DashboardClient } from './DashboardClient'

/**
 * Dashboard Server Component — fetches data, passes to client shell.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  // Auto-generate entries for recurring payments if they don't exist yet this month
  await ensureMonthlyEntries(user.id, year, month)

  const [profileResult, entries] = await Promise.all([
    supabase.from('profiles').select('full_name, currency').eq('id', user.id).single(),
    getPaymentEntries(user.id, year, month),
  ])

  const profile = profileResult.data
  const summary = computeSummary(entries, profile?.currency ?? 'USD')

  const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
    .format(now)
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <DashboardClient
      initialEntries={entries}
      summary={summary}
      monthLabel={monthLabel}
      userName={profile?.full_name?.split(' ')[0] ?? 'Usuario'}
      userInitials={
        profile?.full_name
          ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
          : 'U'
      }
    />
  )
}
