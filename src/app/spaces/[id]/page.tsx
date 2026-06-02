import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatByCurrency } from '@/lib/exchange-rate'
import { cn } from '@/lib/utils'

export default async function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: space } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', id)
    .single()

  if (!space) notFound()

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1

  // Get payment ids for this space
  const { data: spacePayments } = await supabase
    .from('payments')
    .select('id')
    .eq('space_id', id)

  const paymentIds = (spacePayments ?? []).map(p => p.id)

  const { data: entries } = paymentIds.length > 0
    ? await supabase
        .from('payment_entries')
        .select('*, payment:payments(*, category:categories(*))')
        .eq('year', year)
        .eq('month', month)
        .in('payment_id', paymentIds)
        .order('due_date')
    : { data: [] }

  const totalPending = (entries ?? []).filter(e => e.status !== 'paid').reduce((s, e) => s + (e.payment?.amount ?? 0), 0)
  const totalPaid    = (entries ?? []).filter(e => e.status === 'paid').reduce((s, e) => s + (e.payment?.amount ?? 0), 0)
  const total        = totalPending + totalPaid

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/spaces"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Detalle del Espacio</h1>
        <Link href={`/spaces/${id}/edit`}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <Pencil size={20} className="text-gray-600" />
        </Link>
      </header>

      <div className="px-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{space.name}</h2>
          {space.description && <p className="text-sm text-gray-500 mt-0.5">{space.description}</p>}
        </div>

        {/* Total pendiente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total Pendiente</p>
          <p className="text-3xl font-bold text-blue-600 tabular-nums">
            {formatByCurrency(totalPending, 'COP')}
          </p>
          {total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{Math.round((totalPaid / total) * 100)}% pagado</span>
                <span>{formatByCurrency(totalPaid, 'COP')} pagado</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(totalPaid / total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Pagos asignados */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
            Pagos Asignados — {now.toLocaleString('es-CO', { month: 'long' })}
          </p>
          {(entries ?? []).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Sin pagos asignados este mes.</p>
              <Link href="/add" className="mt-2 inline-block text-sm font-semibold text-blue-600">+ Añadir pago</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(entries ?? []).map((entry: any) => {
                const cat    = entry.payment?.category
                const isPaid = entry.status === 'paid'
                return (
                  <Link key={entry.id} href={`/payments/${entry.id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
                    <CategoryIcon icon={cat?.icon ?? 'circle'} color={cat?.color ?? '#3B82F6'} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold text-[15px] truncate', isPaid && 'line-through text-gray-400')}>
                        {entry.payment?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isPaid ? 'Pagado' : `Vence día ${entry.payment?.due_day}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-gray-900">
                        {formatByCurrency(entry.payment?.amount ?? 0, entry.payment?.currency ?? 'COP')}
                      </p>
                      <p className={cn('text-[10px] font-bold uppercase',
                        isPaid ? 'text-green-600' : entry.status === 'overdue' ? 'text-red-500' : 'text-blue-600')}>
                        {isPaid ? 'Completado' : entry.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Delete */}
        <div className="mt-2">
          <Link href={`/spaces/${id}/delete`}
            className="w-full h-14 border-2 border-red-200 text-red-600 font-bold text-[15px]
                       rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors tap-none">
            <Trash2 size={18} />
            Eliminar Espacio
          </Link>
          <p className="text-xs text-gray-400 text-center mt-2">
            Esta acción no se puede deshacer y eliminará todos los registros asociados.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
