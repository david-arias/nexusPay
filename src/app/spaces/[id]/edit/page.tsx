'use client'

import { use, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Save } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'

export default function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName]           = useState('')
  const [description, setDescription] = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [loaded, setLoaded]       = useState(false)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().from('spaces').select('name, description').eq('id', id).single().then(({ data }) => {
        if (data) { setName(data.name); setDescription(data.description ?? '') }
        setLoaded(true)
      })
    })
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es obligatorio.'); return }
    setError(null)
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const { error } = await createClient()
        .from('spaces')
        .update({ name: name.trim(), description: description.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) { setError(error.message); return }
      router.push(`/spaces/${id}`)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Editar Espacio</h1>
      </header>

      {!loaded ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-4 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Nombre del espacio
              </label>
              <input value={name} onChange={e => setName(e.target.value)} required
                placeholder="Ej. Mi Casa, Oficina"
                className="w-full h-12 px-4 rounded-xl bg-gray-100 text-[15px] text-gray-900
                           outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Descripción (opcional)
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="¿Para qué es este espacio?"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-[15px] text-gray-900
                           outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

          <button type="submit" disabled={isPending}
            className={cn(
              'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
              'rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 tap-none transition-colors'
            )}>
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </form>
      )}

      <BottomNav />
    </div>
  )
}
