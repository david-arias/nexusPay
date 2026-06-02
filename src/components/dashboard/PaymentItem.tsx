'use client'

import Link from 'next/link'
import { Check, Pencil } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatByCurrency } from '@/lib/exchange-rate'
import { getStatusConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { UpcomingPayment } from '@/types'

interface PaymentItemProps {
  entry: UpcomingPayment
  onTogglePaid?: (id: string) => void
}

export function PaymentItem({ entry, onTogglePaid }: PaymentItemProps) {
  const { payment, status, days_until_due } = entry
  const category = payment.category
  const isPaid   = status === 'paid'
  const statusCfg = getStatusConfig(status, days_until_due)

  return (
    <div className={cn(
      'flex items-center gap-3 bg-white rounded-2xl border p-4',
      isPaid ? 'border-gray-100 opacity-75' : 'border-gray-100',
      days_until_due < 0 && !isPaid ? 'border-l-4 border-l-red-400' : '',
      days_until_due === 0 && !isPaid ? 'border-l-4 border-l-amber-400' : ''
    )}>

      {/* Category icon */}
      <CategoryIcon icon={category?.icon ?? 'circle'} color={category?.color ?? '#3B82F6'} size="md" />

      {/* Name + status — tapping goes to detail/edit */}
      <Link href={`/payments/${entry.id}`} className="flex-1 min-w-0 tap-none">
        <p className={cn(
          'text-[15px] font-semibold leading-tight truncate',
          isPaid ? 'line-through text-gray-400' : 'text-gray-900'
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

      {/* Amount */}
      <span className={cn('text-base font-bold tabular-nums', isPaid ? 'text-gray-400' : 'text-gray-900')}>
        {formatByCurrency(payment.amount, payment.currency ?? 'COP')}
      </span>

      {/* Edit icon */}
      <Link
        href={`/payments/${entry.id}/edit`}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none flex-shrink-0"
        aria-label={`Editar ${payment.name}`}
      >
        <Pencil size={15} className="text-gray-400" />
      </Link>

      {/* Toggle paid */}
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
