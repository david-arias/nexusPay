'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'

export default function PersonalInfoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const s = createClient()
      s.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        setEmail(user.email ?? '')
        s.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
          if (data) setFullName(data.full_name ?? '')
        })
      })
    })
  }, [])

  async function handleSave() {
    setError(null); setSuccess(false)
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const s = createClient()
      const { data: { user } } = await s.auth.getUser()
      if (!user) return
      const { error } = await s.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (error) setError(error.message)
      else setSuccess(true)
    })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Información Personal</h1>
      </header>

      <div className="px-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Nombre completo</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full h-12 px-0 text-[15px] text-gray-900 bg-transparent border-none outline-none border-b border-gray-100 focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Correo electrónico</label>
            <input value={email} disabled
              className="w-full h-12 px-0 text-[15px] text-gray-400 bg-transparent border-none outline-none cursor-not-allowed" />
            <p className="text-xs text-gray-400">El correo no se puede cambiar desde aquí.</p>
          </div>
        </div>

        {success && <p className="text-sm text-green-600 font-medium text-center">✓ Cambios guardados</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button onClick={handleSave} disabled={isPending}
          className={cn(
            'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
            'rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 tap-none'
          )}>
          {isPending && <Loader2 size={20} className="animate-spin" />}
          Guardar Cambios
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
