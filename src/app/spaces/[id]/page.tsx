import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, UserPlus, Trash2 } from 'lucide-react'
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

  // Fetch space with members
  const { data: space } = await supabase
    .from('spaces')
    .select('*, members:space_members(*, profile:profiles(id, full_name, avatar_url))')
    .eq('id', id)
    .single()

  if (!space) notFound()

  // Fetch payment entries for this space (current month)
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: entries } = await supabase
    .from('payment_entries')
    .select('*, payment:payments(*, category:categories(*))')
    .eq('year', year)
    .eq('month', month)
    .in('payment_id', (
      await supabase.from('payments').select('id').eq('space_id', id)
    ).data?.map(p => p.id) ?? [])

  const totalPending = (entries ?? [])
    .filter(e => e.status !== 'paid')
    .reduce((s, e) => s + (e.payment?.amount ?? 0), 0)

  const totalPaid = (entries ?? [])
    .filter(e => e.status === 'paid')
    .reduce((s, e) => s + (e.payment?.amount ?? 0), 0)

  const total = totalPending + totalPaid
  const isOwner = space.owner_id === user.id

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/spaces"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Detalle del Espacio</h1>
        {isOwner && (
          <Link href={`/spaces/${id}/edit`}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
            <Pencil size={20} className="text-gray-600" />
          </Link>
        )}
      </header>

      <div className="px-4 flex flex-col gap-4">
        {/* Space title + members */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{space.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <span>👥</span> {space.members?.length ?? 0} miembros
          </p>
        </div>

        {/* Invite member button */}
        {isOwner && (
          <Link href={`/spaces/${id}/invite`}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px]
                       rounded-2xl flex items-center justify-center gap-2 transition-colors tap-none">
            <UserPlus size={18} />
            Invitar Miembro
          </Link>
        )}

        {/* Total pendiente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total Pendiente</p>
          <p className="text-3xl font-bold text-blue-600 tabular-nums">
            {formatByCurrency(totalPending, 'COP')}
          </p>
          {total > 0 && (
            <p className="text-xs text-green-600 font-medium mt-2">
              ↓ {Math.round((totalPaid / total) * 100)}% pagado este mes
            </p>
          )}
        </div>

        {/* Members list */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">Miembros</p>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {(space.members ?? []).map((m: any) => (
              <div key={m.user_id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center
                                text-white text-sm font-bold flex-shrink-0">
                  {m.profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-gray-900">{m.profile?.full_name ?? 'Usuario'}</p>
                  <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos asignados */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">Pagos Asignados</p>
          {(entries ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin pagos este mes.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {(entries ?? []).map((entry: any) => {
                const cat   = entry.payment?.category
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

        {/* Delete space — owner only */}
        {isOwner && (
          <div className="mt-2">
            <Link href={`/spaces/${id}/delete`}
              className="w-full h-14 border-2 border-red-300 text-red-600 font-bold text-[15px]
                         rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors tap-none">
              <Trash2 size={18} />
              Eliminar Espacio
            </Link>
            <p className="text-xs text-gray-400 text-center mt-2">
              Esta acción no se puede deshacer y eliminará todos los registros asociados.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
