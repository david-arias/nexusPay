import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { formatCOP, getUSDtoCOP, toCOP } from '@/lib/exchange-rate'

export default async function SpacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1

  // Fetch spaces + their current month entries in one go
  const [spacesResult, usdToCOP] = await Promise.all([
    supabase
      .from('space_members')
      .select(`
        space:spaces (
          id, name, description,
          payments (
            id,
            payment_entries ( id, status, payment_id, payment:payments(amount, currency) )
          )
        )
      `)
      .eq('user_id', user.id),
    getUSDtoCOP(),
  ])

  // We need entries for current month — simpler: fetch separately per space
  // Instead, fetch all payments with entries for this month for spaces the user belongs to
  const rawSpaces = (spacesResult.data ?? []).map((d: any) => d.space).filter(Boolean) as any[]

  // For each space, fetch this month's entries
  const spacesWithTotals = await Promise.all(rawSpaces.map(async (space: any) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('id')
      .eq('space_id', space.id)

    const paymentIds = (payments ?? []).map((p: any) => p.id)
    if (paymentIds.length === 0) return { ...space, totalPending: 0, totalPaid: 0, total: 0, paidPct: 0 }

    const { data: entries } = await supabase
      .from('payment_entries')
      .select('status, payment:payments(amount, currency)')
      .in('payment_id', paymentIds)
      .eq('year', year)
      .eq('month', month)

    let totalPending = 0, totalPaid = 0
    for (const e of entries ?? []) {
      const inCOP = toCOP((e.payment as any)?.amount ?? 0, (e.payment as any)?.currency ?? 'COP', usdToCOP)
      if (e.status === 'paid') totalPaid += inCOP
      else totalPending += inCOP
    }
    const total   = totalPending + totalPaid
    const paidPct = total > 0 ? Math.round((totalPaid / total) * 100) : 0
    return { ...space, totalPending, totalPaid, total, paidPct }
  }))

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>

      <header className="px-4 pt-12 pb-4">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Espacios</h1>
      </header>

      <div className="px-4">
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Gestiona gastos comunes con roomies, colegas o familia.
        </p>

        <Link
          href="/spaces/new"
          className="flex items-center justify-center gap-2 w-full h-14
                     bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]
                     rounded-2xl transition-colors duration-150 tap-none mb-5"
        >
          <Plus size={20} />
          Crear Nuevo Espacio
        </Link>

        {spacesWithTotals.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <p className="text-sm">Aún no tienes espacios compartidos.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {spacesWithTotals.map((space: any) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}

        <Link
          href="/spaces/new"
          className="flex flex-col items-center justify-center gap-2 mt-4
                     border-2 border-dashed border-[var(--border)] rounded-2xl p-8
                     text-[var(--text-secondary)] hover:border-blue-300 hover:text-blue-500
                     transition-colors duration-150 tap-none"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--input-bg)] flex items-center justify-center">
            <Plus size={20} />
          </div>
          <p className="text-sm font-medium">Nuevo Espacio</p>
          <p className="text-xs">Añade un grupo para compartir tus pagos.</p>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}

function SpaceCard({ space }: { space: any }) {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] text-[16px]">{space.name}</h3>
          {space.description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{space.description}</p>}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--text-secondary)]">Pendiente este mes</span>
          <span className="font-bold text-blue-600">{formatCOP(space.totalPending)}</span>
        </div>
        <div className="h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${space.paidPct}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--text-secondary)]">{space.paidPct}% pagado</span>
          <span className="text-[10px] text-[var(--text-secondary)]">Total: {formatCOP(space.total)}</span>
        </div>
      </div>

      <Link href={`/spaces/${space.id}`}
        className="w-full h-11 bg-[var(--input-bg)] hover:bg-[var(--divider)] rounded-xl
                   text-sm font-semibold text-[var(--text-primary)]
                   flex items-center justify-center transition-colors tap-none">
        Ver Detalles
      </Link>
    </div>
  )
}
