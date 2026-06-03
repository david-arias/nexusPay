import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentEntries, computeSummary } from '@/lib/supabase/queries'
import { ensureMonthlyEntries } from '@/lib/supabase/generate-entries'
import { getUSDtoCOP, toCOP } from '@/lib/exchange-rate'
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

  const [profileResult, entries, usdToCOP, spaceMembersResult] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    getPaymentEntries(user.id, year, month),
    getUSDtoCOP(),
    supabase
      .from('space_members')
      .select('space:spaces(id, name)')
      .eq('user_id', user.id),
  ])

  const profile = profileResult.data
  const summary = computeSummary(entries, 'COP', usdToCOP)

  // Fetch space totals for the bar chart
  const rawSpaces = (spaceMembersResult.data ?? []).map((d: any) => d.space).filter(Boolean)
  const spaceTotals: { name: string; total: number }[] = await Promise.all(
    rawSpaces.map(async (space: any) => {
      const { data: pids } = await supabase
        .from('payments').select('id').eq('space_id', space.id)
      const ids = (pids ?? []).map((p: any) => p.id)
      if (ids.length === 0) return { name: space.name, total: 0 }
      const { data: ents } = await supabase
        .from('payment_entries')
        .select('payment:payments(amount, currency)')
        .in('payment_id', ids)
        .eq('year', year).eq('month', month)
      const total = (ents ?? []).reduce(
        (s: number, e: any) => s + toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP), 0
      )
      return { name: space.name, total }
    })
  )

  const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
    .format(now)
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <DashboardClient
      initialEntries={entries}
      summary={summary}
      monthLabel={monthLabel}
      usdToCOP={usdToCOP}
      spaceTotals={spaceTotals}
      userName={profile?.full_name?.split(' ')[0] ?? 'Usuario'}
      userInitials={
        profile?.full_name
          ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
          : 'U'
      }
      avatarUrl={profile?.avatar_url ?? null}
    />
  )
}
