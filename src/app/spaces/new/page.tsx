'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/layout/BottomNav'

export default function NewSpacePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const { createSpace } = await import('./actions')
      const result = await createSpace(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronLeft size={22} className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Nuevo Espacio</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
            Nombre del Espacio
          </label>
          <input name="name" type="text" required placeholder="Ej. Mi Casa, Oficina"
            className="w-full text-[15px] text-[var(--text-primary)] placeholder-[var(--text-disabled)] bg-transparent border-none outline-none" />
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
            Descripción (opcional)
          </label>
          <textarea name="description" rows={3} placeholder="¿Para qué es este espacio?"
            className="w-full text-[15px] text-[var(--text-primary)] placeholder-[var(--text-disabled)] bg-transparent border-none outline-none resize-none" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={isPending}
          className={cn(
            'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
            'rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 tap-none'
          )}>
          {isPending && <Loader2 size={20} className="animate-spin" />}
          Crear Espacio
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
