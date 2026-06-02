import { formatByCurrency } from '@/lib/exchange-rate'
import type { DashboardSummary } from '@/types'

interface SummaryCardProps {
  summary: DashboardSummary
  month: string  // e.g. "Junio 2026"
}

/**
 * Top-of-dashboard card showing monthly spend breakdown.
 * Primary metric = total, secondary = paid vs pending chips.
 */
export function SummaryCard({ summary, month }: SummaryCardProps) {
  const { total_month, total_paid, total_pending, currency } = summary
  const paidPct = total_month > 0 ? (total_paid / total_month) * 100 : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mx-4">
      {/* Month label */}
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
        Gasto total del mes
      </p>

      {/* Big amount */}
      <p className="text-[2rem] font-bold leading-none text-gray-900 mb-4">
        {formatByCurrency(total_month, currency)}
      </p>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all duration-500"
          style={{ width: `${paidPct}%` }}
          role="progressbar"
          aria-valuenow={paidPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${Math.round(paidPct)}% pagado`}
        />
      </div>

      {/* Paid / Pending chips */}
      <div className="flex gap-3">
        <div className="flex-1 bg-green-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700 mb-0.5">
            Pagado
          </p>
          <p className="text-base font-bold text-green-700">
            {formatByCurrency(total_paid, currency)}
          </p>
        </div>
        <div className="flex-1 bg-blue-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 mb-0.5">
            Pendiente
          </p>
          <p className="text-base font-bold text-blue-700">
            {formatByCurrency(total_pending, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}
