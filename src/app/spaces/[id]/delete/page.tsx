'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, ChevronLeft } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DeleteSpacePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const s = createClient()
      const { error } = await s.from('spaces').delete().eq('id', params.id)
      if (error) { setError(error.message); return }
      router.push('/spaces')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Eliminar Espacio</h1>
      </header>

      <div className="px-4 flex flex-col items-center gap-6 pt-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 size={36} className="text-red-600" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar este espacio?</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Esta acción eliminará el espacio y <strong>todos los pagos asociados</strong> permanentemente.
            No se puede deshacer.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex flex-col gap-3 w-full">
          <button onClick={handleDelete} disabled={isPending}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-[15px]
                       rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 tap-none transition-colors">
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            Sí, eliminar espacio
          </button>
          <button onClick={() => router.back()}
            className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[15px]
                       rounded-2xl tap-none transition-colors">
            Cancelar
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
