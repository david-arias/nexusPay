'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Save } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { BottomNav } from '@/components/layout/BottomNav'
import { createPayment } from './actions'
import { cn } from '@/lib/utils'
import type { Category, Space } from '@/types'

interface AddPaymentClientProps {
  categories: Category[]
  spaces: Space[]
}

export function AddPaymentClient({ categories, spaces }: AddPaymentClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0]?.id ?? null
  )
  const [selectedSpace, setSelectedSpace] = useState<string>('personal')
  const [isRecurring, setIsRecurring] = useState(true)
  const [amount, setAmount] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('due_day', String(selectedDay))
    formData.set('category_id', selectedCategory ?? '')
    formData.set('space_id', selectedSpace === 'personal' ? '' : selectedSpace)
    formData.set('is_recurring', String(isRecurring))

    startTransition(async () => {
      const result = await createPayment(formData)
      if (result?.error) setError(result.error)
    })
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full
                     hover:bg-gray-100 transition-colors tap-none"
          aria-label="Volver"
        >
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Añadir Pago</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">

        {/* Nombre */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-2">
            Nombre del Pago
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Ej. Netflix, Alquiler"
            className="w-full text-[15px] text-gray-900 placeholder-gray-400
                       bg-transparent border-none outline-none"
          />
        </div>

        {/* Monto */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-2">
            Monto ($)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xl">$</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 text-2xl font-bold text-gray-900 placeholder-gray-300
                         bg-transparent border-none outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Día de vencimiento */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-3">
            Día de Vencimiento
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {days.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full text-sm font-semibold',
                  'transition-all duration-150 tap-none',
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría */}
        {categories.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-3">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium',
                    'border transition-all duration-150 tap-none',
                    selectedCategory === cat.id
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100'
                  )}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: cat.color }
                      : {}
                  }
                >
                  <CategoryIcon icon={cat.icon} color={selectedCategory === cat.id ? '#fff' : cat.color} size="sm" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Asignar a espacio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 block mb-3">
            Asignar a Espacio
          </label>
          <div className="flex flex-wrap gap-2">
            {/* Personal */}
            <button
              type="button"
              onClick={() => setSelectedSpace('personal')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                'border transition-all duration-150 tap-none',
                selectedSpace === 'personal'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-200 text-gray-700 bg-gray-50'
              )}
            >
              Personal
            </button>
            {spaces.map((space: any) => (
              <button
                key={space.id}
                type="button"
                onClick={() => setSelectedSpace(space.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                  'border transition-all duration-150 tap-none',
                  selectedSpace === space.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 text-gray-700 bg-gray-50'
                )}
              >
                {space.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recurrente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-gray-900">Recurrente</p>
            <p className="text-xs text-gray-500 mt-0.5">Se cobrará automáticamente cada mes</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isRecurring}
            onClick={() => setIsRecurring(v => !v)}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200 tap-none flex-shrink-0',
              isRecurring ? 'bg-blue-600' : 'bg-gray-300'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              isRecurring ? 'translate-x-6' : 'translate-x-0.5'
            )} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
            'rounded-2xl transition-all duration-150 flex items-center justify-center gap-2',
            'disabled:opacity-60 disabled:cursor-not-allowed tap-none'
          )}
        >
          {isPending
            ? <Loader2 size={20} className="animate-spin" />
            : <Save size={20} />
          }
          Guardar Pago
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
