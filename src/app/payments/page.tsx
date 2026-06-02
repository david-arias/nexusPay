import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatByCurrency } from '@/lib/exchange-rate'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface SearchParams { year?: string; month?: string }

export default async function PaymentsHistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const now = new Date()
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()))
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))

  const { data: entries } = await supabase
    .from('payment_entries')
    .select('*, payment:payments(*, category:categories(*))')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('month', month)
    .order('due_date', { ascending: true })

  const totalPaid    = (entries ?? []).filter(e => e.status === 'paid').reduce((s, e) => s + (e.payment?.amount ?? 0), 0)
  const totalAll     = (entries ?? []).reduce((s, e) => s + (e.payment?.amount ?? 0), 0)

  // Prev / next month navigation
  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1)).replace(/^\w/, c => c.toUpperCase())

  // Group by date
  const grouped: Record<string, typeof entries> = {}
  for (const e of entries ?? []) {
    const key = e.due_date
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center justify-between px-4 pt-12 pb-2">
        <Link href="/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Historial de Pagos</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <Filter size={20} className="text-gray-600" />
        </button>
      </header>

      {/* Month navigator */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 flex items-center justify-between px-4 py-3">
        <Link href={`/payments?year=${prevDate.getFullYear()}&month=${prevDate.getMonth() + 1}`}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={20} className="text-gray-600" />
        </Link>
        <div className="text-center">
          <p className="text-xs text-gray-400">Mostrando</p>
          <p className="font-bold text-blue-600">{monthLabel}</p>
        </div>
        <Link href={`/payments?year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronRight size={20} className="text-gray-600" />
        </Link>
      </div>

      {/* Total card */}
      <div className="mx-4 mt-3 bg-blue-600 rounded-2xl p-5">
        <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Total Pagado</p>
        <p className="text-white text-3xl font-bold mt-1">{formatByCurrency(totalPaid, 'COP')}</p>
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: totalAll > 0 ? `${(totalPaid / totalAll) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* Entries grouped by date */}
      <div className="px-4 mt-5 flex flex-col gap-5">
        {Object.keys(grouped).length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Sin pagos este mes.</p>
        )}
        {Object.entries(grouped).map(([dateStr, items]) => (
          <div key={dateStr}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {format(parseISO(dateStr), "EEEE, d MMM", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
            </p>
            <div className="flex flex-col gap-2">
              {items!.map(entry => {
                const cat = entry.payment?.category
                const isPaid = entry.status === 'paid'
                return (
                  <Link key={entry.id} href={`/payments/${entry.id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
                    <CategoryIcon icon={cat?.icon ?? 'circle'} color={cat?.color ?? '#3B82F6'} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[15px] font-semibold truncate', isPaid && 'line-through text-gray-400')}>
                        {entry.payment?.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entry.payment_method ?? (isPaid ? 'Pagado' : 'Pendiente')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('font-bold tabular-nums', isPaid ? 'text-gray-400' : 'text-gray-900')}>
                        {formatByCurrency(entry.payment?.amount ?? 0, entry.payment?.currency ?? 'COP')}
                      </p>
                      <p className={cn(
                        'text-[10px] font-bold uppercase mt-0.5',
                        isPaid ? 'text-green-600' : entry.status === 'overdue' ? 'text-red-500' : 'text-blue-600'
                      )}>
                        {isPaid ? 'COMPLETADO' : entry.status === 'overdue' ? 'VENCIDO' : 'PENDIENTE'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
