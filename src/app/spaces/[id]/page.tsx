import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatCOP, formatUSD, getUSDtoCOP, toCOP } from '@/lib/exchange-rate'
import { cn } from '@/lib/utils'

// ── Inline pie chart (server-renderable SVG) ──────────────────────────────
interface PieSlice { label: string; color: string; pct: number; value: number }

function SpacePieChart({ slices }: { slices: PieSlice[] }) {
  const cx = 70, cy = 70, r = 58
  let cumAngle = -Math.PI / 2
  const paths = slices.map(s => {
    const angle = s.pct * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    return { d: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`, color: s.color }
  })
  return (
    <svg viewBox="0 0 140 140" className="w-28 h-28 flex-shrink-0">
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="var(--card)" strokeWidth="2" />
      ))}
      <circle cx={cx} cy={cy} r={28} fill="var(--card)" />
    </svg>
  )
}

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
  const [spacePaymentsResult, usdToCOP] = await Promise.all([
    supabase.from('payments').select('id').eq('space_id', id),
    getUSDtoCOP(),
  ])

  const paymentIds = (spacePaymentsResult.data ?? []).map((p: any) => p.id)

  const { data: entries } = paymentIds.length > 0
    ? await supabase
        .from('payment_entries')
        .select('*, payment:payments(*, category:categories(*))')
        .eq('year', year)
        .eq('month', month)
        .in('payment_id', paymentIds)
        .order('due_date')
    : { data: [] }

  const totalPending = (entries ?? []).filter(e => e.status !== 'paid')
    .reduce((s, e) => s + toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP), 0)
  const totalPaid    = (entries ?? []).filter(e => e.status === 'paid')
    .reduce((s, e) => s + toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP), 0)
  const total        = totalPending + totalPaid

  // Pie chart: group by category
  const byCat: Record<string, { label: string; color: string; value: number }> = {}
  for (const e of entries ?? []) {
    const cat = e.payment?.category
    const key = cat?.id ?? 'other'
    const val = toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP)
    if (!byCat[key]) byCat[key] = { label: cat?.name ?? 'Otro', color: cat?.color ?? '#94A3B8', value: 0 }
    byCat[key].value += val
  }
  const pieTotal = Object.values(byCat).reduce((s, c) => s + c.value, 0)
  const pieSlices: PieSlice[] = pieTotal > 0
    ? Object.values(byCat).sort((a, b) => b.value - a.value).map(c => ({ ...c, pct: c.value / pieTotal }))
    : []

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/spaces"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronLeft size={22} className="text-[var(--text-primary)]" />
        </Link>
        <h1 className="text-lg font-bold text-[var(--text-primary)] flex-1">Detalle del Espacio</h1>
        <Link href={`/spaces/${id}/edit`}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <Pencil size={20} className="text-[var(--text-secondary)]" />
        </Link>
      </header>

      <div className="px-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{space.name}</h2>
          {space.description && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{space.description}</p>}
        </div>

        {/* Total pendiente */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Total Pendiente</p>
          <p className="text-3xl font-bold text-blue-600 tabular-nums">
            {formatCOP(totalPending)}
          </p>
          {total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                <span>{Math.round((totalPaid / total) * 100)}% pagado</span>
                <span>{formatCOP(totalPaid)} pagado</span>
              </div>
              <div className="h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(totalPaid / total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Pie chart por categoría */}
        {pieSlices.length > 0 && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">
              Gastos por Categoría
            </p>
            <div className="flex items-center gap-4">
              <SpacePieChart slices={pieSlices} />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {pieSlices.map(s => (
                  <div key={s.label} className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">{s.label}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                        {Math.round(s.pct * 100)}%
                      </span>
                      <p className="text-[10px] text-[var(--text-secondary)] tabular-nums">{formatCOP(s.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pagos asignados */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">
            Pagos Asignados — {now.toLocaleString('es-CO', { month: 'long' })}
          </p>
          {(entries ?? []).length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
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
                    className="flex items-center gap-3 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
                    <CategoryIcon icon={cat?.icon ?? 'circle'} color={cat?.color ?? '#3B82F6'} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold text-[15px] truncate', isPaid && 'line-through text-[var(--text-secondary)]')}>
                        {entry.payment?.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {isPaid ? 'Pagado' : `Vence día ${entry.payment?.due_day}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-[var(--text-primary)]">
                        {entry.payment?.currency === 'USD'
                          ? `USD ${formatUSD(entry.payment?.amount ?? 0)}`
                          : `COP ${formatCOP(entry.payment?.amount ?? 0)}`}
                      </p>
                      {entry.payment?.currency === 'USD' && (
                        <p className="text-[10px] text-[var(--text-secondary)] tabular-nums">
                          ≈ {formatCOP(toCOP(entry.payment?.amount ?? 0, 'USD', usdToCOP))}
                        </p>
                      )}
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
          <p className="text-xs text-[var(--text-secondary)] text-center mt-2">
            Esta acción no se puede deshacer y eliminará todos los registros asociados.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
