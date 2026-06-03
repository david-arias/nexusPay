'use client'

import Link from 'next/link'
import { Check, Pencil } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatCOP, formatUSD, toCOP } from '@/lib/exchange-rate'
import { getStatusConfig, cn } from '@/lib/utils'
import type { UpcomingPayment } from '@/types'

interface PaymentItemProps {
  entry: UpcomingPayment
  onTogglePaid?: (id: string) => void
  usdToCOP?: number
}

export function PaymentItem({ entry, onTogglePaid, usdToCOP = 4100 }: PaymentItemProps) {
  const { payment, status, days_until_due } = entry
  const category = payment.category
  const isPaid    = status === 'paid'
  const statusCfg = getStatusConfig(status, days_until_due)
  const currency  = payment.currency ?? 'COP'
  const isUSD     = currency === 'USD'

  const formattedAmount = isUSD
    ? `USD ${formatUSD(payment.amount)}`
    : `COP ${formatCOP(payment.amount)}`

  const copEquivalent = isUSD ? formatCOP(toCOP(payment.amount, 'USD', usdToCOP)) : null

  return (
    <div className={cn(
      'flex items-center gap-3 bg-[var(--card)] rounded-2xl border p-4',
      isPaid ? 'border-[var(--border)] opacity-75' : 'border-[var(--border)]',
      days_until_due < 0 && !isPaid ? 'border-l-4 border-l-red-400' : '',
      days_until_due === 0 && !isPaid ? 'border-l-4 border-l-amber-400' : ''
    )}>

      <CategoryIcon icon={category?.icon ?? 'circle'} color={category?.color ?? '#3B82F6'} size="md" />

      <Link href={`/payments/${entry.id}`} className="flex-1 min-w-0 tap-none">
        <p className={cn(
          'text-[15px] font-semibold leading-tight truncate',
          isPaid ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
        )}>
          {payment.name}
        </p>
        <p className={cn('text-xs mt-0.5 font-medium flex items-center gap-1', statusCfg.textColor)}>
          {isPaid
            ? <><Check size={11} /> Pagado</>
            : <><span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dotColor)} />{statusCfg.label}</>
          }
        </p>
      </Link>

      {/* Amount + USD→COP hint */}
      <div className="text-right flex-shrink-0">
        <span className={cn('text-base font-bold tabular-nums block', isPaid ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
          {formattedAmount}
        </span>
        {copEquivalent && (
          <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">≈ {copEquivalent}</span>
        )}
      </div>

      <Link
        href={`/payments/${entry.id}/edit`}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none flex-shrink-0"
        aria-label={`Editar ${payment.name}`}
      >
        <Pencil size={15} className="text-[var(--text-secondary)]" />
      </Link>

      <button
        onClick={() => onTogglePaid?.(entry.id)}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0',
          'transition-all duration-200 tap-none',
          isPaid
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 text-transparent hover:border-blue-500'
        )}
        aria-label={isPaid ? `Desmarcar ${payment.name}` : `Marcar ${payment.name} como pagado`}
        aria-pressed={isPaid}
      >
        <Check size={14} strokeWidth={3} />
      </button>
    </div>
  )
}
