'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { cn } from '@/lib/utils'

// Simple color palette for category picker
const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16']
const ICONS  = ['home','zap','wifi','tv','car','shield-plus','dumbbell','shopping-cart','clapperboard']

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [error, setError] = useState<string | null>(null)

  // Load categories on mount
  if (!loaded) {
    setLoaded(true)
    import('@/lib/supabase/client').then(({ createClient }) => {
      const s = createClient()
      s.from('categories').select('*').order('name').then(({ data }) => {
        if (data) setCategories(data)
      })
    })
  }

  function openNew() {
    setEditId(null); setName(''); setDescription(''); setColor(COLORS[0]); setIcon(ICONS[0]); setShowForm(true)
  }

  function openEdit(cat: any) {
    setEditId(cat.id); setName(cat.name); setDescription(cat.description ?? ''); setColor(cat.color); setIcon(cat.icon); setShowForm(true)
  }

  async function handleSave() {
    if (!name.trim()) { setError('El nombre es obligatorio.'); return }
    setError(null)
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const s = createClient()
      const { data: { user } } = await s.auth.getUser()
      if (!user) return

      if (editId) {
        await s.from('categories').update({ name, description: description || null, color, icon }).eq('id', editId)
        setCategories(prev => prev.map(c => c.id === editId ? { ...c, name, description, color, icon } : c))
      } else {
        const { data } = await s.from('categories').insert({ user_id: user.id, name, description: description || null, color, icon }).select().single()
        if (data) setCategories(prev => [...prev, data])
      }
      setShowForm(false)
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const s = createClient()
      await s.from('categories').delete().eq('id', id)
      setCategories(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-blue-600">Gestionar Categorías</h1>
        </div>
      </header>

      <p className="px-4 text-sm text-gray-500 mb-4">
        Personaliza tus categorías para un seguimiento preciso de tus gastos y ahorros.
      </p>

      <div className="px-4 flex flex-col gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
            <CategoryIcon icon={cat.icon} color={cat.color} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{cat.name}</p>
              {cat.description && <p className="text-xs text-gray-400 truncate">{cat.description}</p>}
            </div>
            <button onClick={() => openEdit(cat)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 tap-none text-gray-400">
              <Pencil size={16} />
            </button>
            <button onClick={() => handleDelete(cat.id)} disabled={isPending}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 tap-none text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button onClick={openNew}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl
                     flex items-center justify-center gap-2 transition-colors tap-none mt-2">
          <Plus size={20} />
          Añadir Nueva Categoría
        </button>
      </div>

      {/* Bottom sheet form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Editar' : 'Nueva'} Categoría</h2>

            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre"
              className="w-full h-12 px-4 rounded-xl bg-gray-100 text-gray-900 text-[15px] outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (opcional)"
              className="w-full h-12 px-4 rounded-xl bg-gray-100 text-gray-900 text-[15px] outline-none focus:ring-2 focus:ring-blue-500" />

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={cn('w-8 h-8 rounded-full tap-none transition-transform', color === c && 'scale-125 ring-2 ring-offset-2')}
                    style={{ backgroundColor: c, ringColor: c }} />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-700 font-semibold tap-none">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={isPending}
                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold tap-none flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
