import { formatByCurrency } from '@/lib/exchange-rate'
import type { DashboardSummary } from '@/types'

interface SummaryCardProps {
  summary: DashboardSummary
  month: string
}

export function SummaryCard({ summary, month }: SummaryCardProps) {
  const { total_month, total_paid, total_pending, currency } = summary
  const paidPct = total_month > 0 ? (total_paid / total_month) * 100 : 0

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 mx-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
        Gasto total del mes
      </p>

      <p className="text-[2rem] font-bold leading-none text-[var(--text-primary)] mb-4">
        {formatByCurrency(total_month, currency)}
      </p>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--input-bg)] rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${paidPct}%` }}
          role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100} />
      </div>

      {/* Paid / Pending chips — semantic colors with opacity for dark mode compatibility */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-green-500 mb-0.5">
            Pagado
          </p>
          <p className="text-base font-bold text-green-500">
            {formatByCurrency(total_paid, currency)}
          </p>
        </div>
        <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: 'rgba(77,142,255,0.15)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--primary)' }}>
            Pendiente
          </p>
          <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
            {formatByCurrency(total_pending, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}
