'use client'

import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { formatByCurrency } from '@/lib/exchange-rate'
import type { UpcomingPayment } from '@/types'

const METHODS = ['Débito', 'Transferencia', 'Efectivo', 'Crédito', 'Automático', 'Nequi', 'Daviplata']

interface PaidConfirmModalProps {
  entry: UpcomingPayment
  onConfirm: (data: { paidAt: string; amountPaid: number; method: string }) => void
  onCancel: () => void
  isPending: boolean
}

export function PaidConfirmModal({ entry, onConfirm, onCancel, isPending }: PaidConfirmModalProps) {
  const today   = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate]     = useState(today)
  const [amount, setAmount] = useState(String(entry.payment.amount))
  const [method, setMethod] = useState(METHODS[0])

  function handleConfirm() {
    onConfirm({
      paidAt: new Date(date + 'T12:00:00').toISOString(),
      amountPaid: parseFloat(amount) || entry.payment.amount,
      method,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end" onClick={onCancel}>
      <div
        className="w-full max-w-md mx-auto bg-[var(--card)] rounded-t-3xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Confirmar pago</h2>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
            <X size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Payment name + scheduled amount */}
          <div className="flex items-center justify-between bg-[var(--surface-low)] rounded-2xl p-4">
            <div>
              <p className="font-bold text-[var(--text-primary)]">{entry.payment.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">Monto presupuestado</p>
            </div>
            <p className="font-bold text-blue-600 tabular-nums">
              {formatByCurrency(entry.payment.amount, entry.payment.currency ?? 'COP')}
            </p>
          </div>

          {/* Monto real pagado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              Monto real pagado
            </label>
            <div className="flex items-center gap-2 bg-[var(--input-bg)] rounded-xl px-4 h-12">
              <span className="text-blue-600 font-bold">$</span>
              <input
                type="number" inputMode="decimal" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[15px] font-semibold text-[var(--text-primary)] outline-none tabular-nums"
              />
            </div>
            {parseFloat(amount) !== entry.payment.amount && (
              <p className="text-xs text-amber-600 font-medium">
                {parseFloat(amount) > entry.payment.amount ? '↑ Mayor al presupuestado' : '↓ Menor al presupuestado'}
              </p>
            )}
          </div>

          {/* Fecha de pago */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              Fecha de pago
            </label>
            <input
              type="date" value={date} max={today}
              onChange={e => setDate(e.target.value)}
              className="w-full h-12 px-4 bg-[var(--input-bg)] rounded-xl text-[15px] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Método de pago */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              Método de pago
            </label>
            <div className="flex flex-wrap gap-2">
              {METHODS.map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all tap-none',
                    method === m
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--card)] hover:bg-[var(--card-hover)]'
                  )}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm} disabled={isPending}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold text-[15px]
                       rounded-2xl flex items-center justify-center gap-2 transition-colors tap-none disabled:opacity-60"
          >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            Marcar como pagado
          </button>
        </div>
      </div>
    </div>
  )
}
