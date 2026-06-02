'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { login } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleLogin(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(translateError(result.error))
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
      <div className="flex-1 flex flex-col justify-center px-6 py-12">

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src="/icons/icon.svg" alt="NexusPay" className="w-20 h-20 rounded-2xl shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-6">NexusPay</h1>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Bienvenido de nuevo</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Mantén tus finanzas bajo control y sin sorpresas.
          </p>
        </div>

        <form action={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              Correo Electrónico
            </label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              placeholder="nombre@ejemplo.com"
              className="w-full h-14 px-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]
                         text-[var(--text-primary)] placeholder-[var(--text-disabled)] text-[15px]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                Contraseña
              </label>
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password" name="password" type={showPassword ? 'text' : 'password'}
                required autoComplete="current-password" placeholder="••••••••"
                className="w-full h-14 px-4 pr-12 rounded-2xl bg-[var(--card)] border border-[var(--border)]
                           text-[var(--text-primary)] placeholder-[var(--text-disabled)] text-[15px]
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] tap-none"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={isPending}
            className={cn(
              'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
              'rounded-2xl transition-all flex items-center justify-center gap-2 mt-1',
              'disabled:opacity-60 disabled:cursor-not-allowed tap-none'
            )}>
            {isPending && <Loader2 size={20} className="animate-spin" />}
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de ingresar.'
  return msg
}
