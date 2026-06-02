'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'

export default function SecurityPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [show, setShow] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange() {
    setError(null); setSuccess(false)
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }

    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const s = createClient()
      const { error } = await s.auth.updateUser({ password })
      if (error) setError(error.message)
      else { setSuccess(true); setPassword(''); setConfirm('') }
    })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronLeft size={22} className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Seguridad</h1>
      </header>

      <div className="px-4 flex flex-col gap-4">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Cambiar contraseña</p>

          {['Nueva contraseña', 'Confirmar contraseña'].map((label, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={i === 0 ? password : confirm}
                  onChange={e => i === 0 ? setPassword(e.target.value) : setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-0 pr-8 text-[15px] text-[var(--text-primary)] bg-transparent border-none outline-none border-b border-[var(--border)] focus:border-blue-500"
                />
                {i === 0 && (
                  <button type="button" onClick={() => setShow(v => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] tap-none">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {success && <p className="text-sm text-green-600 font-medium text-center">✓ Contraseña actualizada</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button onClick={handleChange} disabled={isPending}
          className={cn(
            'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
            'rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 tap-none'
          )}>
          {isPending && <Loader2 size={20} className="animate-spin" />}
          Actualizar Contraseña
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
