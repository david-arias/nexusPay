import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { getUSDtoCOP, toCOP } from '@/lib/exchange-rate'
import { PaymentsHistoryClient } from './PaymentsHistoryClient'

interface SearchParams { year?: string; month?: string }

export default async function PaymentsHistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const now    = new Date()
  const year   = parseInt(params.year  ?? String(now.getFullYear()))
  const month  = parseInt(params.month ?? String(now.getMonth() + 1))

  const [entriesResult, usdToCOP] = await Promise.all([
    supabase
      .from('payment_entries')
      .select('*, payment:payments(*, category:categories(*))')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .order('due_date', { ascending: true }),
    getUSDtoCOP(),
  ])

  const entries   = entriesResult.data ?? []
  const totalPaid = entries.filter(e => e.status === 'paid')
    .reduce((s, e) => s + toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP), 0)
  const totalAll  = entries
    .reduce((s, e) => s + toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP), 0)

  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1))
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>

      <header className="flex items-center justify-between px-4 pt-12 pb-2">
        <Link href="/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronLeft size={22} className="text-[var(--text-primary)]" />
        </Link>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Historial de Pagos</h1>
        <div className="w-10" />
      </header>

      <PaymentsHistoryClient
        entries={entries}
        year={year}
        month={month}
        monthLabel={monthLabel}
        totalPaid={totalPaid}
        totalAll={totalAll}
        usdToCOP={usdToCOP}
      />

      <BottomNav />
    </div>
  )
}
