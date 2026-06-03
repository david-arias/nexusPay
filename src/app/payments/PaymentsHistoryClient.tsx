'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, List, CalendarDays, LayoutGrid } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatCOP, formatUSD, toCOP } from '@/lib/exchange-rate'
import { cn } from '@/lib/utils'
import { format, parseISO, getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import { es } from 'date-fns/locale'

type ViewMode = 'list' | 'calendar-compact' | 'calendar-grid'

interface Entry {
  id: string
  due_date: string
  status: string
  payment_method?: string | null
  payment?: {
    name: string
    amount: number
    currency: string
    due_day: number
    category?: { icon: string; color: string; name: string } | null
  } | null
}

interface Props {
  entries: Entry[]
  year: number
  month: number
  monthLabel: string
  totalPaid: number
  totalAll: number
  usdToCOP: number
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ── Shared entry card ─────────────────────────────────────────────────────
function EntryCard({ entry, usdToCOP }: { entry: Entry; usdToCOP: number }) {
  const cat    = entry.payment?.category
  const isPaid = entry.status === 'paid'
  const isUSD  = entry.payment?.currency === 'USD'
  return (
    <Link href={`/payments/${entry.id}`}
      className="flex items-center gap-3 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
      <CategoryIcon icon={cat?.icon ?? 'circle'} color={cat?.color ?? '#3B82F6'} size="md" />
      <div className="flex-1 min-w-0">
        <p className={cn('text-[15px] font-semibold truncate', isPaid && 'line-through text-[var(--text-secondary)]')}>
          {entry.payment?.name}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {entry.payment_method ?? (isPaid ? 'Pagado' : 'Pendiente')}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn('font-bold tabular-nums text-sm', isPaid ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
          {isUSD ? `USD ${formatUSD(entry.payment?.amount ?? 0)}` : `COP ${formatCOP(entry.payment?.amount ?? 0)}`}
        </p>
        {isUSD && (
          <p className="text-[10px] text-[var(--text-secondary)] tabular-nums">
            ≈ {formatCOP(toCOP(entry.payment?.amount ?? 0, 'USD', usdToCOP))}
          </p>
        )}
        <p className={cn(
          'text-[10px] font-bold uppercase mt-0.5',
          isPaid ? 'text-green-600' : entry.status === 'overdue' ? 'text-red-500' : 'text-blue-600'
        )}>
          {isPaid ? 'Completado' : entry.status === 'overdue' ? 'Vencido' : 'Pendiente'}
        </p>
      </div>
    </Link>
  )
}

// ── Compact calendar (dots, click to expand) ──────────────────────────────
function CalendarCompact({ entries, year, month, usdToCOP }: {
  entries: Entry[]; year: number; month: number; usdToCOP: number
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const byDay: Record<number, Entry[]> = {}
  for (const e of entries) {
    const d = parseISO(e.due_date).getDate()
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(e)
  }

  const daysInMonth  = getDaysInMonth(new Date(year, month - 1))
  const firstWeekday = getDay(startOfMonth(new Date(year, month - 1)))
  const today        = new Date()
  const todayDay     = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1
  const selectedEntries = selectedDay ? (byDay[selectedDay] ?? []) : []

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[var(--text-secondary)] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstWeekday }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dayEntries = byDay[day] ?? []
          const hasPaid    = dayEntries.some(e => e.status === 'paid')
          const hasPending = dayEntries.some(e => e.status !== 'paid')
          const isToday    = day === todayDay
          const isSelected = day === selectedDay
          return (
            <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
              className={cn(
                'flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl transition-all tap-none',
                isSelected ? 'bg-blue-600' : isToday ? 'bg-blue-50' : 'hover:bg-[var(--card-hover)]'
              )}>
              <span className={cn('text-sm font-semibold leading-none',
                isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-[var(--text-primary)]')}>
                {day}
              </span>
              {dayEntries.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {hasPending && <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/80' : 'bg-blue-500')} />}
                  {hasPaid    && <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/80' : 'bg-green-500')} />}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedDay !== null && (
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
            {selectedEntries.length === 0
              ? `Sin pagos el día ${selectedDay}`
              : format(new Date(year, month - 1, selectedDay), "EEEE d 'de' MMMM", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
          </p>
          <div className="flex flex-col gap-2">
            {selectedEntries.length === 0
              ? <p className="text-sm text-center text-[var(--text-secondary)] py-3">No hay pagos este día.</p>
              : selectedEntries.map(e => <EntryCard key={e.id} entry={e} usdToCOP={usdToCOP} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Expanded grid calendar (Google Calendar style) ────────────────────────
function CalendarGrid({ entries, year, month, usdToCOP }: {
  entries: Entry[]; year: number; month: number; usdToCOP: number
}) {
  const byDay: Record<number, Entry[]> = {}
  for (const e of entries) {
    const d = parseISO(e.due_date).getDate()
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(e)
  }

  const daysInMonth  = getDaysInMonth(new Date(year, month - 1))
  const firstWeekday = getDay(startOfMonth(new Date(year, month - 1)))
  const today        = new Date()
  const todayDay     = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1

  // Build weeks array
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-[var(--border)] mb-0">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[var(--text-secondary)] py-2">{d}</div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-[var(--border)]">
          {week.map((day, di) => {
            if (day === null) return (
              <div key={di} className="min-h-[72px] border-r border-[var(--border)] last:border-r-0 bg-[var(--surface)]/40" />
            )
            const dayEntries = byDay[day] ?? []
            const isToday = day === todayDay
            return (
              <div key={di}
                className="min-h-[72px] border-r border-[var(--border)] last:border-r-0 p-1 flex flex-col gap-0.5">
                {/* Day number */}
                <div className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold self-start',
                  isToday ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)]'
                )}>
                  {day}
                </div>
                {/* Payment chips */}
                {dayEntries.map(e => {
                  const isPaid = e.status === 'paid'
                  const color  = e.payment?.category?.color ?? '#3B82F6'
                  return (
                    <Link key={e.id} href={`/payments/${e.id}`}
                      className={cn(
                        'w-full text-left px-1 py-0.5 rounded text-[9px] font-semibold leading-tight truncate tap-none',
                        isPaid ? 'opacity-60 line-through' : ''
                      )}
                      style={{
                        backgroundColor: isPaid ? 'var(--input-bg)' : `${color}22`,
                        color: isPaid ? 'var(--text-secondary)' : color,
                      }}>
                      {e.payment?.name}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export function PaymentsHistoryClient({ entries, year, month, monthLabel, totalPaid, totalAll, usdToCOP }: Props) {
  const [view, setView] = useState<ViewMode>('list')

  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)

  const grouped: Record<string, Entry[]> = {}
  for (const e of entries) {
    if (!grouped[e.due_date]) grouped[e.due_date] = []
    grouped[e.due_date].push(e)
  }

  const VIEW_OPTS: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'list',             icon: <List size={15} />,        label: 'Lista' },
    { id: 'calendar-compact', icon: <CalendarDays size={15} />, label: 'Compacto' },
    { id: 'calendar-grid',    icon: <LayoutGrid size={15} />,   label: 'Cuadrícula' },
  ]

  return (
    <>
      {/* Month navigator */}
      <div className="mx-4 mt-3 bg-[var(--card)] rounded-2xl border border-[var(--border)] flex items-center justify-between px-4 py-3">
        <Link href={`/payments?year=${prevDate.getFullYear()}&month=${prevDate.getMonth() + 1}`}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronLeft size={20} className="text-[var(--text-secondary)]" />
        </Link>
        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)]">Mostrando</p>
          <p className="font-bold text-blue-600">{monthLabel}</p>
        </div>
        <Link href={`/payments?year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronRight size={20} className="text-[var(--text-secondary)]" />
        </Link>
      </div>

      {/* Summary card */}
      <div className="mx-4 mt-3 bg-blue-600 rounded-2xl p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Total Pagado</p>
            <p className="text-white text-3xl font-bold mt-1 tabular-nums">{formatCOP(totalPaid)}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs">de {formatCOP(totalAll)}</p>
            <p className="text-white font-bold text-lg">
              {totalAll > 0 ? `${Math.round((totalPaid / totalAll) * 100)}%` : '0%'}
            </p>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all"
            style={{ width: totalAll > 0 ? `${(totalPaid / totalAll) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* View toggle — 3 options */}
      <div className="flex gap-1 mx-4 mt-4 bg-[var(--input-bg)] rounded-2xl p-1">
        {VIEW_OPTS.map(opt => (
          <button key={opt.id} onClick={() => setView(opt.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all tap-none',
              view === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-secondary)]'
            )}>
            {opt.icon}{opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'list' && (
        <div className="px-4 mt-5 flex flex-col gap-5 pb-4">
          {entries.length === 0 && (
            <p className="text-center text-[var(--text-secondary)] text-sm py-10">Sin pagos este mes.</p>
          )}
          {Object.entries(grouped).map(([dateStr, items]) => (
            <div key={dateStr}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                {format(parseISO(dateStr), "EEEE, d MMM", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
              </p>
              <div className="flex flex-col gap-2">
                {items.map(e => <EntryCard key={e.id} entry={e} usdToCOP={usdToCOP} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar-compact' && (
        <div className="mx-4 mt-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 mb-4">
          <CalendarCompact entries={entries} year={year} month={month} usdToCOP={usdToCOP} />
        </div>
      )}

      {view === 'calendar-grid' && (
        <div className="mx-4 mt-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden mb-4">
          <CalendarGrid entries={entries} year={year} month={month} usdToCOP={usdToCOP} />
        </div>
      )}
    </>
  )
}
