'use client'

import { useState, useTransition, useMemo } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { PaymentItem } from '@/components/dashboard/PaymentItem'
import { PromoBanner } from '@/components/dashboard/Promobanner'
import { PaidConfirmModal } from '@/components/dashboard/PaidConfirmModal'
import { togglePaymentPaid } from './actions'
import { formatCOP, toCOP } from '@/lib/exchange-rate'
import { cn } from '@/lib/utils'
import type { DashboardSummary, UpcomingPayment } from '@/types'

interface DashboardClientProps {
  initialEntries: UpcomingPayment[]
  summary: DashboardSummary
  monthLabel: string
  userName: string
  userInitials: string
  avatarUrl?: string | null
  usdToCOP: number
  spaceTotals: { name: string; total: number }[]
}

// ── Bar chart ──────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { name: string; total: number }[] }) {
  const max = Math.max(...data.map(d => d.total), 1)
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444']
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={d.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[55%]">{d.name}</span>
            <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">{formatCOP(d.total)}</span>
          </div>
          <div className="h-2.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.total / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

type Tab = 'all' | 'pending' | 'paid'

// ── Pie chart ──────────────────────────────────────────────────────────────
interface PieSlice { label: string; color: string; value: number; pct: number }

function PieChart({ slices }: { slices: PieSlice[] }) {
  const cx = 80, cy = 80, r = 68
  let cumAngle = -Math.PI / 2

  const paths = slices.map(s => {
    const angle = s.pct * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: s.color }
  })

  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0">
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="var(--card)" strokeWidth="2" />
      ))}
      {/* inner circle for donut effect */}
      <circle cx={cx} cy={cy} r={36} fill="var(--card)" />
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────

export function DashboardClient({
  initialEntries, summary, monthLabel, userName, userInitials, avatarUrl, usdToCOP, spaceTotals,
}: DashboardClientProps) {
  const [entries, setEntries]           = useState(initialEntries)
  const [isPending, startTransition]    = useTransition()
  const [pendingEntry, setPendingEntry] = useState<UpcomingPayment | null>(null)
  const [activeTab, setActiveTab]       = useState<Tab>('all')

  function handleTogglePaid(id: string) {
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    if (entry.status === 'paid') {
      doToggle(entry, true)
    } else {
      setPendingEntry(entry)
    }
  }

  function handleConfirmPaid(opts: { paidAt: string; amountPaid: number; method: string }) {
    if (!pendingEntry) return
    doToggle(pendingEntry, false, opts)
    setPendingEntry(null)
  }

  function doToggle(entry: UpcomingPayment, currentlyPaid: boolean, opts?: any) {
    setEntries(prev => prev.map(e =>
      e.id === entry.id
        ? { ...e, status: currentlyPaid ? 'pending' : 'paid', paid_at: currentlyPaid ? null : new Date().toISOString() }
        : e
    ))
    startTransition(async () => {
      const result = await togglePaymentPaid(entry.id, currentlyPaid, opts)
      if (result?.error) {
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...entry } : e))
      }
    })
  }

  // Live summary — recalculate in COP with proper conversion
  const liveSummary: DashboardSummary = useMemo(() => {
    let total_paid = 0, total_pending = 0
    for (const e of entries) {
      const inCOP = toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP)
      if (e.status === 'paid') total_paid += inCOP
      else total_pending += inCOP
    }
    return { ...summary, total_paid, total_pending, total_month: total_paid + total_pending, currency: 'COP' }
  }, [entries, usdToCOP, summary])

  const pendingEntries = entries.filter(e => e.status !== 'paid')
  const paidEntries    = entries.filter(e => e.status === 'paid')

  const hasUrgent = entries.some(e => e.status === 'overdue' || e.days_until_due === 0)

  // Pie chart — group by category in COP
  const pieSlices: PieSlice[] = useMemo(() => {
    const byCategory: Record<string, { label: string; color: string; value: number }> = {}
    for (const e of entries) {
      const cat = e.payment?.category
      const key = cat?.id ?? 'other'
      const val = toCOP(e.payment?.amount ?? 0, e.payment?.currency ?? 'COP', usdToCOP)
      if (!byCategory[key]) {
        byCategory[key] = { label: cat?.name ?? 'Otro', color: cat?.color ?? '#94A3B8', value: 0 }
      }
      byCategory[key].value += val
    }
    const total = Object.values(byCategory).reduce((s, c) => s + c.value, 0)
    if (total === 0) return []
    return Object.values(byCategory)
      .sort((a, b) => b.value - a.value)
      .map(c => ({ ...c, pct: c.value / total }))
  }, [entries, usdToCOP])

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'all',     label: 'Todos',      count: entries.length },
    { id: 'pending', label: 'Pendientes', count: pendingEntries.length },
    { id: 'paid',    label: 'Pagados',    count: paidEntries.length },
  ]

  const showAllSegmented = activeTab === 'all' && pendingEntries.length > 0 && paidEntries.length > 0
  const flatList = activeTab === 'pending' ? pendingEntries : activeTab === 'paid' ? paidEntries : []

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-blue-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center
                            text-white font-bold text-sm flex-shrink-0">
              {userInitials}
            </div>
          )}
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Hola, {userName}</p>
            <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">Mis Pagos</h1>
          </div>
        </div>
        <Link href="/notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] transition-colors tap-none"
          aria-label="Notificaciones">
          <Bell size={22} className="text-[var(--text-primary)]" />
          {hasUrgent && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Link>
      </header>

      {/* Summary */}
      <SummaryCard summary={liveSummary} month={monthLabel} />

      {/* Tabs + Ver historial */}
      <div className="flex items-center justify-between mx-4 mt-5 mb-0 gap-2">
        <span className="text-base font-bold text-[var(--text-primary)]">Pagos</span>
        <Link href="/payments" className="text-sm font-medium text-blue-600 tap-none flex-shrink-0">
          Ver historial →
        </Link>
      </div>
      <div className="flex gap-1 mx-4 mt-3 bg-[var(--input-bg)] rounded-2xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all tap-none',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              activeTab === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-[var(--divider)] text-[var(--text-secondary)]'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Payments list */}
      <section className="px-4 mt-4" aria-label="Lista de pagos">
        {showAllSegmented ? (
          <div className="flex flex-col gap-3">
            {pendingEntries.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">
                  Pendientes
                </p>
                <div className="flex flex-col gap-3">
                  {pendingEntries.map(entry => (
                    <PaymentItem key={entry.id} entry={entry} onTogglePaid={handleTogglePaid} usdToCOP={usdToCOP} />
                  ))}
                </div>
              </div>
            )}
            {paidEntries.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1 mt-2">
                  Pagados
                </p>
                <div className="flex flex-col gap-3">
                  {paidEntries.map(entry => (
                    <PaymentItem key={entry.id} entry={entry} onTogglePaid={handleTogglePaid} usdToCOP={usdToCOP} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'all' && entries.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p className="text-sm">Sin pagos este mes.</p>
            <Link href="/add" className="mt-3 inline-block text-sm font-semibold text-blue-600">+ Añadir pago</Link>
          </div>
        ) : activeTab === 'all' ? (
          // All in one list (only one group)
          <div className="flex flex-col gap-3">
            {entries.map(entry => (
              <PaymentItem key={entry.id} entry={entry} onTogglePaid={handleTogglePaid} usdToCOP={usdToCOP} />
            ))}
          </div>
        ) : flatList.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p className="text-sm">
              {activeTab === 'paid' ? 'Aún no hay pagos marcados como pagados.' : 'No hay pagos pendientes.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {flatList.map(entry => (
              <PaymentItem key={entry.id} entry={entry} onTogglePaid={handleTogglePaid} usdToCOP={usdToCOP} />
            ))}
          </div>
        )}
      </section>

      {/* Pie chart — gastos por categoría */}
      {pieSlices.length > 0 && (
        <section className="px-4 mt-6">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">
              Gastos por Categoría
            </p>
            <div className="flex items-center gap-5">
              <PieChart slices={pieSlices} />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {pieSlices.map(s => (
                  <div key={s.label} className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">{s.label}</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] flex-shrink-0 tabular-nums">
                      {Math.round(s.pct * 100)}%
                    </span>
                  </div>
                ))}
                <div className="border-t border-[var(--border)] pt-2 mt-1">
                  <p className="text-[10px] text-[var(--text-secondary)]">Total mes</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                    {formatCOP(liveSummary.total_month)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bar chart — gastos por espacio */}
      {spaceTotals.filter(s => s.total > 0).length > 0 && (
        <section className="px-4 mt-4">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                Gastos por Espacio
              </p>
              <Link href="/spaces" className="text-xs font-semibold text-blue-600 tap-none">Ver espacios</Link>
            </div>
            <BarChart data={spaceTotals.filter(s => s.total > 0)} />
          </div>
        </section>
      )}

      {/* Promo */}
      <div className="mt-6">
        <PromoBanner />
      </div>

      {/* Paid confirmation modal */}
      {pendingEntry && (
        <PaidConfirmModal
          entry={pendingEntry}
          onConfirm={handleConfirmPaid}
          onCancel={() => setPendingEntry(null)}
          isPending={isPending}
        />
      )}

      <BottomNav />
    </div>
  )
}
