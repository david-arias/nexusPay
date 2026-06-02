'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { register } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleRegister(formData: FormData) {
    setError(null)
    const password = formData.get('password') as string
    const confirm  = formData.get('confirm_password') as string
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6)  { setError('Mínimo 6 caracteres.'); return }

    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #F9F9FF 60%)' }}>
      <div className="flex-1 flex flex-col justify-center px-6 py-12">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">NexusPay</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
          <p className="text-gray-500 text-sm">Empieza a controlar tus finanzas hoy.</p>
        </div>

        <form action={handleRegister} className="flex flex-col gap-4">
          {[
            { id: 'full_name', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez', autoComplete: 'name' },
            { id: 'email', label: 'Correo Electrónico', type: 'email', placeholder: 'nombre@ejemplo.com', autoComplete: 'email' },
          ].map(f => (
            <div key={f.id} className="flex flex-col gap-1.5">
              <label htmlFor={f.id} className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {f.label}
              </label>
              <input id={f.id} name={f.id} type={f.type} required autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                className="w-full h-14 px-4 rounded-2xl bg-white border border-gray-200
                           text-gray-900 placeholder-gray-400 text-[15px]
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
          ))}

          {['password', 'confirm_password'].map((name, i) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label htmlFor={name} className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {i === 0 ? 'Contraseña' : 'Confirmar contraseña'}
              </label>
              <div className="relative">
                <input id={name} name={name} type={showPassword ? 'text' : 'password'} required
                  autoComplete="new-password"
                  placeholder={i === 0 ? 'Mínimo 6 caracteres' : 'Repite tu contraseña'}
                  className="w-full h-14 px-4 pr-12 rounded-2xl bg-white border border-gray-200
                             text-gray-900 placeholder-gray-400 text-[15px]
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                {i === 0 && (
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 tap-none">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={isPending}
            className={cn(
              'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
              'rounded-2xl transition-all flex items-center justify-center gap-2 mt-1',
              'disabled:opacity-60 tap-none'
            )}>
            {isPending && <Loader2 size={20} className="animate-spin" />}
            Crear Cuenta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
