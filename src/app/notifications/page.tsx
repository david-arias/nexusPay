import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatByCurrency } from '@/lib/exchange-rate'
import { differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import { Bell, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1

  // Fetch pending entries for current month — overdue + due soon
  const { data: entries } = await supabase
    .from('payment_entries')
    .select('*, payment:payments(*, category:categories(*))')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('month', month)
    .neq('status', 'paid')
    .order('due_date', { ascending: true })

  const notifications = (entries ?? []).map(e => ({
    ...e,
    days: differenceInDays(parseISO(e.due_date), now),
  })).filter(e => e.days <= 7) // Only show next 7 days + overdue

  const overdue  = notifications.filter(n => n.days < 0)
  const dueToday = notifications.filter(n => n.days === 0)
  const upcoming = notifications.filter(n => n.days > 0)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Notificaciones</h1>
        <Bell size={22} className="text-gray-400 mr-1" />
      </header>

      <div className="px-4 flex flex-col gap-5">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={28} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">¡Todo al día!</p>
            <p className="text-sm text-gray-500">No tienes pagos vencidos ni próximos a vencer.</p>
          </div>
        )}

        {overdue.length > 0 && (
          <NotifGroup
            title="Vencidos"
            color="red"
            items={overdue}
            labelFn={n => `Venció hace ${Math.abs(n.days)} día${Math.abs(n.days) !== 1 ? 's' : ''}`}
          />
        )}

        {dueToday.length > 0 && (
          <NotifGroup
            title="Vencen hoy"
            color="amber"
            items={dueToday}
            labelFn={() => 'Vence hoy'}
          />
        )}

        {upcoming.length > 0 && (
          <NotifGroup
            title="Próximos"
            color="blue"
            items={upcoming}
            labelFn={n => `Vence en ${n.days} día${n.days !== 1 ? 's' : ''}`}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function NotifGroup({ title, color, items, labelFn }: {
  title: string
  color: 'red' | 'amber' | 'blue'
  items: any[]
  labelFn: (n: any) => string
}) {
  const colors = {
    red:   { title: 'text-red-600',   dot: 'bg-red-500',   badge: 'bg-red-100 text-red-700'   },
    amber: { title: 'text-amber-600', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700'},
    blue:  { title: 'text-blue-600',  dot: 'bg-blue-500',  badge: 'bg-blue-100 text-blue-700'  },
  }[color]

  return (
    <div>
      <p className={cn('text-xs font-bold uppercase tracking-widest mb-2 px-1', colors.title)}>
        {title} ({items.length})
      </p>
      <div className="flex flex-col gap-2">
        {items.map(n => {
          const cat = n.payment?.category
          return (
            <Link key={n.id} href={`/payments/${n.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
              <CategoryIcon icon={cat?.icon ?? 'circle'} color={cat?.color ?? '#3B82F6'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{n.payment?.name}</p>
                <p className={cn('text-xs font-medium mt-0.5 flex items-center gap-1', colors.title)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                  {labelFn(n)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 tabular-nums">
                  {formatByCurrency(n.payment?.amount ?? 0, n.payment?.currency ?? 'COP')}
                </p>
                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full', colors.badge)}>
                  {labelFn(n)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
