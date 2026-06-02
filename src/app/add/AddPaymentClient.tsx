'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Save } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Toggle } from '@/components/ui/Toggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { createPayment } from './actions'
import { cn } from '@/lib/utils'
import { formatCOP, formatUSD } from '@/lib/exchange-rate'
import type { Category, Space } from '@/types'

interface AddPaymentClientProps {
  categories: Category[]
  spaces: Space[]
  usdToCOP: number
}

export function AddPaymentClient({ categories, spaces, usdToCOP }: AddPaymentClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0]?.id ?? null)
  const [selectedSpace, setSelectedSpace] = useState<string>('personal')
  const [isRecurring, setIsRecurring] = useState(true)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')

  const amountNum = parseFloat(amount) || 0
  const amountInCOP = currency === 'USD' ? amountNum * usdToCOP : amountNum
  const amountInUSD = currency === 'COP' ? amountNum / usdToCOP : amountNum

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('due_day', String(selectedDay))
    formData.set('category_id', selectedCategory ?? '')
    formData.set('space_id', selectedSpace === 'personal' ? '' : selectedSpace)
    formData.set('is_recurring', String(isRecurring))
    formData.set('currency', currency)

    startTransition(async () => {
      const result = await createPayment(formData)
      if (result?.error) setError(result.error)
    })
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] transition-colors tap-none">
          <ChevronLeft size={22} className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Añadir Pago</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">

        {/* Nombre */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
            Nombre del Pago
          </label>
          <input name="name" type="text" required placeholder="Ej. Netflix, Alquiler"
            className="w-full text-[15px] text-[var(--text-primary)] placeholder-[var(--text-disabled)] bg-transparent border-none outline-none" />
        </div>

        {/* Monto + moneda */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              Monto
            </label>
            {/* Currency toggle */}
            <div className="flex bg-[var(--input-bg)] rounded-xl p-0.5">
              {(['COP', 'USD'] as const).map(c => (
                <button key={c} type="button" onClick={() => setCurrency(c)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-bold transition-all tap-none',
                    currency === c ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-secondary)]'
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xl">{currency === 'COP' ? '$' : 'US$'}</span>
            <input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01"
              required placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 text-2xl font-bold text-[var(--text-primary)] placeholder-gray-300
                         bg-transparent border-none outline-none tabular-nums" />
          </div>

          {/* Equivalencia */}
          {amountNum > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)]">
                Tasa: <span className="font-semibold">1 USD = {formatCOP(usdToCOP)}</span>
              </p>
              {currency === 'USD' ? (
                <p className="text-sm font-semibold text-[var(--text-secondary)] mt-0.5">
                  ≈ {formatCOP(amountInCOP)} COP
                </p>
              ) : (
                <p className="text-sm font-semibold text-[var(--text-secondary)] mt-0.5">
                  ≈ {formatUSD(amountInUSD)} USD
                </p>
              )}
            </div>
          )}
        </div>

        {/* Día de vencimiento */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-3">
            Día de Vencimiento
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {days.map(day => (
              <button key={day} type="button" onClick={() => setSelectedDay(day)}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full text-sm font-semibold transition-all tap-none',
                  selectedDay === day ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--divider)]'
                )}>
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría */}
        {categories.length > 0 && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-3">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all tap-none',
                    selectedCategory === cat.id
                      ? 'border-transparent text-white'
                      : 'border-[var(--border)] text-[var(--text-primary)] bg-[var(--surface-low)] hover:bg-[var(--card-hover)]'
                  )}
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}>
                  <CategoryIcon icon={cat.icon} color={selectedCategory === cat.id ? '#fff' : cat.color} size="sm" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Espacio */}
        {spaces.length > 0 && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-3">
              Asignar a Espacio
            </label>
            <div className="flex flex-wrap gap-2">
              {[{ id: 'personal', name: 'Personal' }, ...spaces].map((s: any) => (
                <button key={s.id} type="button" onClick={() => setSelectedSpace(s.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border transition-all tap-none',
                    selectedSpace === s.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-[var(--border)] text-[var(--text-primary)] bg-[var(--surface-low)] hover:bg-[var(--card-hover)]'
                  )}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
            Notas (opcional)
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Ej. Cuenta bancaria, número de referencia, datos de pago..."
            className="w-full text-[15px] text-[var(--text-primary)] placeholder-[var(--text-disabled)]
                       bg-transparent border-none outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Recurrente */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <Toggle
            checked={isRecurring}
            onChange={setIsRecurring}
            label="Recurrente"
            description="Se cobra automáticamente cada mes"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={isPending}
          className={cn(
            'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
            'rounded-2xl transition-all flex items-center justify-center gap-2',
            'disabled:opacity-60 tap-none'
          )}>
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Guardar Pago
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
