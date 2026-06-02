'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Toggle } from '@/components/ui/Toggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { updatePayment, deletePayment } from './actions'
import { formatCOP, formatUSD } from '@/lib/exchange-rate'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface Props {
  entry: any
  categories: Category[]
  usdToCOP: number
}

export function EditPaymentClient({ entry, categories, usdToCOP }: Props) {
  const router = useRouter()
  const payment = entry.payment
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [name, setName]                       = useState(payment?.name ?? '')
  const [amount, setAmount]                   = useState(String(payment?.amount ?? ''))
  const [currency, setCurrency]               = useState<'COP' | 'USD'>(payment?.currency ?? 'COP')
  const [selectedDay, setSelectedDay]         = useState(payment?.due_day ?? 1)
  const [selectedCategory, setSelectedCategory] = useState(payment?.category_id ?? null)
  const [isRecurring, setIsRecurring]         = useState(payment?.is_recurring ?? true)
  const [notes, setNotes]                     = useState(payment?.notes ?? '')

  const amountNum = parseFloat(amount) || 0

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('due_day', String(selectedDay))
    formData.set('category_id', selectedCategory ?? '')
    formData.set('currency', currency)
    formData.set('is_recurring', String(isRecurring))

    startTransition(async () => {
      const result = await updatePayment(payment.id, formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleDelete() {
    startDelete(async () => {
      await deletePayment(payment.id)
    })
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Editar Pago</h1>
        <button onClick={() => setShowDeleteConfirm(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 tap-none text-red-500">
          <Trash2 size={20} />
        </button>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-4 px-4">

        {/* Nombre */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-2">
            Nombre del Pago
          </label>
          <input name="name" type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full text-[15px] text-gray-900 bg-transparent border-none outline-none" />
        </div>

        {/* Monto + moneda */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Monto</label>
            <div className="flex bg-gray-100 rounded-xl p-0.5">
              {(['COP', 'USD'] as const).map(c => (
                <button key={c} type="button" onClick={() => setCurrency(c)}
                  className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-all tap-none',
                    currency === c ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500')}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xl">{currency === 'COP' ? '$' : 'US$'}</span>
            <input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" required
              value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 text-2xl font-bold text-gray-900 bg-transparent border-none outline-none tabular-nums" />
          </div>
          {amountNum > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Tasa: 1 USD = {formatCOP(usdToCOP)}</p>
              <p className="text-sm font-semibold text-gray-600 mt-0.5">
                ≈ {currency === 'USD' ? formatCOP(amountNum * usdToCOP) + ' COP' : formatUSD(amountNum / usdToCOP) + ' USD'}
              </p>
            </div>
          )}
        </div>

        {/* Día */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-3">
            Día de Vencimiento
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {days.map(day => (
              <button key={day} type="button" onClick={() => setSelectedDay(day)}
                className={cn('flex-shrink-0 w-10 h-10 rounded-full text-sm font-semibold transition-all tap-none',
                  selectedDay === day ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600')}>
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría */}
        {categories.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-3">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all tap-none',
                    selectedCategory === cat.id ? 'border-transparent text-white' : 'border-gray-200 text-gray-700 bg-gray-50')}
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}>
                  <CategoryIcon icon={cat.icon} color={selectedCategory === cat.id ? '#fff' : cat.color} size="sm" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-2">Notas</label>
          <textarea name="notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Opcional..."
            className="w-full text-[15px] text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none resize-none" />
        </div>

        {/* Recurrente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <Toggle checked={isRecurring} onChange={setIsRecurring}
            label="Recurrente" description="Se cobra automáticamente cada mes" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={isPending}
          className={cn('w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
            'rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 tap-none')}>
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Guardar Cambios
        </button>
      </form>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">¿Eliminar pago?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Se eliminarán todos los registros de <strong>{payment?.name}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-700 font-semibold tap-none">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold
                           flex items-center justify-center gap-2 disabled:opacity-60 tap-none">
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
